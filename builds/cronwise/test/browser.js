// Drives the real page in headless Chromium. Run: node test/browser.js  (needs playwright)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  let ok = 0, bad = 0; const chk = (n, c) => { c ? ok++ : (bad++, console.log('FAIL', n)); };
  chk('default text', (await p.textContent('#says')) === 'At 09:00, on Monday through Friday.');
  chk('10 rows', (await p.locator('#runs tr').count()) === 10);
  chk('grid 5 weekday rows lit', (await p.locator('.grid i.on').count()) === 5);
  await p.fill('#expr', '*/15 * * * *');
  chk('typing updates', (await p.textContent('#says')) === 'Every 15 minutes.');
  chk('every-hour grid full', (await p.locator('.grid i.on').count()) === 168);
  await p.fill('#expr', '61 * * * *');
  chk('error shown', (await p.textContent('#says')).startsWith('Not valid:') && (await p.getAttribute('#expr', 'aria-invalid')) === 'true');
  chk('output hidden on error', !(await p.isVisible('#out')));
  await p.fill('#expr', '0 0 30 2 *');
  chk('never runs message', (await p.textContent('#runs')).includes('Never runs'));
  await p.click('#chips button:nth-child(4)');
  chk('chip fills input', (await p.inputValue('#expr')) === '0 0 13 * 5');
  chk('chip description', (await p.textContent('#says')).includes('either one triggers'));
  await p.fill('#expr', '0 8,20 * * MON,THU');
  await p.screenshot({ path: process.argv[2] || 'shot.png', fullPage: true });
  chk('no console errors', errs.length === 0); if (errs.length) console.log(errs);
  console.log(`${ok} passed, ${bad} failed`); await b.close(); process.exit(bad ? 1 : 0);
})();
