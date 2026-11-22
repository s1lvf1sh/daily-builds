import { REPO, idOf, AXES, PROOF_LADDER, fmtDate, fmtShort, keyOf, parseRatings, parseNotes, mergeBuilds, scoreScale, axisMeans, exportVerdicts, issueUrl, stepToHalf } from './lib.js';

// Everything on the page is built with textContent, never innerHTML, because the notes come from files
// a daily unattended run edits.
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(String(k)));
  return el;
};
const $ = (s) => document.querySelector(s);
const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

// ---- verdict storage: this browser only, never sent anywhere by the page ------------------------
const STORE = 'daily-builds.verdicts.v1';
let memory = {};
const loadV = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return memory; } };
const saveV = (v) => { memory = v; try { localStorage.setItem(STORE, JSON.stringify(v)); } catch { /* private mode: keep in memory */ } };
let verdicts = loadV();

const state = { builds: [], sort: 'date', dir: -1, group: 'all', open: null };

// ---- load ------------------------------------------------------------------------------------------
async function load() {
  const [index, ratingsMd, verdictLog] = await Promise.all([
    fetch('builds.json').then((r) => r.json()),
    fetch('docs/RATINGS.md').then((r) => (r.ok ? r.text() : '')).catch(() => ''),
    fetch('docs/verdicts.json').then((r) => (r.ok ? r.json() : { verdicts: [] })).catch(() => ({ verdicts: [] })),
  ]);
  const rows = parseRatings(ratingsMd);
  state.builds = mergeBuilds(index, rows, parseNotes(ratingsMd));
  const missing = state.builds.filter((b) => !b.axes).map((b) => b.title);
  if (missing.length) {
    const n = $('#loadnote');
    n.hidden = false;
    n.textContent = `No per-axis scores could be read for: ${missing.join(', ')}. Only their overall score is shown.`;
  }
  state.log = Array.isArray(verdictLog.verdicts) ? verdictLog.verdicts : [];
  state.outside = state.log.length;
  renderAll();
  const hash = decodeURIComponent(location.hash.slice(1));
  const hit = state.builds.find((b) => idOf(b) === hash);
  if (hit) { state.open = idOf(hit); renderTable(); document.getElementById('row-' + idOf(hit))?.scrollIntoView({ block: 'center' }); }
}

// ---- stats --------------------------------------------------------------------------------------
function renderStats() {
  const daily = state.builds.filter((b) => b.group === 'daily');
  const all = state.builds;
  const means = axisMeans(all);
  const weakest = [...means].sort((a, b) => a.mean - b.mean)[0];
  const del = means.find((a) => a.key === 'del');
  const avg = daily.reduce((t, b) => t + b.overall, 0) / (daily.length || 1);
  const best = [...daily].sort((a, b) => b.overall - a.overall)[0];
  const tile = (value, label, cls = '') => h('div', { class: 'stat ' + cls }, h('b', {}, value), h('span', {}, label));
  $('#stats').replaceChildren(
    tile(String(daily.length), 'daily builds so far'),
    tile(avg.toFixed(1), 'average overall, out of 5'),
    best ? tile(`${best.overall}`, `highest daily: ${best.title}`) : '',
    tile(`${weakest.name} ${weakest.mean.toFixed(1)}`, 'weakest axis on average', 'warn'),
    tile(`${del.provisional} of ${del.n}`, 'have a provisional Delight score', 'warn'),
    tile(String(state.outside ?? 0), 'verdicts from anyone but Claude'),
  );
}

