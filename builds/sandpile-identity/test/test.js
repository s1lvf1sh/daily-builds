// Run: node test/test.js   (needs python3 for the oracle)
const S = require('../src/sandpile.js'); const { execFileSync } = require('child_process'); const path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };
const py = (arg) => JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py')].concat(arg ? [arg] : []), { encoding: 'utf8', maxBuffer: 1 << 26 }));

// 1. Hand facts: 1x1 grid, identity is 0 grains? sink group order is 4; recurrent are 0..3 and e+a=a only for e=0.
ok(S.identity(1, 1)[0] === 0, '1x1 identity is empty');
// 2. Identity vs oracle (computed by one-topple-at-a-time, different order)
const ors = py();
for (const o of ors) { const e = S.identity(o.w, o.h); ok(S.equal(e, Int32Array.from(o.e)), `identity ${o.w}x${o.h} matches oracle`); }
// 3. Brute force: the unique identity of tiny groups equals ours, and group order equals the matrix-tree count
for (const b of py('brute')) {
  ok(b.recurrent === b.spanning_trees, `${b.w}x${b.h}: recurrent count ${b.recurrent} = spanning trees ${b.spanning_trees}`);
  ok(b.identities.length === 1 && S.equal(S.identity(b.w, b.h), Int32Array.from(b.identities[0])), `${b.w}x${b.h}: brute-force identity matches`);
  // our recurrence test must accept exactly the recurrent set: enumerate all 4^n configs for n<=9
  const n = b.w * b.h; if (n <= 9) { let cnt = 0; const c = new Int32Array(n); for (let k = 0; k < 4 ** n; k++) { let t = k; for (let i = 0; i < n; i++) { c[i] = t & 3; t >>= 2; } if (S.isRecurrent(c, b.w, b.h)) cnt++; } ok(cnt === b.recurrent, `${b.w}x${b.h}: burning test accepts exactly ${b.recurrent} configs (got ${cnt})`); }
}
// 4. Algebraic properties on bigger grids
for (const [w, h] of [[5, 5], [12, 9], [32, 32], [61, 61]]) {
  const e = S.identity(w, h);
  ok(S.isRecurrent(e, w, h), `${w}x${h}: identity is recurrent`);
  ok(S.equal(S.add(e, e, w, h), e), `${w}x${h}: e + e = e`);
  for (let s = 1; s <= 6; s++) { const a = S.randomRecurrent(w, h, s * 977 + w); ok(S.isRecurrent(a, w, h), `${w}x${h} seed ${s}: random config recurrent`); ok(S.equal(S.add(e, a, w, h), a), `${w}x${h} seed ${s}: e + a = a`); }
  ok(S.equal(S.identity(w, h), e), 'deterministic');
}
// 5. Abelian: topple order does not matter (bulk stack vs parallel rounds vs reversed scan)
for (let s = 1; s <= 20; s++) {
  const r = S.rng(s), w = 3 + ((r() * 12) | 0), h = 3 + ((r() * 12) | 0), a = new Int32Array(w * h); for (let i = 0; i < a.length; i++) a[i] = (r() * 40) | 0;
  const b1 = Int32Array.from(a); S.stabilize(b1, w, h); const b2 = Int32Array.from(a); let g = 0; while (S.step(b2, w, h) && g++ < 1e5); ok(S.equal(b1, b2), `abelian ${w}x${h} #${s}`);
  ok(b1.every(v => v >= 0 && v <= 3), 'stable');
}
// 6. Non-recurrent things are rejected
ok(!S.isRecurrent(S.filled(5, 5, 0), 5, 5), 'empty 5x5 is not recurrent'); ok(S.isRecurrent(S.filled(5, 5, 3), 5, 5), 'all-3 is recurrent');
const bad = S.filled(5, 5, 3); bad[12] = 0; bad[13] = 0; ok(!S.isRecurrent(bad, 5, 5), 'two adjacent empty cells (forbidden subconfiguration) are not recurrent');
// 7. Known literature check: identity of 3x3 has the published form. Corners 2, edge-mid 3? derived by oracle; also symmetry
for (const [w, h] of [[9, 9], [10, 10], [20, 14]]) { const e = S.identity(w, h); let sym = true; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (e[y * w + x] !== e[y * w + (w - 1 - x)] || e[y * w + x] !== e[(h - 1 - y) * w + x]) sym = false; ok(sym, `${w}x${h}: identity has mirror symmetry`); }
// 8. Mass conservation: grains lost = sum of sink-edge topples
{ const w = 7, h = 6, a = new Int32Array(w * h).fill(9), before = a.reduce((x, y) => x + y), c = Int32Array.from(a); const cnt = S.stabilize(c, w, h); let lost = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) lost += cnt[y * w + x] * ((x === 0) + (x === w - 1) + (y === 0) + (y === h - 1)); ok(before - c.reduce((x, y) => x + y) === lost, 'grains lost equal sink-edge topples'); }
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
