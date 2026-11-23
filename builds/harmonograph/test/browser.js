// Run: NODE_PATH=$(npm root -g) node test/browser.js [outdir]   (real Chromium; screenshots go to outdir)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2] || '/tmp'; const url = 'file://' + path.resolve(__dirname, '../index.html');
const H = require('../src/engine.js');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 } });
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const ink = () => pg.evaluate(() => { const c = document.getElementById('c'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; const b0 = d[0]; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - b0) > 40) n++; return n; });
  await pg.goto(url); await pg.waitForTimeout(300);
  const early = await ink(); await pg.waitForTimeout(1500); const later = await ink();
  ok(early > 0 && later > early * 1.5, 'drawing grows over time: ' + early + ' -> ' + later);
  // First ten seconds: something draws with no input at all.
  await pg.waitForTimeout(6000); await pg.screenshot({ path: path.join(out, 'desktop-auto.png') });
  const hash0 = await pg.evaluate(() => location.hash.slice(1)); ok(H.decode(hash0) !== null, 'url hash holds a valid harmonograph');
  // Pause stops ink.
  await pg.click('#pause'); const a = await ink(); await pg.waitForTimeout(500); const a2 = await ink(); ok(a === a2, 'pause freezes the drawing');
  await pg.click('#pause');
  // Presets: each loads, readout matches the engine's own ratio text.
  for (let i = 0; i < H.PRESETS.length; i++) {
    await pg.selectOption('#preset', String(i)); await pg.waitForTimeout(700);
    const p = H.PRESETS[i].pends, want = H.describeRatio(p[0].f, p[2].f).text;
    const txt = await pg.textContent('#read'); ok(txt.includes(want), 'preset ' + i + ' readout "' + txt + '" has ' + want);
    ok((await pg.evaluate(() => location.hash.slice(1))) === H.encode(p), 'preset ' + i + ' hash');
    ok((await ink()) > 500, 'preset ' + i + ' draws');
    if (i === 0) { await pg.waitForTimeout(6000); await pg.screenshot({ path: path.join(out, 'preset-fifth.png') }); }
  }
  // Surprise me changes the hash and draws.
  const h1 = await pg.evaluate(() => location.hash); await pg.waitForTimeout(5); await pg.click('#surprise'); await pg.waitForTimeout(600);
  ok((await pg.evaluate(() => location.hash)) !== h1, 'surprise changes the design'); ok((await ink()) > 500, 'surprise draws');
  // Dragging changes pitch and shows the curve at once.
  await pg.selectOption('#preset', '0'); await pg.waitForTimeout(200);
  const box = await pg.locator('#c').boundingBox(); const before = await pg.evaluate(() => location.hash);
  await pg.mouse.move(box.x + 200, box.y + 200); await pg.mouse.down(); await pg.mouse.move(box.x + 300, box.y + 150, { steps: 5 }); await pg.mouse.up();
  const after = await pg.evaluate(() => location.hash); const dec = H.decode(after.slice(1));
  ok(after !== before && dec && dec[0].f > 3 && dec[2].f > 2.004, 'drag raised both pitches: ' + (dec && [dec[0].f, dec[2].f]));
  ok((await ink()) > 3000, 'drag draws ahead immediately');
  // Slider change updates the share hash.
  await pg.locator('input[aria-label="Horizontal 1 Swing"]').fill('0.5'); const h2 = H.decode((await pg.evaluate(() => location.hash)).slice(1)); ok(h2[0].a === 0.5, 'slider reaches the hash');
  // Loading a shared link reproduces it.
  const pg2 = await b.newPage({ viewport: { width: 375, height: 800 } }); await pg2.goto(url + '#' + H.encode(H.PRESETS[1].pends)); await pg2.waitForTimeout(500);
  ok((await pg2.textContent('#read')).includes(H.describeRatio(2, 2.003).text), 'shared link restores design');
  await pg2.waitForTimeout(5000); await pg2.screenshot({ path: path.join(out, 'phone.png'), fullPage: true });
  ok(await pg2.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow at 375px');
  // Bad hash falls back to a design instead of a blank page.
  const pg3 = await b.newPage(); await pg3.goto(url + '#nonsense'); await pg3.waitForTimeout(500); ok((await pg3.evaluate(() => { const c = document.getElementById('c'); return c.width; })) === 900 && (await pg3.textContent('#read')).length > 5, 'bad hash falls back');
  // SVG download equals the engine's path for the current design.
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#svg')]); const f = path.join(out, 'dl.svg'); await dl.saveAs(f);
  const svg = fs.readFileSync(f, 'utf8'), cur = H.decode((await pg.evaluate(() => location.hash)).slice(1));
  ok(svg === H.svgDocument(H.sample(cur, 60, 0.005), H.extent(cur), 800), 'downloaded SVG equals engine output for the current design');
  ok(errs.length === 0, 'no page errors: ' + errs.join('; '));
  console.log(pass + ' browser checks passed, ' + fail + ' failed'); await b.close(); process.exit(fail ? 1 : 0);
})();
