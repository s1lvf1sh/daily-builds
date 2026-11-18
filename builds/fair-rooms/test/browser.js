// NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '../index.html');
let pass = 0, fail = 0; const ok = (c, n, e) => { if (c) pass++; else { fail++; console.log('FAIL', n, e ?? ''); } };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(url);
  const prices = () => pg.$$eval('#assign .price', (e) => e.map((x) => x.textContent));
  const text = (s) => pg.innerText(s);
  ok((await prices()).length === 3, 'three price cards'); ok(/Envy-free/.test(await text('#summary')), 'badge shown');
  const p0 = (await prices()).map(Number); ok(Math.abs(p0.reduce((a, c) => a + c, 0) - 2400) < 1e-9, 'default prices total the rent', p0.join());
  // each row's highlighted cell is its maximum (read from the page, not the engine)
  const rows = await pg.$$eval('#envy tbody tr', (trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => ({ v: Number(td.textContent), best: td.classList.contains('best') }))));
  ok(rows.length === 3 && rows.every((r) => r.filter((c) => c.best).length === 1 && r.find((c) => c.best).v >= Math.max(...r.map((c) => c.v)) - 1e-9), 'highlighted cell is a row maximum');
  // presets make the claims their names make
  await pg.click('#presets button:has-text("Same tastes")'); ok((await prices()).join() === '800.00,600.00,400.00', 'same tastes: price equals the shared value', (await prices()).join());
  await pg.click('#presets button:has-text("A cheapskate")'); const t = await text('#assign'); ok(/Gus gets Master[\s\S]*1450\.00/.test(t) && /Hal gets Box room[\s\S]*550\.00/.test(t), 'cheapskate: 1450 and 550', t);
  // editing a bid changes the answer
  await pg.click('#presets button:has-text("Three friends")'); const before = (await prices()).join(); await pg.fill('[data-bid="2,0"]', '3000'); ok((await prices()).join() !== before, 'editing a bid changes prices');
  // low rent still solves
  await pg.click('#presets button:has-text("Three friends")'); await pg.fill('#rent', '600'); const low = (await prices()); ok(low.length === 3, 'low rent still solves', low.join());
  // add and remove people
  await pg.click('#addp'); ok((await prices()).length === 4 && /4 people/.test(await text('#count')), 'add a person'); ok((await pg.$$('#grid [data-bid]')).length === 16, '4x4 grid');
  for (let i = 0; i < 4; i++) if (await pg.isEnabled('#addp')) await pg.click('#addp'); ok(await pg.isDisabled('#addp'), 'capped at 6 people');
  for (let i = 0; i < 6; i++) if (await pg.isEnabled('#delp')) await pg.click('#delp'); ok(await pg.isDisabled('#delp') && (await prices()).length === 2, 'floor of 2 people');
  // errors
  await pg.fill('#rent', 'abc'); ok(/rent must be a number/.test(await text('#err')), 'bad rent message'); await pg.fill('#rent', '1000');
  await pg.fill('[data-bid="0,0"]', '-5'); ok(/zero or more/.test(await text('#err')), 'negative bid message'); await pg.fill('[data-bid="0,0"]', '0'); await pg.fill('[data-bid="0,1"]', '0'); ok(/bid nothing/.test(await text('#err')), 'all-zero bids message');
  await pg.fill('[data-bid="0,0"]', '500'); ok((await text('#err')) === '', 'error clears');
  // share link round trip
  await pg.click('#presets button:has-text("Three friends")'); await pg.fill('#rent', '2500'); const hash = await pg.evaluate(() => location.hash); const want = (await prices()).join();
  await pg.goto(url + hash); await pg.reload(); ok((await pg.inputValue('#rent')) === '2500' && (await prices()).join() === want, 'hash restores the state', hash.slice(0, 40));
  await pg.goto(url + '#%7Bbroken'); await pg.reload(); ok((await prices()).length === 3, 'a broken link falls back to the default');
  // HTML in names is escaped
  await pg.goto(url + '#'); await pg.reload(); await pg.fill('[data-name="0"]', '<img src=x onerror=alert(1)>'); ok((await pg.$$('#assign img')).length === 0, 'names are escaped');
  // phone width
  await pg.setViewportSize({ width: 375, height: 800 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll at 375px');
  await pg.setViewportSize({ width: 1000, height: 900 }); await pg.goto(url + '#'); await pg.reload(); if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT, fullPage: true });
  ok(errs.length === 0, 'no console errors', errs.join(' | '));
  await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
