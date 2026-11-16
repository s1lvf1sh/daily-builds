// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]
const { chromium } = require('playwright'); const path = require('path'); const V = require('../src/vote.js');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html'); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(url); await pg.reload();
  ok((await pg.$$('.m')).length === 6, 'six method cards');
  ok(/rules disagree/.test(await pg.textContent('#verdict')), 'default lunch example shows disagreement');
  // every preset: page winners per method equal the engine's
  for (const name of ['Lunch split', 'Circular', 'Squeeze', 'Wiki 45']) {
    await pg.click(`button[data-p="${name}"]`); const text = await pg.inputValue('#in'); const R = V.analyze(text);
    const shown = await pg.$$eval('.m', (els) => els.map((e) => [...e.querySelectorAll('.bar.w .n')].map((n) => n.textContent).sort()));
    ok(V.METHODS.every((m, i) => JSON.stringify(shown[i]) === JSON.stringify(R.results[m].winners.slice().sort())), 'page winners match engine for ' + name + ' ' + JSON.stringify(shown));
    const rows = await pg.$$('#pw tr'); ok(rows.length === R.candidates.length + 1, name + ': matrix size');
  }
  await pg.click('button[data-p="Circular"]'); ok(/no Condorcet winner/.test(await pg.textContent('#verdict')), 'circular: no Condorcet winner stated');
  await pg.click('button[data-p="Wiki 45"]'); ok(/All six rules agree|rules disagree/.test(await pg.textContent('#verdict')), 'verdict text present for Wiki 45');
  const hash = await pg.evaluate(() => decodeURIComponent(location.hash.slice(1))); ok(hash === (await pg.inputValue('#in')), 'address bar mirrors the ballots');
  await pg.fill('#in', '2: A > A'); await pg.waitForTimeout(300); ok(/twice/.test(await pg.textContent('#err')) && (await pg.$$('.m')).length === 0, 'bad input shows an error and no results');
  await pg.fill('#in', '<img src=x onerror=alert(1)>: A > B\n3: <b>X</b> > <i>Y</i>'); await pg.waitForTimeout(300); ok((await pg.$$('#methods img, #methods b b, #pw i')).length === 0 && errs.length === 0, 'names are escaped, not injected as HTML');
  await pg.goto(url + '#' + encodeURIComponent('3: Cat > Dog\n2: Dog > Cat')); await pg.reload(); ok((await pg.inputValue('#in')).startsWith('3: Cat'), 'share link restores ballots'); ok(/Cat/.test(await pg.textContent('#verdict')), 'share link computes result');
  await pg.click('#clear'); ok(/Fix the ballots/.test(await pg.textContent('#verdict')), 'cleared input handled');
  await pg.goto(url + '#%E0%A4%A'); await pg.reload(); ok((await pg.inputValue('#in')).length > 10, 'malformed hash falls back to the default');
  ok(errs.length === 0, 'no page errors: ' + errs.join('|'));
  await pg.goto(url); await pg.reload(); await pg.click('button[data-p="Squeeze"]'); if (process.argv[2]) await pg.screenshot({ path: process.argv[2], fullPage: true });
  await pg.setViewportSize({ width: 390, height: 800 }); const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(sw[0] <= sw[1] + 1, 'no horizontal scroll on a phone ' + sw);
  if (process.argv[3]) await pg.screenshot({ path: process.argv[3], fullPage: true });
  await br.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
