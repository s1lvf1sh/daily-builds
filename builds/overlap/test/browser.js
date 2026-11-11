// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [shot.png]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 900 }, timezoneId: 'Europe/Paris', deviceScaleFactor: 1 }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };
  const url = 'file://' + path.resolve(__dirname, '../index.html');
  const st = (o) => '#' + encodeURIComponent(JSON.stringify(o));
  const ex = [{ name: 'Ana', zone: 'America/New_York', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] }, { name: 'Ben', zone: 'Europe/London', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] }];
  await pg.goto(url + st({ people: ex, from: '2026-03-23', weeks: 1, len: 60, view: 'UTC' }));
  ok((await pg.locator('#people .row').count()) === 2, 'two people rendered');
  let ans = await pg.locator('#answer').innerText();
  ok(/5 windows/.test(ans) && /20 h/.test(ans), 'week of 23 Mar: 5 windows, 20 h in total (got: ' + ans.split('\n')[0] + ')');
  ok(/13:00–17:00/.test(ans), 'window shows 13:00-17:00 UTC');
  ok(/Ana: 09:00–13:00/.test(ans) && /Ben: 13:00–17:00/.test(ans), 'each person sees their own local time');
  await pg.screenshot({ path: process.argv[2] || '/tmp/overlap.png', fullPage: true });
  // the week of the UK change: windows shrink to 3 h
  await pg.goto(url + st({ people: ex, from: '2026-03-30', weeks: 1, len: 60, view: 'UTC' })); await pg.reload();
  ans = await pg.locator('#answer').innerText(); ok(/5 windows/.test(ans) && /15 h/.test(ans), 'week of 30 Mar: 3 h a day = 15 h (got: ' + ans.split('\n')[0] + ')');
  // editing a field updates the answer: move Ben to Tokyo
  await pg.locator('.row[data-i="1"] [data-k="zone"]').fill('Asia/Tokyo');
  ans = await pg.locator('#answer').innerText(); ok(/No time works for everyone/.test(ans), 'NY + Tokyo 9-17 has no common time');
  ok(/Best 60-minute compromise: 1 of 2/.test(ans), 'compromise offered');
  // bad zone reports an error and does not crash
  await pg.locator('.row[data-i="1"] [data-k="zone"]').fill('Mars/Olympus'); ok(/not a known time zone/.test(await pg.locator('#err').innerText()), 'bad zone is reported');
  // removing a person
  await pg.locator('[data-del="1"]').click(); ok((await pg.locator('#people .row').count()) === 1, 'person removed');
  // link round trip
  const hash = await pg.evaluate(() => location.hash); await pg.goto('about:blank'); await pg.goto(url + hash);
  ok((await pg.locator('#people .row').count()) === 1, 'state restored from the address');
  // strips
  ok((await pg.locator('.strip').count()) === 7, 'seven day strips');
  // phone width has no sideways scroll
  await pg.setViewportSize({ width: 390, height: 800 }); await pg.goto(url + st({ people: ex, from: '2026-03-23', weeks: 2, len: 60, view: 'UTC' })); await pg.reload();
  ok((await pg.locator('.strip').count()) === 14, 'two weeks = 14 strips');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no horizontal scroll at 390px');
  await pg.screenshot({ path: (process.argv[3] || '/tmp/overlap-phone.png'), fullPage: false });
  ok(errs.length === 0, 'no console errors: ' + errs.join('|'));
  console.log(`${pass} passed, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
