// NODE_PATH=$(npm root -g) node test/browser.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  let pass = 0, fail = 0; const ck = (n, ok, x = '') => { ok ? pass++ : (fail++, console.log('FAIL', n, x)); };
  const n = () => p.$$eval('.sw', (e) => e.length);
  ck('10 swatches', (await n()) === 10);
  ck('matrix 11x11', (await p.$$eval('#matrix tr', (e) => e.length)) === 11);
  ck('css has 10 vars', (await p.textContent('#css')).match(/--tone-/g).length === 10);
  // swatch label contrast matches the colour the browser actually painted
  const px = await p.$$eval('.sw', (els) => els.map((e) => [getComputedStyle(e).backgroundColor, e.textContent]));
  const hexOf = (c) => '#' + c.match(/\d+/g).slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
  ck('painted colour = shown hex', px.every(([c, t]) => t.includes(hexOf(c))), px[0]);
  await p.fill('#steps', '6'); await p.dispatchEvent('#steps', 'input');
  ck('steps slider -> 6', (await n()) === 6);
  await p.fill('#max', '8'); await p.dispatchEvent('#max', 'input');
  ck('rule text: AAA needs 5 steps', /5<\/b> apart for AAA|5 apart for AAA/.test(await p.textContent('#rule')), await p.textContent('#rule'));
  const cell = async (a, b) => Number(await p.$eval(`#matrix tr:nth-child(${a + 2}) td:nth-child(${b + 2})`, (e) => e.textContent));
  ck('matrix 0/5 >= 7 and 0/4 < 7', (await cell(0, 5)) >= 7 && (await cell(0, 4)) < 7);
  await p.evaluate(() => { document.getElementById('hue').value = 10; document.getElementById('hue').dispatchEvent(new Event('input')); });
  ck('hue changes output', (await p.textContent('#o-hue')) === '10°');
  await p.screenshot({ path: process.argv[2] || path.resolve(__dirname, 'shot.png') });
  ck('no console errors', errs.length === 0, errs);
  console.log(`${pass} passed, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
