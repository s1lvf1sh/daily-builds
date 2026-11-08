// Chladni-style sand figures on a square plate (idealised as a membrane with fixed edges).
// Modes: u(x,y) = sin(m*pi*x) sin(n*pi*y) + s * sin(n*pi*x) sin(m*pi*y), on the unit square.
(function (root) {
  'use strict';

  // All (m,n) with 1 <= m <= n, ordered by eigenvalue m^2+n^2 (ties: smaller m first).
  function modeList(maxIndex) {
    const out = [];
    for (let m = 1; m <= maxIndex; m++) for (let n = m; n <= maxIndex; n++) out.push({ m, n, k2: m * m + n * n });
    out.sort((a, b) => a.k2 - b.k2 || a.m - b.m);
    // Keep only modes whose eigenvalue is complete within the index cut (no missing partners).
    const limit = maxIndex * maxIndex + 1;
    return out.filter((q) => q.k2 <= limit);
  }

  // Field value at (x,y) in [0,1]^2. s in [-1,1] mixes the two degenerate partners (ignored when m===n).
  function field(m, n, s, x, y) {
    const P = Math.PI;
    const a = Math.sin(m * P * x) * Math.sin(n * P * y);
    if (m === n) return a;
    return a + s * Math.sin(n * P * x) * Math.sin(m * P * y);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function scatter(count, rng) {
    const xs = new Float32Array(count), ys = new Float32Array(count);
    for (let i = 0; i < count; i++) { xs[i] = rng(); ys[i] = rng(); }
    return { xs, ys };
  }

  // One shaking step: every grain hops a random distance proportional to the local vibration |u|.
  // Grains therefore keep moving where the plate moves and stall where |u| ~ 0 (the nodal lines).
  function step(g, mode, s, rng, amp) {
    const { xs, ys } = g;
    for (let i = 0; i < xs.length; i++) {
      const v = Math.abs(field(mode.m, mode.n, s, xs[i], ys[i]));
      const r = amp * v;
      let x = xs[i] + (rng() * 2 - 1) * r;
      let y = ys[i] + (rng() * 2 - 1) * r;
      if (x < 0) x = -x; else if (x > 1) x = 2 - x;     // reflect at the edges
      if (y < 0) y = -y; else if (y > 1) y = 2 - y;
      xs[i] = x; ys[i] = y;
    }
  }

  // Mean |u| over the grains (smaller = more settled on nodal lines).
  function meanAbs(g, mode, s) {
    let t = 0;
    for (let i = 0; i < g.xs.length; i++) t += Math.abs(field(mode.m, mode.n, s, g.xs[i], g.ys[i]));
    return t / g.xs.length;
  }

  const api = { modeList, field, mulberry32, scatter, step, meanAbs };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Plate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
