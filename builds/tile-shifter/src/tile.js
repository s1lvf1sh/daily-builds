// Tile Shifter engine: a tile whose opposite edges are translated copies of each other,
// so it tiles the plane by translation. Pure functions, no DOM.

export const SUBDIV = 10; // flattening steps per Catmull-Rom segment

// Mulberry32: tiny seeded generator, so a seed always gives the same tile.
export function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Corner vectors. 'para': two edge vectors a,b. 'hex': three edge vectors e0,e1,e2 of a
// centrally symmetric hexagon (edges e0,e1,e2,-e0,-e1,-e2).
export function geometry(kind, skew = 0, height = 1) {
  if (kind === 'para') {
    const a = [1, 0], b = [skew, height];
    return { n: 4, pairs: 2, verts: [[0, 0], a, [a[0] + b[0], a[1] + b[1]], b], lattice: [a, b] };
  }
  const e = [[1, 0], [0.5 + skew, 0.8660254037844386 * height], [-0.5 + skew, 0.8660254037844386 * height]];
  const verts = [[0, 0]];
  const seq = [e[0], e[1], e[2], [-e[0][0], -e[0][1]], [-e[1][0], -e[1][1]], [-e[2][0], -e[2][1]]];
  for (let i = 0; i < 5; i++) verts.push([verts[i][0] + seq[i][0], verts[i][1] + seq[i][1]]);
  const l1 = [e[0][0] + e[1][0], e[0][1] + e[1][1]];
  const l2 = [e[1][0] + e[2][0], e[1][1] + e[2][1]];
  return { n: 6, pairs: 3, verts, lattice: [l1, l2] };
}

// Edge-local control point (u along the edge, v sideways in edge lengths) to a plane point.
function place(S, E, [u, v]) {
  const dx = E[0] - S[0], dy = E[1] - S[1];
  return [S[0] + u * dx - v * dy, S[1] + u * dy + v * dx];
}

// Centripetal-free uniform Catmull-Rom through pts, flattened. Includes both ends.
export function smooth(pts, sub = SUBDIV) {
  if (pts.length < 3) return pts.map((p) => p.slice());
  const out = [pts[0].slice()];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 1; s <= sub; s++) {
      const t = s / sub, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  return out;
}

// state: {kind, skew, height, edges: [[ [u,v], ... ] per independent edge]}
// Returns the closed outline (flattened, no repeated last point) and the full control path per side.
export function buildTile(state) {
  const g = geometry(state.kind, state.skew, state.height);
  const { n, pairs, verts } = g;
  const sides = new Array(n);
  for (let i = 0; i < pairs; i++) {
    const S = verts[i], E = verts[(i + 1) % n];
    const ctrl = [S, ...state.edges[i].map((c) => place(S, E, c)), E];
    sides[i] = ctrl;
    // Partner side i+pairs runs verts[p] -> verts[p+1]; the translated copy of side i runs
    // verts[p+1] -> verts[p], so reverse it for traversal.
    const p = i + pairs;
    const d = [verts[(p + 1) % n][0] - S[0], verts[(p + 1) % n][1] - S[1]];
    sides[p] = ctrl.map((q) => [q[0] + d[0], q[1] + d[1]]).reverse();
  }
  const outline = [];
  for (let i = 0; i < n; i++) {
    const flat = smooth(sides[i]);
    for (let k = 0; k < flat.length - 1; k++) outline.push(flat[k]);
  }
  return { ...g, sides, outline };
}

export function shoelace(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

export function cellArea(lattice) {
  return Math.abs(lattice[0][0] * lattice[1][1] - lattice[0][1] * lattice[1][0]);
}

function segCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// True when the outline crosses itself (so it is not a legal tile).
export function selfIntersects(poly) {
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (segCross(a, b, poly[j], poly[(j + 1) % n])) return true;
    }
  }
  return false;
}

export function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

// Report whether the state is a legal tile: simple outline whose area equals one lattice cell.
export function validate(tile) {
  const area = Math.abs(shoelace(tile.outline));
  const cell = cellArea(tile.lattice);
  const simple = !selfIntersects(tile.outline);
  return { simple, area, cell, ok: simple && Math.abs(area - cell) < 1e-9 * Math.max(1, cell) };
}

// A random tile. Control points sit at even u positions with jitter; v is the wobble.
export function randomState(seed, kind = 'hex', k = 3, amp = 0.28, skew = 0, height = 1) {
  const r = rng(seed);
  const pairs = kind === 'para' ? 2 : 3;
  const edges = [];
  for (let i = 0; i < pairs; i++) {
    const e = [];
    for (let j = 1; j <= k; j++) e.push([j / (k + 1) + (r() - 0.5) * 0.12, (r() - 0.5) * 2 * amp]);
    edges.push(e);
  }
  return { kind, skew, height, edges };
}

