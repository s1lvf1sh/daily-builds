// node test/test.js   (MUT=name runs the engine with one deliberate bug, to prove the tests can fail)
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '../src/ruler.js'), 'utf8');
const MUTS = {
  nodiff0: ['const d = Math.abs(x - marks[i]); if (cnt[d]++ === 0 && inT[d]) uncovered--;', 'const d = Math.abs(x - marks[i]); if (cnt[d]++ === 0 && inT[d] && d > 1) uncovered--;'],
  bound: ['rem * m0 + (rem * (rem - 1)) / 2', 'rem * m0 + (rem * (rem - 1)) / 2 - 1'],
  noends: ['add(0); if (L > 0) add(L);', 'add(0);'],
  mirror: ['Math.round((solutions + palindromes) / 2)', 'solutions'],
  pal: ['v === L - m[m.length - 1 - i]', 'v === m[i]'],
  loopend: ['x <= L - 1 - (rem - 1)', 'x <= L - 1 - rem'],
  wich: ['steps.push(r + 1);\n    for (let i = 0; i < r; i++) steps.push(2 * r + 1);', 'steps.push(r + 2);\n    for (let i = 0; i < r; i++) steps.push(2 * r + 1);'],
  lb: ['(k * (k - 1)) / 2 < L', '(k * (k - 1)) / 2 <= L'],
  clean: ['m < 0 || m > L', 'm < 0 || m > L + 1'],
  missing: ['targets.filter((t) => !have.has(t))', 'targets.filter((t) => !have.has(t) && t !== 1)'],
};
if (process.env.MUT) { const [a, b] = MUTS[process.env.MUT]; if (!src.includes(a)) throw new Error('mutation target not found: ' + process.env.MUT); src = src.replace(a, b); }
const m = { exports: {} }; new Function('module', 'self', src)(m, undefined); const R = m.exports;
let pass = 0, fail = 0;
const eq = (a, b, name) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (ok) pass++; else { fail++; if (fail < 25) console.log('FAIL', name, JSON.stringify(a), '!=', JSON.stringify(b)); } };
const T = (n) => Array.from({ length: n }, (_, i) => i + 1);
const safe = (f) => { try { return f(); } catch (e) { return 'threw:' + e.message; } };

// distances and missing, worked by hand
eq(R.distances([0, 1, 4, 6]), [1, 2, 3, 4, 5, 6], 'distances of 0,1,4,6');
eq(R.missing([0, 1, 4, 6], T(6)), [], 'perfect ruler 0,1,4,6 misses nothing');
eq(R.missing([0, 1, 3, 6], T(6)), [4], 'ruler 0,1,3,6 measures 1,2,3,5,6 and misses only 4');
eq(R.missing([0, 6], T(6)), [1, 2, 3, 4, 5], 'bare stick measures only its length');
eq(R.missing([0, 1, 4, 6], [7, 8]), [7, 8], 'distances beyond the stick are missing');
eq(R.cleanMarks([3, 3, 1], 6), [0, 1, 3, 6], 'cleanMarks adds ends, sorts, removes duplicates');
eq(safe(() => R.cleanMarks([7], 6)), 'threw:mark 7 is not a whole number from 0 to 6', 'mark out of range rejected');
eq(safe(() => R.cleanMarks([1.5], 6)), 'threw:mark 1.5 is not a whole number from 0 to 6', 'fractional mark rejected');
eq(R.lowerBound(6), 4, 'lower bound L=6'); eq(R.lowerBound(7), 5, 'lower bound L=7'); eq(R.lowerBound(1), 2, 'lower bound L=1'); eq(R.lowerBound(3), 3, 'lower bound L=3');

// classic anchors: perfect rulers exist exactly for L = 1,2,3,6
for (const [L, k] of [[1, 2], [2, 3], [3, 3], [6, 4], [13, 6]]) eq(R.solve(L, T(L)).count, k, 'known minimum marks for length ' + L);
eq(R.solve(6, T(6)).marks, [0, 1, 4, 6], 'only perfect ruler of length 6 found');
eq(R.solve(6, T(6), { countAll: true }).solutions, 1, 'length 6 has one optimal ruler up to mirror');
eq(R.solve(1, [1]).marks, [0, 1], 'length 1');
eq(R.solve(5, []).count, 2, 'no targets: the bare stick');
eq(R.solve(10, [10]).count, 2, 'only the full length needed: 2 marks');
eq(R.solve(10, [5]).count, 3, 'only 5 needed on length 10: 3 marks');
eq(R.solve(10, [3, 7]).count, 3, 'targets 3 and 7 on length 10: mark at 3 (or 7) is enough');
eq(R.solve(9, [4, 5]).count, 3, 'targets 4 and 5 on length 9: one mark at 4 or 5');

// Wichmann family: complete, with the stated length and mark count
for (let r = 0; r <= 4; r++) for (let s = 0; s <= 6; s++) {
  const w = R.wichmann(r, s), L = w[w.length - 1];
  eq([L, w.length], [4 * r * (r + s + 2) + 3 * (s + 1), 4 * r + s + 3], `W(${r},${s}) length and marks`);
  eq(R.missing(w, T(L)), [], `W(${r},${s}) is a complete ruler`);
}
// the exact minimum never exceeds a Wichmann ruler of the same length
for (const [r, s] of [[1, 0], [1, 1], [0, 0], [2, 0]]) { const w = R.wichmann(r, s), L = w[w.length - 1]; eq(R.solve(L, T(L), { deadlineMs: 20000 }).count <= w.length, true, `exact <= W(${r},${s})`); }

// anneal: any answer must verify; it must not invent a ruler
const lcg = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
{ const a = R.anneal(30, T(30), 10, { rng: lcg(7), deadlineMs: 4000 }); eq(a ? [a.length, R.missing(a, T(30)).length, a[0], a[a.length - 1]] : null, [10, 0, 0, 30], 'anneal finds a valid 10-mark ruler for 30'); }
eq(R.anneal(30, T(30), 5, { rng: lcg(7), deadlineMs: 300 }), null, 'anneal returns null when 5 marks cannot measure 1..30');

// oracle: independent brute force over every mark set
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle_cases.json'), 'utf8'));
let multi = 0, partial = 0;
for (const c of cases) {
  const r = R.solve(c.L, c.targets, { countAll: true });
  eq([r.count, r.solutions, r.proven], [c.k, c.optimal, true], `oracle L=${c.L} T=${c.targets}`);
  eq(r.marks && R.missing(r.marks, c.targets).length, 0, `returned ruler covers targets L=${c.L}`);
  eq(r.marks && r.marks.length, c.k, `returned ruler has k marks L=${c.L}`);
  const inOracle = c.rulers.some((x) => JSON.stringify(x) === JSON.stringify(r.marks) || JSON.stringify(x.map((v) => c.L - v).reverse()) === JSON.stringify(r.marks));
  eq(inOracle, true, `returned ruler is one the oracle lists L=${c.L}`);
  if (c.optimal > 1) multi++; if (c.targets.length < c.L) partial++;
}
console.log(`oracle cases: ${cases.length} (${multi} with several optimal rulers, ${partial} with only some distances needed)`);
console.log(`${pass} passed, ${fail} failed` + (process.env.MUT ? ' [mutant ' + process.env.MUT + ']' : ''));
process.exit(fail ? 1 : 0);
