// Ripple Tank engine: the 2-D scalar wave equation u_tt = c(x,y)^2 * laplacian(u) on a grid,
// advanced with the standard leapfrog (second-order) scheme. Pure code: runs in Node and the browser.
//
// Cell kinds in `kind`: 0 = water, 1 = wall (u held at 0, so waves reflect), 2 = shallow water (slower waves).
// c2[i] is the squared Courant number (c*dt/dx)^2 for the cell. 2-D stability needs c2 <= 1/2.

export const WATER = 0, WALL = 1, SHALLOW = 2;
export const C2_DEEP = 0.25;      // c = 0.5 cells per step
export const C2_SHALLOW = 0.09;   // c = 0.3 cells per step (ratio 0.6)

export function createTank(w, h, opts = {}) {
  const n = w * h;
  const t = {
    w, h, n,
    u: new Float32Array(n), prev: new Float32Array(n), next: new Float32Array(n),
    kind: new Uint8Array(n),
    c2: new Float32Array(n).fill(C2_DEEP),
    damp: new Float32Array(n),          // per-step damping factor (0 = none), used for the sponge edge
    sources: [],                         // {x, y, freq (cycles per step), amp, phase, until}
    step: 0,
    sponge: opts.sponge ?? 18,
  };
  buildSponge(t);
  return t;
}

function buildSponge(t) {
  const { w, h, sponge: s } = t;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const d = Math.min(x, y, w - 1 - x, h - 1 - y);
    t.damp[y * w + x] = d >= s ? 0 : 0.12 * Math.pow((s - d) / s, 2);
  }
}

export function setKind(t, i, k) {
  t.kind[i] = k;
  t.c2[i] = k === SHALLOW ? C2_SHALLOW : C2_DEEP;
  if (k === WALL) { t.u[i] = 0; t.prev[i] = 0; }
}

export function paint(t, cx, cy, r, k) {
  const r2 = r * r;
  for (let y = Math.max(1, Math.floor(cy - r)); y <= Math.min(t.h - 2, Math.ceil(cy + r)); y++)
    for (let x = Math.max(1, Math.floor(cx - r)); x <= Math.min(t.w - 2, Math.ceil(cx + r)); x++)
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) setKind(t, y * t.w + x, k);
}

// One instantaneous stone: a smooth bump (cosine bell) added to u.
export function drop(t, cx, cy, r = 3, amp = 1) {
  for (let y = Math.max(1, Math.floor(cy - r)); y <= Math.min(t.h - 2, Math.ceil(cy + r)); y++)
    for (let x = Math.max(1, Math.floor(cx - r)); x <= Math.min(t.w - 2, Math.ceil(cx + r)); x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < r && t.kind[y * t.w + x] !== WALL) { const b = amp * 0.5 * (1 + Math.cos(Math.PI * d / r)); t.u[y * t.w + x] += b; t.prev[y * t.w + x] += b; }
    }
}

export function addSource(t, x, y, freq, amp = 1) { const s = { x, y, freq, amp, phase: 0 }; t.sources.push(s); return s; }

export function stepOnce(t) {
  const { w, h, u, prev, next, kind, c2, damp } = t;
  for (let y = 1; y < h - 1; y++) {
    let i = y * w + 1;
    for (let x = 1; x < w - 1; x++, i++) {
      if (kind[i] === WALL) { next[i] = 0; continue; }
      const lap = u[i - 1] + u[i + 1] + u[i - w] + u[i + w] - 4 * u[i];
      const d = damp[i];
      next[i] = (2 * u[i] - (1 - d) * prev[i] + c2[i] * lap) / (1 + d);
    }
  }
  // outer ring is a fixed zero (the sponge has already killed the wave before it gets there)
  for (const s of t.sources) {
    const i = Math.round(s.y) * w + Math.round(s.x);
    if (kind[i] !== WALL) next[i] += s.amp * Math.sin(2 * Math.PI * s.freq * t.step) * 0.5;
  }
  t.prev = u; t.u = next; t.next = prev; t.step++;
}

export function run(t, steps) { for (let k = 0; k < steps; k++) stepOnce(t); }

// Discrete energy of the leapfrog scheme (conserved exactly when damping is 0 and c is uniform):
//   E = sum( ((u - prev)^2) / 2 + (c^2 / 2) * sum over grid edges of (u_i - u_j)(prev_i - prev_j) )
// We use the common form with the mixed term, which has no drift for the undamped scheme.
export function energy(t) {
  const { w, h, u, prev, c2 } = t; let e = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, v = u[i] - prev[i]; e += 0.5 * v * v;
    if (x < w - 1) e += 0.5 * c2[i] * (u[i] - u[i + 1]) * (prev[i] - prev[i + 1]);
    if (y < h - 1) e += 0.5 * c2[i] * (u[i] - u[i + w]) * (prev[i] - prev[i + w]);
  }
  return e;
}

