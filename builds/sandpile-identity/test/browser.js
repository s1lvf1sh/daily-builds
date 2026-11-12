// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [wide.png] [phone.png]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };
  await pg.goto('file://' + path.resolve(__dirname, '../index.html'));
  const grid = () => pg.evaluate(() => Array.from(window.__sandpile.cfg).join(''));
  const msg = async () => (await pg.locator('#msg').innerText());
  ok((await pg.evaluate(() => window.__sandpile.w)) === 43, 'default 43 wide');
  let m = await msg(); ok(/Identity is recurrent: yes/.test(m) && /e \+ e = e: yes/.test(m), 'identity checks pass on load: ' + m.replace(/\n/g, ' | '));
  const g1 = await grid(); ok(/^[0-3]+$/.test(g1) && g1.length === 43 * 43, 'identity is a stable 43x43 grid');
  // compare with library on the page's own copy
  const lib = await pg.evaluate(() => Array.from(Sandpile.identity(43, 43)).join('')); ok(lib === g1, 'page shows library identity');
  await pg.screenshot({ path: process.argv[2] || '/tmp/sp-wide.png', fullPage: true });
  // resize
  await pg.evaluate(() => { const w = document.getElementById('w'); w.value = 20; w.dispatchEvent(new Event('input')); });
  ok((await pg.evaluate(() => window.__sandpile.h)) === 20, 'square lock sets height'); ok((await grid()).length === 400, '20x20 grid');
  // clear -> drop grains by clicking: pile must topple and then settle stable, grains conserved or lost only at edge
  await pg.click('#bClear'); ok(/^0+$/.test(await grid()), 'cleared');
  const box = await pg.locator('#cv').boundingBox(); await pg.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await pg.waitForFunction(() => document.getElementById('cv').dataset.settled === '1', null, { timeout: 5000 });
  let g = await grid(); ok(/^[0-3]+$/.test(g) && /[1-3]/.test(g), 'click dropped grains, pile settled stable'); ok(g[210] !== '0' || g.replace(/0/g, '').length > 0, 'nonempty');
  // add identity to a random recurrent pile -> unchanged
  await pg.click('#bRand'); const r1 = await grid(); await pg.click('#bAddId'); await pg.waitForFunction(() => /ended exactly|changed/.test(document.getElementById('msg').textContent), null, { timeout: 8000 });
  ok(/ended exactly as it began/.test(await msg()) && (await grid()) === r1, 'adding identity to a recurrent pile leaves it unchanged');
  // add identity to a NON-recurrent pile (clear + one click) -> changes
  await pg.click('#bClear'); await pg.mouse.click(box.x + 5, box.y + 5, {}); await pg.waitForFunction(() => document.getElementById('cv').dataset.settled === '1');
  const nr = await grid(); await pg.click('#bAddId'); await pg.waitForFunction(() => /ended exactly|changed/.test(document.getElementById('msg').textContent), null, { timeout: 8000 });
  ok(/changed/.test(await msg()) && (await grid()) !== nr, 'adding identity to a non-recurrent pile changes it');
  // rectangular, big
  await pg.uncheck('#sq'); await pg.evaluate(() => { const h = document.getElementById('h'); h.value = 15; h.dispatchEvent(new Event('input')); });
  ok((await pg.evaluate(() => [window.__sandpile.w, window.__sandpile.h].join('x'))) === '20x15', 'rectangular grid 20x15');
  await pg.click('#bId'); m = await msg(); ok(/e \+ e = e: yes/.test(m), 'rectangular identity passes checks');
  await pg.evaluate(() => { const s = document.getElementById('sq'); s.checked = true; s.dispatchEvent(new Event('change')); });
  const t0 = Date.now(); await pg.evaluate(() => { const w = document.getElementById('w'); w.value = 101; w.dispatchEvent(new Event('input')); }); await pg.click('#bId'); ok(Date.now() - t0 < 4000, '101x101 identity in under 4 s (' + (Date.now() - t0) + ' ms)');
  m = await msg(); ok(/e \+ e = e: yes/.test(m) && /Identity is recurrent: yes/.test(m), '101x101 checks pass');
  await pg.screenshot({ path: (process.argv[2] || '/tmp/sp-wide.png').replace('.png', '-101.png') });
  // phone
  await pg.setViewportSize({ width: 390, height: 800 }); await pg.screenshot({ path: process.argv[3] || '/tmp/sp-phone.png', fullPage: true });
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal scroll on phone');
  ok(errs.length === 0, 'no console/page errors ' + errs.join(';'));
  console.log(`${pass} passed, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
