'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const P = require('../src/plate.js');
let pass = 0, fail = 0;
const check = (name, ok, info) => { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? '  ' + info : ''}`); };
const MUTATE = process.env.MUTATE || '';

// --- 1. Mode list: ordering and completeness ---
const modes = P.modeList(8);
check('mode list sorted by m^2+n^2', modes.every((q, i) => i === 0 || modes[i - 1].k2 <= q.k2));
check('mode list is complete below the cut (no missing partner)', (() => {
  for (let m = 1; m <= 8; m++) for (let n = m; n <= 8; n++) if (m * m + n * n <= 65 && !modes.some((q) => q.m === m && q.n === n)) return false;
  return true;
})(), `${modes.length} modes`);

// --- 2. Oracle: discrete Laplacian eigenvalues and residuals of our fields ---
const N = 40, h = 1 / (N + 1);
const fields = [];
const cases = [[1, 1, 0], [1, 2, 0], [1, 2, 1], [1, 2, -1], [2, 3, 0.5], [2, 5, 0], [2, 5, 0.7], [3, 4, 1], [4, 7, -0.3], [5, 5, 0], [1, 7, 1], [3, 6, 0.25]];
for (const [m, n, s] of cases) {
  const values = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let v = P.field(m, n, s, (i + 1) * h, (j + 1) * h);
    if (MUTATE === 'field') v = Math.sin(m * Math.PI * (i + 1) * h) * Math.sin((n + 1) * Math.PI * (j + 1) * h); // wrong mode number
    values.push(v);
  }
  fields.push({ m, n, s, values });
}
const res = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py')], { input: JSON.stringify({ fields }), maxBuffer: 1e8 }).toString());
// 2a. Eigenvalue ordering: oracle's 2-D eigenvalues (in pi^2 units) vs JS m^2+n^2, with multiplicity
// JS multiset: (m,n) both orders counted, so m!=n appears twice.
const js = [];
for (let m = 1; m <= 12; m++) for (let n = 1; n <= 12; n++) js.push(m * m + n * n);
js.sort((a, b) => a - b);
let worst = 0;
for (let i = 0; i < 20; i++) worst = Math.max(worst, Math.abs(res.eig2d_over_pi2[i] / js[i] - 1));
check('oracle eigenvalues match m^2+n^2 incl. degeneracy (first 20, <1.5%)', worst < 0.015, `worst relative error ${(worst * 100).toFixed(3)}%`);
// 2b. Fields satisfy the discrete eigen-equation
res.residuals.forEach((r, i) => check(`field (${cases[i].join(', ')}) is an eigenvector of the Laplacian`, r < 0.02, `residual ${r.toExponential(2)}`));
// A deliberately wrong field must be rejected (residual large)
const bad = { m: 2, n: 5, s: 0, values: fields[5].values.map((v, i) => v + 0.5 * Math.sin(3 * Math.PI * ((i % N) + 1) * h) * Math.sin(Math.PI * (Math.floor(i / N) + 1) * h)) };
const badRes = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py')], { input: JSON.stringify({ fields: [bad] }), maxBuffer: 1e8 }).toString()).residuals[0];
check('oracle rejects a field that mixes in a foreign mode', badRes > 0.2, `residual ${badRes.toFixed(2)}`);

// --- 3. Symmetry / boundary properties ---
check('field vanishes on all four edges', [0, 1].every((e) => [0.1, 0.37, 0.8].every((t) => Math.abs(P.field(2, 5, 0.6, e, t)) < 1e-12 && Math.abs(P.field(2, 5, 0.6, t, e)) < 1e-12)));
check('s=+1 gives symmetric, s=-1 antisymmetric under x<->y', [[0.2, 0.7], [0.31, 0.12]].every(([x, y]) => Math.abs(P.field(2, 5, 1, x, y) - P.field(2, 5, 1, y, x)) < 1e-12 && Math.abs(P.field(2, 5, -1, x, y) + P.field(2, 5, -1, y, x)) < 1e-12));
check('s=+1 diagonal x=y is nonzero except nodes, s=-1 diagonal is exactly zero', Math.abs(P.field(2, 5, -1, 0.3, 0.3)) < 1e-12 && Math.abs(P.field(2, 5, 1, 0.3, 0.3)) > 0.1);

// --- 4. Sand physics: grains settle on nodal lines ---
for (const [m, n, s] of [[1, 2, 0], [2, 5, 0.5], [3, 4, 1], [4, 7, -1]]) {
  const mode = { m, n }, rng = P.mulberry32(123);
  const g = P.scatter(5000, rng);
  const before = P.meanAbs(g, mode, s);
  for (let t = 0; t < 600; t++) P.step(g, mode, s, rng, MUTATE === 'sand' ? 0 : 0.06);
  const after = P.meanAbs(g, mode, s);
  check(`sand on (${m},${n}) s=${s}: mean |u| falls to <30% of the random value`, after < 0.3 * before, `${before.toFixed(3)} -> ${after.toFixed(3)}`);
  check(`sand on (${m},${n}) s=${s}: all grains stay on the plate`, Array.from(g.xs).every((x) => x >= 0 && x <= 1) && Array.from(g.ys).every((y) => y >= 0 && y <= 1));
}
// Determinism
const a = P.scatter(10, P.mulberry32(5)), b = P.scatter(10, P.mulberry32(5));
check('same seed gives the same sprinkle', a.xs.every((x, i) => x === b.xs[i]));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
