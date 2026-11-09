const S = require('../src/split.js');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + ' got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b));

// --- unit
eq(S.allocate(100, [100, 100, 100]), [34, 33, 33], 'thirds');
eq(S.allocate(1, [100, 100, 100]), [1, 0, 0], 'one cent');
eq(S.allocate(1000, [200, 100, 100]), [500, 250, 250], 'weights');
eq(S.toCents('12'), 1200, 'cents int'); eq(S.toCents('12.5'), 1250, 'cents .5'); eq(S.toCents('0.07'), 7, 'cents .07'); eq(S.toCents('x'), null, 'cents bad');
eq(S.fmt(-5), '-0.05', 'fmt');
let r = S.run('ana paid 30 dinner\nbo paid 0 x\nfoo');
eq(r.errors.map((e) => e.line), [2, 3], 'error lines');
r = S.run('ana paid 30 lunch for ana, bo\nbo sent ana 15');
eq(r.transfers, [], 'transfer cancels debt');
r = S.run('ana paid 90 trip for all except cy\nbo paid 10 x for cy\ncy paid 5 y for all');
ok(r.people.length === 3 && Object.values(r.bal).reduce((a, b) => a + b, 0) === 0, 'except + sum zero');
r = S.run('a paid 10 x for b\nb paid 10 y for a');
eq(r.transfers, [], 'mutual cancel');
// known partition case: two independent pairs need 2 transfers, not 3
r = S.run('a paid 10 x for b\nc paid 20 y for d');
eq(r.transfers.length, 2, 'two disjoint debts -> 2 transfers');
// cycle collapses
r = S.run('a paid 10 x for b\nb paid 10 y for c\nc paid 10 z for a');
eq(r.transfers, [], 'debt cycle vanishes');
// hidden zero-sum subgroup: balances +5,+7,-5,-7 needs 2, greedy alone gives 3
r = S.run('a paid 5 x for c\nb paid 7 y for d');
eq(r.transfers.length, 2, 'subgroup found');

// --- random sweep
function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const R = rng(20261109);
const names = ['ana', 'bo', 'cy', 'dee', 'eli', 'fay', 'gus'];
const cases = [];
let maxN = 0, savedTotal = 0, naiveTotal = 0;
for (let c = 0; c < 400; c++) {
  const n = 2 + Math.floor(R() * 6);
  const ppl = names.slice(0, n);
  const lines = [];
  const clustered = c % 3 === 0 && n >= 4;
  const ne = 1 + Math.floor(R() * 7);
  for (let e = 0; e < ne; e++) {
    if (!clustered && R() < 0.15) {
      const f = ppl[Math.floor(R() * n)]; let t = ppl[Math.floor(R() * n)];
      if (f === t) t = ppl[(ppl.indexOf(f) + 1) % n];
      lines.push(`${f} sent ${t} ${Math.floor(R() * 40)}.${String(Math.floor(R() * 100)).padStart(2, '0')}`.replace(/ 0\.00$/, ' 1.00'));
      continue;
    }
    const grp = clustered ? ppl.filter((_, i) => i % 2 === (e % 2)) : ppl;
    if (grp.length === 0) continue;
    const payer = grp[Math.floor(R() * grp.length)];
    const amt = `${1 + Math.floor(R() * 200)}.${String(Math.floor(R() * 100)).padStart(2, '0')}`;
    const k = 1 + Math.floor(R() * grp.length);
    const pick = grp.filter(() => true).sort(() => R() - 0.5).slice(0, k);
    const list = pick.map((p) => (R() < 0.3 ? `${p}:${1 + Math.floor(R() * 3)}` : p)).join(', ');
    lines.push(`${payer} paid ${amt} x for ${list}`);
  }
  const text = lines.join('\n');
  const res = S.run(text);
  ok(res.errors.length === 0, 'case ' + c + ' parse errors ' + JSON.stringify(res.errors));
  // invariants
  const sum = Object.values(res.bal).reduce((a, b) => a + b, 0);
  ok(sum === 0, 'case ' + c + ' sum');
  const after = { ...res.bal };
  for (const t of res.transfers) { ok(t.cents > 0 && t.from !== t.to, 'positive transfer'); after[t.from] += t.cents; after[t.to] -= t.cents; }
  ok(Object.values(after).every((v) => v === 0), 'case ' + c + ' settles everyone');
  const nz = Object.values(res.bal).filter((v) => v).length;
  ok(res.transfers.length <= Math.max(0, nz - 1), 'case ' + c + ' not worse than n-1');
  maxN = Math.max(maxN, nz); savedTotal += Math.max(0, nz - 1) - res.transfers.length;
  cases.push({ text, bal: res.bal, count: res.transfers.length });
}
// exact-vs-large: 25 people falls back to greedy and still settles
{
  const L = []; for (let i = 0; i < 25; i++) L.push(`p${i} paid ${10 + i}.00 x for p${(i + 1) % 25}, p${(i + 7) % 25}`);
  const res = S.run(L.join('\n'));
  const after = { ...res.bal }; res.transfers.forEach((t) => { after[t.from] += t.cents; after[t.to] -= t.cents; });
  ok(Object.values(after).every((v) => v === 0) && res.exact === false, 'large group greedy fallback settles');
}
const tmp = path.join(os.tmpdir(), 'es-cases-' + process.pid + '.json');
fs.writeFileSync(tmp, JSON.stringify(cases));
try {
  const out = execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py'), tmp]).toString().trim();
  console.log('oracle:', out); pass++;
} catch (e) { fail++; console.log('FAIL oracle\n' + (e.stdout || '') + (e.stderr || '')); }
fs.unlinkSync(tmp);
console.log(`transfers saved vs plain greedy over sweep: ${savedTotal}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
