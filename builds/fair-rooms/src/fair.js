// Fair Rooms engine: envy-free rent division with exact rational arithmetic.
// Plain script and CommonJS module. No dependencies.
(function (root) {
  'use strict';
  const abs = (a) => (a < 0n ? -a : a);
  const gcd = (a, b) => { a = abs(a); b = abs(b); while (b) [a, b] = [b, a % b]; return a; };
  // Fraction: {n, d} with d > 0, lowest terms.
  const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  const div = (a, b) => F(a.n * b.d, a.d * b.n);
  const cmp = (a, b) => { const x = a.n * b.d, y = b.n * a.d; return x < y ? -1 : x > y ? 1 : 0; };
  const neg = (a) => F(-a.n, a.d);
  const ZERO = F(0), ONE = F(1);
  // Parse a decimal string such as "12", "-3.50", ".5" into a Fraction. Returns null when invalid.
  function parse(s) {
    s = String(s).trim().replace(/^\+/, ''); const m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(s);
    if (!m || (m[2] === '' && !m[3])) return null; const frac = m[3] || '';
    if (m[2].length + frac.length > 15) return null;
    return F(BigInt((m[1] || '') + (m[2] || '0') + frac), 10n ** BigInt(frac.length));
  }
  // Exact decimal text, rounded half away from zero to `dp` places.
  function fmt(f, dp = 2) {
    const sc = 10n ** BigInt(dp); let q = (abs(f.n) * sc * 2n + f.d) / (f.d * 2n); const sign = f.n < 0n && q !== 0n ? '-' : '';
    const ip = q / sc, fp = String(q % sc).padStart(dp, '0'); return sign + ip + (dp ? '.' + fp : '');
  }

  // Two-phase simplex, exact, Bland's rule. Maximise c.x subject to rows {a:[Fraction], t:'<='|'>='|'=', b:Fraction}, x >= 0.
  function simplex(nv, c, rows) {
    const m = rows.length; let ncol = nv; const meta = [];
    rows = rows.map((r) => { if (cmp(r.b, ZERO) < 0) return { a: r.a.map(neg), b: neg(r.b), t: r.t === '<=' ? '>=' : r.t === '>=' ? '<=' : '=' }; return r; });
    const slack = [], art = [];
    rows.forEach((r, i) => { if (r.t !== '=') { slack[i] = ncol++; } });
    rows.forEach((r, i) => { if (r.t !== '<=') art[i] = ncol++; });
    const T = rows.map((r, i) => { const row = new Array(ncol + 1).fill(ZERO); r.a.forEach((v, j) => { row[j] = v; }); if (slack[i] !== undefined) row[slack[i]] = r.t === '<=' ? ONE : neg(ONE); if (art[i] !== undefined) row[art[i]] = ONE; row[ncol] = r.b; return row; });
    const basis = rows.map((r, i) => (art[i] !== undefined ? art[i] : slack[i]));
    function run(cost, allowed) {
      for (let guard = 0; guard < 20000; guard++) {
        // reduced costs: cost_j - sum_i cost_basis_i * T[i][j]
        let enter = -1;
        for (let j = 0; j < ncol; j++) {
          if (!allowed(j)) continue; let z = cost[j]; for (let i = 0; i < m; i++) z = sub(z, mul(cost[basis[i]], T[i][j]));
          if (cmp(z, ZERO) > 0) { enter = j; break; }
        }
        if (enter < 0) return 'optimal';
        let leave = -1, best = null;
        for (let i = 0; i < m; i++) if (cmp(T[i][enter], ZERO) > 0) { const ratio = div(T[i][ncol], T[i][enter]); if (best === null || cmp(ratio, best) < 0 || (cmp(ratio, best) === 0 && basis[i] < basis[leave])) { best = ratio; leave = i; } }
        if (leave < 0) return 'unbounded';
        const pv = T[leave][enter]; for (let j = 0; j <= ncol; j++) T[leave][j] = div(T[leave][j], pv);
        for (let i = 0; i < m; i++) if (i !== leave && cmp(T[i][enter], ZERO) !== 0) { const f = T[i][enter]; for (let j = 0; j <= ncol; j++) T[i][j] = sub(T[i][j], mul(f, T[leave][j])); }
        basis[leave] = enter;
      }
      throw new Error('simplex did not terminate');
    }
    const isArt = new Set(art.filter((v) => v !== undefined));
    if (isArt.size) {
      const c1 = new Array(ncol).fill(ZERO); isArt.forEach((j) => { c1[j] = neg(ONE); });
      run(c1, () => true);
      let infeas = ZERO; for (let i = 0; i < m; i++) if (isArt.has(basis[i])) infeas = add(infeas, T[i][ncol]);
      if (cmp(infeas, ZERO) !== 0) return { status: 'infeasible' };
      for (let i = 0; i < m; i++) if (isArt.has(basis[i])) { // drive artificial out of the basis if possible
        const j = [...Array(ncol).keys()].find((j) => !isArt.has(j) && cmp(T[i][j], ZERO) !== 0);
        if (j !== undefined) { const pv = T[i][j]; for (let k = 0; k <= ncol; k++) T[i][k] = div(T[i][k], pv); for (let r = 0; r < m; r++) if (r !== i && cmp(T[r][j], ZERO) !== 0) { const f = T[r][j]; for (let k = 0; k <= ncol; k++) T[r][k] = sub(T[r][k], mul(f, T[i][k])); } basis[i] = j; }
      }
    }
    const c2 = new Array(ncol).fill(ZERO); c.forEach((v, j) => { c2[j] = v; });
    const st = run(c2, (j) => !isArt.has(j)); if (st === 'unbounded') return { status: 'unbounded' };
    const x = new Array(ncol).fill(ZERO); basis.forEach((bj, i) => { x[bj] = T[i][ncol]; });
    return { status: 'optimal', x: x.slice(0, nv) };
  }

  function permutations(n) { const out = [], a = [...Array(n).keys()]; (function rec(k) { if (k === n) { out.push(a.slice()); return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0); return out; }

  // v[i][j]: person i's value of room j (Fractions). rent: Fraction. Returns exact envy-free maximin solution.
  function solve(v, rent) {
    const n = v.length; if (n < 1 || v.some((r) => r.length !== n)) throw new Error('need as many rooms as people');
    // 1. any welfare-maximising assignment (room of person i is sigma[i])
    let best = null, sigma = null;
    for (const p of permutations(n)) { let w = ZERO; for (let i = 0; i < n; i++) w = add(w, v[i][p[i]]); if (best === null || cmp(w, best) > 0) { best = w; sigma = p; } }
    // 2. maximise the minimum utility over envy-free prices; shift by S so that all variables are >= 0
    let tot = ZERO; v.forEach((r) => r.forEach((x) => { tot = add(tot, F(abs(x.n), x.d)); }));
    const S = add(add(mul(F(4), tot), F(abs(rent.n), rent.d)), ONE);
    const zero = () => new Array(n + 1).fill(ZERO); const rows = [];
    let r0 = zero(); for (let j = 0; j < n; j++) r0[j] = ONE; rows.push({ a: r0, t: '=', b: add(rent, mul(F(n), S)) });
    for (let i = 0; i < n; i++) {
      const r = sigma[i]; let a = zero(); a[n] = ONE; a[r] = add(a[r], ONE); rows.push({ a, t: '<=', b: add(v[i][r], mul(F(2), S)) }); // u <= v_ir - p_r
      for (let j = 0; j < n; j++) if (j !== r) { a = zero(); a[j] = ONE; a[r] = neg(ONE); rows.push({ a, t: '>=', b: sub(v[i][j], v[i][r]) }); } // p_j - p_r >= v_ij - v_ir
    }
    const c = zero(); c[n] = ONE; const res = simplex(n + 1, c, rows);
    if (res.status !== 'optimal') throw new Error('LP ' + res.status);
    const price = new Array(n), assigned = new Array(n);
    for (let i = 0; i < n; i++) { price[sigma[i]] = sub(res.x[sigma[i]], S); }
    const u = sub(res.x[n], S);
    for (let i = 0; i < n; i++) assigned[i] = { room: sigma[i], price: price[sigma[i]], utility: sub(v[i][sigma[i]], price[sigma[i]]) };
    return { sigma, price, u, assigned, welfare: best, margin: res.x.slice(0, n).reduce((m, x) => (m === null || cmp(x, m) < 0 ? x : m), null) };
  }

  // Independent verification of a claimed answer, straight from the definition of envy-freeness.
  function check(v, rent, sigma, price) {
    const n = v.length; const problems = [];
    let s = ZERO; price.forEach((p) => { s = add(s, p); }); if (cmp(s, rent) !== 0) problems.push('prices do not sum to the rent');
    if (new Set(sigma).size !== n) problems.push('rooms are not a one-to-one assignment');
    let minU = null;
    for (let i = 0; i < n; i++) {
      const mine = sub(v[i][sigma[i]], price[sigma[i]]); if (minU === null || cmp(mine, minU) < 0) minU = mine;
      for (let j = 0; j < n; j++) if (cmp(sub(v[i][j], price[j]), mine) > 0) problems.push('person ' + i + ' envies room ' + j);
    }
    return { ok: problems.length === 0, problems, minUtility: minU };
  }

  // Round exact prices to cents, keeping the total exact (largest-remainder), then report any envy the rounding introduces.
  function toCents(price, rent, v, sigma) {
    const n = price.length, cents = price.map((p) => div(mul(p, F(100)), ONE)); const fl = cents.map((x) => { const q = x.n / x.d; return (x.n % x.d !== 0n && x.n < 0n) ? q - 1n : q; });
    let want = (rent.n * 100n) / rent.d; let have = fl.reduce((a, b) => a + b, 0n);
    const order = [...Array(n).keys()].sort((a, b) => { const ra = sub(cents[a], F(fl[a])), rb = sub(cents[b], F(fl[b])); return cmp(rb, ra) || a - b; });
    for (let k = 0; have < want; k++, have++) fl[order[k % n]] += 1n;
    const rounded = fl.map((x) => F(x, 100)); const chk = check(v, rent, sigma, rounded);
    let worst = ZERO; for (let i = 0; i < n; i++) { const mine = sub(v[i][sigma[i]], rounded[sigma[i]]); for (let j = 0; j < n; j++) { const e = sub(sub(v[i][j], rounded[j]), mine); if (cmp(e, worst) > 0) worst = e; } }
    return { rounded, envyFree: chk.ok, worstEnvy: worst };
  }

  const api = { F, add, sub, mul, div, cmp, neg, parse, fmt, simplex, solve, check, toCents, permutations, ZERO, ONE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FairRooms = api;
})(typeof self !== 'undefined' ? self : this);
