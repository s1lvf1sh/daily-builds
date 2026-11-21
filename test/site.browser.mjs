// Drives the real index page in headless Firefox over WebDriver BiDi (Node's own WebSocket).
// Run: node test/site.browser.mjs        Set SHOTS=dir to also save screenshots.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 8217, BIDI = 9347, SHOTS = process.env.SHOTS;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/markdown' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = normalize(join(root, p === '/' ? 'index.html' : p));
  if (!f.startsWith(root)) return res.writeHead(403).end();
  let body;
  try { body = await readFile(f); } catch { return res.writeHead(404).end('not found'); }
  res.writeHead(200, { 'content-type': (types[extname(f)] ?? 'text/plain') + '; charset=utf-8' }).end(body);
}).listen(PORT, '127.0.0.1');
const profile = mkdtempSync(join(tmpdir(), 'db-ff-'));
const firefox = spawn('firefox', ['--headless', '--no-remote', '--profile', profile, `--remote-debugging-port=${BIDI}`], { stdio: 'ignore' });
const cleanup = () => { firefox.kill(); server.close(); try { rmSync(profile, { recursive: true, force: true }); } catch {} };
process.on('exit', cleanup);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 40 && !ws; i++) { await sleep(250); try { const s = new WebSocket(`ws://127.0.0.1:${BIDI}/session`); await new Promise((a, b) => { s.onopen = a; s.onerror = b; }); ws = s; } catch {} }
if (!ws) { console.log('FAIL  could not reach Firefox'); process.exit(1); }
let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else if (msg.method === 'log.entryAdded' && ['error'].includes(msg.params.level)) logs.push(msg.params.text); };
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (m) => (m.type === 'error' ? rej(new Error(`${m.error}: ${m.message}`)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
await send('session.new', { capabilities: {} });
await send('session.subscribe', { events: ['log.entryAdded'] });
const { context } = await send('browsingContext.create', { type: 'tab' });
const js = async (expr) => { const r = await send('script.evaluate', { expression: expr, target: { context }, awaitPromise: true }); if (r.type === 'exception') throw new Error('page script: ' + r.exceptionDetails?.text + ' in ' + expr.slice(0, 90)); return r.result.value; };
const click = (x, y) => send('input.performActions', { context, actions: [{ type: 'pointer', id: 'm', parameters: { pointerType: 'mouse' }, actions: [{ type: 'pointerMove', x: Math.round(x), y: Math.round(y) }, { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 }] }] });
const clickOn = async (sel) => { const [x, y] = JSON.parse(await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = e.getBoundingClientRect(); return JSON.stringify([r.x + Math.min(r.width / 2, 30), r.y + r.height / 2]); })()`)); await click(x, y); await sleep(200); };
const key = (k) => send('input.performActions', { context, actions: [{ type: 'key', id: 'k', actions: [{ type: 'keyDown', value: k }, { type: 'keyUp', value: k }] }] });
const shot = async (name) => { if (!SHOTS) return; const { data } = await send('browsingContext.captureScreenshot', { context }); writeFileSync(join(SHOTS, name), Buffer.from(data, 'base64')); };
const results = [];
const ok = (name, cond, detail = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
const q = (sel, prop = 'textContent') => js(`document.querySelector(${JSON.stringify(sel)})?.${prop}`);
const count = (sel) => js(`document.querySelectorAll(${JSON.stringify(sel)}).length`);

await send('browsingContext.setViewport', { context, viewport: { width: 1280, height: 1000 } });
await send('browsingContext.navigate', { context, url: `http://localhost:${PORT}/`, wait: 'complete' });
await sleep(800);
const total = Number(await js(`fetch('builds.json').then(r=>r.json()).then(d=>d.daily.length+d.earlier.length)`));
ok('the scoreboard lists every project in builds.json', (await count('#table tbody tr.row')) === total, `${await count('#table tbody tr.row')} rows, ${total} projects`);
ok('the stats tiles are computed', (await count('#stats .stat')) === 6 && /\d/.test(await q('#stats .stat b')), await q('#stats .stat:nth-child(4)'));
ok('"Let\'s Play God" has all six axis scores (apostrophe title)', await js(`(() => { const tr = [...document.querySelectorAll('tr.row')].find(r => r.textContent.includes('Play God')); return tr && tr.querySelectorAll('td.cell:not(.overall) .n').length === 6; })()`));
ok('dates are written day-month', /^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(await q('#table tbody tr.row .when')), await q('#table tbody tr.row .when'));
ok('the page does not scroll sideways at desktop width', await js(`document.documentElement.scrollWidth <= window.innerWidth`));
await shot('desktop-top.png');

// sort by Use (descending) then ascending
await clickOn('#table thead th:nth-child(6) button');
const useDesc = JSON.parse(await js(`JSON.stringify([...document.querySelectorAll('tr.row')].map(r => parseFloat(r.querySelectorAll('td.cell .n')[4].textContent)))`));
ok('clicking Use sorts the board from high to low', useDesc.length === total && useDesc[0] > useDesc[useDesc.length - 1] && useDesc.every((v, i) => i === 0 || useDesc[i - 1] >= v), useDesc.slice(0, 5).join(','));
await clickOn('#table thead th:nth-child(6) button');
const useAsc = JSON.parse(await js(`JSON.stringify([...document.querySelectorAll('tr.row')].map(r => parseFloat(r.querySelectorAll('td.cell .n')[4].textContent)))`));
ok('clicking again reverses it', useAsc[0] < useAsc[useAsc.length - 1] && useAsc.every((v, i) => i === 0 || useAsc[i - 1] <= v), useAsc.slice(0, 5).join(','));
await clickOn('.chip[data-group="earlier"]');
ok('the Earlier filter shows only the six earlier projects', (await count('tr.row')) === 6);
await clickOn('.chip[data-group="all"]');

// open a project, set verdicts
await clickOn('tr.row .name');
ok('opening a project shows its verdict, evidence and gap', (await count('tr.detail')) === 1 && /Biggest gap/.test(await q('tr.detail')) && /Verdict/.test(await q('tr.detail')));
const slug = await js(`document.querySelector('tr.detail').id.replace('detail-','')`);
await js(`(() => { const i = document.getElementById(${JSON.stringify(slug + '-use')}); i.value = 4.5; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await js(`(() => { const c = document.querySelector('tr.detail .checks input'); c.click(); })()`);
await sleep(200);
const stored = JSON.parse(await js(`localStorage.getItem('daily-builds.verdicts.v1')`) || '{}');
ok('a verdict is saved in the browser', stored[slug]?.use === 4.5 && stored[slug]?.ran === true, JSON.stringify(stored[slug]));
ok('an untouched axis is not saved', stored[slug] && !('del' in stored[slug]));
const exported = JSON.parse(await q('#vjson', 'value'));
ok('the export is valid JSON in the documented schema', exported.schema === 'daily-builds-verdicts/1' && exported.verdicts[0].build === slug && exported.verdicts[0].use === 4.5 && exported.verdicts[0].ran_it === true && !('delight' in exported.verdicts[0]));
const href = await q('#issue', 'href');
ok('the GitHub issue link is pre-filled and nothing was sent', href.startsWith('https://github.com/s1lvf1sh/daily-builds/issues/new?') && decodeURIComponent(href).includes(slug));
ok('the summary lists the verdict with its difference from mine', /Use 4\.5 \(mine/.test(await q('#vlist')), await q('#vlist'));
await shot('detail-open.png');

// reload: the verdict survives; clear removes it
await send('browsingContext.reload', { context, wait: 'complete' }); await sleep(800);
ok('the verdict is still there after a reload', /Use 4\.5/.test(await q('#vlist')));
await clickOn('#clear');
ok('"Clear mine" empties the list and the export', /No verdicts yet/.test(await q('#vlist')) && (await q('#vjson', 'value')) === '');

// the scale playground
await clickOn('.presets .chip:nth-child(2)');
ok('"Brilliant but unchecked" is capped by Proof at 1.5', /^1\.5/.test(await q('#result .big')) && /Capped/.test(await q('#result .why')), await q('#result .meta'));
await clickOn('.presets .chip:nth-child(3)');
ok('"Best I can score alone" is not capped (4.9 under a 5.0 cap)', /^4\.9/.test(await q('#result .big')) && /Not capped/.test(await q('#result .why')), await q('#result .meta'));
ok('the Proof ladder highlights the level', /4 ·/.test(await q('.ladder li.on')));
await shot('scale.png');
await js(`document.getElementById('patterns').scrollIntoView({ behavior: 'instant' })`);
await shot('patterns.png');

// keyboard: a project can be opened with Enter
await js(`document.querySelector('tr.row .name').focus()`);
await key('');
await sleep(200);
ok('Enter on a project name opens it (keyboard works)', (await count('tr.detail')) === 1);

// phone width
await send('browsingContext.setViewport', { context, viewport: { width: 390, height: 844 } });
await sleep(300);
ok('no page-level sideways scroll at phone width (the table scrolls inside its box)', await js(`document.documentElement.scrollWidth <= window.innerWidth`), await js(`document.documentElement.scrollWidth + ' vs ' + window.innerWidth`));
ok('an opened project panel fits inside the phone screen', await js(`(() => { const r = document.querySelector('.detail-in').getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth + 1; })()`), await js(`JSON.stringify(document.querySelector('.detail-in').getBoundingClientRect().toJSON())`));
await shot('mobile.png');
ok('no console errors', logs.length === 0, logs.join(' | ').slice(0, 200));

console.log(results.join('\n'));
const failed = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
cleanup();
process.exit(failed ? 1 : 0);
