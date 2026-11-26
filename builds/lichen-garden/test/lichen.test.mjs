// Run: node --test test/lichen.test.mjs   (needs python3 for the oracle test)
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as L from '../src/lichen.js';

const oracle = (cases) => JSON.parse(execFileSync('python3', ['-I', fileURLToPath(new URL('./oracle.py', import.meta.url))], { input: JSON.stringify(cases), maxBuffer: 1 << 24 }).toString());
let seed = 12345; const rnd = (n) => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return (seed >>> 8) % n; };
const randSpores = (days, n) => Array.from({ length: n }, () => ({ day: rnd(days), x: rnd(48), y: rnd(48), k: 1 + rnd(3) }));

test('the JS engine and the independent Python oracle agree on 14 random worlds', () => {
  const cases = [{ to: 0, spores: [] }, { to: 365, spores: [] }];
  for (let i = 0; i < 12; i++) cases.push({ to: 20 + rnd(230), spores: randSpores(400, rnd(40)) });
  const want = oracle(cases);
  cases.forEach((c, i) => assert.equal(L.digest(L.simulate(c.to, c.spores)), want[i], `case ${i} (to ${c.to})`));
});

test('fast-forwarding from a saved state equals replaying from day 0', () => {
  for (let t = 0; t < 8; t++) {
    const sp = randSpores(300, 25), mid = 50 + rnd(100), end = mid + 50 + rnd(150);
    const a = L.simulate(end, sp);
    const half = L.simulate(mid, sp), b = L.simulate(end, sp, half);
    assert.equal(L.digest(a), L.digest(b));
  }
});

test('growth only happens next to a parent of that species, and never out of nothing', () => {
  for (let t = 0; t < 6; t++) {
    const w = L.simulate(30 + rnd(250), randSpores(300, 10));
    const d0 = w.day;
    for (let d = d0 + 1; d <= d0 + 40; d++) {
      const before = Uint8Array.from(w.sp); L.step(w, d);
      for (let i = 0; i < L.N; i++) if (before[i] === 0 && w.sp[i]) {
        const x = i % L.W, y = (i / L.W) | 0; let found = false;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if ((dx || dy) && xx >= 0 && yy >= 0 && xx < L.W && yy < L.H && before[yy * L.W + xx] === w.sp[i]) found = true; }
        assert.ok(found, `cell ${i} colonised on day ${d} with no parent`);
      }
    }
  }
});

test('an empty world stays empty (nothing from nothing)', () => {
  const w = L.newWorld(); w.sp.fill(0); w.age.fill(0);
  for (let d = 0; d < 100; d++) L.step(w, d);
  assert.deepEqual(L.counts(w), [L.N, 0, 0, 0]);
});

test('seasons: summer growth beats winter growth, and midwinter is the coldest day', () => {
  const rate = (from, to) => { const w = L.simulate(from - 1, []); const a = L.counts(w).reduce((x, y, i) => i ? x + y : x, 0); L.simulate(to, [], w); return L.counts(w).slice(1).reduce((x, y) => x + y, 0) - a; };
  assert.ok(rate(115, 175) > 5 * Math.max(1, rate(0, 40)) , 'spring growth should dwarf deep-winter growth');
  const days = Array.from({ length: 360 }, (_, i) => i);
  assert.equal(days.reduce((m, d) => (L.warmth(d) < L.warmth(m) ? d : m), 25), 25);
  assert.equal(L.warmth(25 + 180), 180);
  assert.equal(L.seasonName(25), 'winter'); assert.equal(L.seasonName(205), 'summer');
});

test('the daily spore limit is enforced and out-of-range spores are ignored', () => {
  const four = [0, 1, 2, 3].map((i) => ({ day: 5, x: 3 + i, y: 40, k: 1 }));
  const w = L.simulate(5, four);
  const w0 = L.simulate(5, four.slice(0, 3));
  assert.equal(L.digest(w), L.digest(w0));
  const bad = [{ day: 2, x: -1, y: 3, k: 1 }, { day: 2, x: 3, y: 99, k: 1 }, { day: 2, x: 3, y: 3, k: 9 }];
  assert.equal(L.digest(L.simulate(10, bad)), L.digest(L.simulate(10, [])));
});

test('share-link codec round-trips and rejects junk', () => {
  const sp = randSpores(900, 50);
  assert.deepEqual(L.decodeSpores(L.encodeSpores(sp)), sp);
  assert.deepEqual(L.decodeSpores('x.y.z~1.2'), []);
  assert.deepEqual(L.decodeSpores(''), []);
});

test('the default world survives its first two years (it does not die out on its own)', () => {
  const w = L.simulate(730, []); const c = L.counts(w);
  assert.ok(c[1] > 0 && c[2] > 0 && c[3] > 0, 'a species went extinct: ' + c);
});

test('the hash is not trivially biased', () => {
  const b = new Array(256).fill(0); for (let i = 0; i < 25600; i++) b[L.mix(i % 97, i, 1) & 255]++;
  assert.ok(Math.max(...b) < 160 && Math.min(...b) > 45);
});
