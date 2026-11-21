// Pure functions for the daily-builds site: no DOM, so Node can test them against the real data files.
// The page reads docs/RATINGS.md and builds.json, which the daily routine already updates,
// so a new build appears here with no extra step.

export const REPO = 'https://github.com/s1lvf1sh/daily-builds';
export const AXES = [
  { key: 'amb', name: 'Ambition', short: 'Amb', q: 'How hard was the problem?' },
  { key: 'cra', name: 'Craft', short: 'Cra', q: 'How well is it built?' },
  { key: 'pro', name: 'Proof', short: 'Pro', q: 'How strong is the evidence it works?' },
  { key: 'del', name: 'Delight', short: 'Del', q: 'Is it enjoyable or beautiful to use?' },
  { key: 'use', name: 'Use', short: 'Use', q: 'Does it solve a real need?' },
  { key: 'ori', name: 'Originality', short: 'Ori', q: 'How far is it from what exists?' },
];
export const PROOF_LADDER = [
  'Never run',
  'Run by hand',
  'Automated tests of the main paths',
  'Tests, plus many inputs, plus inspecting the output',
  'An independent oracle, or the real environment driven end to end',
  'Used by other people, who reported back',
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-11-21' -> '21 Nov 2026' (day-month, never month-day). */
export function fmtDate(iso) {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : iso || '';
}
/** '2026-11-21' -> '21 Nov' */
export function fmtShort(iso) {
  return fmtDate(iso).replace(/ \d{4}$/, '');
}

export const keyOf = (title) => String(title).toLowerCase().replace(/\[\[|\]\]/g, '').replace(/['\u2019]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Parse the score tables in docs/RATINGS.md. Rows with a date have 11 cells, first-round rows have 10. */
export function parseRatings(md) {
  const rows = [];
  const num = (s) => {
    const m = /^\**\s*([0-5](?:\.5|\.0)?)\s*(~?)/.exec(s);
    return m ? { v: parseFloat(m[1]), prov: m[2] === '~' } : null;
  };
  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue;
    const c = line.split('|').slice(1, -1).map((s) => s.trim());
    let i = 0;
    let date = null;
    if (/^\d{4}-\d\d-\d\d$/.test(c[0])) { date = c[0]; i = 1; }
    if (c.length !== i + 10) continue;
    const axes = c.slice(i + 1, i + 7).map(num);
    if (axes.some((a) => !a)) continue;
    rows.push({
      title: c[i].replace(/\[\[|\]\]/g, ''),
      date,
      axes: Object.fromEntries(AXES.map((a, n) => [a.key, axes[n]])),
      overall: parseFloat(c[i + 7].replace(/\*/g, '')),
      cap: parseFloat(c[i + 8]),
      confidence: c[i + 9],
    });
  }
  return rows;
}

/** Parse the "### Title: score" sections into { verdict, evidence, gap }. The last section for a title wins. */
export function parseNotes(md) {
  const out = new Map();
  const parts = md.split(/\n(?=### )/);
  for (const part of parts) {
    const head = /^### (.+?): (\d(?:\.\d)?)/.exec(part);
    if (!head) continue;
    const field = (label) => {
      const m = new RegExp(`\\*\\*${label}[^*]*\\*\\*\\s*([^\\n]+)`).exec(part);
      return m ? m[1].trim() : '';
    };
    out.set(keyOf(head[1]), { verdict: field('Verdict'), evidence: field('Evidence'), gap: field('Biggest gap') });
  }
  return out;
}

/** Join builds.json with the parsed tables and notes. */
export function mergeBuilds(index, ratingRows, notes) {
  const byKey = new Map(ratingRows.map((r) => [keyOf(r.title), r]));
  const mk = (p, group) => {
    const r = byKey.get(keyOf(p.title));
    return {
      title: p.title,
      slug: p.slug || null,
      date: p.date,
      blurb: p.blurb,
      url: p.url,
      repo: p.repo || null,
      status: p.status || 'complete',
      group,
      axes: r ? r.axes : null,
      overall: r ? r.overall : p.rating ?? null,
      cap: r ? r.cap : null,
      confidence: r ? r.confidence : null,
      notes: notes.get(keyOf(p.title)) || null,
    };
  };
  return [...index.daily.map((p) => mk(p, 'daily')), ...index.earlier.map((p) => mk(p, 'earlier'))];
}

/** The scale's rule: overall = mean (half rounds up), never above Proof + 0.5. */
export function scoreScale(s) {
  const vals = AXES.map((a) => s[a.key]);
  const mean = Math.floor((vals.reduce((x, y) => x + y, 0) / 6) * 10 + 0.5 + 1e-9) / 10;
  const cap = s.pro + 0.5;
  return { mean, cap, overall: Math.min(mean, cap), capped: mean > cap };
}

/** Average of each axis across the given builds that have axis scores. */
export function axisMeans(builds) {
  const have = builds.filter((b) => b.axes);
  return AXES.map((a) => ({
    ...a,
    mean: have.reduce((t, b) => t + b.axes[a.key].v, 0) / (have.length || 1),
    provisional: have.filter((b) => b.axes[a.key].prov).length,
    n: have.length,
  }));
}

/** Visitor verdicts -> the JSON block the page exports and I read back in a local session. */
export function exportVerdicts(verdicts, today) {
  const list = Object.entries(verdicts).map(([build, v]) => ({
    build,
    ...(v.use != null ? { use: v.use } : {}),
    ...(v.del != null ? { delight: v.del } : {}),
    ran_it: !!v.ran,
    would_return: !!v.back,
    ...(v.note ? { note: String(v.note).slice(0, 400) } : {}),
  }));
  return JSON.stringify({ schema: 'daily-builds-verdicts/1', exported: today, verdicts: list }, null, 2);
}

/** A prefilled GitHub issue link. Nothing is sent until the visitor opens it and presses Submit. */
export function issueUrl(json, count) {
  const body = '```json\n' + json + '\n```';
  if (body.length > 6000) return null;
  const q = new URLSearchParams({ title: `Verdicts on ${count} build${count === 1 ? '' : 's'}`, body });
  return `${REPO}/issues/new?${q}`;
}

export const stepToHalf = (n) => Math.round(Number(n) * 2) / 2;
