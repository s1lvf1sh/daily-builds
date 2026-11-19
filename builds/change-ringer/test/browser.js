// NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '../index.html');
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.addInitScript(() => { window.__osc = []; window.AudioContext = class { constructor() { this.currentTime = 0; this.destination = {}; } createOscillator() { const o = { frequency: { value: 0 }, connect() {}, start() { window.__osc.push(o.frequency.value); }, stop() {} }; return o; } createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; } close() {} }; });
  await pg.goto(url);
  const text = (s) => pg.innerText(s); const badges = async () => (await text('#badges')).toLowerCase();
  // what the page draws, read back from the DOM: one string per drawn row
  const rowsDrawn = () => pg.$$eval('#leads svg', (svgs) => svgs.flatMap((s) => { const byY = {}; s.querySelectorAll('text').forEach((t) => { (byY[t.getAttribute('y')] ||= []).push([Number(t.getAttribute('x')), t.textContent]); }); return Object.keys(byY).map(Number).sort((a, c) => a - c).map((y) => byY[y].sort((a, c) => a[0] - c[0]).map((p) => p[1]).join('')); }));
  const validRows = (rows, n) => { const start = '123456789'.slice(0, n); let prev = start; for (const r of rows) { if ([...r].sort().join('') !== start) return false; for (let i = 0; i < n; i++) if (Math.abs(r.indexOf(prev[i]) - i) > 1) return false; prev = r; } return true; };
  // default: Plain Bob Minor plain course
  let bd = await badges(); ok(/60 changes, 5 leads of 12/.test(bd) && /comes round/.test(bd) && /\btrue\b/.test(bd), 'default is the 60-change Minor course', bd);
  let rows = await rowsDrawn(); ok(rows.length === 60 && rows[59] === '123456', 'drawn rows: 60, last is rounds', rows.length + ' ' + rows[59]);
  ok(validRows(rows, 6), 'every drawn row is a permutation and bells move one place at most');
  ok(new Set(rows).size === 60, 'the 60 drawn rows are all different (rounds is the last)', new Set(rows).size);
  ok((await pg.$$eval('#leads polyline', (p) => p.map((x) => x.getAttribute('points').split(' ').length))).every((c) => c === 12), 'trace has one point per row');
  ok((await pg.$$('#leads text.sel')).length === 60, 'the followed bell is marked in every row');
  await pg.selectOption('#trace', '5'); ok(await pg.$$eval('#leads text.sel', (t) => t.length === 60 && t.every((x) => x.textContent === '5')), 'follow bell 5');
  // presets make the claims their names make
  const preset = (n) => pg.click(`#presets button:has-text("${n}")`);
  await preset('Minimus'); bd = await badges(); ok(/24 changes/.test(bd) && /extent: all 24/.test(bd), 'Minimus plain course is the extent', bd);
  await preset('Doubles'); bd = await badges(); ok(/120 changes/.test(bd) && /extent: all 120/.test(bd), 'Doubles preset is a 120-row extent', bd);
  rows = await rowsDrawn(); ok(rows.length === 120 && new Set(rows).size === 120 && validRows(rows, 5), 'Doubles: 120 distinct valid drawn rows', rows.length + ' ' + new Set(rows).size);
  await preset('Major'); bd = await badges(); ok(/96 changes/.test(bd) && /does not come round/.test(bd), 'Major preset: 6 leads do not come round', bd);
  await preset('Hunt'); bd = await badges(); ok(/12 changes, 1 lead/.test(bd) && !/extent/.test(bd), 'Plain hunt: one lead of 12', bd);
  // a false touch is shown as false, with false rows highlighted
  await preset('Minor'); await pg.fill('#comp', 'pppppp'); bd = await badges(); ok(/\bfalse\b/.test(bd) && /repeat/.test(await text('#verdict')), 'six plain leads are false', bd);
  ok((await pg.$$('#leads rect')).length > 0, 'false rows are highlighted');
  await pg.fill('#comp', 'pppp'); ok(/does not come round/.test(await badges()) && /not rounds/.test(await text('#verdict')), 'four leads: not round');
  // errors
  await pg.fill('#pn', 'x13'); ok(/method/.test(await text('#merr')), 'bad place notation message', await text('#merr')); await pg.fill('#pn', '&x16x16x16,12');
  await pg.fill('#bob', '15'); ok(/bob/.test(await text('#merr')), 'bad bob message', await text('#merr')); await pg.fill('#bob', '14');
  await pg.fill('#comp', 'pqp'); ok(/unexpected/.test(await text('#cerr')), 'bad composition message'); await pg.fill('#comp', ''); ok(/at least one lead/.test(await text('#cerr')), 'empty composition message');
  await pg.fill('#comp', 'ppppp'); ok((await text('#cerr')) === '' && (await text('#merr')) === '', 'errors clear');
  await pg.selectOption('#n', '5'); ok(/method/.test(await text('#merr')), 'changing the bells re-validates the method', await text('#merr'));
  // search
  await preset('Doubles'); await pg.check('#ext'); await pg.fill('#maxl', '12'); await pg.click('#go');
  let ss = await text('#sumsearch'); ok(/^12 true touches found/.test(ss) && /finished/.test(ss), 'Doubles extent search: 12 found, finished', ss);
  ok((await pg.$$('#found li')).length === 12, 'twelve list items');
  await pg.click('#found li:nth-child(3) button'); bd = await badges(); ok(/extent: all 120/.test(bd), 'a found touch loads and is an extent', bd);
  await preset('Minor'); await pg.uncheck('#ext'); await pg.fill('#maxl', '5'); await pg.click('#go'); ss = await text('#sumsearch'); ok(/^5 true touches found \(4 of 3 leads, 1 of 5 leads\)/.test(ss), 'Minor up to 5 leads: 4 three-lead touches and the plain course', ss);
  await pg.fill('#maxl', '12'); await pg.click('#go'); ss = await text('#sumsearch'); ok(/^1591 true touches/.test(ss), 'Minor up to 12 leads: 1591', ss);
  await pg.uncheck('#ab'); await pg.uncheck('#as'); await pg.click('#go'); ss = await text('#sumsearch'); ok(/^1 true touch found \(1 of 5/.test(ss), 'plain leads only: just the plain course', ss);
  await pg.check('#ab'); await pg.check('#as');
  // sound: the right number of strikes and the treble is the highest pitch
  await preset('Minor'); await pg.click('#play'); const osc = await pg.evaluate(() => window.__osc.slice()); ok(osc.length === 61 * 6, 'play schedules 61 rows x 6 bells', osc.length);
  ok(osc.slice(0, 6).every((f, i, a) => i === 0 || f < a[i - 1]), 'rounds descends in pitch (treble highest)', osc.slice(0, 6).map((f) => f.toFixed(0)).join()); await pg.click('#play'); ok((await text('#play')) === 'Play', 'Stop button stops');
  // share link
  await pg.fill('#comp', 'ppppbpppp'); const h = await pg.evaluate(() => location.hash); const want = await badges();
  await pg.goto(url + h); await pg.reload(); ok((await pg.inputValue('#comp')) === 'ppppbpppp' && (await badges()) === want, 'hash restores the state');
  await pg.goto(url + '#%7Bbroken'); await pg.reload(); ok(/60 changes/.test(await badges()), 'a broken link falls back to the default');
  // phone width
  await pg.goto(url + '#'); await pg.reload(); await pg.setViewportSize({ width: 375, height: 800 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll at 375px');
  if (process.env.SHOT) { await pg.screenshot({ path: process.env.SHOT.replace('.png', '-phone.png'), fullPage: true }); await pg.setViewportSize({ width: 1000, height: 900 }); await pg.click('#presets button:has-text("Minor")'); await pg.fill('#comp', 'ppppbppp'); await pg.screenshot({ path: process.env.SHOT, fullPage: true }); }
  ok(errs.length === 0, 'no console errors', errs.join(' | '));
  await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exitCode = fail ? 1 : 0;
})();
