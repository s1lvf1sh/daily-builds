// Knotwork engine: Celtic-style knots from a grid with walls. Works in the browser (global Knot) and Node (require).
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Knot = factory(); })(this, function () {
  'use strict';
  // Each cell has 4 diagonal segments joining the midpoints of its sides: 0=NE 1=SE 2=SW 3=NW (named by the corner they cut off).
  const N = 0, E = 1, S = 2, W = 3;
  const SEG_ENDS = [[N, E], [S, E], [S, W], [N, W]];
  const END_SEGS = [[0, 3], [1, 0], [1, 2], [2, 3]]; // END_SEGS[end] = the two segments of a cell that touch that end
  const SEG_SLASH = [false, true, false, true];       // true = runs "/" (up and to the right)
  // Straight continuation of a segment end into the neighbouring cell: [dx, dy, segment, end]
  const NB = [{ [N]: [0, -1, 2, S], [E]: [1, 0, 2, W] }, { [S]: [0, 1, 3, N], [E]: [1, 0, 3, W] },
              { [S]: [0, 1, 0, N], [W]: [-1, 0, 0, E] }, { [N]: [0, -1, 1, S], [W]: [-1, 0, 1, E] }];

  function createGrid(w, h) {
    const g = { W: w, H: h, h: [], v: [] };
    for (let y = 0; y <= h; y++) g.h.push(Array.from({ length: w }, () => y === 0 || y === h));
    for (let y = 0; y < h; y++) g.v.push(Array.from({ length: w + 1 }, (_, x) => x === 0 || x === w));
    return g;
  }
  const isBorder = (g, t, x, y) => (t === 'h' ? y === 0 || y === g.H : x === 0 || x === g.W);
  function setWall(g, t, x, y, val) { if (isBorder(g, t, x, y)) return false; (t === 'h' ? g.h[y] : g.v[y])[x] = !!val; return true; }
  const getWall = (g, t, x, y) => (t === 'h' ? g.h[y][x] : g.v[y][x]);
  function wallAtEnd(g, cx, cy, end) { return end === N ? g.h[cy][cx] : end === S ? g.h[cy + 1][cx] : end === W ? g.v[cy][cx] : g.v[cy][cx + 1]; }
  function endPoint(cx, cy, end) { return end === N ? [2 * cx + 1, 2 * cy] : end === S ? [2 * cx + 1, 2 * cy + 2] : end === W ? [2 * cx, 2 * cy + 1] : [2 * cx + 2, 2 * cy + 1]; }
  const par = (n) => ((n % 2) + 2) % 2;
  // At the crossing at half-unit point (X,Y): is the "/" strand on top? Chosen so over/under alternates along every strand.
  const slashOver = (X, Y) => par(Math.floor((X - Y) / 2) + Math.floor((X + Y) / 2)) === 0;

  function partner(g, s, end) {
    const c = (s / 4) | 0, k = s % 4, cx = c % g.W, cy = (c / g.W) | 0;
    if (wallAtEnd(g, cx, cy, end)) { const o = END_SEGS[end][0] === k ? END_SEGS[end][1] : END_SEGS[end][0]; return [c * 4 + o, end]; }
    const [dx, dy, k2, e2] = NB[k][end];
    return [((cy + dy) * g.W + cx + dx) * 4 + k2, e2];
  }

  function analyze(g) {
    const total = g.W * g.H * 4, segStrand = new Int32Array(total).fill(-1), strands = [];
    for (let s0 = 0; s0 < total; s0++) {
      if (segStrand[s0] >= 0) continue;
      const id = strands.length, st = { id, segs: [], pts: [], over: [] };
      let s = s0, enter = SEG_ENDS[s0 % 4][0];
      for (;;) {
        segStrand[s] = id; st.segs.push(s);
        const k = s % 4, c = (s / 4) | 0, cx = c % g.W, cy = (c / g.W) | 0;
        const exit = SEG_ENDS[k][0] === enter ? SEG_ENDS[k][1] : SEG_ENDS[k][0];
        const p = endPoint(cx, cy, exit); st.pts.push(p);
        if (!wallAtEnd(g, cx, cy, exit)) st.over.push(SEG_SLASH[k] === slashOver(p[0], p[1]));
        const [s2, e2] = partner(g, s, exit);
        if (s2 === s0 && e2 === SEG_ENDS[s0 % 4][0]) break;
        s = s2; enter = e2;
        if (st.segs.length > total) throw new Error('trace did not close');
      }
      strands.push(st);
    }
    const crossings = [];
    const add = (X, Y, leftSegs, rightSegs) => { // find the strand of the "/" and "\" segment at a crossing
      const sl = leftSegs.slash, bs = leftSegs.back; const sOver = slashOver(X, Y);
      crossings.push({ X, Y, slashOver: sOver, over: segStrand[sOver ? sl : bs], under: segStrand[sOver ? bs : sl] });
    };
    for (let y = 1; y < g.H; y++) for (let x = 0; x < g.W; x++) if (!g.h[y][x]) {
      const a = ((y - 1) * g.W + x) * 4, b = (y * g.W + x) * 4; add(2 * x + 1, 2 * y, { slash: a + 1, back: a + 2 });
      if (segStrand[a + 1] !== segStrand[b + 3] || segStrand[a + 2] !== segStrand[b]) throw new Error('inconsistent crossing');
    }
    for (let y = 0; y < g.H; y++) for (let x = 1; x < g.W; x++) if (!g.v[y][x]) {
      const a = (y * g.W + x - 1) * 4, b = (y * g.W + x) * 4; add(2 * x, 2 * y + 1, { slash: a + 1, back: a });
      if (segStrand[a + 1] !== segStrand[b + 3] || segStrand[a] !== segStrand[b + 2]) throw new Error('inconsistent crossing');
    }
    return { W: g.W, H: g.H, strands, segStrand, crossings, count: strands.length };
  }
  // True when the strand alternates over/under all the way round (cyclically).
  function alternates(st) { const o = st.over, n = o.length; for (let i = 0; i < n; i++) if (o[i] === o[(i + 1) % n]) return false; return true; }

  // ---- symmetry on wall edges, in half-unit midpoint coordinates ----
  const SYMS = ['none', 'lr', 'ud', 'both', 'rot4'];
  const edgeXY = (t, x, y) => (t === 'h' ? [2 * x + 1, 2 * y] : [2 * x, 2 * y + 1]);
  const xyEdge = (X, Y) => (X % 2 === 1 ? { t: 'h', x: (X - 1) / 2, y: Y / 2 } : { t: 'v', x: X / 2, y: (Y - 1) / 2 });
  function orbit(g, e, sym) {
    const gens = [];
    if (sym === 'lr' || sym === 'both') gens.push(([X, Y]) => [2 * g.W - X, Y]);
    if (sym === 'ud' || sym === 'both') gens.push(([X, Y]) => [X, 2 * g.H - Y]);
    if (sym === 'rot4' && g.W === g.H) gens.push(([X, Y]) => [g.W + g.H - Y, g.H + X - g.W]);
    const seen = new Map(), q = [edgeXY(e.t, e.x, e.y)];
    while (q.length) { const p = q.pop(), key = p[0] + ',' + p[1]; if (seen.has(key)) continue; seen.set(key, p); for (const f of gens) q.push(f(p)); }
    return [...seen.values()].map(([X, Y]) => xyEdge(X, Y));
  }
  const interiorEdges = (g) => { const r = []; for (let y = 1; y < g.H; y++) for (let x = 0; x < g.W; x++) r.push({ t: 'h', x, y });
    for (let y = 0; y < g.H; y++) for (let x = 1; x < g.W; x++) r.push({ t: 'v', x, y }); return r; };
  function toggle(g, e, sym) { // toggle an edge and its mirror images together; returns the new state
    if (isBorder(g, e.t, e.x, e.y)) return null; const val = !getWall(g, e.t, e.x, e.y);
    for (const o of orbit(g, e, sym)) setWall(g, o.t, o.x, o.y, val); return val;
  }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function clear(g) { for (const e of interiorEdges(g)) setWall(g, e.t, e.x, e.y, false); }
  function shuffle(g, sym, seed, density) {
    clear(g); const r = rng(seed); for (const e of interiorEdges(g)) if (r() < (density == null ? 0.3 : density)) { setWall(g, e.t, e.x, e.y, true); for (const o of orbit(g, e, sym)) setWall(g, o.t, o.x, o.y, true); }
  }
  // Hill-climb toward a single strand. Returns { found, count }. Leaves the best grid found in g.
  function solve(g, sym, seed, opts) {
    const r = rng(seed), edges = interiorEdges(g), tries = (opts && opts.tries) || 12, steps = (opts && opts.steps) || 400;
    if (!edges.length) return { found: analyze(g).count === 1, count: analyze(g).count };
    let best = null, bestCount = Infinity;
    for (let t = 0; t < tries && bestCount > 1; t++) {
      shuffle(g, sym, Math.floor(r() * 2 ** 31), 0.15 + r() * 0.3); let cur = analyze(g).count;
      for (let i = 0; i < steps && cur > 1; i++) {
        const e = edges[(r() * edges.length) | 0], orb = orbit(g, e, sym), before = orb.map((o) => getWall(g, o.t, o.x, o.y)), val = !before[0];
        for (const o of orb) setWall(g, o.t, o.x, o.y, val); const c = analyze(g).count;
        if (c <= cur) cur = c; else orb.forEach((o, j) => setWall(g, o.t, o.x, o.y, before[j]));
      }
      if (cur < bestCount) { bestCount = cur; best = JSON.parse(JSON.stringify(g)); }
    }
    g.h = best.h; g.v = best.v; return { found: bestCount === 1, count: bestCount };
  }

  // ---- share link: size + symmetry + wall bits ----
  function encode(g, sym) {
    const bits = interiorEdges(g).map((e) => (getWall(g, e.t, e.x, e.y) ? 1 : 0)); let hex = '';
    for (let i = 0; i < bits.length; i += 4) hex += parseInt(((bits[i] || 0) + '' + (bits[i + 1] || 0) + (bits[i + 2] || 0) + (bits[i + 3] || 0)), 2).toString(16);
    return `${g.W}x${g.H}-${sym}-${hex}`;
  }
  function decode(str) {
    const m = /^(\d{1,2})x(\d{1,2})-(none|lr|ud|both|rot4)-([0-9a-f]*)$/.exec(str || ''); if (!m) return null;
    const w = +m[1], h = +m[2]; if (w < 1 || h < 1 || w > 24 || h > 24) return null;
    const g = createGrid(w, h), es = interiorEdges(g); if (m[4].length !== Math.ceil(es.length / 4)) return null;
    const bits = [...m[4]].map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
    es.forEach((e, i) => setWall(g, e.t, e.x, e.y, bits[i] === '1')); return { g, sym: m[3] };
  }

  // ---- drawing (SVG, half-unit coordinates: the grid is 2W by 2H) ----
  const PALETTE = ['#f2b441', '#4fc3b0', '#ef7b6b', '#8fb4ff', '#c78bf0', '#a6d65b', '#f58fc0', '#59c7f0'];
  function renderSVG(g, a, opts) {
    opts = opts || {}; const pal = opts.palette || PALETTE, ink = '#140f26', col = (id) => pal[id % pal.length];
    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${2 * g.W + 2} ${2 * g.H + 2}" role="img" aria-label="Knot with ${a.count} strand${a.count === 1 ? '' : 's'}">`];
    parts.push(`<rect x="-1" y="-1" width="${2 * g.W + 2}" height="${2 * g.H + 2}" fill="${opts.bg || '#1d1740'}"/>`);
    const wall = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    for (const e of interiorEdges(g)) if (getWall(g, e.t, e.x, e.y)) parts.push(e.t === 'h' ? wall(2 * e.x + 0.15, 2 * e.y, 2 * e.x + 1.85, 2 * e.y, '#6f62a8', 0.34) : wall(2 * e.x, 2 * e.y + 0.15, 2 * e.x, 2 * e.y + 1.85, '#6f62a8', 0.34));
    parts.push(`<rect x="0" y="0" width="${2 * g.W}" height="${2 * g.H}" fill="none" stroke="#6f62a8" stroke-width="0.12"/>`);
    parts.push('<g class="strands" fill="none" stroke-linejoin="round">');
    for (const st of a.strands) { const d = 'M' + st.pts.map((p) => p.join(' ')).join('L') + 'Z';
      parts.push(`<path class="strand" data-id="${st.id}" d="${d}" stroke="${ink}" stroke-width="1"/><path d="${d}" stroke="${col(st.id)}" stroke-width="0.62"/>`); }
    parts.push('</g><g class="over" fill="none" stroke-linecap="butt">');
    for (const c of a.crossings) { const dx = 0.5, dy = c.slashOver ? -0.5 : 0.5, d = `M${c.X - dx} ${c.Y - dy}L${c.X + dx} ${c.Y + dy}`;
      parts.push(`<path d="${d}" stroke="${ink}" stroke-width="1"/><path d="${d}" stroke="${col(c.over)}" stroke-width="0.62"/>`); }
    parts.push('</g>');
    if (opts.hit) { parts.push('<g class="hits" fill="transparent">');
      for (const e of interiorEdges(g)) { const [X, Y] = edgeXY(e.t, e.x, e.y); parts.push(`<rect class="hit" data-t="${e.t}" data-x="${e.x}" data-y="${e.y}" x="${e.t === 'h' ? X - 0.9 : X - 0.45}" y="${e.t === 'h' ? Y - 0.45 : Y - 0.9}" width="${e.t === 'h' ? 1.8 : 0.9}" height="${e.t === 'h' ? 0.9 : 1.8}"/>`); }
      parts.push('</g>'); }
    parts.push('</svg>'); return parts.join('');
  }
  return { createGrid, setWall, getWall, isBorder, analyze, alternates, interiorEdges, orbit, toggle, shuffle, clear, solve, encode, decode, renderSVG, rng, SYMS, PALETTE };
});
