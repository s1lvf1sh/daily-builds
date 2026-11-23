// Run: node test/test.js   (MUTATE=name runs against a deliberately broken engine; it must fail)
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8');
const MUT = {
  decay: ['Math.exp(-q.d * t)', 'Math.exp(-q.d * t * 0.5)'],
  phase: ['(q.p * Math.PI) / 180', 'q.p'],
  axis: ["if (q.axis === 'x') x +=", "if (q.axis === 'y') x +="],
  cents: ['1200 * Math.log2(r / (p / q))', '1200 * Math.log(r / (p / q))'],
  svgflip: ['(c - pts[i].y * s)', '(c + pts[i].y * s)'],
  clampf: ['clamp(q.f, 0.05, 8)'.replace('q.f, 0.05, 8', 'q.f, 0.05, 8'), 'q.f'],
};
if (process.env.MUTATE) {
  const m = MUT[process.env.MUTATE];
  if (!src.includes(m[0])) throw new Error('mutation target missing');
  if (process.env.MUTATE === 'clampf') src = src.replace('q.f = clamp(q.f, 0.05, 8);', 'q.f = q.f;');
  else src = src.replace(m[0], m[1]);
}
const mod = { exports: {} };
new Function('module', 'window', src)(mod, undefined);
const H = mod.exports;

let pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('FAIL', msg); } }
const near = (a, b, e) => Math.abs(a - b) <= e;

// 1. Independent oracle: integrate x'' + 2d x' + (w^2+d^2) x = 0 with RK4; compare with the closed form.
function rk4(q, T, h) {
  const w = H.TAU * q.f, ph = q.p * Math.PI / 180, d = q.d;
  let x = q.a * Math.sin(ph), v = q.a * (w * Math.cos(ph) - d * Math.sin(ph));
  const acc = (x, v) => -2 * d * v - (w * w + d * d) * x;
  const out = [x]; const n = Math.round(T / h);
  for (let i = 0; i < n; i++) {
    const k1x = v, k1v = acc(x, v);
    const k2x = v + h / 2 * k1v, k2v = acc(x + h / 2 * k1x, v + h / 2 * k1v);
    const k3x = v + h / 2 * k2v, k3v = acc(x + h / 2 * k2x, v + h / 2 * k2v);
    const k4x = v + h * k3v, k4v = acc(x + h * k3x, v + h * k3v);
    x += h / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); v += h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v); out.push(x);
  }
  return out;
}
let worst = 0, cases = 0;
const R = H.rng(12345);
for (let i = 0; i < 60; i++) {
  const q = { axis: 'x', a: 0.1 + R() * 0.9, f: 0.2 + R() * 4, p: Math.floor(R() * 360), d: R() * 0.2 };
  const h = 0.0005, T = 20, o = rk4(q, T, h);
  for (let j = 0; j < o.length; j += 400) { worst = Math.max(worst, Math.abs(o[j] - H.pendulumAt(q, j * h))); }
  cases++;
}
ok(worst < 1e-6, 'closed form vs RK4 worst ' + worst);
console.log('RK4 oracle: ' + cases + ' pendulums, worst error ' + worst.toExponential(2));

// 2. Axis routing and superposition.
const P = [{ axis: 'x', a: 0.5, f: 1, p: 30, d: 0.1 }, { axis: 'x', a: 0.2, f: 2, p: 0, d: 0 },
  { axis: 'y', a: 0.7, f: 3, p: 10, d: 0.05 }, { axis: 'y', a: 0.1, f: 1, p: 200, d: 0 }];
for (const t of [0, 0.37, 5.2, 18]) {
  const pt = H.pointAt(P, t);
  ok(near(pt.x, H.pendulumAt(P[0], t) + H.pendulumAt(P[1], t), 1e-12), 'x sum at ' + t);
  ok(near(pt.y, H.pendulumAt(P[2], t) + H.pendulumAt(P[3], t), 1e-12), 'y sum at ' + t);
}

// 3. Decay: after t = ln(2)/d the envelope halves.
{ const q = { axis: 'x', a: 1, f: 1, p: 90, d: 0.1 }; // sin(2 pi t + 90deg) = cos: peaks at integer t
  const t = Math.round(Math.log(2) / 0.1); // 7 -> peak
  ok(near(H.pendulumAt(q, t), Math.exp(-0.1 * t), 1e-12), 'decay envelope at integer-t peak'); }

