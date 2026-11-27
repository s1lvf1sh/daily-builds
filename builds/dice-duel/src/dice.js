// Dice Duel engine: exact distributions of dice expressions. No dependencies.
// Grammar: expr = term (('+'|'-') term)* ; term = factor ('*' factor)* ;
// factor = int | '(' expr ')' | '-' factor | pool ; pool = [N] 'd' (M|'%') [('kh'|'kl'|'dh'|'dl') [K]]
(function (root) {
  const LIM = { dice: 100, sides: 1000, states: 4e6 };
  const C = (n, k) => { let r = 1n; for (let i = 1n; i <= BigInt(k); i++) r = (r * (BigInt(n) - BigInt(k) + i)) / i; return r; };
  const dist = (map) => { let t = 0n; for (const v of map.values()) t += v; return { map, total: t }; };
  const put = (m, k, v) => m.set(k, (m.get(k) || 0n) + v);
  const konst = (n) => dist(new Map([[n, 1n]]));
  const combine = (a, b, f) => { const m = new Map(); for (const [x, p] of a.map) for (const [y, q] of b.map) put(m, f(x, y), p * q); return dist(m); };

  // Sum of the kept dice among n dice of s sides. mode: 'kh'|'kl'; k kept dice (k>=n keeps all).
  function pool(n, s, mode, k) {
    if (n > LIM.dice || s > LIM.sides) throw new Error(`too large (max ${LIM.dice} dice, ${LIM.sides} sides)`);
    if (n < 1 || s < 1) throw new Error('need at least 1 die and 1 side');
    k = Math.max(0, Math.min(k, n));
    if (n * s * n > LIM.states) throw new Error('too large to enumerate exactly');
    const faces = []; for (let v = 1; v <= s; v++) faces.push(v);
    if (mode === 'kh') faces.reverse(); // visit best-first so "kept" are the first k dice assigned
    let cur = new Map([['0:0', 1n]]); // key used:sum
    for (const v of faces) {
      const nxt = new Map();
      for (const [key, w] of cur) {
        const [u, sum] = key.split(':').map(Number);
        for (let c = 0; u + c <= n; c++) {
          const gain = Math.max(0, Math.min(k, u + c) - Math.min(k, u));
          put(nxt, `${u + c}:${sum + v * gain}`, w * C(n - u, c));
        }
      }
      cur = nxt;
    }
    const m = new Map(); for (const [key, w] of cur) { const [u, sum] = key.split(':').map(Number); if (u === n) put(m, sum, w); }
    return dist(m);
  }

  function parse(src) {
    const t = []; const re = /\s*(\d+|kh|kl|dh|dl|[d%+\-*()])/gy; let i = 0, m;
    src = String(src).toLowerCase();
    while (i < src.length && (m = re.exec(src))) { t.push(m[1]); i = re.lastIndex; }
    if (src.slice(i).trim() !== '') throw new Error(`unexpected "${src.slice(i).trim()[0]}"`);
    let p = 0; const peek = () => t[p], eat = () => t[p++];
    const isNum = (x) => x !== undefined && /^\d+$/.test(x);
    function expr() { let a = term(); while (peek() === '+' || peek() === '-') { const o = eat(); const b = term(); a = combine(a, b, o === '+' ? (x, y) => x + y : (x, y) => x - y); } return a; }
    function term() { let a = factor(); while (peek() === '*') { eat(); a = combine(a, factor(), (x, y) => x * y); } return a; }
    function factor() {
      const x = peek();
      if (x === '-') { eat(); const a = factor(); return dist(new Map([...a.map].map(([v, w]) => [-v, w]))); }
      if (x === '(') { eat(); const a = expr(); if (eat() !== ')') throw new Error('missing )'); return a; }
      let n = 1, hasN = false;
      if (isNum(x)) { n = +eat(); hasN = true; if (peek() !== 'd') return konst(n); }
      if (peek() !== 'd') throw new Error(x === undefined ? 'expression ends too early' : `unexpected "${x}"`);
      eat(); let s;
      if (peek() === '%') { eat(); s = 100; } else if (isNum(peek())) s = +eat(); else throw new Error('missing die size after d');
      let mode = 'kh', k = n;
      if (['kh', 'kl', 'dh', 'dl'].includes(peek())) {
        const o = eat(); const arg = isNum(peek()) ? +eat() : 1;
        if (o === 'kh' || o === 'kl') { mode = o; k = arg; } else { mode = o === 'dl' ? 'kh' : 'kl'; k = Math.max(0, n - arg); }
      }
      void hasN; return pool(n, s, mode, k);
    }
    if (!t.length) throw new Error('empty expression');
    const r = expr(); if (p < t.length) throw new Error(`unexpected "${t[p]}"`); return r;
  }

  const ratio = (a, b) => Number((a * 10n ** 15n) / b) / 1e15;
  function stats(d) {
    let num = 0n, min = Infinity, max = -Infinity; const pr = [];
    for (const [v, w] of [...d.map].sort((a, b) => a[0] - b[0])) { const p = ratio(w, d.total); pr.push([v, p, w]); num += BigInt(v) * w; min = Math.min(min, v); max = Math.max(max, v); }
    const mean = Number((num * 10n ** 15n) / d.total) / 1e15;
    let varr = 0; for (const [v, p] of pr) varr += p * (v - mean) ** 2;
    return { mean, sd: Math.sqrt(varr), min, max, pr };
  }
  // exact P(A>B), P(A=B), P(A<B) as BigInt fractions over a.total*b.total
  function duel(a, b) {
    let gt = 0n, eq = 0n, lt = 0n;
    for (const [x, p] of a.map) for (const [y, q] of b.map) { const w = p * q; if (x > y) gt += w; else if (x === y) eq += w; else lt += w; }
    const T = a.total * b.total; return { gt, eq, lt, T, pGt: ratio(gt, T), pEq: ratio(eq, T), pLt: ratio(lt, T) };
  }
  // P(X >= t)
  function atLeast(d, t) { let w = 0n; for (const [v, c] of d.map) if (v >= t) w += c; return ratio(w, d.total); }
  // sample a value from a distribution with rng() in [0,1)
  function sample(d, rng) {
    let r = BigInt(Math.floor(rng() * 1e12)) * d.total / 1000000000000n;
    for (const [v, w] of [...d.map].sort((a, b) => a[0] - b[0])) { if (r < w) return v; r -= w; }
    return [...d.map.keys()].pop();
  }
  const api = { parse, pool, stats, duel, atLeast, sample, LIM };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Dice = api;
})(typeof self !== 'undefined' ? self : globalThis);
