// Abelian sandpile on a w x h grid whose outside edge is a sink.
// A cell with 4 or more grains topples: it sends one grain to each of its 4 neighbours (grains pushed off the edge vanish).
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Sandpile = factory(); })(this, function () {
  // Topple until stable. Bulk-topples floor(v/4) at a time. Returns the toppling count of each cell.
  function stabilize(cfg, w, h) {
    const n = w * h, count = new Int32Array(n), stack = [];
    for (let i = 0; i < n; i++) if (cfg[i] >= 4) stack.push(i);
    while (stack.length) {
      const i = stack.pop(); const k = cfg[i] >> 2; if (k === 0) continue;
      cfg[i] -= 4 * k; count[i] += k;
      const x = i % w, y = (i / w) | 0;
      if (x > 0) { cfg[i - 1] += k; if (cfg[i - 1] >= 4) stack.push(i - 1); }
      if (x < w - 1) { cfg[i + 1] += k; if (cfg[i + 1] >= 4) stack.push(i + 1); }
      if (y > 0) { cfg[i - w] += k; if (cfg[i - w] >= 4) stack.push(i - w); }
      if (y < h - 1) { cfg[i + w] += k; if (cfg[i + w] >= 4) stack.push(i + w); }
    }
    return count;
  }
  // One parallel round: every unstable cell topples once. Returns the number of cells that toppled.
  function step(cfg, w, h) {
    const n = w * h, t = []; for (let i = 0; i < n; i++) if (cfg[i] >= 4) t.push(i);
    for (const i of t) { cfg[i] -= 4; const x = i % w, y = (i / w) | 0;
      if (x > 0) cfg[i - 1]++; if (x < w - 1) cfg[i + 1]++; if (y > 0) cfg[i - w]++; if (y < h - 1) cfg[i + w]++; }
    return t.length;
  }
  function add(a, b, w, h) { const c = new Int32Array(w * h); for (let i = 0; i < c.length; i++) c[i] = a[i] + b[i]; stabilize(c, w, h); return c; }
  function filled(w, h, v) { return new Int32Array(w * h).fill(v); }
  // Identity element of the sandpile group: e = s(2c - s(2c)) where c is the all-3 configuration.
  function identity(w, h) {
    const t = filled(w, h, 6); stabilize(t, w, h);
    const d = new Int32Array(w * h); for (let i = 0; i < d.length; i++) d[i] = 6 - t[i];
    stabilize(d, w, h); return d;
  }
  // Burning test: feed each cell the grains its sink edges would send; recurrent iff every cell topples exactly once.
  function isRecurrent(cfg, w, h) {
    for (let i = 0; i < cfg.length; i++) if (cfg[i] < 0 || cfg[i] > 3) return false;
    const b = Int32Array.from(cfg);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) b[y * w + x] += (x === 0) + (x === w - 1) + (y === 0) + (y === h - 1);
    const c = stabilize(b, w, h); for (let i = 0; i < c.length; i++) if (c[i] !== 1) return false;
    return true;
  }
  function equal(a, b) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function hist(cfg) { const h = [0, 0, 0, 0]; for (const v of cfg) h[v]++; return h; }
  // Deterministic PRNG (mulberry32)
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // A random recurrent configuration: all-3 plus random grains, stabilized (reaching a recurrent state from a recurrent one).
  function randomRecurrent(w, h, seed) { const r = rng(seed), c = filled(w, h, 3); for (let i = 0; i < w * h; i++) c[i] += (r() * 8) | 0; stabilize(c, w, h); return c; }
  return { stabilize, step, add, filled, identity, isRecurrent, equal, hist, rng, randomRecurrent };
});
