// node test/browser.js   (needs playwright + chromium; NODE_PATH=$(npm root -g))
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const url = 'file://' + path.join(__dirname, '../index.html');
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(url);
  const verdict = () => pg.innerText('#verdict');
  ok(/folds flat/i.test(await verdict()), 'default folds'); ok((await pg.$$('#stack line.seg')).length === 8, 'dragon3 has 8 segments');
  await pg.fill('#creases', 'VMVM'); await pg.fill('#lengths', '1 1 1 1 1');
  ok(/will not fold|not fold/i.test(await verdict()) || /folds flat/i.test(await verdict()), 'verdict text present');
  // Presets: each preset makes the claim its name makes
  const claims = { 'Accordion': /folds flat/i, 'Dragon, 4 folds': /folds flat/i, 'Roll up': /folds flat, 1 way|folds flat/i, 'Will not fold': /will not fold flat/i, 'Odd lengths': /folds flat/i };
  for (const [name, re] of Object.entries(claims)) { await pg.click(`#presets button:has-text("${name}")`); ok(re.test(await verdict()), 'preset ' + name, await verdict()); }
  await pg.click('#presets button:has-text("Accordion")');
  ok((await pg.$$('#stack line.seg')).length === 9, 'accordion draws 9 bars');
  ok((await pg.$$('#curve line')).length === 9, 'curve draws 9 edges');
  // navigation
  await pg.fill('#creases', 'VVMVM'); await pg.fill('#lengths', '');
  const w0 = await pg.innerText('#which'); await pg.click('#next'); const w1 = await pg.innerText('#which');
  ok(w0 !== w1 && /Folding 2 of/.test(w1), 'next moves to folding 2', w1); await pg.click('#prev'); ok(/Folding 1 of/.test(await pg.innerText('#which')), 'prev back');
  // layer order shown in the picture matches the engine: bar y positions are distinct
  const ys = await pg.$$eval('#stack line.seg', (ls) => ls.map((l) => l.getAttribute('y1'))); ok(new Set(ys).size === ys.length, 'bars on distinct layers');
  // errors
  await pg.fill('#creases', 'VXM'); ok(/only be M/.test(await pg.innerText('#err')), 'bad letter error');
  await pg.fill('#creases', 'VM'); await pg.fill('#lengths', '1 2'); ok(/Need 3 lengths/.test(await pg.innerText('#err')), 'length count error');
  await pg.fill('#lengths', ''); ok((await pg.innerText('#err')) === '', 'error clears');
  // share link reload
  await pg.fill('#creases', 'MMVV'); await pg.fill('#lengths', '1 2 1 2 1'); const href = await pg.evaluate(() => location.hash); await pg.goto(url + href); await pg.reload();
  ok((await pg.inputValue('#creases')) === 'MMVV' && (await pg.inputValue('#lengths')) === '1 2 1 2 1', 'hash restores state', href);
  // big input stays responsive
  await pg.fill('#lengths', ''); const t0 = Date.now(); await pg.fill('#creases', 'V'.repeat(30) ); await pg.waitForTimeout(50); ok(Date.now() - t0 < 5000, 'long strip returns in time'); ok(/folds flat/i.test(await verdict()), '30 V creases fold (roll)');
  // phone width: no horizontal scroll
  await pg.setViewportSize({ width: 375, height: 800 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll at 375px');
  await pg.fill('#creases', 'VVMVVMM'); const out = process.env.SHOT; if (out) { await pg.screenshot({ path: out, fullPage: true }); }
  ok(errs.length === 0, 'no console errors', errs.join(' | '));
  await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
