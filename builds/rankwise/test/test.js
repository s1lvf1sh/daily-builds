// Run: node test/test.js   (needs python3). Prints a count of passes and failures.
const V = require('../src/vote.js'); const { execFileSync } = require('child_process'); const path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const ri = (n) => Math.floor(rnd() * n);

// 1. Hand-derived cases
const A = V.analyze('3: A > B > C\n2: B > C > A\n2: C > B > A');
ok(eq(A.results.plurality.winners, ['A']) && eq(A.results.irv.winners, ['A']) && eq(A.results.borda.winners, ['B']) && A.condorcet === 'B', 'classic split: plurality A, Condorcet B');
const cyc = V.analyze('1: A > B > C\n1: B > C > A\n1: C > A > B');
ok(cyc.condorcet === null && eq(cyc.results.copeland.winners, ['A', 'B', 'C']) && eq(cyc.results.schulze.winners, ['A', 'B', 'C']), 'perfect 3-cycle: everyone tied, no Condorcet winner');
ok(eq(V.analyze('5: A > B\n4: B > A').results.schulze.winners, ['A']), 'two candidates: majority wins');
ok(eq(V.pairwise(V.parse('2: A > B\n1: B').ballots, ['A', 'B', 'C']), [[0, 2, 2], [1, 0, 3], [0, 0, 0]]), 'unlisted candidates are tied last (partial ballot "B" puts B over A and C, A and C tied)');
// Wikipedia's Schulze example (Schulze 2011) as a known literature value: winner E (45 voters, 5 candidates)
const W = 'x5: A > C > B > E > D\n'.replace('x5', '5') + '5: A > D > E > C > B\n8: B > E > D > A > C\n3: C > A > B > E > D\n7: C > A > E > B > D\n2: C > B > A > D > E\n7: D > C > E > B > A\n8: E > B > A > D > C';
ok(eq(V.analyze(W).results.schulze.winners, ['E']), 'literature example (45 voters): Schulze winner E');
{ const R = V.analyze(W), c = R.candidates, g = (a, b) => R.pairwise[c.indexOf(a)][c.indexOf(b)]; ok(eq(['B', 'C', 'D', 'E'].map((x) => g('A', x)), [20, 26, 30, 22]), 'literature example: row A of the pairwise matrix is 20,26,30,22'); }

// 2. Parser
const bad = ['3: A > A', 'A >', '0: A > B', '2: A = B', ''];
bad.forEach((t) => ok(V.analyze(t).errors.length > 0, 'rejects: ' + JSON.stringify(t)));
const pp = V.parse('# comment\n  3 x  Pizza  >  Tacos # trailing\n\n2: Tacos'); ok(pp.ballots.length === 2 && pp.ballots[0].count === 3 && eq(pp.candidates, ['Pizza', 'Tacos']), 'parser handles comments, spacing, "N x"');
ok(V.parse('1: ' + 'ABCDEFGHIJKLM'.split('').join(' > ')).errors.length > 0, '13 candidates rejected');

// 3. Random sweep against the oracle
function gen() {
  const n = 2 + ri(4), C = 'ABCDEF'.slice(0, n).split(''), nb = 1 + ri(7), ballots = [];
  for (let i = 0; i < nb; i++) { const p = C.slice().sort(() => rnd() - 0.5); const len = 1 + ri(n); ballots.push([1 + ri(5), p.slice(0, len)]); }
  return { cands: C, ballots };
}
const cases = []; for (let i = 0; i < 3000; i++) { const c = gen(); const used = new Set(c.ballots.flatMap((b) => b[1])); c.cands = c.cands.filter((x) => used.has(x)); if (c.cands.length >= 2) cases.push(c); }
const t0 = Date.now();
const orc = JSON.parse(execFileSync('python3', [path.join(__dirname, 'oracle.py')], { input: JSON.stringify(cases), maxBuffer: 1 << 28 }));
const seen = { diverge: 0, cw: 0, nocw: 0, tie: 0 }; let bad2 = 0;
cases.forEach((c, i) => {
  const text = c.ballots.map(([k, r]) => k + ': ' + r.join(' > ')).join('\n'); const P = V.parse(text);
  // keep the oracle's candidate order = parse order so matrices line up
  const cand = P.candidates; const oc = orc[i];
  const o2 = oc; if (!eq(cand, c.cands)) { /* order may differ; compare via names below */ }
  const mine = V.analyze(P);
  for (const m of V.METHODS) if (!eq(mine.results[m].winners.slice().sort(), o2[m])) { bad2++; if (bad2 < 6) console.log('MISMATCH', m, JSON.stringify(c), mine.results[m].winners, o2[m]); }
  if ((mine.condorcet || null) !== o2.condorcet) { bad2++; console.log('CONDORCET mismatch', JSON.stringify(c)); }
  const idx = c.cands.map((x) => cand.indexOf(x)); const pw = idx.map((a) => idx.map((b) => mine.pairwise[a][b]));
  if (!eq(pw, o2.pairwise)) { bad2++; console.log('PAIRWISE mismatch', JSON.stringify(c)); }
  if (new Set(mine.groups.map((g) => g.winners.join())).size > 1) seen.diverge++;
  if (mine.condorcet) seen.cw++; else seen.nocw++;
  if (V.METHODS.some((m) => mine.results[m].winners.length > 1)) seen.tie++;
  // laws that must hold on every input
  if (mine.condorcet) for (const m of ['copeland', 'minimax', 'schulze']) if (!eq(mine.results[m].winners, [mine.condorcet])) { bad2++; console.log('LAW: Condorcet winner not chosen by', m, JSON.stringify(c)); }
  for (const m of V.METHODS) if (mine.results[m].winners.length < 1) { bad2++; console.log('no winner', m); }
});
ok(bad2 === 0, `${cases.length} random cases x 6 methods agree with the oracle (${bad2} problems)`);
ok(seen.diverge > 300 && seen.cw > 300 && seen.nocw > 100 && seen.tie > 100, 'sweep covers disagreement, Condorcet, cycles and ties: ' + JSON.stringify(seen));
console.log(`sweep ${cases.length} cases in ${Date.now() - t0} ms; ${JSON.stringify(seen)}`);
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