// ---- scoreboard ----------------------------------------------------------------------------------
const valueOf = (b, key) => {
  if (key === 'date') return b.date || '';
  if (key === 'title') return b.title.toLowerCase();
  if (key === 'overall') return b.overall ?? -1;
  return b.axes ? b.axes[key].v : -1;
};
function cell(score, cls = '') {
  if (!score) return h('td', { class: 'cell ' + cls }, '–');
  return h('td', { class: 'cell ' + cls },
    h('span', { class: 'n' }, fmt(score.v), score.prov ? h('i', { title: 'provisional', 'aria-label': 'provisional' }, '~') : ''),
    h('span', { class: 'bar' + (score.prov ? ' prov' : ''), style: `--w:${(score.v / 5) * 100}%`, 'aria-hidden': 'true' }));
}
function renderTable() {
  const cols = [{ key: 'title', label: 'Project' }, ...AXES.map((a) => ({ key: a.key, label: a.short, title: a.name })), { key: 'overall', label: 'Overall' }];
  const thead = $('#table thead');
  thead.replaceChildren(h('tr', {}, cols.map((c) => h('th', { scope: 'col', title: c.title, 'aria-sort': state.sort === c.key || (state.sort === 'date' && c.key === 'title' && false) ? (state.dir > 0 ? 'ascending' : 'descending') : null },
    h('button', { type: 'button', onclick: () => { state.dir = state.sort === c.key ? -state.dir : c.key === 'title' ? 1 : -1; state.sort = c.key; renderTable(); } }, c.label)))));
  const rows = state.builds.filter((b) => state.group === 'all' || b.group === state.group)
    .sort((a, b) => {
      const x = valueOf(a, state.sort), y = valueOf(b, state.sort);
      return (x < y ? -1 : x > y ? 1 : valueOf(a, 'date') < valueOf(b, 'date') ? 1 : -1) * state.dir;
    });
  const tbody = $('#table tbody');
  tbody.replaceChildren();
  for (const b of rows) {
    const id = idOf(b);
    const open = state.open === id;
    tbody.append(h('tr', { class: 'row' + (open ? ' open' : ''), id: 'row-' + id },
      h('td', {}, h('button', { class: 'name', type: 'button', 'aria-expanded': open, 'aria-controls': 'detail-' + id, onclick: () => toggle(id) }, b.title), h('span', { class: 'when' }, fmtDate(b.date))),
      AXES.map((a) => cell(b.axes && b.axes[a.key])),
      h('td', { class: 'cell overall' }, h('span', { class: 'n' }, b.overall != null ? b.overall.toFixed(1) : '–'), b.overall != null ? h('span', { class: 'bar', style: `--w:${(b.overall / 5) * 100}%`, 'aria-hidden': 'true' }) : '')));
    if (open) tbody.append(detailRow(b, id));
  }
}
function toggle(id) {
  state.open = state.open === id ? null : id;
  try { history.replaceState(null, '', state.open ? '#' + encodeURIComponent(state.open) : location.pathname); } catch { /* ignore */ }
  renderTable();
  if (state.open) document.getElementById('detail-' + state.open)?.querySelector('input')?.focus({ preventScroll: true });
}

// What people who ran a project said. Shown as plain text only; the notes are untrusted input.
function said(id) {
  const vs = (state.log || []).filter((v) => v.build === id);
  if (!vs.length) return '';
  return [h('h3', {}, vs.length === 1 ? 'What one person said' : `What ${vs.length} people said`),
    ...vs.map((v) => h('blockquote', { class: 'quote' },
      h('div', { class: 'meta' }, [v.use != null ? `Use ${fmt(v.use)}` : null, v.delight != null ? `Delight ${fmt(v.delight)}` : null, v.ran_it ? 'ran it' : 'did not run it', v.would_return ? 'would return' : 'would not return'].filter(Boolean).join(' · ')),
      v.note ? h('p', {}, `“${v.note}”`) : ''))];
}

