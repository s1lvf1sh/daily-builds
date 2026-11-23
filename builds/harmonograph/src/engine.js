// Harmonograph engine: four damped pendulums (two drive x, two drive y).
// Pure functions, no DOM. Works as a browser <script> (window.Harmo) and in Node (module.exports).
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;

  // A pendulum: axis 'x'|'y', a amplitude (0..1), f frequency in Hz, p phase in degrees, d decay per second.
  function pendulumAt(q, t) {
    return q.a * Math.sin(TAU * q.f * t + (q.p * Math.PI) / 180) * Math.exp(-q.d * t);
  }

  function pointAt(pends, t) {
    let x = 0, y = 0;
    for (const q of pends) { if (q.axis === 'x') x += pendulumAt(q, t); else y += pendulumAt(q, t); }
    return { x, y };
  }

  function sample(pends, T, h) {
    const n = Math.floor(T / h) + 1, pts = new Array(n);
    for (let i = 0; i < n; i++) pts[i] = pointAt(pends, i * h);
    return pts;
  }

  // Largest possible |x| or |y| (sum of amplitudes on each axis) for framing the drawing.
  function extent(pends) {
    let ex = 0, ey = 0;
    for (const q of pends) { if (q.axis === 'x') ex += Math.abs(q.a); else ey += Math.abs(q.a); }
    return Math.max(ex, ey, 1e-9);
  }

  // Smallest positive ratio p:q (q <= maxDen) near f1/f2, with the error in cents.
  function nearestRatio(f1, f2, maxDen) {
    maxDen = maxDen || 12;
    const r = f1 / f2;
    let best = null;
    for (let q = 1; q <= maxDen; q++) {
      const p = Math.round(r * q);
      if (p < 1) continue;
      const cents = 1200 * Math.log2(r / (p / q));
      const g = gcd(p, q);
      if (g !== 1) continue;
      const score = Math.abs(cents) + 3 * Math.log2(p * q); // prefer simple ratios
      if (!best || score < best.score) best = { p, q, cents, score };
    }
    return best;
  }
  function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }

  const INTERVALS = { '1:1': 'unison', '2:1': 'octave', '3:2': 'fifth', '4:3': 'fourth', '5:4': 'major third',
    '6:5': 'minor third', '5:3': 'major sixth', '8:5': 'minor sixth', '9:8': 'major second', '3:1': 'octave + fifth' };
  function describeRatio(f1, f2) {
    const r = nearestRatio(f1, f2);
    const hi = Math.max(r.p, r.q), lo = Math.min(r.p, r.q);
    const name = INTERVALS[hi + ':' + lo];
    return { p: r.p, q: r.q, cents: r.cents, text: r.p + ':' + r.q + (name ? ' (' + name + ')' : ''), name: name || null };
  }

  // SVG path through points, centred in a size x size box, scaled so extent maps to 0.45*size.
  function svgPath(pts, ext, size) {
    const s = (0.45 * size) / ext, c = size / 2;
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      d += (i ? 'L' : 'M') + (c + pts[i].x * s).toFixed(2) + ' ' + (c - pts[i].y * s).toFixed(2);
    }
    return d;
  }
  function svgDocument(pts, ext, size, stroke) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
      '<rect width="100%" height="100%" fill="#fbf7ee"/><path d="' + svgPath(pts, ext, size) +
      '" fill="none" stroke="' + (stroke || '#1b2a3a') + '" stroke-width="0.6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  // Share links: 'axis:a:f:p:d' per pendulum, joined by '_'.
  function encode(pends) {
    return pends.map(q => [q.axis, q.a, q.f, q.p, q.d].join(':')).join('_');
  }
  function decode(str) {
    const parts = String(str || '').split('_');
    if (parts.length !== 4) return null;
    const out = [];
    for (const s of parts) {
      const f = s.split(':');
      if (f.length !== 5 || (f[0] !== 'x' && f[0] !== 'y')) return null;
      const q = { axis: f[0], a: +f[1], f: +f[2], p: +f[3], d: +f[4] };
      if (![q.a, q.f, q.p, q.d].every(Number.isFinite)) return null;
      q.a = clamp(q.a, 0, 1); q.f = clamp(q.f, 0.05, 8); q.p = clamp(q.p, -360, 360); q.d = clamp(q.d, 0, 0.5);
      out.push(q);
    }
    if (out.filter(q => q.axis === 'x').length !== 2) return null;
    return out;
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Mulberry32 for reproducible "surprise me".
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const SIMPLE = [[1, 1], [2, 1], [3, 2], [4, 3], [5, 4], [5, 3], [3, 1], [5, 2], [7, 4], [7, 5], [8, 5], [9, 8]];
  function randomPends(seed) {
    const r = rng(seed), pick = a => a[Math.floor(r() * a.length)];
    const base = 0.8 + r() * 0.8, [p, q] = pick(SIMPLE);
    const detune = (r() - 0.5) * 0.012; // slow precession
    const dec = () => 0.012 + r() * 0.03;
    const a2 = () => 0.15 + r() * 0.5;
    return [
      { axis: 'x', a: 0.9, f: base * p, p: Math.round(r() * 360), d: dec() },
      { axis: 'x', a: a2(), f: base * pick([1, 2, 3]) * (1 + detune * 0.5), p: Math.round(r() * 360), d: dec() },
      { axis: 'y', a: 0.9, f: base * q * (1 + detune), p: Math.round(r() * 360), d: dec() },
      { axis: 'y', a: a2(), f: base * pick([1, 2, 3]), p: Math.round(r() * 360), d: dec() },
    ].map(o => Object.assign(o, { f: +clamp(o.f, 0.05, 8).toFixed(3), a: +o.a.toFixed(2), d: +o.d.toFixed(3) }));
  }

  const PRESETS = [
    { name: 'Fifth, slowly drifting', pends: [
      { axis: 'x', a: 0.9, f: 3, p: 90, d: 0.02 }, { axis: 'x', a: 0.0, f: 1, p: 0, d: 0.02 },
      { axis: 'y', a: 0.9, f: 2.004, p: 0, d: 0.02 }, { axis: 'y', a: 0.0, f: 1, p: 0, d: 0.02 }] },
    { name: 'Lace', pends: [
      { axis: 'x', a: 0.7, f: 2, p: 0, d: 0.015 }, { axis: 'x', a: 0.4, f: 3.003, p: 90, d: 0.015 },
      { axis: 'y', a: 0.7, f: 2.003, p: 90, d: 0.015 }, { axis: 'y', a: 0.4, f: 3, p: 0, d: 0.015 }] },
    { name: 'Octave bloom', pends: [
      { axis: 'x', a: 0.8, f: 1, p: 0, d: 0.02 }, { axis: 'x', a: 0.3, f: 4.002, p: 45, d: 0.02 },
      { axis: 'y', a: 0.8, f: 2.001, p: 90, d: 0.02 }, { axis: 'y', a: 0.3, f: 3, p: 0, d: 0.02 }] },
    { name: 'Tight spiral', pends: [
      { axis: 'x', a: 0.9, f: 1, p: 90, d: 0.045 }, { axis: 'x', a: 0, f: 1, p: 0, d: 0.045 },
      { axis: 'y', a: 0.9, f: 1.002, p: 0, d: 0.045 }, { axis: 'y', a: 0, f: 1, p: 0, d: 0.045 }] },
  ];

  const api = { TAU, pendulumAt, pointAt, sample, extent, nearestRatio, describeRatio, svgPath, svgDocument,
    encode, decode, rng, randomPends, PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Harmo = api;
})(typeof window !== 'undefined' ? window : globalThis);
