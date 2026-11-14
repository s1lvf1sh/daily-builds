// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html'); const T = require('../src/edo.js');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(url);
  const recs = () => pg.$$eval('#scan tr', (t) => t.map((r) => +r.dataset.n));
  const expect = (set, eq, max, metric) => T.scan(max, T.parseList(set), T.parseRatio(eq), metric).filter((x) => x.record).map((x) => x.n);
  let got = await recs(); ok(JSON.stringify(got) === JSON.stringify(expect('3/2, 5/4, 6/5', '2', 72, 'rms')), 'default record list matches engine: ' + got);
  ok([12, 19, 31, 53].every((n) => got.includes(n)), '12, 19, 31, 53 shown');
  await pg.click('#scan tr[data-n="31"]');
  ok(/31 steps per 2\/1 \(38\.710/.test(await pg.textContent('#dtitle')), 'detail title: ' + await pg.textContent('#dtitle'));
  const d = await pg.$$eval('#detail tr', (t) => t.map((r) => r.innerText.replace(/\s+/g, ' ')));
  ok(d.length === 3 && /5\/4.*10.*\+0\.78/.test(d[1]) , 'detail row for 5/4 in 31: ' + d[1]);
  await pg.click('#presets button:nth-of-type(5)');
  ok((await pg.inputValue('#equave')) === '3' && JSON.stringify(await recs()) === JSON.stringify(expect('5/3, 7/3, 7/5', '3', 40, 'rms')), 'Bohlen-Pierce preset');
  await pg.fill('#ratios', '3/2, 5/4, 6/5'); await pg.fill('#equave', '2'); await pg.fill('#maxn', '120');
  await pg.click('#m-max'); ok(JSON.stringify(await recs()) === JSON.stringify(expect('3/2, 5/4, 6/5', '2', 120, 'max')), 'worst-interval metric');
  await pg.check('#all'); ok((await recs()).length === 120, 'show every N lists 120 rows');
  await pg.fill('#ratios', '3/2, bad'); ok(/not a ratio/.test(await pg.textContent('#e1')) && (await recs()).length === 0, 'bad ratio message, table cleared');
  await pg.fill('#ratios', '2/3'); ok(/greater than 1/.test(await pg.textContent('#e1')), 'falling ratio rejected');
  await pg.fill('#ratios', '3/2'); await pg.fill('#equave', '1/2'); ok(/above 1/.test(await pg.textContent('#e2')), 'equave below 1 rejected');
  await pg.fill('#equave', '2'); await pg.fill('#maxn', '999'); ok(/1 to 400/.test(await pg.textContent('#e3')), 'size limit message');
  await pg.fill('#maxn', '72');
  // audio: stub the Web Audio API and check the frequencies the page schedules
  await pg.evaluate(() => { window.__f = []; window.AudioContext = function () { return { state: 'running', currentTime: 0, destination: {}, resume() {}, createGain: () => ({ gain: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {} }), createOscillator: () => { const o = { frequency: { value: 0 }, type: '', connect() {}, start() { window.__f.push(o.frequency.value); }, stop() {} }; return o; } }; }; });
  await pg.fill('#ratios', '3/2'); await pg.click('#scan tr[data-n="12"]'); await pg.click('#detail button[data-i="0"]');
  const f = await pg.evaluate(() => window.__f); const exp = [220, 330, 220, 220 * Math.pow(2, 7 / 12)];
  ok(f.length === 4 && f.every((x, i) => Math.abs(x - exp[i]) < 1e-9), 'play schedules pure 330 then tempered ' + exp[3].toFixed(3) + ': ' + f);
  await pg.evaluate(() => (window.__f = [])); await pg.click('#playscale'); const sf = await pg.evaluate(() => window.__f);
  ok(sf.length === 13 && Math.abs(sf[12] - 440) < 1e-9 && Math.abs(sf[1] - 220 * Math.pow(2, 1 / 12)) < 1e-9, 'scale has 13 notes ending on the octave: ' + sf.length);
  // permalink
  await pg.goto(url + '#' + encodeURIComponent(JSON.stringify({ ratios: '5/4, 7/4', equave: '2', maxn: 60, metric: 'rms', sel: 31 }))); await pg.reload();
  ok((await pg.inputValue('#ratios')) === '5/4, 7/4' && /^31 steps/.test(await pg.textContent('#dtitle')), 'hash restores state');
  await pg.goto(url + '#garbage%'); await pg.reload(); ok((await pg.inputValue('#ratios')) === '3/2, 5/4, 6/5', 'bad hash falls back');
  await pg.goto(url); await pg.reload();
  if (process.argv[2]) await pg.screenshot({ path: process.argv[2], fullPage: true });
  await pg.setViewportSize({ width: 390, height: 800 }); const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(sw[0] <= sw[1] + 1, 'no horizontal scroll on a phone ' + sw);
  if (process.argv[3]) await pg.screenshot({ path: process.argv[3], fullPage: true });
  ok(errs.length === 0, 'no console errors: ' + errs.join(';'));
  await br.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
