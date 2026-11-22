// NODE_PATH=$(npm root -g) SHOT=/path/out.png node test/browser.js   (or BASE=url to test the live site)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const url = process.env.BASE || ('file://' + path.join(__dirname, '../index.html'));
const E = require('../src/dial.js');
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 1000 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(url);
  const setv = async (id, v) => { await pg.fill('#' + id, String(v)); await pg.dispatchEvent('#' + id, 'input'); };
  const read = async () => Object.fromEntries((await pg.$$eval('#read dt', (a) => a.map((d) => [d.textContent, d.nextElementSibling.textContent]))));
  const num = (s) => parseFloat(String(s).replace('−', '-'));
  // fixed scenario: London, 21 Jun 2026, clock 13:00 with daylight saving
  await setv('date', '2026-06-21'); await pg.check('#dst'); await pg.evaluate(() => { document.getElementById('clock').value = 780; document.getElementById('clock').dispatchEvent(new Event('input')); });
  const N = E.dayOfYear(2026, 6, 21);
  let r = await read();
  ok(/^1[12]:\d\d sun time/.test(r['Dial reads']), 'London clock 13:00 DST reads about 12 on the dial', r['Dial reads']);
  const expectSolar = E.clockToSolar(780, -0.13, 0, true, N); ok(r['Dial reads'].startsWith(String(Math.floor(expectSolar / 60)).padStart(2, '0') + ':' + String(Math.round(expectSolar % 60)).padStart(2, '0')), 'dial reading equals the engine', r['Dial reads'] + ' vs ' + expectSolar);
  const heightWant = Math.asin(E.sunVec(51.5, E.declination(N), E.hourAngleOfSolar(expectSolar))[2]) * 180 / Math.PI;
  ok(Math.abs(num(r['Sun height']) - heightWant) < 0.06, 'sun height readout', r['Sun height'] + ' vs ' + heightWant);
  ok(/16 h/.test(r['Day length']), 'London midsummer day is about 16 h 40', r['Day length']);
  // the drawn gnomon shadow lies on the drawn hour line for that time, and the nodus dot sits on its date curve
  const geo = await pg.evaluate(() => { const poly = document.querySelector('#shadow').getAttribute('points').split(' ').map((p) => p.split(',').map(Number)); const dot = document.querySelector('#nodusdot'); const vb = document.getElementById('dial').viewBox.baseVal; return { poly, dot: [+dot.getAttribute('cx'), +dot.getAttribute('cy')], S: vb.width }; });
  const S = geo.S, ox = S / 2, oy = S * 0.8, tip = geo.poly[2];
  const Hsol = E.hourAngleOfSolar(expectSolar), dir = E.hourDir(51.5, Hsol, 0);
  const cross = (tip[0] - ox) * (-dir[1]) - (tip[1] - oy) * dir[0]; ok(Math.abs(cross) < 0.05 * S / 10, 'shadow tip is on the hour line', cross);
  const q = E.nodusShadow(51.5, E.declination(N), Hsol, S / 7, 0.5); ok(Math.abs(geo.dot[0] - (ox + q[0])) < 0.01 && Math.abs(geo.dot[1] - (oy - q[1])) < 0.01, 'nodus dot where the engine puts it', JSON.stringify([geo.dot, q]));
  // hour lines drawn: solar mode 12 is the noon line, straight up
  const noon = await pg.$eval('#dial .hl[data-h="12"]', (l) => [+l.getAttribute('x2') - +l.getAttribute('x1'), +l.getAttribute('y2') - +l.getAttribute('y1')]); ok(Math.abs(noon[0]) < 1e-6 && noon[1] < 0, 'noon line points up in the north', noon.join());
  const lines = await pg.$$eval('#dial .hl', (l) => l.length); ok(lines >= 15 && lines <= 19, 'about 17 hour lines at 51.5N', lines);
  const dc = await pg.$$eval('#dial .dc', (l) => l.length); ok(dc >= 7, 'seven date curves', dc);
  // moving the clock moves the shadow
  await pg.evaluate(() => { document.getElementById('clock').value = 540; document.getElementById('clock').dispatchEvent(new Event('input')); });
  const tip2 = await pg.$eval('#shadow', (p) => p.getAttribute('points').split(' ')[2].split(',').map(Number)); ok(Math.hypot(tip2[0] - tip[0], tip2[1] - tip[1]) > 5, 'clock slider moves the shadow');
  ok(tip2[0] < ox, 'morning shadow falls west of the noon line (towards the left)... sun in the east', tip2[0] + ' vs ' + ox);
  // night: no shadow
  await pg.evaluate(() => { document.getElementById('clock').value = 120; document.getElementById('clock').dispatchEvent(new Event('input')); });
  ok((await pg.$$('#shadow')).length === 0, 'no shadow at 02:00'); ok(/down/.test((await read())['Dial reads']), 'says the sun is down');
  // southern hemisphere: Sydney, noon line points down, text says south, hour lines mirror
  await pg.click('#presets button:has-text("Sydney")');
  const noonS = await pg.$eval('#dial .hl[data-h="12"]', (l) => [+l.getAttribute('x2') - +l.getAttribute('x1'), +l.getAttribute('y2') - +l.getAttribute('y1')]); ok(noonS[1] > 0, 'noon line points down in the south', noonS.join());
  ok(/SOUTH/.test(await pg.textContent('#dial .north')), 'plate says the noon line points south');
  // the 3 p.m. line sits on the east side in both hemispheres (after noon the sun is in the west, the shadow east)
  const l15 = await pg.$eval('#dial .hl[data-h="15"]', (l) => +l.getAttribute('x2') - +l.getAttribute('x1')); ok(l15 > 0, '3 pm line is to the right', l15);
  // standard-time mode: Berlin noon line is rotated by the longitude gap
  await pg.click('#presets button:has-text("London")'); await setv('lon', 13.4); await setv('tz', 1); await pg.selectOption('#mode', 'std');
  const n12 = await pg.$eval('#dial .hl[data-h="12"]', (l) => [+l.getAttribute('x2') - +l.getAttribute('x1'), +l.getAttribute('y2') - +l.getAttribute('y1')]);
  const ang = Math.atan2(n12[0], -n12[1]) * 180 / Math.PI; const want = Math.atan2(Math.sin(51.5 * Math.PI / 180) * Math.sin(-1.6 * Math.PI / 180), Math.cos(-1.6 * Math.PI / 180)) * 180 / Math.PI;
  ok(Math.abs(ang - want) < 0.01, 'standard-time noon line is rotated by the longitude fix', ang + ' vs ' + want);
  // validation
  await setv('lat', 2); ok(/Latitude must/.test(await pg.innerText('#err')), 'equator-ish latitude is refused with a message'); await setv('lat', 51.5);
  ok((await pg.innerText('#err')) === '', 'error clears');
  // print sheet contains the dial and gnomon at true size, without the live shadow
  const sheet = await pg.evaluate(() => { const s = document.getElementById('sheet'); const svgs = [...s.querySelectorAll('svg')]; return { n: svgs.length, w: svgs.map((v) => v.getAttribute('width')), live: s.querySelectorAll('#live,#shadow,#nodusdot').length }; });
  ok(sheet.n === 2 && sheet.w[0] === '180mm' && sheet.live === 0, 'print sheet: dial 180mm and gnomon, no live shadow', JSON.stringify(sheet));
  const pdfOk = await pg.emulateMedia({ media: 'print' }).then(async () => { const v = await pg.evaluate(() => { const r = document.querySelector('#sheet svg').getBoundingClientRect(); return [r.width, r.height, getComputedStyle(document.querySelector('#sheet')).display]; }); await pg.emulateMedia({ media: 'screen' }); return v; });
  ok(pdfOk[2] === 'block' && Math.abs(pdfOk[0] - 180 * 96 / 25.4) < 2, 'print media: sheet visible and dial is 180 mm wide', JSON.stringify(pdfOk));
  // gnomon template: the nodus lies on the hypotenuse
  const gg = await pg.evaluate(() => { const poly = document.querySelector('#gpoly').getAttribute('points').split(' ').map((p) => p.split(',').map(Number)); const n = document.querySelector('#nodus'); return { poly, n: [+n.getAttribute('cx'), +n.getAttribute('cy')] }; });
  const [A, B, C] = gg.poly; const cr = (C[0] - A[0]) * (gg.n[1] - A[1]) - (C[1] - A[1]) * (gg.n[0] - A[0]); ok(Math.abs(cr) / Math.hypot(C[0] - A[0], C[1] - A[1]) < 0.01, 'nodus ring sits on the hypotenuse (within 0.01 mm)', cr);
  ok(Math.abs(Math.atan2(A[1] - C[1], B[0] - A[0]) * 180 / Math.PI - 51.5) < 0.01, 'gnomon template angle is the latitude');
  // 500 random states: no errors thrown
  for (let i = 0; i < 40; i++) { await setv('lat', (Math.random() * 150 - 75).toFixed(1)); await setv('date', '2026-' + String(1 + (i % 12)).padStart(2, '0') + '-15'); await pg.evaluate((c) => { document.getElementById('clock').value = c; document.getElementById('clock').dispatchEvent(new Event('input')); }, Math.floor(Math.random() * 1440)); }
  ok(errs.length === 0, 'no page errors', errs.join(' | '));
  await setv('lat', 51.5); await setv('lon', -0.13); await setv('tz', 0); await pg.selectOption('#mode', 'solar'); await setv('date', '2026-11-22'); await pg.evaluate(() => { document.getElementById('clock').value = 705; document.getElementById('clock').dispatchEvent(new Event('input')); });
  if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT, fullPage: true });
  await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
