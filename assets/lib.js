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
  // A project can have several rows: the original, then dated re-ratings after outside verdicts. The last row is current.
  const byKey = new Map();
  const firstKey = new Map();
  for (const r of ratingRows) { byKey.set(keyOf(r.title), r); if (!firstKey.has(keyOf(r.title))) firstKey.set(keyOf(r.title), r); }
  const mk = (p, group) => {
    const r = byKey.get(keyOf(p.title));
    const first = firstKey.get(keyOf(p.title));
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
      original: first && first !== r ? { axes: first.axes, overall: first.overall } : null,
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

/** The id a build has on the page and in verdict files: its slug, or its title with hyphens. */
export const idOf = (b) => b.slug || keyOf(b.title).replace(/ /g, '-');
export const roundHalf = (x) => Math.round(x * 2) / 2;

/**
 * Re-rate from the ORIGINAL scores plus every recorded verdict, never from an already-adjusted row,
 * so applying the same verdicts twice gives the same answer. Only verdicts from people who ran it count.
 *  - Delight (provisional, i.e. my guess): replaced by the mean of the verdicts. A guess is not evidence.
 *  - Use (my judgment): the mean of my score and the verdicts, so I count as one voice among them.
 * Proof, Ambition, Craft and Originality are untouched. Results go to the nearest half point.
 */
export function rerate(original, verdicts) {
  const voices = verdicts.filter((v) => v.ran_it);
  const axes = { ...original };
  const changes = [];
  for (const [key, field] of [['use', 'use'], ['del', 'delight']]) {
    const theirs = voices.map((v) => v[field]).filter((x) => typeof x === 'number');
    if (!theirs.length) continue;
    const mine = original[key];
    const pool = mine.prov ? theirs : [mine.v, ...theirs];
    const v = roundHalf(pool.reduce((a, b) => a + b, 0) / pool.length);
    axes[key] = { v, prov: false };
    changes.push({ key, from: mine, to: axes[key], voices: theirs.length, how: mine.prov ? 'replaced my provisional score' : 'averaged with mine' });
  }
  const scores = Object.fromEntries(AXES.map((a) => [a.key, axes[a.key].v]));
  return { axes, changes, ...scoreScale(scores) };
}

/**
 * Read one GitHub issue body as a verdict file. Only structured fields are kept; free text is
 * length-limited and stripped of control characters, and is only ever shown as text, never run.
 * Returns { verdicts, rejected } where rejected explains each thing that was dropped.
 */
export function parseVerdictIssue(body, knownIds) {
  const rejected = [];
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(body || '');
  let data;
  try { data = JSON.parse(m ? m[1] : body); } catch { return { verdicts: [], rejected: ['no readable JSON block'] }; }
  if (!data || data.schema !== 'daily-builds-verdicts/1' || !Array.isArray(data.verdicts)) return { verdicts: [], rejected: ['not a daily-builds-verdicts/1 file'] };
  const okScore = (x) => typeof x === 'number' && x >= 0 && x <= 5 && x * 2 === Math.round(x * 2);
  const verdicts = [];
  for (const v of data.verdicts.slice(0, 50)) {
    if (!v || typeof v.build !== 'string' || !knownIds.has(v.build)) { rejected.push(`unknown build ${JSON.stringify(v?.build)}`); continue; }
    const out = { build: v.build, ran_it: v.ran_it === true, would_return: v.would_return === true };
    for (const f of ['use', 'delight']) if (v[f] != null) { if (okScore(v[f])) out[f] = v[f]; else rejected.push(`${v.build}: bad ${f} score`); }
    if (typeof v.note === 'string') out.note = v.note.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 400);
    verdicts.push(out);
  }
  return { verdicts, rejected };
}
