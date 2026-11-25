// Real-browser check. Run: NODE_PATH=$(npm root -g) node test/browser.mjs [outdir]
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url)); const out = process.argv[2];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const srv = createServer((q, r) => { const f = join(root, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(f)] || 'text/plain' }); r.end(readFileSync(f)); }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch(); const errs = [];
const pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await pg.goto(base); await pg.waitForTimeout(500);
const maxU = () => pg.evaluate(() => window.__W.maxAbs(window.__tank));
const stepNo = () => pg.evaluate(() => window.__tank.step);
const shot = async (n) => out && pg.screenshot({ path: `${out}/${n}.png` });
const canvasInk = () => pg.evaluate(() => { const c = document.getElementById('tank'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let bright = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 40) bright++; return bright; });

// 1. rain runs on its own
await pg.waitForTimeout(2500);
assert.ok(await stepNo() > 50, 'simulation advances by itself');
assert.equal(await pg.evaluate(() => window.__app.rain), true);
await shot('1-rain');
// 2. a real click stops rain and drops a stone
const box = await pg.locator('#tank').boundingBox();
await pg.click('#calm'); await pg.waitForTimeout(100);
assert.ok(await maxU() < 1e-6, 'calm clears the water');
await pg.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5); await pg.waitForTimeout(50);
assert.equal(await pg.evaluate(() => window.__app.rain), false, 'touching the water stops the rain');
assert.ok(await maxU() > 0.2, 'the stone made a wave');
await pg.waitForTimeout(500); assert.ok(await canvasInk() > 50, 'canvas shows bright wave crests');
await shot('2-stone');
// 3. draw a wall by dragging; the wall cells become walls and stay at zero
await pg.click('[data-tool=wall]');
await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.2); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.8, { steps: 10 }); await pg.mouse.up();
const walls = await pg.evaluate(() => window.__tank.kind.reduce((a, k) => a + (k === 1), 0)); assert.ok(walls > 150, `wall cells ${walls}`);
// 4. shallow patch, erase
await pg.click('[data-tool=shallow]'); await pg.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
assert.ok(await pg.evaluate(() => window.__tank.kind.some(k => k === 2)), 'shallow cells exist');
await pg.click('[data-tool=erase]'); await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5 + 8, { steps: 3 }); await pg.mouse.up();
const walls2 = await pg.evaluate(() => window.__tank.kind.reduce((a, k) => a + (k === 1), 0)); assert.ok(walls2 < walls, 'erase removes wall');
// 5. wave maker + probe
await pg.click('[data-tool=source]'); await pg.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.6);
assert.equal(await pg.evaluate(() => window.__tank.sources.length), 1);
await pg.click('[data-tool=probe]'); await pg.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.6); await pg.waitForTimeout(1200);
assert.ok(await pg.evaluate(() => window.__app.probe !== null)); await shot('3-tools');
// 6. pause stops time, play resumes
await pg.click('#play'); const s1 = await stepNo(); await pg.waitForTimeout(300); assert.equal(await stepNo(), s1, 'paused'); await pg.click('#play'); await pg.waitForTimeout(300); assert.ok(await stepNo() > s1, 'resumed');
// 7. every preset: loads, runs a second, stays finite, shot
for (const key of ['open', 'double', 'single', 'lens', 'shelf', 'box']) {
  await pg.selectOption('#preset', key); await pg.waitForTimeout(2200);
  const m = await maxU(); assert.ok(Number.isFinite(m) && m < 50, `${key}: max ${m}`);
  assert.equal(await pg.evaluate(() => location.hash), '#' + key);
  await shot('preset-' + key);
}
// the double-slit has a visible interference pattern: take the real canvas, compute column variation behind slits after 8s
await pg.selectOption('#preset', 'double'); await pg.waitForTimeout(9000);
const banding = await pg.evaluate(() => { const c = document.getElementById('tank'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const col = Math.round(c.width * 0.85); let v = []; for (let y = 10; y < c.height - 10; y++) v.push(d[(y * c.width + col) * 4]); const mean = v.reduce((a, q) => a + q) / v.length; return Math.sqrt(v.reduce((a, q) => a + (q - mean) ** 2, 0) / v.length); });
console.log('double-slit column spread (red channel stdev):', banding.toFixed(1)); assert.ok(banding > 8, 'bands visible in the real canvas');
// 8. deep link and save picture
const p2 = await b.newPage(); await p2.goto(base + '#lens'); await p2.waitForTimeout(400);
assert.equal(await p2.evaluate(() => window.__app.preset), 'lens'); assert.equal(await p2.evaluate(() => window.__app.rain), false);
const p3 = await b.newPage(); await p3.goto(base + '#nonsense'); await p3.waitForTimeout(300); assert.equal(await p3.evaluate(() => window.__app.preset), 'open');
const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#snap')]); assert.equal(dl.suggestedFilename(), 'ripple-tank.png');
// 9. keyboard: focus canvas, press Space
await pg.selectOption('#preset', 'open'); await pg.click('#calm'); await pg.focus('#tank'); await pg.keyboard.press('Space'); await pg.waitForTimeout(30); assert.ok(await maxU() > 0.2, 'Space drops a stone');
// 10. phone width
const ph = await b.newPage({ viewport: { width: 375, height: 800 } }); await ph.goto(base); await ph.waitForTimeout(500);
const over = await ph.evaluate(() => document.documentElement.scrollWidth - innerWidth); assert.ok(over <= 0, `horizontal overflow ${over}px`);
if (out) await ph.screenshot({ path: `${out}/phone.png`, fullPage: true });
assert.deepEqual(errs, [], 'no console errors');
console.log('browser checks passed'); await b.close(); srv.close();
