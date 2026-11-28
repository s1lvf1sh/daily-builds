// Run: NODE_PATH=$(npm root -g) node test/browser.mjs [screenshotDir]   (Playwright Chromium; serves the folder itself)
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { analyse, judge } from '../src/gerry.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = fileURLToPath(new URL('..', import.meta.url)), shots = process.argv[2];
const srv = createServer((q, s) => { const u = q.url.split(/[?#]/)[0], f = root + (u === '/' ? 'index.html' : u.slice(1)); try { const d = readFileSync(f); s.setHeader('content-type', f.endsWith('.js') ? 'text/javascript' : 'text/html'); s.end(d); } catch { s.statusCode = 404; s.end(); } }).listen(0);
const base = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
let ok = 0; const check = (c, m) => { assert.ok(c, m); ok++; console.log('ok', m); };
const st = () => p.evaluate(() => window.__lab.state());
async function cellXY(i, n) { const r = await p.locator('#grid').boundingBox(); return [r.x + ((i % n) + 0.5) * r.width / n, r.y + (((i / n) | 0) + 0.5) * r.height / n]; }
async function paint(from, to, n) { const [x1, y1] = await cellXY(from, n), [x2, y2] = await cellXY(to, n); await p.mouse.move(x1, y1); await p.mouse.down(); await p.mouse.move(x2, y2, { steps: 12 }); await p.mouse.up(); }

await p.goto(base); await p.waitForTimeout(300);
let s = await st();
check(s.n === 5 && s.info.total === 4006, 'opens on 5x5 with all 4006 cuts counted');
check((await p.locator('#headline').textContent()).includes('wins 0 of 5'), 'starting stripes map: 40% of voters win 0 seats');
check((await p.locator('#goal').textContent()).includes('It can be done'), 'a challenge is shown at once');

// Best-for-Orange button gives a valid map whose seats match the engine's claim
await p.click('#bestA'); s = await st();
let j = judge(5, s.votes, s.assign);
check(j.valid && j.seatsA === s.info.maxA.a && s.info.maxA.a >= 3, `best-for-Orange map is valid and gives ${j.seatsA} seats with 40% of the voters`);
check((await p.locator('#goal').textContent()).includes('Done'), 'goal flips to Done');
check((await p.locator('#headline').textContent()).includes(`wins ${j.seatsA} of 5`), 'headline matches');
if (shots) await p.screenshot({ path: shots + '/best.png' });

// Clear, then paint two districts by dragging; the table must say what is left
await p.click('#clear'); await p.click('button[data-tool=d0]'); await paint(0, 4, 5);
s = await st(); check(s.assign.slice(0, 5).every((d) => d === 0) && s.assign[5] === -1, 'dragging paints a row and nothing else');
check((await p.locator('#msg').textContent()).includes('20 cells still need'), 'unassigned cells are reported (20 left)');
await p.click('button[data-tool=d1]'); await paint(5, 9, 5); await paint(6, 6, 5); // paint another row
await p.click('button[data-tool=erase]'); await paint(0, 0, 5); s = await st(); check(s.assign[0] === -1, 'erase works');

// Flip voters by click and by drag; histogram analysis recomputed from the engine
await p.click('button[data-tool=vote]'); const before = (await st()).votes.slice();
const [cx, cy] = await cellXY(12, 5); await p.mouse.click(cx, cy); s = await st();
check(s.votes[12] !== before[12] && s.votes.filter((v, i) => v !== before[i]).length === 1, 'clicking a voter flips exactly that voter');
const ref = analyse(5, s.votes); check(s.info.total === ref.total && JSON.stringify(s.info.bySeatsA) === JSON.stringify(ref.bySeatsA), 'analysis refreshed after the flip and equals the engine');

// Shuffle: share respected
await p.selectOption('#share', '60'); await p.click('#rnd'); s = await st(); check(s.votes.filter(Boolean).length === 15, 'shuffle gives exactly 15 of 25 orange at 60%');

// Deep link round trip
await p.click('#bestB'); const url = await p.evaluate(() => location.href); check(url.includes('#n=5&v='), 'address bar carries the map');
const p2 = await b.newPage({ viewport: { width: 1000, height: 1000 } }); await p2.goto(url); await p2.waitForTimeout(300);
const s2 = await p2.evaluate(() => window.__lab.state()); s = await st(); check(JSON.stringify(s2.votes) === JSON.stringify(s.votes) && JSON.stringify(s2.assign) === JSON.stringify(s.assign), 'a shared link restores voters and districts');
await p2.goto(base + '#n=9&v=zz&a=1'); await p2.waitForTimeout(200); check((await p2.evaluate(() => window.__lab.state().n)) === 5, 'a corrupt link falls back to the default');
await p2.close();

// Sizes
for (const n of [3, 4]) { await p.selectOption('#size', String(n)); await p.waitForTimeout(100); s = await st(); check(s.n === n && s.info.total === { 3: 10, 4: 117 }[n], `size ${n}: ${s.info.total} cuts`); }
await p.selectOption('#size', '6'); await p.waitForTimeout(100); check(await p.locator('#count').isVisible(), '6x6 offers a count button instead of auto-counting');
await p.click('#count'); await p.waitForFunction(() => window.__lab.state().info, null, { timeout: 15000 }); s = await st(); check(s.info.total === 451206, '6x6 counts 451,206 cuts in the page');
await p.click('#bestA'); s = await st(); j = judge(6, s.votes, s.assign); check(j.valid, '6x6 best-for-Orange map is valid');
if (shots) await p.screenshot({ path: shots + '/six.png', fullPage: true });

// Phone width
const m = await b.newPage({ viewport: { width: 375, height: 800 }, hasTouch: true }); await m.goto(base); await m.waitForTimeout(300);
check(await m.evaluate(() => document.documentElement.scrollWidth <= 375), 'no horizontal overflow at 375 px');
if (shots) await m.screenshot({ path: shots + '/phone.png', fullPage: true });
check(errs.length === 0, 'no console errors: ' + errs.join('|'));
console.log(`${ok} checks passed`); srv.close(); await b.close();
