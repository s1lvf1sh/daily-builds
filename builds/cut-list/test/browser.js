// NODE_PATH=$(npm root -g) SHOT=/path/out.png node test/browser.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '../index.html');
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(url);
  const text = (s) => pg.innerText(s); const badges = async () => (await text('#badges')).toLowerCase();
  // what the page draws, read back: one array of piece labels per board, plus the board length label
  const drawn = () => pg.$$eval('#boards .board', (bs) => bs.map((b) => ({ head: b.querySelector('h3 span').textContent, segs: [...b.querySelectorAll('.seg')].map((s) => s.textContent), widths: [...b.querySelectorAll('.seg')].map((s) => parseFloat(s.style.width)) })));
  const setAll = async (p, s, k, u) => { await pg.selectOption('#unit', u); await pg.fill('#pieces', p); await pg.fill('#stock', s); await pg.fill('#kerf', k); };
  // default preset: bookcase, priced
  let bd = await badges(); ok(/proven cheapest/.test(bd) && /4 boards for 13 pieces/.test(bd) && /less board than first-fit/.test(bd), 'default (Shelving) is solved, proven, and beats first-fit', bd);
  let bs = await drawn(); const pieceCount = bs.reduce((a, x) => a + x.segs.length, 0); ok(pieceCount === 13, 'default draws all 13 pieces', pieceCount);
  ok(bs.every((x) => x.widths.reduce((a, w) => a + w, 0) <= 100.0001), 'segments never exceed the board width');
  const shop = await text('#shop'); const nBoards = bs.length; ok(new RegExp(`${nBoards}`).test(await text('#badges')), 'badge shows the board count');
  // the plan drawn is the plan promised: sum of lengths per board fits with kerf
  const parseIn = (s) => { const m = /^(?:(\d+) )?(?:(\d+)\/(\d+))?$|^(\d+)$/.exec(s.trim()); return s.includes('/') ? (s.includes(' ') ? +s.split(' ')[0] + eval(s.split(' ')[1]) : eval(s)) : +s; };
  ok(bs.every((x) => { const L = parseIn(x.head.replace(/^Board \d+: /, '').replace(' in', '')); const sum = x.segs.reduce((a, s) => a + parseIn(s), 0) + (x.segs.length - 1) / 8; return sum <= L + 1e-9; }), 'every drawn board fits, kerf included');
  // kerf preset makes its claim: 499 x4 + 333 x3 on 1000 with kerf 2
  await pg.click('#presets button:has-text("Bookcase")'); ok(/total 87\.00/.test(await badges()), 'priced Bookcase preset shows a total', await badges()); await pg.click('#presets button:has-text("Tight")'); bs = await drawn(); bd = await badges();
  ok(bs.length === 4 && bs.reduce((a, x) => a + x.segs.length, 0) === 7, 'tight preset: 7 pieces need 4 boards with a 2 mm kerf', bs.length);
  await pg.fill('#kerf', '0'); ok((await drawn()).length === 3, 'tight preset with no kerf needs only 3 boards (499+499=998, 333x3=999)', (await drawn()).length);
  await setAll('500 x 2\n250 x 4', '1000', '0', 'mm'); ok((await drawn()).length === 2, '2x500 + 4x250 = 2000 mm: exactly two boards with no kerf');
  await pg.fill('#kerf', '2'); ok((await drawn()).length === 3, 'a 2 mm kerf turns the same job into three boards', (await drawn()).length);
  // first-fit comparison appears where exact is better: find via engine is covered in unit tests; here check badge exists when equal
  ok(/first-fit/.test(await badges()), 'comparison badge shown', await badges());
  // priced vs unpriced
  await setAll('60 x 3', '100 @ 4\n200 @ 9', '', 'mm'); ok(/total 9\.00/.test(await badges()) && (await drawn()).length === 1, 'priced: one 200 at 9.00');
  await pg.fill('#stock', '100 @ 4\n200 @ 13'); ok(/total 12\.00/.test(await badges()) && (await drawn()).length === 3, 'priced: three 100s at 12.00');
  // errors
  await pg.fill('#pieces', 'banana'); ok(/line 1/.test(await text('#err')) && (await text('#boards')) === '', 'bad piece line shows an error and no plan', await text('#err'));
  await pg.fill('#pieces', '500'); await pg.fill('#stock', '100'); ok(/longer than every board/.test(await text('#err')), 'piece longer than boards', await text('#err'));
  await pg.fill('#stock', '600'); ok((await text('#err')) === '' && (await drawn()).length === 1, 'errors clear');
  await pg.fill('#kerf', 'x'); ok(/kerf/.test(await text('#err')), 'bad kerf'); await pg.fill('#kerf', '');
  // inches with fractions
  await setAll('3 1/2 x 3\n1/2', '12', '1/8', 'in'); bs = await drawn(); ok(bs.length === 1 && bs[0].segs.includes('3 1/2') && bs[0].segs.includes('1/2'), 'fractions are read and shown', JSON.stringify(bs));
  // honest fallback: a search too big for the time budget
  await setAll(Array.from({ length: 14 }, (_, q) => `${200 + q * 37} x 8`).join('\n'), '2400\n3000\n3600', '3', 'mm');
  bd = await badges(); ok(/not proven cheapest/.test(bd) ? !(await pg.$eval('#longer', (x) => x.hidden)) : /proven cheapest/.test(bd), 'when not proven, the page says so and offers more time', bd);
  // share link
  await pg.click('#presets button:has-text("Fence")'); const h = await pg.evaluate(() => location.hash); const want = await text('#badges');
  await pg.goto(url + h); await pg.reload(); ok((await text('#badges')) === want, 'hash restores the plan');
  await pg.goto(url + '#%7Bbroken'); await pg.reload(); ok(/proven cheapest/.test(await badges()), 'a broken link falls back to the default');
  // copy text
  const t = await pg.evaluate(() => window.__cutText()); ok(/^Cut list, kerf/.test(t) && /Board 1/.test(t), 'text export', t.slice(0, 60));
  // phone width
  await pg.goto(url + '#'); await pg.reload(); await pg.setViewportSize({ width: 375, height: 800 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll at 375px');
  if (process.env.SHOT) { await pg.screenshot({ path: process.env.SHOT.replace('.png', '-phone.png'), fullPage: true }); await pg.setViewportSize({ width: 1000, height: 900 }); await pg.screenshot({ path: process.env.SHOT, fullPage: true }); await pg.emulateMedia({ colorScheme: 'dark' }); await pg.screenshot({ path: process.env.SHOT.replace('.png', '-dark.png'), fullPage: true }); }
  ok(errs.length === 0, 'no console errors', errs.join(' | '));
  await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exitCode = fail ? 1 : 0;
})();
