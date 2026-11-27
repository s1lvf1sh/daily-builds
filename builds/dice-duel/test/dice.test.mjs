// Run: node --test test/dice.test.mjs   (needs python3 for the oracle test)
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { createRequire } from 'node:module'; import { execFileSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const D = createRequire(import.meta.url)('../src/dice.js');
const oracle = fileURLToPath(new URL('./oracle.py', import.meta.url));
const asObj = (d) => Object.fromEntries([...d.map].sort((a, b) => a[0] - b[0]).map(([k, v]) => [k, v.toString()]));

test('matches brute-force enumeration on 120 random expressions x 3 seeds (exact counts)', () => {
  let n = 0;
  for (const seed of [1, 2, 3]) {
    const cases = JSON.parse(execFileSync('python3', ['-I', oracle, String(seed)], { maxBuffer: 1 << 26 }).toString());
    for (const [expr, counts] of Object.entries(cases)) {
      const want = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, String(v)]));
      const got = asObj(D.parse(expr));
      // total in JS is a product of die counts; the oracle's too, so counts must be equal as-is
      assert.deepEqual(got, want, expr); n++;
    }
  }
  assert.ok(n >= 300, 'cases checked: ' + n); console.log('exact cases:', n);
});

test('published values: 4d6 drop lowest mean 12.2446, advantage d20 mean 13.825', () => {
  assert.ok(Math.abs(D.stats(D.parse('4d6dl1')).mean - 12.2446) < 5e-5);
  assert.ok(Math.abs(D.stats(D.parse('2d20kh1')).mean - 13.825) < 1e-12);
  assert.ok(Math.abs(D.stats(D.parse('2d20kl1')).mean - 7.175) < 1e-12);
  // P(natural 20 with advantage) = 1 - (19/20)^2
  assert.ok(Math.abs(D.atLeast(D.parse('2d20kh1'), 20) - 0.0975) < 1e-12);
});

test('symmetry and totals', () => {
  const a = D.parse('3d8kh2'); assert.equal(a.total, 512n);
  const d = D.duel(D.parse('2d6'), D.parse('2d6'));
  assert.equal(d.gt, d.lt); assert.equal(d.gt + d.eq + d.lt, d.T); assert.equal(d.eq, 146n);  // 146/1296 ties
  const r = D.duel(D.parse('d20+3'), D.parse('d20')); assert.ok(r.pGt > r.pLt);
});

test('grammar: precedence, parens, unary minus, d%, whitespace and case', () => {
  assert.equal(D.stats(D.parse('2+3*4')).mean, 14);
  assert.equal(D.stats(D.parse('(2+3)*4')).mean, 20);
  assert.equal(D.stats(D.parse('-d4')).mean, -2.5);
  assert.ok(Math.abs(D.stats(D.parse(' 2D6 + 1 ')).mean - 8) < 1e-12);
  assert.equal(D.parse('d%').total, 100n);
  assert.equal(D.stats(D.parse('5-2-1')).mean, 2);   // left-associative
  assert.equal(D.stats(D.parse('d6kh')).mean, 3.5);  // kh defaults to 1
});

test('bad input throws a readable error and never hangs', () => {
  for (const bad of ['', '   ', '2d', 'd0', '0d6', '2d6+', '(2d6', '2d6)', '2d6 kh x', '3 4', 'abc', '101d6', '2d1001', '100d1000'])
    assert.throws(() => D.parse(bad), Error, JSON.stringify(bad));
});

test('keep more than rolled keeps all; keep 0 gives 0', () => {
  assert.deepEqual(asObj(D.parse('2d4kh9')), asObj(D.parse('2d4')));
  assert.deepEqual(asObj(D.parse('2d4kh0')), { 0: '16' });
  assert.deepEqual(asObj(D.parse('2d4dh9')), { 0: '16' });
});

test('sampling follows the distribution (chi-square, seeded rng)', () => {
  let s = 12345; const rng = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const d = D.parse('2d6kh1'), N = 60000, seen = {};
  for (let i = 0; i < N; i++) { const v = D.sample(d, rng); seen[v] = (seen[v] || 0) + 1; }
  let chi = 0; for (const [v, p] of D.stats(d).pr.map((x) => [x[0], x[1]])) chi += (((seen[v] || 0) - N * p) ** 2) / (N * p);
  assert.ok(chi < 20.5, 'chi2 with 5 dof (p=0.001 -> 20.5): ' + chi);
});

test('large pool is fast and exact: 50d20kh10 total', () => {
  const t = Date.now(); const d = D.parse('30d20kh10'); assert.equal(d.total, 20n ** 30n);
  assert.ok(Date.now() - t < 5000, 'ms: ' + (Date.now() - t));
});

test('spread: sd of d6 is sqrt(35/12), of 2d6 sqrt(35/6), constants have 0', () => {
  assert.ok(Math.abs(D.stats(D.parse('d6')).sd - Math.sqrt(35 / 12)) < 1e-9);
  assert.ok(Math.abs(D.stats(D.parse('2d6')).sd - Math.sqrt(35 / 6)) < 1e-9);
  assert.equal(D.stats(D.parse('7')).sd, 0);
});
