// Drives the real page in headless Chromium. Run: NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(url);
  const set = async (a, b) => { await pg.fill('#ra', a); await pg.fill('#rb', b); };
  const verdict = () => pg.$eval('#verdict', (e) => e.innerText);
  ok(/Twins/.test(await verdict()), 'default preset (a|b)* vs (a*b*)* are twins: ' + await verdict());
  await set('a+', 'a*'); let v = await verdict();
  ok(/Not the same/.test(v) && /only B matches/.test(v) && !/only A matches/.test(v) && (await pg.$('#verdict .s.empty')) !== null, 'a+ vs a* names the empty string: ' + v.replace(/\n/g, ' '));
  await set('ab', 'ba'); v = (await verdict()).replace(/\n/g, ' ');
  ok(/only A matches ab/.test(v) && /only B matches ba/.test(v), 'ab vs ba: ' + v);
  await set('(a', 'a'); ok(/Missing \)/.test(await pg.textContent('#ea')) && /Enter two valid/.test(await verdict()), 'error shown for (a');
  await set('(?=a)', 'a'); ok(/not regular/.test(await pg.textContent('#ea')), 'lookahead explained');
  await set('x{2,4}', 'xx|xxx|xxxx'); ok(/Twins/.test(await verdict()), 'x{2,4} twin');
  await pg.fill('#probe', 'xxx'); ok(/A: match.*B: match/.test((await pg.textContent('#probeRes')).replace(/\s+/g, ' ')), 'probe matches both');
  await pg.fill('#probe', 'x'); ok(/A: no match.*B: no match/.test((await pg.textContent('#probeRes')).replace(/\s+/g, ' ')), 'probe rejects both');
  await set('(a|b)*abb', 'a'); ok((await pg.$$('#graphs svg')).length === 2, 'two machine drawings');
  ok((await pg.$$('#graphs svg circle')).length >= 7, 'drawing has circles for states');
  const first = await pg.$eval('#details', (e) => e.innerText); ok(/abb/.test(first) && /aabb/.test(first), 'examples listed');
  // preset buttons
  await pg.click('#presets button:nth-of-type(3)'); ok((await pg.inputValue('#ra')) === 'a+' && (await pg.inputValue('#rb')) === 'a*', 'preset button fills inputs');
  // permalink
  await pg.goto(url + '#' + encodeURIComponent(JSON.stringify(['[0-9]+', '\\d+']))); await pg.reload(); ok(/Twins/.test(await verdict()) && (await pg.inputValue('#ra')) === '[0-9]+', 'hash restores a pair');
  await pg.goto(url + '#garbage%'); await pg.reload(); ok(/Twins/.test(await verdict()), 'bad hash falls back to default');
  await pg.setViewportSize({ width: 1100, height: 900 }); await set('[a-z]+@[a-z]+', '\\w+@\\w+');
  if (process.argv[2]) await pg.screenshot({ path: process.argv[2], fullPage: true });
  await pg.setViewportSize({ width: 390, height: 800 });
  const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); ok(sw[0] <= sw[1] + 1, 'no horizontal scroll on a phone ' + sw);
  if (process.argv[3]) await pg.screenshot({ path: process.argv[3], fullPage: true });
  ok(errs.length === 0, 'no console errors: ' + errs.join(';'));
  await br.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