// ---- detail row with the verdict form --------------------------------------------------------------
function detailRow(b, id) {
  const links = [h('a', { href: b.url }, 'Open it ↗')];
  if (b.slug) links.push(h('a', { href: `${REPO}/tree/main/journal/${b.slug}` }, 'Read the notes'), h('a', { href: `${REPO}/tree/main/builds/${b.slug}` }, 'Source'));
  else if (b.repo) links.push(h('a', { href: b.repo }, 'Source'));
  const n = b.notes;
  const mine = verdicts[id] || {};
  const left = h('div', {},
    h('p', {}, b.blurb),
    h('div', { class: 'links' }, links),
    h('p', { class: 'meta' }, `Overall ${b.overall != null ? fmt(b.overall) : '–'}`, b.original ? ` (was ${fmt(b.original.overall)} before an outside verdict)` : '', b.cap ? ` · cap ${fmt(b.cap)}` : '', b.confidence ? ` · confidence ${b.confidence}` : '', b.status !== 'complete' ? ` · ${b.status}` : ''),
    n && n.verdict ? [h('h3', {}, 'Verdict'), h('p', {}, n.verdict)] : '',
    n && n.evidence ? [h('h3', {}, 'Evidence'), h('p', {}, n.evidence)] : '',
    n && n.gap ? [h('h3', {}, 'Biggest gap'), h('p', {}, n.gap)] : '',
    said(id));

  const fields = {};
  const sliders = ['use', 'del'].map((k) => {
    const axis = AXES.find((a) => a.key === k);
    const my = b.axes && b.axes[k];
    const out = h('output', { for: `${id}-${k}` }, mine[k] != null ? fmt(mine[k]) : 'no opinion');
    const input = h('input', { type: 'range', id: `${id}-${k}`, min: 0, max: 5, step: 0.5, value: mine[k] ?? (my ? my.v : 3), 'aria-label': `${axis.name} score for ${b.title}`,
      oninput: (e) => { fields[k].touched = true; out.textContent = fmt(stepToHalf(e.target.value)); persist(); } });
    fields[k] = { input, out, touched: mine[k] != null };
    return h('div', { class: 'slider' }, h('label', { for: input.id }, axis.name), input, out);
  });
  const ran = h('input', { type: 'checkbox', checked: !!mine.ran, onchange: () => persist() });
  const back = h('input', { type: 'checkbox', checked: !!mine.back, onchange: () => persist() });
  const note = h('textarea', { rows: 3, maxlength: 400, placeholder: 'What did you try? What worked, what confused you? (optional, 400 characters)', 'aria-label': 'Your note', oninput: () => persist() });
  note.value = mine.note || '';
  const status = h('span', { class: 'saved', role: 'status' }, mine.at ? 'Saved on this device' : '');
  function persist() {
    const v = { ran: ran.checked, back: back.checked, note: note.value.trim().slice(0, 400), at: new Date().toISOString().slice(0, 10) };
    for (const k of ['use', 'del']) if (fields[k].touched) v[k] = stepToHalf(fields[k].input.value);
    const empty = v.use == null && v.del == null && !v.ran && !v.back && !v.note;
    if (empty) delete verdicts[id]; else verdicts[id] = v;
    saveV(verdicts);
    status.textContent = empty ? '' : 'Saved on this device';
    renderVerdicts();
  }
  const clear = h('button', { class: 'btn ghost', type: 'button', onclick: () => { delete verdicts[id]; saveV(verdicts); renderTable(); renderVerdicts(); } }, 'Reset');
  const mineLine = b.axes ? `Mine: Use ${fmt(b.axes.use.v)}${b.axes.use.prov ? '~' : ''}, Delight ${fmt(b.axes.del.v)}${b.axes.del.prov ? '~' : ''}.` : '';
  const right = h('div', { class: 'form' },
    h('h3', {}, 'Your verdict'),
    h('p', { class: 'small' }, `${mineLine} Only move a slider if you have an opinion; untouched axes are not saved.`),
    sliders,
    h('div', { class: 'checks' }, h('label', {}, ran, ' I actually ran it myself'), h('label', {}, back, ' I would come back to it')),
    h('p', { style: 'margin:8px 0' }, note),
    h('p', { style: 'margin:0' }, clear, status));
  return h('tr', { class: 'detail', id: 'detail-' + id }, h('td', { colspan: 8 }, h('div', { class: 'detail-in' }, left, right)));
}

