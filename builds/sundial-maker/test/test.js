// node test/test.js   (MUT=name runs the engine with one deliberate bug, to prove the tests can fail)
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '../src/dial.js'), 'utf8');
const MUTS = {
  hemi: ['return [0, s * Math.cos(lat * D), s * Math.sin(lat * D)]', 'return [0, Math.cos(lat * D), Math.abs(Math.sin(lat * D))]'],
  east: ['-Math.cos(d) * Math.sin(h), Math.sin(d)', 'Math.cos(d) * Math.sin(h), Math.sin(d)'],
  eotsign: ['- (dst ? 60 : 0) + 4 * (lon - 15 * tz) + eot(N)', '- (dst ? 60 : 0) + 4 * (lon - 15 * tz) - eot(N)'],
  lon: ['4 * (lon - 15 * tz) + eot(N)', '4 * (15 * tz - lon) + eot(N)'],
  refr: ['Math.sin(-0.833 * D)', 'Math.sin(0)'],
  decsign: ['Math.sin(d) * Math.cos(p) - Math.cos(d)', 'Math.sin(-d) * Math.cos(p) - Math.cos(d)'],
  nodusz: ['t = g / P[2]', 't = g / Math.abs(P[1])'],
  dst: ['clockMin - (dst ? 60 : 0)', 'clockMin + (dst ? 60 : 0)'],
  gnom: ['base * t', 'base / t'],
  dates: ['Math.abs(a) < Math.abs(b) ? N :', 'Math.abs(a) > Math.abs(b) ? N :'],
};
if (process.env.MUT) { const [a, b] = MUTS[process.env.MUT]; if (!src.includes(a)) throw new Error('mutation target not found: ' + process.env.MUT); src = src.replace(a, b); }
const m = { exports: {} }; new Function('module', 'self', src)(m, undefined); const E = m.exports;
const O = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle_cases.json'), 'utf8'));
let pass = 0, fail = 0;
const ok = (c, name, extra) => { if (c) pass++; else { fail++; if (fail < 25) console.log('FAIL', name, extra === undefined ? '' : extra); } };
const near = (a, b, tol, name) => ok(Math.abs(a - b) <= tol, name, a + ' vs ' + b);
const safe = (f) => { try { return f(); } catch (e) { return 'threw:' + e.message; } };

// ---- hand-derived anchors
near(E.dayOfYear(2026, 3, 21), 80, 0, 'day of year 21 Mar');
near(E.dayOfYear(2026, 12, 31), 365, 0, 'day of year 31 Dec');
near(E.declination(E.dayOfYear(2026, 6, 21)), 23.44, 0.1, 'June solstice declination');
near(E.declination(E.dayOfYear(2026, 12, 21)), -23.44, 0.1, 'December solstice declination');
near(E.declination(E.dayOfYear(2026, 3, 20)), 0, 0.5, 'equinox declination near 0');
near(E.eot(E.dayOfYear(2026, 11, 3)), 16.4, 0.5, 'equation of time peaks near +16.4 min on 3 Nov');
near(E.eot(E.dayOfYear(2026, 2, 11)), -14.2, 0.5, 'equation of time bottoms near -14.2 min on 11 Feb');
near(E.eot(E.dayOfYear(2026, 4, 15)), 0, 0.5, 'equation of time is about 0 on 15 Apr');
near(E.dayLengthHours(0, 10), 12.1, 0.1, 'equator day is about 12 h');
near(E.dayLengthHours(51.5, 0), 12.1, 0.1, 'equinox day is about 12 h at any latitude');
ok(E.sunsetAngle(70, 23.4).kind === 'day' && E.sunsetAngle(70, -23.4).kind === 'night' && E.sunsetAngle(51.5, 23.4).kind === 'normal', 'polar day and night kinds');
// noon shadow of the nodus at the equinox: g/tan(lat) + g*tan(lat) north of the style's foot (north hemisphere)
for (const [lat, g] of [[30, 20], [51.5, 25], [60, 10]]) { const q = E.nodusShadow(lat, 0, 0, g); near(q[1], g / Math.tan(lat * Math.PI / 180) + g * Math.tan(lat * Math.PI / 180), 1e-9, 'equinox noon nodus shadow at ' + lat); near(q[0], 0, 1e-9, 'noon shadow on the noon line'); }
// southern mirror: same distances, but on the other side
{ const a = E.nodusShadow(40, 5, 30, 20), b = E.nodusShadow(-40, -5, -30, 20); near(a[0], -b[0], 1e-9, 'mirror x'); near(a[1], -b[1], 1e-9, 'mirror y'); }
// the equinoctial shadows lie on one straight line (perpendicular to the noon line)
for (const lat of [25, 51.5, -34]) { const ys = []; for (let H = -70; H <= 70; H += 10) ys.push(E.nodusShadow(lat, 0, H, 20)[1]); near(Math.max(...ys), Math.min(...ys), 1e-9, 'equinox line is straight at ' + lat); }
// hour lines do not depend on the date
for (const lat of [20, 51.5, -34]) for (const H of [-75, -30, 15, 60]) { const a = E.hourDir(lat, H, 0), b = E.hourDir(lat, H, 20), c = E.hourDir(lat, H, -20); ok(a && b && c && Math.hypot(a[0] - b[0], a[1] - b[1], a[0] - c[0], a[1] - c[1]) < 1e-9, 'hour line independent of declination', [lat, H].join()); }
// clock arithmetic: Greenwich, no DST, 3 Nov: solar = clock + EoT; 15 degrees east of the zone meridian = one hour ahead
{ const N = E.dayOfYear(2026, 11, 3); near(E.clockToSolar(720, 0, 0, false, N), 720 + E.eot(N), 1e-9, 'Greenwich solar time');
  near(E.clockToSolar(720, 15, 0, false, N) - E.clockToSolar(720, 0, 0, false, N), 60, 1e-9, '15 deg east is 60 min ahead');
  near(E.clockToSolar(780, 0, 0, true, N), E.clockToSolar(720, 0, 0, false, N), 1e-9, 'DST clock 13:00 equals standard 12:00');
  near(E.solarToClock(E.clockToSolar(600, -74, -5, true, N), -74, -5, true, N), 600, 1e-9, 'clock round trip');
  near(E.hourAngleOfStandardHour(12, 13.4, 1), -1.6, 1e-9, 'Berlin noon line is 1.6 deg west of the 15E meridian hour angle'); near(E.hourAngleOfSolar(780), 15, 1e-9, '13:00 solar is 15 deg'); }
