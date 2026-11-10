// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [shot.png]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };
  const url = 'file://' + path.resolve(__dirname, '../index.html');
  await pg.goto(url + '#easy/7');
  ok((await pg.locator('.cell').count()) === 16, '4x4 board for easy');
  const par = parseInt(await pg.locator('#par').innerText(), 10);
  const lit0 = await pg.locator('.cell.on').count(); ok(lit0 > 0, 'some lights on at start');
  await pg.screenshot({ path: process.argv[2] || '/tmp/stamp-lights.png' });
  // hover preview highlights stamp footprint
  await pg.hover('.cell >> nth=5'); ok((await pg.locator('.cell.pv').count()) >= 2, 'hover previews stamp');
  // press then undo restores
  await pg.click('.cell >> nth=5'); ok((await pg.locator('#moves').innerText()) === '1', 'press counted');
  await pg.click('#undo'); ok((await pg.locator('.cell.on').count()) === lit0, 'undo restores board');
  // follow hints until solved; count presses
  let n = 0; while (!(await pg.locator('#msg.win').count()) && n < 40) {
    await pg.click('#hint'); const idx = await pg.evaluate(() => [...document.querySelectorAll('.cell')].findIndex((c) => c.classList.contains('hint')));
    if (idx < 0) break; await pg.click('.cell >> nth=' + idx); n++;
  }
  ok(n === par, 'following hints takes exactly par presses (' + n + ' vs ' + par + ')');
  ok(/fewest possible/.test(await pg.locator('#msg').innerText()), 'win message shown');
  ok((await pg.locator('.cell.on').count()) === 0, 'no lights on after win');
  // reset after win
  await pg.click('#reset'); ok((await pg.locator('.cell.on').count()) === lit0, 'reset restores the puzzle');
  // same hash same puzzle after reload
  await pg.reload(); ok((await pg.locator('.cell.on').count()) === lit0, 'link reproduces the puzzle');
  // levels
  await pg.selectOption('#level', 'hard'); ok((await pg.locator('.cell').count()) === 36, 'hard is 6x6');
  await pg.click('#daily'); ok(/#hard\/\d{8}$/.test(pg.url()), 'daily seed is a date in the url');
  await pg.click('#rand'); ok((await pg.locator('#moves').innerText()) === '0', 'new random starts at 0');
  ok(errs.length === 0, 'no console errors ' + errs.join('|'));
  await pg.setViewportSize({ width: 390, height: 800 }); await pg.selectOption('#level', 'hard');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 390px');
  await pg.screenshot({ path: (process.argv[2] || '/tmp/stamp-lights.png').replace('.png', '-mobile.png') });
  console.log(pass + ' passed, ' + fail + ' failed'); await b.close(); process.exit(fail ? 1 : 0);
})();