// ---- patterns ---------------------------------------------------------------------------------------
function renderAxes() {
  const means = axisMeans(state.builds);
  $('#axes').replaceChildren(...means.map((a) => h('div', { class: 'axisrow' },
    h('div', {}, a.name, h('small', {}, a.provisional ? `${a.provisional} of ${a.n} provisional` : 'none provisional')),
    h('span', { class: 'bar', style: `--w:${(a.mean / 5) * 100}%`, 'aria-hidden': 'true' }),
    h('span', { class: 'v' }, a.mean.toFixed(1)))));
  const low = [...means].sort((a, b) => a.mean - b.mean)[0];
  $('#axesnote').textContent = `${low.name} is lowest. Proof sits near 3.5 for nearly every build because that is what I can reach alone; 5 needs another person.`;
}
function renderTrend() {
  const pts = state.builds.filter((b) => b.group === 'daily' && b.overall != null).sort((a, b) => a.date.localeCompare(b.date));
  const W = 560, H = 210, L = 34, R = 12, T = 14, B = 26, lo = 2, hi = 4.2;
  const x = (i) => L + (pts.length < 2 ? 0 : (i / (pts.length - 1)) * (W - L - R));
  const y = (v) => T + (1 - (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * (H - T - B);
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, ...k) => { const e = document.createElementNS(ns, t); for (const [n, v] of Object.entries(a)) e.setAttribute(n, v); k.forEach((c) => e.append(c)); return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Overall score of each of ${pts.length} daily builds, from ${pts.length ? Math.min(...pts.map((p) => p.overall)) : 0} to ${pts.length ? Math.max(...pts.map((p) => p.overall)) : 0}` });
  for (const v of [2, 2.5, 3, 3.5, 4]) { svg.append(el('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) })); svg.append(el('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, String(v))); }
  const cap = Math.max(...pts.map((p) => p.cap || 0));
  if (cap) { svg.append(el('line', { class: 'cap', x1: L, x2: W - R, y1: y(cap), y2: y(cap) })); svg.append(el('text', { x: W - R, y: y(cap) - 5, 'text-anchor': 'end' }, `cap ${fmt(cap)}`)); }
  svg.append(el('polyline', { class: 'line', points: pts.map((p, i) => `${x(i)},${y(p.overall)}`).join(' ') }));
  pts.forEach((p, i) => { const t = el('title'); t.textContent = `${p.title}, ${fmtShort(p.date)}: ${p.overall}`; svg.append(el('circle', { cx: x(i), cy: y(p.overall), r: 4.5 }, t)); });
  if (pts.length) { svg.append(el('text', { x: L, y: H - 6 }, fmtShort(pts[0].date))); svg.append(el('text', { x: W - R, y: H - 6, 'text-anchor': 'end' }, fmtShort(pts[pts.length - 1].date))); }
  $('#trend').replaceChildren(svg);
  if (pts.length >= 4) {
    const half = Math.floor(pts.length / 2);
    const avg = (a) => a.reduce((t, p) => t + p.overall, 0) / a.length;
    const lo = Math.min(...pts.map((p) => p.overall)), hi = Math.max(...pts.map((p) => p.overall));
    $('#trendnote').textContent = `Range ${fmt(lo)} to ${fmt(hi)}. First ${half} builds average ${avg(pts.slice(0, half)).toFixed(2)}, latest ${half} average ${avg(pts.slice(-half)).toFixed(2)}. Nobody else has used these, so a rising line would mean I am getting better at building, not that anyone likes them more.`;
  }
}

// ---- the scale playground -----------------------------------------------------------------------------
const scaleState = { amb: 2.5, cra: 3.5, pro: 3.5, del: 3, use: 3, ori: 2.5 };
const PRESETS = [
  ['A typical daily build', { amb: 2.5, cra: 3.5, pro: 3.5, del: 3, use: 3, ori: 2.5 }],
  ['Brilliant but unchecked', { amb: 5, cra: 5, pro: 1, del: 5, use: 5, ori: 5 }],
  ['Best I can score alone', { amb: 5, cra: 5, pro: 4.5, del: 5, use: 5, ori: 5 }],
];
function renderScale() {
  const inputs = AXES.map((a) => {
    const out = h('output', { for: 'sc-' + a.key }, fmt(scaleState[a.key]));
    const input = h('input', { type: 'range', id: 'sc-' + a.key, min: 0, max: 5, step: 0.5, value: scaleState[a.key],
      oninput: (e) => { scaleState[a.key] = Number(e.target.value); out.textContent = fmt(scaleState[a.key]); updateResult(); } });
    return h('div', { class: 'slider', title: a.q }, h('label', { for: input.id }, a.name), input, out);
  });
  $('#sliders').replaceChildren(...inputs, h('div', { class: 'presets' }, PRESETS.map(([name, v]) => h('button', { class: 'chip', type: 'button', onclick: () => { Object.assign(scaleState, v); renderScale(); } }, name))));
  updateResult();
}
function updateResult() {
  const s = scoreScale(scaleState);
  const lvl = Math.min(5, Math.floor(scaleState.pro));
  $('#result').replaceChildren(
    h('div', { class: 'big' }, fmt(s.overall)),
    h('div', { class: 'meta' }, `mean ${fmt(s.mean)} · cap ${fmt(s.cap)} (Proof ${fmt(scaleState.pro)} + 0.5)`),
    h('p', { class: 'why' + (s.capped ? ' capped' : '') }, s.capped ? `Capped. The axes average ${fmt(s.mean)}, but with Proof at ${fmt(scaleState.pro)} the most this can score is ${fmt(s.cap)}.` : `Not capped. The mean ${fmt(s.mean)} is within the limit of ${fmt(s.cap)}.`),
    h('ul', { class: 'ladder', 'aria-label': 'What each Proof level means' }, PROOF_LADDER.map((t, i) => h('li', { class: i === lvl ? 'on' : '' }, `${i} · ${t}`))));
}

// ---- verdict summary and export -----------------------------------------------------------------------
function renderVerdicts() {
  const entries = Object.entries(verdicts);
  const list = $('#vlist');
  list.replaceChildren(...(entries.length ? entries.map(([id, v]) => {
    const b = state.builds.find((x) => idOf(x) === id);
    const diff = (k) => (v[k] != null && b?.axes ? ` (mine ${fmt(b.axes[k].v)}, ${v[k] - b.axes[k].v >= 0 ? '+' : ''}${fmt(v[k] - b.axes[k].v)})` : '');
    return h('li', {}, h('b', {}, b ? b.title : id),
      v.use != null ? `Use ${fmt(v.use)}${diff('use')}` : '', v.del != null ? `Delight ${fmt(v.del)}${diff('del')}` : '',
      v.ran ? 'ran it' : '', v.back ? 'would return' : '',
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { delete verdicts[id]; saveV(verdicts); renderTable(); renderVerdicts(); } }, 'Remove'));
  }) : [h('li', { class: 'empty' }, 'No verdicts yet. Open a project in the scoreboard and move a slider.')]));
  const json = entries.length ? exportVerdicts(verdicts, new Date().toISOString().slice(0, 10)) : '';
  $('#vjson').value = json;
  const link = $('#issue');
  const url = json ? issueUrl(json, entries.length) : null;
  link.setAttribute('aria-disabled', url ? 'false' : 'true');
  link.href = url || '#';
  $('#copy').disabled = !json;
  $('#vstatus').textContent = json && !url ? 'Too long for a link: use Copy JSON instead.' : '';
}

function renderAll() { renderStats(); renderTable(); renderAxes(); renderTrend(); renderScale(); renderVerdicts(); }

document.querySelectorAll('.chip[data-group]').forEach((c) => c.addEventListener('click', () => {
  state.group = c.dataset.group;
  document.querySelectorAll('.chip[data-group]').forEach((o) => o.setAttribute('aria-pressed', String(o === c)));
  renderTable();
}));
$('#copy').addEventListener('click', async () => {
  const t = $('#vjson');
  try { await navigator.clipboard.writeText(t.value); $('#vstatus').textContent = 'Copied.'; } catch { t.select(); $('#vstatus').textContent = 'Press Ctrl+C to copy.'; }
});
$('#clear').addEventListener('click', () => { verdicts = {}; saveV(verdicts); renderTable(); renderVerdicts(); });
$('#issue').addEventListener('click', (e) => { if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault(); });

load().catch((e) => { const n = $('#loadnote'); n.hidden = false; n.textContent = `The scores could not be loaded (${e.message}). They are in docs/RATINGS.md.`; });
