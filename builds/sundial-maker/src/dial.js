// Sundial engine: a horizontal dial for any latitude, built from 3-D vectors.
// Axes: x east, y north, z up. Angles in degrees unless a name says otherwise. Works in Node and in the browser.
(function (root) {
  'use strict';
  const D = Math.PI / 180;
  const sgn = (v) => (v < 0 ? -1 : 1);

  function dayOfYear(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 1; }

  // Spencer (1971) Fourier series for the sun's declination (degrees) and the equation of time (minutes).
  function gamma(N) { return (2 * Math.PI * (N - 1)) / 365; }
  function declination(N) {
    const g = gamma(N);
    return (0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)) / D;
  }
  function eot(N) {
    const g = gamma(N);
    return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  }

  // Unit vector from the observer towards the sun, for hour angle H (0 at solar noon, +15 per hour after noon).
  function sunVec(lat, dec, H) {
    const p = lat * D, d = dec * D, h = H * D;
    return [-Math.cos(d) * Math.sin(h), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.sin(p) * Math.cos(h), Math.sin(d) * Math.sin(p) + Math.cos(d) * Math.cos(p) * Math.cos(h)];
  }
  // The style (the edge that casts the hour shadow) is parallel to the earth's axis, pointing at the pole above the horizon.
  function styleDir(lat) { const s = sgn(lat); return [0, s * Math.cos(lat * D), s * Math.sin(lat * D)]; }

  // Shadow of the point t*P on the style, projected on the dial plane (z = 0). null if the sun is below the horizon.
  function shadowOf(p, s) {
    if (s[2] <= 1e-6) return null;
    const k = p[2] / s[2];
    return [p[0] - k * s[0], p[1] - k * s[1]];
  }
  // Direction (unit vector on the dial) of the hour line for hour angle H. The plane of the style and the sun meets the dial
  // in a line whose direction does not depend on declination; s_z*P - P_z*s is that direction for any sun height.
  function hourDir(lat, H, dec) {
    const s = sunVec(lat, dec || 0, H), P = styleDir(lat);
    const q = [s[2] * P[0] - P[2] * s[0], s[2] * P[1] - P[2] * s[1]];
    const n = Math.hypot(q[0], q[1]);
    return n < 1e-12 ? null : [q[0] / n, q[1] / n];
  }
  // Where the nodus (a point on the style at height g above the dial) casts its shadow. Distance from the style's foot.
  function nodus(lat, g) { const P = styleDir(lat), t = g / P[2]; return [0, P[1] * t, g]; }
  function nodusShadow(lat, dec, H, g, minAlt) {
    const s = sunVec(lat, dec, H);
    if (s[2] <= Math.sin((minAlt === undefined ? 2 : minAlt) * D)) return null;
    return shadowOf(nodus(lat, g), s);
  }
  // Hour angle (deg) of the sunrise/sunset for a declination, or null for polar day/night; +-Infinity-free.
  function sunsetAngle(lat, dec) {
    const c = (Math.sin(-0.833 * D) - Math.sin(lat * D) * Math.sin(dec * D)) / (Math.cos(lat * D) * Math.cos(dec * D));
    if (c >= 1) return { kind: 'night', H: 0 };
    if (c <= -1) return { kind: 'day', H: 180 };
    return { kind: 'normal', H: Math.acos(c) / D };
  }
  function dayLengthHours(lat, dec) { return (2 * sunsetAngle(lat, dec).H) / 15; }

  // A curve of nodus shadows for one declination, as arrays of segments of [x, y] (broken where the sun is down).
  function dateCurve(lat, dec, g, stepDeg, minAlt) {
    const out = []; let cur = [];
    for (let H = -180; H <= 180.0001; H += stepDeg || 1) {
      const q = nodusShadow(lat, dec, H, g, minAlt);
      if (q) cur.push(q); else if (cur.length) { out.push(cur); cur = []; }
    }
    if (cur.length) out.push(cur);
    return out;
  }
  // Day numbers (1..365) on which the declination first crosses the given value going up and going down.
  function datesAtDeclination(dec) {
    const days = [];
    for (let N = 1; N <= 365; N++) {
      const a = declination(N) - dec, b = declination(N === 365 ? 1 : N + 1) - dec;
      if (a === 0) days.push(N); else if (a * b < 0) days.push(Math.abs(a) < Math.abs(b) ? N : (N === 365 ? 1 : N + 1));
    }
    return [...new Set(days)];
  }
  function dateLabel(N) { const d = new Date(Date.UTC(2026, 0, N)); return d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]; }

  // Clock <-> sun time. lon east positive; tz = standard-time offset from UTC in hours; dst adds one hour to the clock.
  // Solar (apparent) time = clock - dst + 4 min per degree of (lon - 15*tz) + equation of time.
  function clockToSolar(clockMin, lon, tz, dst, N) { return clockMin - (dst ? 60 : 0) + 4 * (lon - 15 * tz) + eot(N); }
  function solarToClock(solarMin, lon, tz, dst, N) { return solarMin - 4 * (lon - 15 * tz) - eot(N) + (dst ? 60 : 0); }
  const hourAngleOfSolar = (solarMin) => (solarMin - 720) / 4;
  // Hour angle of a mean-time standard hour line (no DST, no equation of time): a dial can fix the longitude, not the equation of time.
  function hourAngleOfStandardHour(h, lon, tz) { return 15 * (h - 12) + (lon - 15 * tz); }

  // Gnomon: a right triangle whose hypotenuse is the style. Returns plate-ready numbers in the same unit as g.
  function gnomon(lat, g, margin) {
    const a = Math.abs(lat), t = Math.tan(a * D), y0 = g / t, base = y0 + (margin === undefined ? g * 0.35 : margin);
    return { baseLen: base, height: base * t, nodusY: y0, nodusZ: g, styleLen: Math.hypot(base, base * t), angle: a };
  }

  const api = { dayOfYear, declination, eot, sunVec, styleDir, shadowOf, hourDir, nodus, nodusShadow, sunsetAngle, dayLengthHours, dateCurve, datesAtDeclination, dateLabel, clockToSolar, solarToClock, hourAngleOfSolar, hourAngleOfStandardHour, gnomon };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Dial = api;
})(typeof self !== 'undefined' ? self : this);
