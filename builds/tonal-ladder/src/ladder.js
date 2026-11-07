// Tonal Ladder core: OKLCH colour ramps whose WCAG contrast is predictable.
// Key fact: contrast(a,b) = (Ya+.05)/(Yb+.05) for Ya>Yb. Against white, cw = 1.05/(Y+.05),
// so contrast(a,b) = cw(a)/cw(b). If cw is geometric along the ramp, two steps k apart
// always have contrast r^k, whatever the hue.
(function (root) {
  'use strict';
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

  function oklchToLinear(L, C, hDeg) {
    const h = (hDeg * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
  }
  const inGamut = (rgb) => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

  // Largest chroma <= C that stays inside sRGB at this L and hue.
  function fitChroma(L, C, h) {
    if (inGamut(oklchToLinear(L, C, h))) return C;
    let lo = 0, hi = C;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid; else hi = mid;
    }
    return lo;
  }

  function toHex(rgbLinear) {
    return '#' + rgbLinear.map((v) => {
      const c = Math.round(255 * gam(Math.min(1, Math.max(0, v))));
      return c.toString(16).padStart(2, '0');
    }).join('');
  }
  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => lin(v / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(h1, h2) {
    const a = luminance(h1), b = luminance(h2);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function colourAt(L, C, h) {
    const c = fitChroma(L, C, h);
    return { hex: toHex(oklchToLinear(L, c, h)), chroma: c };
  }

  // Find the colour whose contrast against white is closest to `target` (>=1, <=21).
  function solveStep(target, C, h) {
    const wantY = 1.05 / target - 0.05;
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (luminance(colourAt(mid, C, h).hex) < wantY) lo = mid; else hi = mid;
    }
    // choose the better of the two neighbouring 8-bit results
    const a = colourAt(lo, C, h), b = colourAt(hi, C, h);
    const err = (x) => Math.abs(Math.log(contrast(x.hex, '#ffffff') / target));
    const best = err(a) <= err(b) ? a : b;
    return { ...best, L: err(a) <= err(b) ? lo : hi };
  }

  function makeRamp({ hue, chroma, steps = 10, minContrast = 1.06, maxContrast = 16 }) {
    if (!(steps >= 2 && steps <= 24)) throw new RangeError('steps must be 2..24');
    if (!(minContrast >= 1 && maxContrast <= 21 && maxContrast > minContrast)) throw new RangeError('contrast range invalid');
    if (!(chroma >= 0 && chroma <= 0.4)) throw new RangeError('chroma must be 0..0.4');
    const h = ((hue % 360) + 360) % 360;
    const ratio = Math.pow(maxContrast / minContrast, 1 / (steps - 1));
    const out = [];
    for (let i = 0; i < steps; i++) {
      const target = minContrast * Math.pow(ratio, i);
      const s = solveStep(target, chroma, h);
      out.push({ index: i, target, hex: s.hex, L: s.L, chroma: s.chroma, vsWhite: contrast(s.hex, '#ffffff'), vsBlack: contrast(s.hex, '#000000') });
    }
    return { hue: h, ratio, steps: out };
  }

  // Smallest step gap k with ratio^k >= level, or null if the ramp is too short.
  function gapFor(ramp, level) {
    for (let k = 1; k < ramp.steps.length; k++) if (Math.pow(ramp.ratio, k) >= level) return k;
    return null;
  }

  function toCss(ramp, name = 'tone') {
    return ':root {\n' + ramp.steps.map((s, i) => `  --${name}-${i}: ${s.hex};`).join('\n') + '\n}';
  }

  const api = { makeRamp, gapFor, toCss, contrast, luminance, colourAt, oklchToLinear };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Ladder = api;
})(typeof self !== 'undefined' ? self : this);
