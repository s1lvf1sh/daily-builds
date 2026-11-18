// node test/test.js   (MUTANT=1..6 runs a deliberately broken engine; each must fail)
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '../src/fair.js'), 'utf8');
const M = Number(process.env.MUTANT || 0);
const mutations = {
  1: ['sub(res.x[sigma[i]], S)', 'res.x[sigma[i]]'],                       // forget to undo the price shift
  2: ["a[r] = neg(ONE); rows.push({ a, t: '>='", "a[r] = neg(ONE); rows.push({ a, t: '<='"], // flip the envy inequality
  3: ['if (best === null || cmp(w, best) > 0)', 'if (best === null || cmp(w, best) < 0)'], // pick the worst assignment
  4: ["t: '=', b: add(rent, mul(F(n), S))", "t: '=', b: add(rent, mul(F(n - 1), S))"],      // wrong total
  5: ['c[n] = ONE; const res', 'c[0] = ONE; const res'],                    // maximise one price instead of the minimum utility
  6: ["if (cmp(s, rent) !== 0) problems", "if (false) problems"],            // checker ignores the rent total
};
if (M) { const [a, b] = mutations[M]; if (!src.includes(a)) throw new Error('mutation target missing'); src = src.replace(a, b); }
const mod = { exports: {} }; new Function('module', 'self', src)(mod, undefined); const f = mod.exports;
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
const V = (rows) => rows.map((r) => r.map((x) => f.F(x))); const R = (x) => f.F(x);
const tryRun = (fn, name) => { try { fn(); } catch (e) { ok(false, name + ' threw', e.message); } };

// 1. parsing and formatting
ok(f.cmp(f.parse('12.50'), f.F(25, 2)) === 0, 'parse 12.50'); ok(f.parse('-.5').n === -1n, 'parse -.5'); ok(f.parse('abc') === null && f.parse('') === null && f.parse('1e3') === null, 'parse rejects junk');
ok(f.fmt(f.F(1, 3)) === '0.33' && f.fmt(f.F(2, 3)) === '0.67' && f.fmt(f.F(-5, 2), 0) === '-3' && f.fmt(f.F(0)) === '0.00', 'fmt rounding');

// 2. hand-derived cases
tryRun(() => {
  let r = f.solve(V([[1200, 800], [1000, 1000]]), R(2000));
  ok(r.sigma.join() === '0,1' && f.cmp(r.price[0], R(1100)) === 0 && f.cmp(r.price[1], R(900)) === 0 && f.cmp(r.u, R(100)) === 0, 'two people, hand answer 1100/900', f.fmt(r.u));
  r = f.solve(V([[500]]), R(500)); ok(f.cmp(r.price[0], R(500)) === 0 && f.cmp(r.u, R(0)) === 0, 'one person pays the whole rent');
  r = f.solve(V([[3, 3, 3], [3, 3, 3], [3, 3, 3]]), R(9)); ok(r.price.every((p) => f.cmp(p, R(3)) === 0) && f.cmp(r.u, R(0)) === 0, 'identical tastes split evenly');
  r = f.solve(V([[0, 10], [0, 10]]), R(10)); ok(f.cmp(r.u, R(0)) === 0 && f.check(V([[0, 10], [0, 10]]), R(10), r.sigma, r.price).ok, 'both want one room: the price rises until neither envies');
  // rent exceeds what anyone values: utility is negative but still envy-free
  r = f.solve(V([[1, 1], [1, 1]]), R(10)); ok(f.cmp(r.u, R(-4)) === 0, 'negative surplus when rent is above all values', f.fmt(r.u));
  // a case where equalising utility alone would be envious (needs a negative price): checker must still pass
  const w = V([[100, 0, 0], [0, 100, 0], [0, 0, 100]]); r = f.solve(w, R(60)); ok(f.check(w, R(60), r.sigma, r.price).ok && f.cmp(r.u, R(80)) === 0, 'diagonal tastes: each pays 20, surplus 80');
  const q = V([[10, 0], [0, 0]]); r = f.solve(q, R(4)); ok(f.check(q, R(4), r.sigma, r.price).ok, 'one-sided tastes stay envy-free', JSON.stringify(r.price.map((p) => f.fmt(p))));
}, 'hand cases');

