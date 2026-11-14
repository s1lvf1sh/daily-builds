// Tuning Fit engine: how well does an equal division of an interval (an "EDO") approximate target just ratios?
(function (root) {
  'use strict';
  const MAXN = 400;

  // Parse "3/2", "5", or "1.5" into an exact fraction {n, d} of safe integers. Throws Error with a readable message.
  function parseRatio(text) {
    const s = String(text).trim();
    let m = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
    let n, d;
    if (m) { n = +m[1]; d = +m[2]; }
    else if ((m = /^\d+$/.exec(s))) { n = +s; d = 1; }
    else if ((m = /^(\d+)\.(\d{1,6})$/.exec(s))) { d = Math.pow(10, m[2].length); n = +m[1] * d + +m[2]; }
    else throw new Error('"' + s + '" is not a ratio. Write it like 3/2.');
    if (!(n > 0 && d > 0)) throw new Error('"' + s + '" needs positive numbers.');
    if (n > 1e6 || d > 1e6) throw new Error('"' + s + '" is too large (limit 1,000,000).');
    const g = gcd(n, d); n /= g; d /= g;
    return { n, d, text: n + '/' + d };
  }
  function gcd(a, b) { while (b) { const t = a % b; a = b; b = t; } return a; }
  const log2 = (r) => Math.log2(r.n / r.d);
  const cents = (r) => 1200 * log2(r);

  // Parse a comma/space separated list. Ratios must be above 1:1. Duplicates are dropped.
  function parseList(text) {
    const parts = String(text).split(/[,;\s]+/).filter(Boolean);
    if (!parts.length) throw new Error('Add at least one ratio.');
    if (parts.length > 24) throw new Error('At most 24 ratios.');
    const out = [], seen = {};
    for (const p of parts) {
      const r = parseRatio(p);
      if (r.n <= r.d) throw new Error('"' + p + '" must be greater than 1 (a rising interval).');
      if (!seen[r.text]) { seen[r.text] = 1; out.push(r); }
    }
    return out;
  }

  // Nearest step of an n-division of `equave` to ratio r. Ties (exactly halfway) go up.
  // The nearest step is decided in log space; near-ties within 1e-9 are treated as ties.
  function nearestStep(n, r, equave) {
    const x = n * log2(r) / log2(equave);
    let k = Math.floor(x); const f = x - k;
    if (f > 0.5 - 1e-9) k += 1;
    return k;
  }
  // Error in cents of the tempered interval relative to the just ratio (tempered minus just).
  function errorCents(n, r, equave, k) { return k * cents(equave) / n - cents(r); }

  // Fit one n-division. Returns steps, step size, per-interval rows, rms and max absolute error.
  function fit(n, ratios, equave) {
    const eq = cents(equave);
    const rows = ratios.map((r) => {
      const k = nearestStep(n, r, equave);
      return { ratio: r.text, just: cents(r), step: k, tempered: k * eq / n, err: errorCents(n, r, equave, k) };
    });
    let ss = 0, mx = 0;
    for (const w of rows) { ss += w.err * w.err; mx = Math.max(mx, Math.abs(w.err)); }
    return { n, stepCents: eq / n, rows, rms: Math.sqrt(ss / rows.length), max: mx };
  }

  // Fit every n from 1 to maxN and mark "records": sizes that beat every smaller size on the chosen metric.
  function scan(maxN, ratios, equave, metric) {
    metric = metric === 'max' ? 'max' : 'rms';
    if (!(maxN >= 1 && maxN <= MAXN)) throw new Error('Size limit must be 1 to ' + MAXN + '.');
    const all = []; let best = Infinity;
    for (let n = 1; n <= maxN; n++) {
      const f = fit(n, ratios, equave);
      f.score = f[metric];
      f.record = f.score < best - 1e-12;
      if (f.record) best = f.score;
      all.push(f);
    }
    return all;
  }

  // Frequency of step k of an n-division of `equave`, from base frequency hz.
  function freq(hz, k, n, equave) { return hz * Math.pow(equave.n / equave.d, k / n); }

  const api = { parseRatio, parseList, cents, nearestStep, errorCents, fit, scan, freq, MAXN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TuningFit = api;
})(typeof self !== 'undefined' ? self : this);
