// Engine tests. Run: node --test test/wave.test.mjs
// Oracles are physics that the scheme does not contain: the continuum dispersion relation, Snell's wavelength law,
// Young's double-slit fringes computed from two point sources by direct summation, and energy conservation.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as W from '../src/wave.mjs';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, want ${b} +- ${tol}`);
const quiet = (t) => { t.damp.fill(0); return t; };

// 1. standing mode of a closed box: period must match 2*pi/(c*k) (continuum), c = 0.5.
test('standing mode period matches the continuum wave equation', () => {
  for (const [m, n] of [[1, 1], [2, 1], [1, 3], [3, 2]]) {
    const w = 82, h = 62, t = quiet(W.createTank(w, h));
    const Lx = w - 1, Ly = h - 1;                       // walls (zero) sit on index 0 and w-1
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = Math.sin(m * Math.PI * x / Lx) * Math.sin(n * Math.PI * y / Ly); t.u[y * w + x] = v; t.prev[y * w + x] = v; }
    // leapfrog start: set prev = u (zero velocity) -- first step is then slightly off, so use a half-step-correct start
    const k = Math.PI * Math.hypot(m / Lx, n / Ly), cc = 0.5, T = 2 * Math.PI / (cc * k);
    // probe at an antinode-ish point; find downward zero crossings of u at probe
    const px = Math.round(Lx / (2 * m) ), py = Math.round(Ly / (2 * n));
    let last = t.u[py * w + px], crossings = [];
    for (let s = 1; s <= Math.ceil(5.2 * T); s++) {
      W.stepOnce(t); const v = t.u[py * w + px];
      if (last > 0 && v <= 0) crossings.push(s - 1 + last / (last - v));   // linear interpolation
      last = v;
    }
    assert.ok(crossings.length >= 4, `mode ${m},${n}: found ${crossings.length} crossings`);
    const period = (crossings.at(-1) - crossings[0]) / (crossings.length - 1);
    close(period / T, 1, 0.012, `mode ${m},${n} period ratio`);
  }
});

// 2. a ring from a stone spreads at c = 0.5 cells per step.
test('a ring front moves at the wave speed', () => {
  const w = 420, h = 300, t = quiet(W.createTank(w, h)); const x0 = 100, y0 = 150;
  W.drop(t, x0, y0, 5); W.run(t, 400);
  let best = -1, bx = 0; for (let x = x0 + 30; x < w - 2; x++) { const v = t.u[y0 * w + x]; if (v > best) { best = v; bx = x; } }
  close(bx - x0, 0.5 * 400, 4, 'ring radius after 400 steps');
});

// 3. energy is conserved by the undamped scheme (reflecting walls).
test('undamped energy (uniform depth, with walls) is conserved to 0.1% over 2000 steps', () => {
  const t = quiet(W.createTank(80, 60)); W.wallRect(t, 20, 15, 22, 40); W.drop(t, 55, 20, 5);
  W.run(t, 5); const e0 = W.energy(t); let worst = 0;
  for (let k = 0; k < 2000; k++) { W.stepOnce(t); worst = Math.max(worst, Math.abs(W.energy(t) / e0 - 1)); }
  assert.ok(worst < 1e-3, `worst relative energy drift ${worst}`);
});

// 4. the sponge edge absorbs: with damping on, the field dies.
test('open water absorbs at the edge: almost nothing is left after 1200 steps', () => {
  const t = W.createTank(160, 120); W.drop(t, 80, 60, 4); W.run(t, 1200);
  assert.ok(W.maxAbs(t) < 0.01, `max amplitude ${W.maxAbs(t)}`);
});

// 5. wavelength in shallow water follows Snell's law: lambda2/lambda1 = c2/c1.
test('wavelength in shallow water is shorter by c2/c1', () => {
  const w = 700, h = 200, t = W.createTank(w, h, { sponge: 30 });
  for (let y = 1; y < h - 1; y++) for (let x = 350; x < w - 1; x++) W.setKind(t, y * w + x, W.SHALLOW);
  // a wide channel with the sponge only at the two ends (side walls would otherwise add guide dispersion if narrow)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.min(x, w - 1 - x); t.damp[y * w + x] = d >= 30 ? 0 : 0.12 * ((30 - d) / 30) ** 2; }
  const f = 0.02; for (let y = 1; y < h - 1; y++) W.addSource(t, 60, y, f, 1);
  W.run(t, 1500);
  const row = 100;
  const lam = (x0, x1) => { // distance between successive upward zero crossings of u along a row at a fixed time
    const xs = []; for (let x = x0; x < x1; x++) { const a = t.u[row * w + x], b = t.u[row * w + x + 1]; if (a < 0 && b >= 0) xs.push(x + -a / (b - a)); }
    return { n: xs.length, lam: (xs.at(-1) - xs[0]) / (xs.length - 1) };
  };
  const deep = lam(100, 330), shallow = lam(380, 560);
  assert.ok(deep.n >= 6 && shallow.n >= 8, `crossings ${deep.n}, ${shallow.n}`);
  close(deep.lam, 0.5 / f, 0.7, 'deep wavelength (c/f = 25)');
  close(shallow.lam / deep.lam, 0.3 / 0.5, 0.015, 'wavelength ratio');
});

