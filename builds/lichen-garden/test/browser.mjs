// Real-browser check. Run: NODE_PATH=$(npm root -g) node test/browser.mjs [outdir]
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url)); const out = process.argv[2];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.md': 'text/plain' };
const srv = createServer((q, r) => { const f = join(root, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(f)] || 'text/plain' }); r.end(readFileSync(f)); }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch(); const errs = [];
const ctx = await b.newContext({ viewport: { width: 1000, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const pg = await ctx.newPage();
pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const shot = async (n) => out && pg.screenshot({ path: `${out}/${n}.png` });
const st = () => pg.evaluate(() => window.__state);
let n = 0; const ok = (m) => console.log('ok', ++n, m);

// 1. day 120 of the world, still (no autoplay): page digest equals the engine's own, and canvas shows lichen colours
await pg.goto(base + '?today=120&still=1'); await pg.waitForTimeout(300);
let s = await st(); assert.equal(s.view, 120);
const eng = await pg.evaluate(() => window.__L.digest(window.__L.simulate(120, [])));
assert.equal(s.digest, eng); ok('page state equals engine digest on day 120');
const px = await pg.evaluate(() => { const c = document.getElementById('c').getContext('2d').getImageData(0, 0, 48, 48).data; let g = 0, y = 0, bl = 0; for (let i = 0; i < c.length; i += 4) { if (c[i + 1] > c[i] + 20 && c[i + 1] > c[i + 2] + 20) g++; else if (c[i] > 150 && c[i + 2] < 140 && c[i + 1] > 120) y++; else if (c[i + 2] > c[i] + 30) bl++; } return [g, y, bl]; });
assert.ok(px.every((v) => v > 20), 'all three species visible in real pixels: ' + px); ok('canvas pixels show all three species ' + px);
await shot('desktop-day120');

// 2. real click on a day != today jumps to today; click on today plants; 4th is refused
await pg.goto(base + '?today=120&still=1'); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(200);
await pg.evaluate(() => window.__setView(40));
const box = await pg.locator('#c').boundingBox();
await pg.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
s = await st(); assert.equal(s.view, 120); assert.equal(s.spores, 0); ok('click on a past day returns to today without planting');
for (const f of [0.2, 0.4, 0.6, 0.8]) await pg.mouse.click(box.x + box.width * f, box.y + box.height * 0.9);
s = await st(); assert.equal(s.spores, 3); ok('three spores accepted, the fourth refused');
assert.match(await pg.textContent('#msg'), /Three spores a day/);
const withSp = await pg.evaluate(() => { const g = window.__get(); return window.__L.digest(window.__L.simulate(g.view, g.spores)); });
assert.equal(s.digest, withSp); ok('state with spores equals engine with the same spores');

// 3. persistence and share link
await pg.reload(); await pg.waitForTimeout(200); s = await st(); assert.equal(s.spores, 3); ok('spores survive a reload (localStorage)');
await pg.click('#share'); const link = await pg.evaluate(() => navigator.clipboard.readText()); assert.match(link, /#s=/);
const pg2 = await ctx.newPage(); await pg2.goto(link.replace(/^http:\/\/[^/]+\//, base).replace('#', '?today=120&still=1#')); await pg2.waitForTimeout(200);
assert.equal((await pg2.evaluate(() => window.__state)).digest, s.digest); ok('share link opens the same garden');
await pg2.close();

// 4. slider scrub forward and back is exact
await pg.evaluate(() => window.__setView(300)); const f300 = (await st()).digest;
await pg.evaluate(() => window.__setView(150)); await pg.evaluate(() => window.__setView(300));
assert.equal((await st()).digest, f300); ok('scrubbing back and forth gives the same day-300 garden');
await pg.fill('#t', '200'); s = await st(); assert.equal(s.view, 200); ok('range input moves the day');
await shot('desktop-forecast');

// 5. autoplay by default moves time, button pauses
await pg.goto(base + '?today=10'); await pg.waitForTimeout(1200); s = await st(); assert.ok(s.view > 10, 'autoplay advanced: ' + s.view);
await pg.click('#play'); const v1 = (await st()).view; await pg.waitForTimeout(400); assert.equal((await st()).view, v1); ok('autoplay runs and Pause stops it');
await pg.click('#today'); assert.equal((await st()).view, 10); ok('Today button returns');

// 6. phone width, no horizontal overflow; clear
await pg.setViewportSize({ width: 375, height: 800 }); await pg.goto(base + '?today=200&still=1'); await pg.waitForTimeout(300);
const ov = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth); assert.ok(ov <= 0, 'overflow ' + ov); ok('no horizontal overflow at 375 px');
await shot('phone');
assert.deepEqual(errs, []); ok('no console errors');
await b.close(); srv.close();
