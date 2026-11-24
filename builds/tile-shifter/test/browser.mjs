// Real-browser check. Run: NODE_PATH=$(npm root -g) node test/browser.mjs [outdir]
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.argv[2];
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = createServer((q, r) => { const f = join(root, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(f)] || 'text/plain' }); r.end(readFileSync(f)); }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch(); const errs = [];
const pg = await b.newPage({ viewport: { width: 1200, height: 800 } });
pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await pg.goto(base); await pg.waitForTimeout(400);

const gaps = () => pg.evaluate(() => { const c = document.getElementById('view'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let z = 0; for (let i = 3; i < d.length; i += 4) if (d[i] === 0) z++; return z; });
await pg.uncheck('#outline'); await pg.waitForTimeout(100);
let kinds = 0;
for (const kind of ['hex', 'para']) {
  await pg.selectOption('#kind', kind);
  for (let n = 0; n < 6; n++) { await pg.click('#shuffle'); await pg.waitForTimeout(60); const z = await gaps(); assert.equal(z, 0, `${kind} shuffle ${n}: ${z} transparent pixels (gaps) in the tiling`); kinds++; }
}
console.log('no gaps in', kinds, 'shuffled tilings (every pixel of the view canvas painted)');

// drag a dot with the real mouse and re-check
await pg.selectOption('#kind', 'hex'); await pg.click('#shuffle');
const before = await pg.evaluate(() => JSON.stringify(window.__tile.state.edges));
const box = await pg.locator('#edit').boundingBox();
const h = await pg.evaluate(() => { const t = window.__tile.tile; return t.sides[0][2]; });
const scr = await pg.evaluate((p) => { const c = document.getElementById('edit'); /* recompute the same mapping */ const t = window.__tile.tile; const xs = t.outline.map(q=>q[0]), ys=t.outline.map(q=>q[1]); const x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,hh=Math.max(...ys)-y0,pad=70,s=(640-2*pad)/Math.max(w,hh); return [p[0]*s+pad-x0*s+(640-2*pad-w*s)/2, p[1]*s+pad-y0*s+(640-2*pad-hh*s)/2]; }, h);
const sx = box.x + scr[0] / 640 * box.width, sy = box.y + scr[1] / 640 * box.height;
await pg.mouse.move(sx, sy); await pg.mouse.down(); await pg.mouse.move(sx + 12, sy + 15, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(100);
const after = await pg.evaluate(() => JSON.stringify(window.__tile.state.edges));
assert.notEqual(before, after, 'dragging a dot changed the tile');
assert.equal(await gaps(), 0, 'no gaps after a real mouse drag');
// the twin moved with it: the outline is still legal by the page own status
const status = await pg.textContent('#status'); console.log('status after drag:', status);
assert.match(status, /perfect tiling|stays where/);

// a drag far off the tile must not break it
await pg.mouse.move(sx, sy); await pg.mouse.down(); await pg.mouse.move(box.x + 2, box.y + 2, { steps: 8 }); await pg.mouse.up(); await pg.waitForTimeout(100);
assert.equal(await gaps(), 0, 'no gaps after a wild drag');

// share link round trip
const href = await pg.evaluate(() => location.href);
const p2 = await b.newPage(); await p2.goto(href); await p2.waitForTimeout(300);
const same = await p2.evaluate(() => JSON.stringify(window.__tile.state.edges.map(e => e.map(q => q.map(v => Math.round(v * 1000) / 1000)))));
const orig = await pg.evaluate(() => JSON.stringify(window.__tile.state.edges.map(e => e.map(q => q.map(v => Math.round(v * 1000) / 1000)))));
assert.equal(same, orig, 'a shared link reopens the same tile');

// breathe keeps tiling
await pg.check('#breathe'); for (let n = 0; n < 5; n++) { await pg.waitForTimeout(250); assert.equal(await gaps(), 0, 'gap while breathing'); } await pg.uncheck('#breathe');

// bad hash falls back to a shuffle
const p3 = await b.newPage(); await p3.goto(base + '#garbage|1'); await p3.waitForTimeout(300);
assert.ok(await p3.evaluate(() => window.__tile.state.edges.length >= 2));

// phone width: no sideways scroll
const ph = await b.newPage({ viewport: { width: 375, height: 800 } }); await ph.goto(base); await ph.waitForTimeout(300);
const sw = await ph.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); assert.ok(sw[0] <= sw[1], 'horizontal overflow ' + sw);
if (out) { await pg.screenshot({ path: out + '/desktop.png' }); await ph.screenshot({ path: out + '/phone.png', fullPage: true }); await pg.uncheck('#outline'); await pg.selectOption('#kind','para'); await pg.click('#shuffle'); await pg.waitForTimeout(100); await pg.screenshot({ path: out + '/para.png' }); }
assert.deepEqual(errs, [], 'console errors');
console.log('browser checks passed'); await b.close(); srv.close();
