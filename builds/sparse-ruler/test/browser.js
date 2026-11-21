// NODE_PATH=$(npm root -g) SHOT=/path/out.png node test/browser.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '../index.html');
const R = require('../src/ruler.js');
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(url);
  const text = (s) => pg.innerText(s); const badges = async () => (await text('#badges')).toLowerCase();
  const marks = async () => (await pg.inputValue('#marksIn')).split(' ').map(Number);
  const cells = () => pg.$$eval('#map .cell', (cs) => cs.map((c) => [+c.dataset.d, c.dataset.state]));
  const T = (n) => Array.from({ length: n }, (_, i) => i + 1);
  // what the page shows must be a ruler that really measures what it says
  const check = async (L, tg, name) => { const m = await marks(); ok(R.missing(m, tg).length === 0, name + ': drawn marks measure every target', m.join()); const cs = await cells(); ok(cs.every(([d, s]) => (s === 'ok') === (R.distances(m).includes(d)) || s === 'unneeded'), name + ': map agrees with marks'); return m; };
  let bd = await badges();
  ok(/6 marks/.test(bd) && /proven fewest/.test(bd), 'default length 13 gives 6 marks, proven', bd);
  await check(13, T(13), 'default');
  const ticks = await pg.$$eval('#stick svg line.tick', (l) => l.length); ok(ticks === 6, 'stick draws one tick per mark', ticks);
  ok((await cells()).length === 13 && (await cells()).every(([, s]) => s === 'ok'), 'default map: 13 cells all measurable');
  // presets make the claims in their names
  await pg.click('#presets button:has-text("30 cm")'); bd = await badges(); ok(/10 marks/.test(bd) && /proven fewest/.test(bd), '30 cm ruler needs 10 marks (proven)', bd); await check(30, T(30), '30');
  await pg.click('#presets button:has-text("40 inch")'); bd = await badges(); ok(/11 marks/.test(bd) && /proven fewest/.test(bd), '40 inch stick needs 11 marks (proven)', bd);
  await pg.click('#presets button:has-text("Only 3, 5")'); bd = await badges(); ok(/5 marks/.test(bd) && /proven fewest/.test(bd), 'targets preset solved with 5 marks (python brute force found no 4)', bd);
  const m3 = await check(24, [3, 5, 12, 19], 'targets'); ok((await cells()).filter(([, s]) => s === 'unneeded').length === 20, 'targets preset greys the 20 unneeded lengths');
  const want = R.solve(24, [3, 5, 12, 19]).count; ok(m3.length === want, 'targets preset count equals the engine', m3.length + ' vs ' + want);
  await pg.click('#presets button:has-text("Shelf gaps")'); await check(90, [15, 25, 40, 55, 70], 'shelf'); ok(/proven fewest/.test(await badges()), 'shelf preset proven');
  await pg.click('#presets button:has-text("Too long")'); bd = await badges();
  ok(/not proven/.test(bd) && !!(await pg.$('#more')), 'length 80 is honestly labelled not proven and offers more time', bd);
  await check(80, T(80), '80'); ok((await marks()).length <= 18, 'length 80 heuristic found at most 18 marks (a Wichmann ruler has 14+)', (await marks()).length);
  // editing: click a position removes a mark and the map shows what is lost
  await pg.fill('#len', '13'); await pg.selectOption('#mode', 'all'); await pg.click('#solve');
  const before = await marks(); const drop = before[2]; await pg.click(`#stick .pos[data-pos="${drop}"]`, { force: true });
  const after = await marks(); ok(after.length === before.length - 1 && !after.includes(drop), 'click removes a mark', after.join());
  bd = await badges(); const mm = R.missing(after, T(13)); ok(mm.length > 0 ? /missing/.test(bd) && (await cells()).filter(([, s]) => s === 'missing').length === mm.length : true, 'removal shows exactly the lengths now missing', bd);
  await pg.click(`#stick .pos[data-pos="${drop}"]`, { force: true }); ok(JSON.stringify(await marks()) === JSON.stringify(before), 'click again restores it');
  await pg.click('#stick .pos[data-pos="0"]', { force: true }); ok(JSON.stringify(await marks()) === JSON.stringify(before), 'the ends cannot be removed');
  await pg.fill('#marksIn', '0 1 4 6 99'); await pg.press('#marksIn', 'Tab'); ok(/not a whole number from 0 to 13/.test(await text('#err')), 'typed mark out of range is reported', await text('#err'));
  await pg.fill('#marksIn', '0 1 2 3 4 5 6 7 8 9 10 11 12 13'); await pg.press('#marksIn', 'Tab'); ok(/14 marks/.test(await badges()) && /more than the search/.test(await badges()), 'a full ruler works but says it uses more marks', await badges());
  // errors
  await pg.selectOption('#mode', 'some'); await pg.fill('#targets', '3 banana'); await pg.click('#solve'); ok(/banana/.test(await text('#err')), 'bad target text reported', await text('#err'));
  await pg.fill('#targets', '3 99'); await pg.click('#solve'); ok(/does not fit/.test(await text('#err')), 'target beyond stick reported', await text('#err'));
  await pg.fill('#targets', '9-3'); await pg.click('#solve'); ok(/backwards/.test(await text('#err')), 'backwards range reported');
  await pg.fill('#targets', '2-4 8'); await pg.fill('#len', '12'); await pg.click('#solve'); ok((await text('#err')) === '' && (await cells()).filter(([, s]) => s !== 'unneeded').length === 4, 'range 2-4 plus 8 is four needed lengths', await text('#err'));
  await pg.fill('#len', '0'); await pg.click('#solve'); ok(/whole number from 1 to 200/.test(await text('#err')), 'length 0 rejected');
  await pg.fill('#len', '201'); await pg.click('#solve'); ok(/1 to 200/.test(await text('#err')), 'length 201 rejected');
  // share link
  await pg.click('#presets button:has-text("The classic")'); const h = await pg.evaluate(() => location.hash); const want2 = await text('#badges');
  await pg.goto(url + h); await pg.reload(); ok((await text('#badges')).includes('6 marks') && (await text('#badges')).includes('every length'), 'hash restores the ruler', await text('#badges'));
  await pg.goto(url + '#%7Bbroken'); await pg.reload(); ok(/6 marks/.test(await badges()), 'a broken link falls back to the default');
  const t = await pg.evaluate(() => window.__rulerText()); ok(/^Marks on a 13 cm stick \(6 marks\)/.test(t), 'text export', t);
  await pg.goto(url + '#'); await pg.reload(); await pg.setViewportSize({ width: 375, height: 800 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll at 375px');
  if (process.env.SHOT) {
    await pg.click('#presets button:has-text("30 cm")'); await pg.screenshot({ path: process.env.SHOT.replace('.png', '-phone.png'), fullPage: true });
    await pg.setViewportSize({ width: 1000, height: 900 }); await pg.screenshot({ path: process.env.SHOT, fullPage: true });
    await pg.emulateMedia({ colorScheme: 'dark' }); await pg.screenshot({ path: process.env.SHOT.replace('.png', '-dark.png'), fullPage: true });
  }
  ok(errs.length === 0, 'no console or page errors', errs.join(' | '));
  console.log(`${pass} passed, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