export function maxAbs(t) { let m = 0; for (let i = 0; i < t.n; i++) { const a = Math.abs(t.u[i]); if (a > m) m = a; } return m; }

// ---- presets -------------------------------------------------------------------------------
export function wallRect(t, x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setKind(t, y * t.w + x, WALL); }
export function clearRect(t, x0, y0, x1, y1, k = WATER) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setKind(t, y * t.w + x, k); }

export const PRESETS = {
  open: { label: 'Open water', build(t) { drop(t, t.w * 0.4, t.h * 0.5, 4); } },
  double: { label: 'Double slit', build(t) { doubleSlit(t, { d: 36, a: 5, freq: 0.05 }); } },
  single: { label: 'Single slit', build(t) { slits(t, [0], { a: 10, freq: 0.05 }); } },
  lens: { label: 'Lens', build(t) { lens(t, 0.035); } },
  shelf: { label: 'Shallow shelf', build(t) { shelf(t, 0.035); } },
  box: { label: 'Echo box', build(t) { box(t); } },
};

// A wall across the middle with slits at the given offsets (cells from centre) and a plane-ish source on the left.
export function slits(t, offsets, { a = 5, freq = 0.05, wallX = Math.round(t.w * 0.3), thick = 3 } = {}) {
  wallRect(t, wallX, 1, wallX + thick - 1, t.h - 2);
  const cy = Math.floor(t.h / 2);
  for (const o of offsets) clearRect(t, wallX, cy + o - Math.floor(a / 2), wallX + thick - 1, cy + o + Math.floor(a / 2));
  // a line of in-phase point sources makes a plane wave
  for (let y = 4; y < t.h - 4; y += 2) addSource(t, wallX - 12, y, freq, 0.9);
  return { wallX, cy };
}
export function doubleSlit(t, { d = 36, a = 5, freq = 0.05 } = {}) { return slits(t, [-d / 2, d / 2], { a, freq }); }

function lens(t, freq) {
  // a lens-shaped patch of slow water bends a plane wave toward a focus
  const cx = Math.round(t.w * 0.42), cy = Math.floor(t.h / 2), R = Math.round(t.h * 0.9), half = 14;
  for (let y = 1; y < t.h - 1; y++) for (let x = 1; x < t.w - 1; x++) {
    const dx1 = x - (cx - R + half), dx2 = x - (cx + R - half);
    if (dx1 * dx1 + (y - cy) ** 2 <= R * R && dx2 * dx2 + (y - cy) ** 2 <= R * R) setKind(t, y * t.w + x, SHALLOW);
  }
  for (let y = 4; y < t.h - 4; y += 2) addSource(t, 14, y, freq, 0.9);
}
function shelf(t, freq) {
  // a diagonal shelf of shallow water: waves coming in at an angle bend (Snell's law)
  for (let y = 1; y < t.h - 1; y++) for (let x = 1; x < t.w - 1; x++) if (x > t.w * 0.5 + (y - t.h / 2) * 0.0 ) setKind(t, y * t.w + x, SHALLOW);
  for (let k = 0; k < 40; k++) addSource(t, 14 + k * 0.9, 30 + k * 1.6, freq, 0.9); // a tilted line of sources makes an oblique wave
}
function box(t) {
  wallRect(t, Math.round(t.w * 0.2), Math.round(t.h * 0.2), Math.round(t.w * 0.8), Math.round(t.h * 0.2) + 2);
  wallRect(t, Math.round(t.w * 0.2), Math.round(t.h * 0.8), Math.round(t.w * 0.8), Math.round(t.h * 0.8) + 2);
  wallRect(t, Math.round(t.w * 0.2), Math.round(t.h * 0.2), Math.round(t.w * 0.2) + 2, Math.round(t.h * 0.8) + 2);
  wallRect(t, Math.round(t.w * 0.8), Math.round(t.h * 0.2), Math.round(t.w * 0.8) + 2, Math.round(t.h * 0.8) + 2);
  drop(t, t.w * 0.45, t.h * 0.45, 4);
}

export function loadPreset(t, key) {
  t.u.fill(0); t.prev.fill(0); t.next.fill(0); t.kind.fill(0); t.c2.fill(C2_DEEP); t.sources.length = 0; t.step = 0;
  PRESETS[key].build(t);
}

// ---- helpers shared with the page and the tests ---------------------------------------------
export function c(t, i) { return Math.sqrt(t.c2[i]); }