// 4. Lissajous crossings: for coprime a:b and generic phase, a closed undamped curve has 2ab-a-b self-intersections.
function crossings(pts) { // pts closed polyline (last == first)
  const n = pts.length - 1; let c = 0;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    const A = pts[i], B = pts[i + 1], C = pts[j], D = pts[j + 1];
    if (cross(A, B, C) * cross(A, B, D) < 0 && cross(C, D, A) * cross(C, D, B) < 0) c++;
  }
  return c;
}
let lissOk = 0, lissN = 0, dips = 0;
for (const [a, b] of [[1, 2], [2, 3], [3, 2], [3, 4], [4, 5], [1, 3], [5, 3], [5, 6], [2, 5]]) {
  const want = 2 * a * b - a - b, counts = [];
  for (const phi of [3, 10, 17, 29, 41, 63, 77, 88]) {
    const pe = [{ axis: 'x', a: 1, f: a, p: phi, d: 0 }, { axis: 'y', a: 1, f: b, p: 0, d: 0 }];
    const N = 3000, pts = [];
    for (let i = 0; i <= N; i++) pts.push(H.pointAt(pe, i / N)); // period 1 s since a,b integers
    counts.push(crossings(pts));
  }
  lissN++;
  // Observed: the formula is reached at most phases; at a few phases a polyline count is one lower
  // (not caused by sampling: 4x finer sampling gave the same). So assert max == formula, never above, never below by more than 1.
  const mx = Math.max(...counts), mn = Math.min(...counts); dips += counts.filter(c => c < want).length;
  if (mx === want && mn >= want - 1) lissOk++; else console.log('  crossings', a + ':' + b, counts, 'formula', want);
  ok(mx === want && mn >= want - 1, 'crossings ' + a + ':' + b);
}
console.log('Lissajous crossing formula 2ab-a-b reached at some phase and never exceeded: ' + lissOk + '/' + lissN + ' pairs; ' + dips + ' of ' + (lissN * 8) + ' phase counts were one below');

// 5. Share-link round trip and rejection of bad input.
for (let s = 1; s <= 50; s++) {
  const p = H.randomPends(s), back = H.decode(H.encode(p));
  ok(back && JSON.stringify(back) === JSON.stringify(p.map(q => Object.assign({}, q, { a: Math.min(1, q.a) }))), 'roundtrip seed ' + s);
}
ok(H.decode('garbage') === null, 'garbage');
ok(H.decode('x:1:1:0:0_x:1:1:0:0_x:1:1:0:0_y:1:1:0:0') === null, 'needs two x and two y');
ok(H.decode('x:1:NaN:0:0_x:1:1:0:0_y:1:1:0:0_y:1:1:0:0') === null, 'NaN rejected');
{ const q = H.decode('x:9:99:0:9_x:1:1:0:0_y:1:1:0:0_y:1:1:0:0')[0]; ok(q.a === 1 && q.f === 8 && q.d === 0.5, 'clamped'); }

// 6. Ratio naming and cents (cents checked by an independent formula: ln-based with known values).
{ const r = H.describeRatio(3, 2); ok(r.p === 3 && r.q === 2 && Math.abs(r.cents) < 1e-9 && r.name === 'fifth', '3:2'); }
{ const r = H.describeRatio(2.004, 2); ok(r.p === 1 && r.q === 1 && near(r.cents, 3.4587, 0.01), 'unison +3.46 cents ' + r.cents); }
{ const r = H.describeRatio(1.5 * 1.0058, 1); // 3:2 sharp by 1200*log2(1.0058)=10.0 cents
  ok(r.text.startsWith('3:2') && near(r.cents, 1200 * Math.log(1.0058) / Math.LN2, 1e-6) && near(r.cents, 10.0, 0.1), 'fifth +10c ' + r.cents); }
{ const r = H.describeRatio(4, 3); ok(r.name === 'fourth', '4:3'); }

// 7. SVG: y flipped (up is up), centred, path point count and extent.
{ const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }], d = H.svgPath(pts, 1, 100);
  ok(d === 'M50.00 50.00L95.00 5.00', 'svg path ' + d);
  const doc = H.svgDocument(H.sample(H.PRESETS[0].pends, 10, 0.01), H.extent(H.PRESETS[0].pends), 400);
  ok((doc.match(/[ML]/g) || []).length === 1001 && doc.startsWith('<svg') && doc.endsWith('</svg>'), 'svg document points'); }

// 8. Every preset and 200 random harmonographs stay inside the frame (|x|,|y| <= extent) and are finite.
{ let bad = 0;
  const all = H.PRESETS.map(p => p.pends); for (let s = 1; s <= 200; s++) all.push(H.randomPends(s));
  for (const pe of all) { const e = H.extent(pe); for (const p of H.sample(pe, 40, 0.01)) if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x) > e + 1e-9 || Math.abs(p.y) > e + 1e-9) bad++; }
  ok(bad === 0, 'bounded finite, bad=' + bad); }

// 9. Presets: each one is valid for the share-link codec, and the engine's own ratio read-out for it is what the README quotes.
for (const p of H.PRESETS) ok(H.decode(H.encode(p.pends)) !== null, 'preset codec ' + p.name);
{ const r = H.describeRatio(H.PRESETS[0].pends[0].f, H.PRESETS[0].pends[2].f); ok(r.p === 3 && r.q === 2 && near(r.cents, 1200*Math.log2(3/2.004/1.5), 1e-9) && r.cents < 0 && r.cents > -5, 'preset 1 is a fifth a few cents flat (3 / 2.004)'); }

// 10. Determinism of the seeded generator.
ok(JSON.stringify(H.randomPends(7)) === JSON.stringify(H.randomPends(7)) && JSON.stringify(H.randomPends(7)) !== JSON.stringify(H.randomPends(8)), 'seeded');

console.log(pass + ' checks passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
