// Writes oracle_cases.json: random place notations and touches, with the engine's answers.
const R = require('../src/ring.js'); const fs = require('fs'); const path = require('path');
let seed = 20261119; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)); const pick = (a) => a[ri(0, a.length - 1)];
const SYM = R.SYM;
function randChange(n) { // a random valid change, as text
  if (n % 2 === 0 && rnd() < 0.3) return rnd() < 0.5 ? 'x' : '-';
  for (let t = 0; t < 200; t++) {
    const k = ri(1, n); const set = new Set(); while (set.size < k) set.add(ri(1, n));
    const places = [...set].sort((a, b) => a - b);
    if (!R.validateChange(places, n, 0)) return places.map((p) => SYM[p - 1]).join('');
  }
  return n % 2 ? '1' : 'x';
}
const cases = []; const notations = [];
for (let i = 0; i < 400; i++) {
  const n = ri(4, 8); const len = ri(1, 12); let parts = [];
  for (let j = 0; j < len; j++) parts.push(randChange(n));
  let s = ''; for (let j = 0; j < parts.length; j++) { const p = parts[j]; s += (j && p !== 'x' && p !== '-' && s[s.length - 1] !== 'x' && s[s.length - 1] !== '-' ? '.' : '') + p; }
  const style = rnd();
  if (style < 0.25) s = '&' + s; else if (style < 0.5 && parts.length > 1) { const k = ri(1, parts.length - 1); s = parts.slice(0, k).join('.').replace(/\.?([x-])\.?/g, '$1') + ',' + parts.slice(k).join('.').replace(/\.?([x-])\.?/g, '$1'); }
  if (rnd() < 0.15) { const chars = s.split(''); chars[ri(0, chars.length - 1)] = pick(['9', '3', 'q', '.', 'x', '7']); s = chars.join(''); } // sometimes break it
  notations.push({ n, s });
}
for (const { n, s } of notations) {
  const p = R.parseNotation(s, n); const c = { kind: 'notation', n, s, valid: !p.error };
  if (!p.error) {
    c.changes = p.changes.map((x) => x.join(','));
    const m = { n, changes: p.changes, calls: {} }; const L = p.changes.length;
    const comp = []; const k = ri(1, 6); for (let i = 0; i < k; i++) comp.push('p'); // plain leads: engine rows
    const r = R.ring(m, comp); const a = R.analyse(r.rows, n);
    c.comp = comp.join(''); c.rows = r.rows.map(R.rowStr); c.analysis = { length: a.length, comesRound: a.comesRound, distinct: a.distinct, groups: a.falseGroups };
  }
  cases.push(c);
}
// the named methods with random call strings (includes false and untrue-ending touches)
const methods = [
  { name: 'Plain Bob Minimus', n: 4, pn: '&x14x14,12', bob: '14', single: '1234' },
  { name: 'Plain Bob Doubles', n: 5, pn: '&5.1.5.1.5,125', bob: '145', single: '123' },
  { name: 'Plain Bob Minor', n: 6, pn: '&x16x16x16,12', bob: '14', single: '1234' },
  { name: 'Plain Bob Major', n: 8, pn: '&x18x18x18x18,12', bob: '14', single: '1234' },
];
for (const mm of methods) for (let i = 0; i < 150; i++) {
  const k = ri(1, 14); let comp = ''; for (let j = 0; j < k; j++) comp += pick(['p', 'p', 'b', 's']);
  const m = R.makeMethod(mm.n, mm.pn, mm.bob, mm.single); const r = R.ring(m, comp.split('')); const a = R.analyse(r.rows, mm.n);
  cases.push({ kind: 'touch', ...mm, comp, rows: r.rows.map(R.rowStr), analysis: { length: a.length, comesRound: a.comesRound, distinct: a.distinct, groups: a.falseGroups } });
}
// exhaustive composition searches
const searches = [
  { ...methods[0], K: 8, extentOnly: false }, { ...methods[1], K: 8, extentOnly: false },
  { ...methods[2], K: 9, extentOnly: false }, { ...methods[1], K: 12, extentOnly: true },
];
for (const s of searches) {
  const m = R.makeMethod(s.n, s.pn, s.bob, s.single);
  const r = R.search(m, { maxLeads: s.K, limit: 1e9, nodeBudget: 1e9, extentOnly: s.extentOnly });
  cases.push({ kind: 'search', ...s, complete: r.complete, total: r.total, countByLeads: r.countByLeads, touches: r.touches.slice().sort() });
}
fs.writeFileSync(path.join(__dirname, 'oracle_cases.json'), JSON.stringify(cases));
console.log('cases', cases.length, 'notations valid', cases.filter((c) => c.kind === 'notation' && c.valid).length, 'invalid', cases.filter((c) => c.kind === 'notation' && !c.valid).length);
for (const c of cases.filter((x) => x.kind === 'search')) console.log(c.name, 'K', c.K, 'extentOnly', c.extentOnly, 'total', c.total, JSON.stringify(c.countByLeads));