// gnomon triangle: hypotenuse makes the latitude angle with the base
for (const lat of [20, 51.5, -64]) { const gn = E.gnomon(lat, 30); near(Math.atan2(gn.height, gn.baseLen) * 180 / Math.PI, Math.abs(lat), 1e-9, 'gnomon angle ' + lat); near(gn.nodusZ / gn.nodusY, Math.tan(Math.abs(lat) * Math.PI / 180), 1e-9, 'nodus sits on the hypotenuse ' + lat); }
// declination dates: both dates of a declination really have it
for (const dec of [-20, 0, 11.6, 20]) { const ds = E.datesAtDeclination(dec); ok(ds.length === 2, 'two dates at declination ' + dec, ds.join()); for (const N of ds) { near(E.declination(N), dec, 0.4, 'date ' + N + ' has declination ' + dec); for (const k of [-2, -1, 1, 2]) { const M = ((N - 1 + k + 365) % 365) + 1; ok(Math.abs(E.declination(N) - dec) <= Math.abs(E.declination(M) - dec) + 1e-12 || ds.includes(M), 'date ' + N + ' is the nearest day to declination ' + dec, M); } } }
ok(E.dateCurve(51.5, 0, 25, 1).length === 1 && E.dateCurve(51.5, 0, 25, 1)[0].length > 150, 'one daytime curve at the equinox');

// ---- independent oracle (python, different formulas)
for (const c of O.hour) { const d = E.hourDir(c.lat, c.H); ok(d && Math.hypot(d[0] - c.dir[0], d[1] - c.dir[1]) < 1e-9, 'hour line vs closed form', JSON.stringify([c.lat, c.H, d, c.dir])); }
let live = 0, maxD = 0, edge = 0;
for (const c of O.nodus) { const q = E.nodusShadow(c.lat, c.dec, c.H, c.g, 2);
  if (c.q === null) { ok(q === null || Math.abs(Math.asin(E.sunVec(c.lat, c.dec, c.H)[2]) * 180 / Math.PI - 2) < 1e-6, 'sun down agrees', JSON.stringify(c)); continue; }
  if (q === null) { edge++; continue; } live++;
  const d = Math.hypot(q[0] - c.q[0], q[1] - c.q[1]); maxD = Math.max(maxD, d / (c.g + 1)); ok(d < 1e-6 * (1 + Math.hypot(...c.q)), 'nodus shadow vs altitude/azimuth', JSON.stringify([c, q])); }
ok(live > 1000, 'oracle exercised many live nodus shadows', live);
let maxDec = 0, maxEot = 0;
for (const a of O.astro) { maxDec = Math.max(maxDec, Math.abs(E.declination(a.N) - a.dec)); maxEot = Math.max(maxEot, Math.abs(E.eot(a.N) - a.eot)); }
ok(maxDec < 0.5, 'declination vs Meeus over the whole year', maxDec); ok(maxEot < 1.0, 'equation of time vs Meeus over the whole year', maxEot);
let maxLen = 0, nLen = 0, maxGeo = 0;
for (const c of O.daylen) { if (Math.abs(c.lat) > 57) continue; const mine = E.dayLengthHours(c.lat, E.declination(c.N)); const diff = Math.abs(mine - c.hours) * 60; maxLen = Math.max(maxLen, diff); nLen++; ok(diff < 7, 'day length vs minute-by-minute oracle (engine series)', JSON.stringify([c, mine]));
  const own = E.dayLengthHours(c.lat, O.astro[c.N - 1].dec); const d2 = Math.abs(own - c.hours) * 60; maxGeo = Math.max(maxGeo, d2); ok(d2 < 2.5, 'day length geometry vs oracle, given the oracle declination', JSON.stringify([c, own])); }
console.log(`oracle: ${live} nodus shadows (${edge} within 1e-6 of the 2-degree cutoff skipped), max |dec diff| ${maxDec.toFixed(3)} deg, max |EoT diff| ${maxEot.toFixed(2)} min, ${nLen} day lengths, max diff ${maxLen.toFixed(2)} min (${maxGeo.toFixed(2)} min when given the oracle declination)`);
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