// 6. reflection: a ring hits a long wall; the echo is a ring centred on the mirror image of the stone.
test('a wall reflects: the echo front is where the mirror image says', () => {
  const w = 420, h = 300, t = quiet(W.createTank(w, h)); W.wallRect(t, 250, 1, 252, h - 2);
  const x0 = 100, y0 = 150, d = 250 - x0, steps = Math.round((d + 60) / 0.5);
  W.drop(t, x0, y0, 5); W.run(t, steps);
  let best = 1, bx = 0; for (let x = x0 + 10; x < 248; x++) { const v = t.u[y0 * w + x]; if (v < best) { best = v; bx = x; } }
  close(bx, 250 - 60, 4, 'echo front position (a fixed wall inverts the wave, so look for the trough)');
  assert.ok(best < -0.01, `echo amplitude ${best}`);
});

// 7. Young's double slit: fringe positions on the screen versus summing two point sources (Huygens).
test('double-slit fringes match two-source interference', () => {
  const w = 420, h = 300, t = W.createTank(w, h, { sponge: 30 }); t.damp.fill(0);
  const f = 0.05, lambda = 0.5 / f;                  // 10 cells
  const { wallX, cy } = W.doubleSlit(t, { d: 60, a: 5, freq: f });
  // sponge on, as in the app: rebuild damping
  const t2 = W.createTank(w, h, { sponge: 30 }); W.doubleSlit(t2, { d: 60, a: 5, freq: f });
  W.run(t2, 1500);
  const X = 380, L = X - (wallX + 1.5);
  // time-average of u^2 over 3 periods at the screen column
  const acc = new Float64Array(h); const P = Math.round(1 / f) * 6;
  for (let s = 0; s < P; s++) { W.stepOnce(t2); for (let y = 0; y < h; y++) acc[y] += t2.u[y * w + X] ** 2; }
  // oracle: two cylindrical waves from the slit centres
  const k = 2 * Math.PI / lambda, y1 = cy - 30, y2 = cy + 30, ox = wallX + 1.5;
  const model = (y) => { const r1 = Math.hypot(L, y - y1), r2 = Math.hypot(L, y - y2); const re = Math.cos(k * r1) / Math.sqrt(r1) + Math.cos(k * r2) / Math.sqrt(r2), im = Math.sin(k * r1) / Math.sqrt(r1) + Math.sin(k * r2) / Math.sqrt(r2); return re * re + im * im; };
  const peaks = (arr, lo, hi) => { const p = []; for (let y = lo + 2; y < hi - 2; y++) if (arr(y) > arr(y - 1) && arr(y) >= arr(y + 1) && arr(y) > arr(y - 2) && arr(y) >= arr(y + 2)) p.push(y); return p; };
  const sm = (y) => (acc[y - 1] + acc[y] + acc[y + 1]) / 3;
  const lo = cy - 115, hi = cy + 115;
  const pm = peaks(sm, lo, hi), po = peaks(model, lo, hi);
  // central maximum on the axis, and spacing close to lambda*L/d
  const centre = pm.reduce((a, b) => Math.abs(b - cy) < Math.abs(a - cy) ? b : a);
  close(centre, cy, 2, 'central fringe is on the axis');
  const sp = (a) => { const q = a.filter(y => y >= cy - 100 && y <= cy + 100); return (q.at(-1) - q[0]) / (q.length - 1); };
  assert.ok(pm.length >= 5, `found ${pm.length} fringes`);
  close(sp(pm), sp(po), 2.5, 'fringe spacing, simulation vs two-source sum');
  close(sp(pm), lambda * L / 60, lambda * L / 60 * 0.15, 'fringe spacing, simulation vs lambda*L/d');
  // every oracle peak near the axis has a simulated peak within 3 cells
  for (const y of po.filter(y => Math.abs(y - cy) < 90)) assert.ok(pm.some(q => Math.abs(q - y) <= 3), `oracle fringe at ${y} has no simulated fringe within 3 cells (sim: ${pm})`);
});

// 8. walls are really walls, and random scenes stay finite and bounded.
test('walls stay at zero and random scenes stay bounded', () => {
  let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let trial = 0; trial < 12; trial++) {
    const t = W.createTank(120, 90);
    for (let k = 0; k < 6; k++) W.paint(t, 5 + rnd() * 110, 5 + rnd() * 80, 2 + rnd() * 8, rnd() < 0.5 ? W.WALL : W.SHALLOW);
    for (let k = 0; k < 3; k++) W.addSource(t, 10 + rnd() * 100, 10 + rnd() * 70, 0.02 + rnd() * 0.12, 1);
    for (let k = 0; k < 3; k++) W.drop(t, 10 + rnd() * 100, 10 + rnd() * 70, 3);
    W.run(t, 1500);
    for (let i = 0; i < t.n; i++) { assert.ok(Number.isFinite(t.u[i]), 'finite'); if (t.kind[i] === W.WALL) assert.equal(t.u[i], 0, 'wall cell is zero'); }
    assert.ok(W.maxAbs(t) < 60, `bounded ${W.maxAbs(t)}`);
  }
});

test('every preset loads and runs', () => {
  const t = W.createTank(240, 160);
  for (const key of Object.keys(W.PRESETS)) { W.loadPreset(t, key); W.run(t, 600); assert.ok(Number.isFinite(W.maxAbs(t)), key); }
});
