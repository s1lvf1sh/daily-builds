// node test/run.js  (needs python3)
const { execFileSync } = require('child_process');
const path = require('path');
const L = require('../src/ladder.js');
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { if (ok) pass++; else { fail++; console.log('FAIL', name, extra); } };

// 1. Known reference values (WCAG definition; Ottosson's published OKLab test colours)
check('black/white = 21', Math.abs(L.contrast('#000000', '#ffffff') - 21) < 1e-9);
check('same colour = 1', L.contrast('#336699', '#336699') === 1);
check('#777 on white ~4.48', Math.abs(L.contrast('#777777', '#ffffff') - 4.478) < 0.005, L.contrast('#777777', '#ffffff'));
const w = L.oklchToLinear(1, 0, 0);
check('OKLCH white -> linear (1,1,1)', w.every((v) => Math.abs(v - 1) < 1e-4), w);
// sRGB red is OKLCH(0.62796, 0.25768, 29.23)
const red = L.oklchToLinear(0.62796, 0.25768, 29.2339);
check('OKLCH red -> linear (1,0,0)', Math.abs(red[0] - 1) < 2e-3 && Math.abs(red[1]) < 2e-3 && Math.abs(red[2]) < 2e-3, red);

// 2. Input validation
for (const bad of [{ steps: 1 }, { steps: 30 }, { chroma: -1 }, { chroma: 0.9 }, { minContrast: 0.5 }, { maxContrast: 25 }, { minContrast: 5, maxContrast: 4 }]) {
  let threw = false;
  try { L.makeRamp({ hue: 100, chroma: 0.1, ...bad }); } catch (e) { threw = e instanceof RangeError; }
  check('rejects ' + JSON.stringify(bad), threw);
}

// 3. Sweep: hues x chromas x step counts x ranges, then hand the hex values to the independent oracle
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const cases = [];
for (let hue = 0; hue < 360; hue += 30) for (const chroma of [0, 0.04, 0.12, 0.25]) cases.push({ hue, chroma, steps: 10 });
for (let i = 0; i < 60; i++) {
  const min = 1.03 + rnd() * 0.3;
  cases.push({ hue: rnd() * 360, chroma: rnd() * 0.3, steps: 4 + Math.floor(rnd() * 12), minContrast: min, maxContrast: 8 + rnd() * 12 });
}
const ramps = cases.map((c) => ({ c, r: L.makeRamp(c) }));
const payload = ramps.map(({ c, r }) => ({ hue: r.hue, chroma: c.chroma, ratio: r.ratio, steps: r.steps.map((s) => s.hex) }));
const res = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py')], { input: JSON.stringify(payload), maxBuffer: 1 << 26 }));
const TOL = 0.04; // 8-bit rounding limits pair precision at the pale end
let worstPair = 0, worstHue = 0, worstChroma = -1;
res.forEach((o, i) => {
  const { c, r } = ramps[i];
  worstPair = Math.max(worstPair, o.worst_pair_rel_err);
  worstHue = Math.max(worstHue, o.worst_hue_deg);
  worstChroma = Math.max(worstChroma, o.over_chroma);
  check(`pairs ${JSON.stringify(c)}`, o.worst_pair_rel_err < TOL, o.worst_pair_rel_err);
  check(`hue ${JSON.stringify(c)}`, o.worst_hue_deg < 4, o.worst_hue_deg);
  check(`chroma cap ${JSON.stringify(c)}`, o.over_chroma < 0.01, o.over_chroma);
  const min = c.minContrast ?? 1.06, max = c.maxContrast ?? 16;
  check(`ends ${JSON.stringify(c)}`, Math.abs(o.first_vs_white / min - 1) < 0.03 && Math.abs(o.last_vs_white / max - 1) < 0.03, [o.first_vs_white, o.last_vs_white]);
  const hexes = r.steps.map((s) => s.hex);
  check('hex format', hexes.every((h) => /^#[0-9a-f]{6}$/.test(h)));
  check('monotonic darker', r.steps.every((s, k) => k === 0 || s.vsWhite > r.steps[k - 1].vsWhite));
});

// 4. gapFor and CSS export
const r10 = L.makeRamp({ hue: 250, chroma: 0.12 });
const g = L.gapFor(r10, 4.5);
check('gapFor meets level', Math.pow(r10.ratio, g) >= 4.5 && Math.pow(r10.ratio, g - 1) < 4.5);
check('gapFor null when too short', L.gapFor(L.makeRamp({ hue: 0, chroma: 0, steps: 2, maxContrast: 3 }), 7) === null);
const gi = g;
check('gap pair really passes AA (measured from hex)', r10.steps.every((s, i) => i + gi >= r10.steps.length || L.contrast(s.hex, r10.steps[i + gi].hex) >= 4.5 * 0.97));
check('css has all steps', (L.toCss(r10).match(/--tone-/g) || []).length === 10);

console.log(`${cases.length} ramps; worst pair error ${(worstPair * 100).toFixed(2)}%, worst hue drift ${worstHue.toFixed(2)} deg, max chroma overshoot ${worstChroma.toFixed(4)}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