// Try seeds until the tile is legal; amplitude is relaxed if a few fail.
export function shuffle(seed, kind, k, amp, skew, height) {
  for (let t = 0; t < 200; t++) {
    const a = amp * (t < 60 ? 1 : t < 120 ? 0.7 : 0.4);
    const s = randomState(seed + t * 7919, kind, k, a, skew, height);
    if (validate(buildTile(s)).ok) return { state: s, seed: seed + t * 7919 };
  }
  return { state: randomState(seed, kind, 0, 0, skew, height), seed };
}

// Lattice translates covering a view box [x0,y0,x1,y1] (tile-space), with their indices.
export function translatesFor(tile, box, margin = 1) {
  const [a, b] = tile.lattice;
  const det = a[0] * b[1] - a[1] * b[0];
  const corners = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]];
  let i0 = Infinity, i1 = -Infinity, j0 = Infinity, j1 = -Infinity;
  for (const [x, y] of corners) {
    const i = (x * b[1] - y * b[0]) / det, j = (a[0] * y - a[1] * x) / det;
    i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j);
  }
  const out = [];
  for (let i = Math.floor(i0) - margin; i <= Math.ceil(i1) + margin; i++)
    for (let j = Math.floor(j0) - margin; j <= Math.ceil(j1) + margin; j++)
      out.push({ i, j, x: i * a[0] + j * b[0], y: i * a[1] + j * b[1] });
  return out;
}

// How many lattice copies of the tile contain the point (x, y)? A tiling gives exactly 1.
export function coverCount(tile, x, y, span = 4) {
  const [a, b] = tile.lattice;
  let c = 0;
  for (let i = -span; i <= span; i++)
    for (let j = -span; j <= span; j++)
      if (inside(tile.outline, x - i * a[0] - j * b[0], y - i * a[1] - j * b[1])) c++;
  return c;
}

// Colouring: which of `n` colours tile (i, j) gets. Neighbours across the lattice differ when n >= 3 .
export function colourIndex(i, j, n) {
  return (((i + 2 * j) % n) + n) % n;
}

export function toSVG(tile, { cols = 5, rows = 4, palette, stroke = '#222' } = {}) {
  const [a, b] = tile.lattice;
  const box = [0, 0, cols * Math.hypot(...a), rows * Math.hypot(...b)];
  const f = (v) => (+v.toFixed(4)).toString();
  const d = tile.outline.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join('') + 'Z';
  const tr = translatesFor(tile, [0, 0, cols * 0.9, rows * 0.9], 0);
  const body = tr.map((t, k) => `<use href="#t" x="${f(t.x)}" y="${f(t.y)}" fill="${palette[colourIndex(t.i, t.j, palette.length)]}"/>`).join('');
  const xs = tile.outline.map((p) => p[0]), ys = tile.outline.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  void box;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(-0.2)} ${f(-0.2)} ${f(cols * 0.9 + w)} ${f(rows * 0.9 + h)}"><defs><path id="t" d="${d}" stroke="${stroke}" stroke-width="0.012" stroke-linejoin="round"/></defs>${body}</svg>`;
}

export function tileSVG(tile) {
  const f = (v) => (+v.toFixed(4)).toString();
  const xs = tile.outline.map((p) => p[0]), ys = tile.outline.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0;
  const d = tile.outline.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join('') + 'Z';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(x0 - 0.05)} ${f(y0 - 0.05)} ${f(w + 0.1)} ${f(h + 0.1)}" width="${f((w + 0.1) * 10)}cm" height="${f((h + 0.1) * 10)}cm"><path d="${d}" fill="none" stroke="#000" stroke-width="0.01"/></svg>`;
}

// Share links: compact JSON of the state in the URL hash.
export function encodeState(s) {
  const r = (x) => Math.round(x * 1000) / 1000;
  return [s.kind === 'para' ? 'p' : 'h', r(s.skew), r(s.height), ...s.edges.map((e) => e.map(([u, v]) => r(u) + ',' + r(v)).join(';'))].join('|');
}
export function decodeState(str) {
  try {
    const [k, sk, h, ...es] = str.split('|');
    const kind = k === 'p' ? 'para' : 'hex';
    const edges = es.map((e) => (e ? e.split(';').map((p) => p.split(',').map(Number)) : []));
    const need = kind === 'para' ? 2 : 3;
    const state = { kind, skew: +sk, height: +h, edges };
    const okNum = edges.every((e) => e.every((p) => p.length === 2 && p.every(Number.isFinite)));
    if (edges.length !== need || !okNum || !Number.isFinite(state.skew) || !Number.isFinite(state.height)) return null;
    if (state.height < 0.3 || state.height > 2 || Math.abs(state.skew) > 1) return null;
    if (edges.some((e) => e.length > 8 || e.some(([u, v]) => Math.abs(u) > 2 || Math.abs(v) > 2))) return null;
    return state;
  } catch { return null; }
}
