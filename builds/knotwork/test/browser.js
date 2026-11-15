// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]
const { chromium } = require('playwright'); const path = require('path'); const K = require('../src/knot.js');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html'); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(url + '#7x5-none-' + '0'.repeat(Math.ceil(K.interiorEdges(K.createGrid(7, 5)).length / 4))); await pg.reload();
  ok(/One strand/.test(await pg.textContent('#status')), 'empty 7x5 shows one strand: ' + (await pg.textContent('#status')).slice(0, 40));
  ok((await pg.$$('path.strand')).length === 1, 'one strand path drawn');
  await pg.fill('#w', '6'); await pg.dispatchEvent('#w', 'input'); await pg.fill('#h', '4'); await pg.dispatchEvent('#h', 'input');
  ok(/2 strands/.test(await pg.textContent('#status')) && (await pg.$$('path.strand')).length === 2, '6x4 shows 2 strands (gcd)');
  // click one interior edge and compare with the engine on the same grid
  await pg.click('.hit', { force: true });
  const g = K.createGrid(6, 4); const e = K.interiorEdges(g)[0]; K.setWall(g, e.t, e.x, e.y, true); const want = K.analyze(g).count;
  ok((await pg.$$('path.strand')).length === want, 'click toggles edge 0, strand count matches engine: ' + want);
  await pg.click('.hit', { force: true }); ok((await pg.$$('path.strand')).length === 2, 'clicking again removes the wall');
  await pg.selectOption('#sym', 'both'); await pg.click('#solve');
  const s = await pg.textContent('#status'); const hash = await pg.evaluate(() => location.hash.slice(1)); const dec = K.decode(hash);
  ok(dec && K.analyze(dec.g).count === (await pg.$$('path.strand')).length, 'URL hash decodes to the grid that is drawn');
  ok(dec && dec.sym === 'both', 'symmetry in hash'); ok(/strand/.test(s), 'status after solve: ' + s.slice(0, 60));
  await pg.selectOption('#sym', 'none'); await pg.click('#solve'); ok(/One strand/.test(await pg.textContent('#status')), 'solve makes one strand (no symmetry)');
  await pg.click('#rand'); const nStr = (await pg.$$('path.strand')).length; const dec2 = K.decode(await pg.evaluate(() => location.hash.slice(1))); ok(K.analyze(dec2.g).count === nStr, 'random walls: page count equals engine count');
  await pg.fill('#w', '9'); await pg.dispatchEvent('#w', 'input'); await pg.fill('#h', '7'); await pg.dispatchEvent('#h', 'input'); await pg.click('#clear');
  ok(/One strand/.test(await pg.textContent('#status')), '9x7 empty: gcd 1, one strand'); 
  await pg.selectOption('#sym', 'rot4'); ok((await pg.inputValue('#w')) === (await pg.inputValue('#h')), 'rot4 forces a square grid');
  const dl = pg.waitForEvent('download'); await pg.click('#svg'); const d = await dl; const p = await d.path(); const txt = require('fs').readFileSync(p, 'utf8'); ok(/^<svg/.test(txt) && /<\/svg>$/.test(txt) && !/class="hit"/.test(txt), 'SVG download is a clean SVG without click targets');
  await pg.goto(url + '#garbage'); await pg.reload(); ok((await pg.$$('path.strand')).length >= 1, 'bad hash falls back to a default knot');
  ok(errs.length === 0, 'no page errors: ' + errs.join('|'));
  await pg.goto(url + '#' + K.encode((() => { const q = K.createGrid(9, 7); K.solve(q, 'both', 3); return q; })(), 'both')); await pg.reload();
  if (process.argv[2]) await pg.screenshot({ path: process.argv[2] });
  await pg.setViewportSize({ width: 390, height: 800 }); const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(sw[0] <= sw[1] + 1, 'no horizontal scroll on a phone ' + sw);
  if (process.argv[3]) await pg.screenshot({ path: process.argv[3], fullPage: true });
  await br.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