// 3. the checker can fail
{ const v = V([[1200, 800], [1000, 1000]]); ok(!f.check(v, R(2000), [0, 1], [R(1300), R(700)]).ok, 'checker rejects an envious split'); ok(!f.check(v, R(2000), [0, 1], [R(1100), R(800)]).ok, 'checker rejects wrong total'); ok(!f.check(v, R(2000), [0, 0], [R(1000), R(1000)]).ok, 'checker rejects shared room'); ok(f.check(v, R(2000), [0, 1], [R(1100), R(900)]).ok, 'checker accepts the good split'); }

// 4. random sweep: exact envy-freeness, exact total, and optimal against deterministic perturbation
function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
{
  const rnd = rng(12345); let cases = 0, bad = 0, negPrice = 0, tight = 0;
  for (let t = 0; t < 600; t++) {
    const n = 2 + Math.floor(rnd() * 5); const hi = [3, 10, 200][t % 3];
    const v = V(Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(rnd() * (hi + 1)))));
    const rent = R(Math.floor(rnd() * hi * n)); let r;
    try { r = f.solve(v, rent); } catch (e) { ok(false, 'solve threw', e.message); continue; }
    cases++; const c = f.check(v, rent, r.sigma, r.price); if (!c.ok || f.cmp(c.minUtility, r.u) !== 0) { bad++; ok(false, 'sweep case ' + t, c.problems.join('; ')); }
    if (r.price.some((p) => f.cmp(p, f.ZERO) < 0)) negPrice++;
    // any assignment with the best welfare has the same optimum; the engine's guard shift must not bind
    if (f.cmp(r.margin, f.F(1)) > 0) tight++;
  }
  ok(bad === 0, `envy-free + total exact on ${cases} random cases`); ok(negPrice > 0, 'sweep contains negative prices', negPrice); ok(tight === cases, 'shift guard never binds');
}

// 5. against the independent Python oracle (every assignment, vertex enumeration)
{
  const cf = path.join(__dirname, 'oracle_cases.json');
  if (!fs.existsSync(cf)) ok(false, 'oracle_cases.json missing; run python3 oracle.py gen');
  else {
    const cases = JSON.parse(fs.readFileSync(cf, 'utf8')); let mism = 0; const bySize = {};
    for (const c of cases) {
      const v = V(c.v), rent = R(c.rent); let r; try { r = f.solve(v, rent); } catch (e) { mism++; continue; } const [a, b] = c.u.split('/'); const want = f.F(BigInt(a), BigInt(b || 1));
      bySize[c.v.length] = (bySize[c.v.length] || 0) + 1; if (f.cmp(r.u, want) !== 0) { mism++; if (mism < 4) console.log('MISMATCH', JSON.stringify(c), f.fmt(r.u, 6)); }
    }
    ok(mism === 0, `optimum matches the oracle on ${cases.length} cases`, mism + ' mismatches'); console.log('oracle cases by size', JSON.stringify(bySize));
  }
}

// 6. cent rounding keeps the total and reports envy honestly
tryRun(() => {
  const v = V([[1200, 800, 500], [900, 900, 400], [700, 600, 700]]); const rent = R(2500); const r = f.solve(v, rent); const cents = f.toCents(r.price, rent, v, r.sigma);
  const s = cents.rounded.reduce((a, b) => f.add(a, b), f.ZERO); ok(f.cmp(s, rent) === 0, 'rounded prices keep the exact total');
  ok(cents.rounded.every((p) => (p.n * 100n) % p.d === 0n), 'rounded prices are whole cents');
  ok(f.cmp(cents.worstEnvy, f.F(1, 100)) <= 0, 'rounding envy is at most one cent', f.fmt(cents.worstEnvy, 4));
}, 'cent rounding');
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
