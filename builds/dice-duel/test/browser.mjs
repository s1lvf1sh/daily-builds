// Real-browser check. Run: NODE_PATH=$(npm root -g) node test/browser.mjs [outdir]
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { fileURLToPath } from 'node:url'; import { extname, join } from 'node:path'; import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url)); const out = process.argv[2];
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = createServer((q, r) => { const f = join(root, q.url.split('?')[0].replace(/^\/$/, '/index.html')); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(f)] || 'text/plain' }); r.end(readFileSync(f)); }).listen(0);
const base = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch(); const errs = [];
const ctx = await b.newContext({ viewport: { width: 1000, height: 1100 } }); const pg = await ctx.newPage();
pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const st = () => pg.evaluate(() => window.__state); let n = 0; const ok = (m) => console.log('ok', ++n, m);
const shot = async (nm) => out && pg.screenshot({ path: `${out}/${nm}.png`, fullPage: true });
const eng = (await import('node:module')).createRequire(import.meta.url)('../src/dice.js');

await pg.goto(base); let s = await st();
const want = eng.duel(eng.parse('2d20kh1+5'), eng.parse('d20+10'));
assert.equal(s.gt, want.gt.toString()); assert.equal(s.T, '8000'); ok('default duel counts in the page equal the engine (' + s.gt + '/' + s.eq + '/' + s.lt + ' of ' + s.T + ')');
assert.ok((await pg.textContent('#headline')).includes('B wins more often')); ok('headline names B');
assert.ok(await pg.locator('#chart rect').count() > 20); ok('chart draws bars: ' + await pg.locator('#chart rect').count());
await shot('desktop');

// typing a new expression updates the exact result and the URL
await pg.fill('#ea', '4d6dl1'); await pg.fill('#eb', '3d6'); s = await st();
const w2 = eng.duel(eng.parse('4d6dl1'), eng.parse('3d6')); assert.equal(s.gt, w2.gt.toString()); assert.equal(s.T, (6n ** 7n).toString()); ok('typing recomputes (4d6dl1 vs 3d6: ' + s.gt + ' of ' + s.T + ')');
assert.ok(pg.url().includes('a=4d6dl1')); ok('URL hash remembers expressions');

// reload from the shared link restores them
await pg.reload(); s = await st(); assert.equal(s.a, '4d6dl1'); assert.equal(s.b, '3d6'); ok('reload restores from link');

// bad input: error shown, state flagged, no console error
await pg.fill('#ea', '2d'); s = await st(); assert.equal(s.error, true);
assert.ok((await pg.textContent('#erra')).length > 3); assert.ok(await pg.locator('#ea.err').count() === 1); ok('bad input shows message: "' + await pg.textContent('#erra') + '"');
await pg.fill('#ea', '2d6'); s = await st(); assert.equal(s.error, false); ok('recovers after a fix');

// a preset button works
await pg.click('#presets button:nth-child(3)'); s = await st(); assert.equal(s.a, '4d6dl1'); ok('preset button fills both fields');

// 1000 rolls land near the exact answer (binomial 5 sigma)
await pg.fill('#ea', '2d20kh1+5'); await pg.fill('#eb', 'd20+10');
await pg.click('#roll1k'); const tl = await pg.textContent('#tally'); const m = tl.match(/A (\d+) · tie (\d+) · B (\d+)/); const wins = +m[1];
const p = Number(want.gt * 10n ** 9n / want.T) / 1e9, sd = Math.sqrt(1000 * p * (1 - p)); assert.ok(Math.abs(wins - 1000 * p) < 5 * sd, `wins ${wins} vs ${1000 * p} ± ${sd}`); ok(`1000 real rolls: A won ${wins}, exact expectation ${(1000 * p).toFixed(0)} ± ${sd.toFixed(0)}`);
await pg.click('#roll1'); assert.ok((await pg.textContent('#rollout')).includes('against')); ok('single roll prints a result');

// target slider table matches engine
await pg.fill('#ea', '2d20kh1'); await pg.fill('#eb', 'd20'); await pg.evaluate(() => { const t = document.getElementById('target'); t.value = 15; t.dispatchEvent(new Event('input')); });
const cell = await pg.textContent('#tt tr:first-child td:nth-child(2)'); assert.equal(cell, (eng.atLeast(eng.parse('2d20kh1'), 15) * 100).toFixed(2) + '%'); ok('at-least table matches engine: ' + cell);
await shot('desktop-adv');

// phone width: no horizontal overflow
await pg.setViewportSize({ width: 375, height: 800 }); await pg.goto(base); await pg.waitForTimeout(100);
const ov = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth); assert.ok(ov <= 0, 'overflow ' + ov); ok('no horizontal overflow at 375px'); await shot('phone');
assert.deepEqual(errs, []); ok('no console errors');
await b.close(); srv.close();
