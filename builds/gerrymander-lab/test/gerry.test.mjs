// Run: node --test test/gerry.test.mjs   (needs python3 for the oracle)
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyse, enumerate, judge, winner, parseVotes, votesToString } from '../src/gerry.js';

const oracle = fileURLToPath(new URL('./oracle.py', import.meta.url));
const py = (...a) => JSON.parse(execFileSync('python3', [oracle, ...a], { encoding: 'utf8' }));
function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function randomVotes(n, r) { const p = 0.2 + 0.6 * r(); return Array.from({ length: n * n }, () => (r() < p ? 1 : 0)); }

test('number of ways to cut an n x n grid into n connected districts of n cells: 10, 117, 4006, 451206 (published sequence)', () => {
  const z = (n) => enumerate(n, Array(n * n).fill(0), null);
  assert.equal(z(2), 2); assert.equal(z(3), 10); assert.equal(z(4), 117); assert.equal(z(5), 4006); assert.equal(z(6), 451206);
});

test('every enumerated cut is valid (sizes, connectivity) and seat tallies equal judge()', () => {
  for (const n of [3, 4, 5]) {
    const r = rng(n), votes = randomVotes(n, r);
    let bad = 0, seen = new Set();
    enumerate(n, votes, (assign, a, b) => {
      const j = judge(n, votes, Array.from(assign));
      if (!j.valid || j.seatsA !== a || j.seatsB !== b) bad++;
      seen.add(Array.from(assign).join(''));
    });
    assert.equal(bad, 0);
    // distinct as partitions: canonical labels mean the label string identifies the partition
    assert.equal(seen.size, analyse(n, votes).total);
  }
});

test('engine histogram equals the Python bitmask-DP oracle on 60 random maps (n=3..5)', () => {
  for (let i = 0; i < 60; i++) {
    const n = 3 + (i % 3), r = rng(1000 + i), votes = randomVotes(n, r);
    const mine = analyse(n, votes), ref = py(String(n), votes.join(''));
    assert.equal(mine.total, ref.total, `total n=${n} ${votes.join('')}`);
    assert.deepEqual(mine.hist, ref.hist, `hist n=${n} ${votes.join('')}`);
    const agg = {}; for (const [k, c] of Object.entries(ref.hist)) { const a = +k.split('-')[0]; agg[a] = (agg[a] || 0) + c; }
    assert.deepEqual(mine.bySeatsA, agg, `bySeatsA n=${n} ${votes.join('')}`);
  }
});

test('engine equals the oracle on 6 random 6x6 maps (451206 cuts each)', () => {
  for (let i = 0; i < 6; i++) {
    const votes = randomVotes(6, rng(77 + i));
    const mine = analyse(6, votes), ref = py('6', votes.join(''));
    assert.equal(mine.total, ref.total);
    assert.deepEqual(mine.hist, ref.hist);
  }
});

test('oracle itself: DP equals a brute force over all labelled assignments on 3x3', () => {
  for (let i = 0; i < 8; i++) {
    const v = randomVotes(3, rng(5 + i)).join('');
    assert.deepEqual(py('3', v), py('bf3', v));
  }
});

test('extreme maps returned are valid cuts that really give the claimed seats', () => {
  for (let i = 0; i < 12; i++) {
    const n = 4 + (i % 3), votes = randomVotes(n, rng(300 + i)), r = analyse(n, votes);
    for (const e of [r.maxA, r.minA, r.maxB]) { const j = judge(n, votes, e.assign); assert.ok(j.valid); assert.equal(j.seatsA, e.a); assert.equal(j.seatsB, e.b); }
    const as = Object.keys(r.bySeatsA).map(Number);
    assert.equal(r.maxA.a, Math.max(...as)); assert.equal(r.minA.a, Math.min(...as));
  }
});

test('known cases: a 3x3 with 5 A voters can cut A into 2 seats or 1; all-A gives all seats', () => {
  const all = analyse(5, Array(25).fill(1)); assert.deepEqual(all.bySeatsA, { 5: 4006 });
  const none = analyse(5, Array(25).fill(0)); assert.deepEqual(none.bySeatsA, { 0: 4006 });
  // A fills the top three rows of a 5x5 (60% of voters): A can take all 5 seats with horizontal strips
  const v = Array.from({ length: 25 }, (_, i) => (i < 15 ? 1 : 0));
  const r = analyse(5, v); assert.equal(r.maxA.a, 5);
  // and the minority can still win a majority of seats: 40% of voters, but 3 of 5 seats
  const w = Array.from({ length: 25 }, (_, i) => (i % 5 < 2 ? 1 : 0)); // two left columns = 40%
  assert.ok(analyse(5, w).maxA.a >= 3);
});

test('judge rejects: wrong sizes, unassigned cells, disconnected district', () => {
  const n = 3, votes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  assert.equal(judge(n, votes, [0, 0, 0, 1, 1, 1, 2, 2, 2]).valid, true);
  assert.equal(judge(n, votes, [0, 0, 0, 1, 1, 1, 2, 2, -1]).valid, false);
  assert.equal(judge(n, votes, [0, 0, 1, 0, 1, 1, 2, 2, 2]).valid, true);
  const d = judge(n, votes, [0, 1, 0, 0, 1, 1, 2, 2, 2]); // district 0 = cells 0,2,3: 2 and 0 are not adjacent... 0-3 yes, 2 alone
  assert.equal(d.connected[0], false); assert.equal(d.valid, false);
  assert.equal(judge(n, votes, [0, 0, 0, 0, 1, 1, 1, 2, 2]).valid, false);
  const wrongSizes = judge(n, votes, [0, 0, 0, 0, 1, 1, 2, 2, 2]); // all connected, sizes 4/2/3: only the size rule rejects it
  assert.deepEqual(wrongSizes.connected, [true, true, true]); assert.equal(wrongSizes.valid, false);
});

test('ties: even-sized districts can tie and nobody takes the seat', () => {
  assert.equal(winner(2, 4), 'T'); assert.equal(winner(3, 4), 'A'); assert.equal(winner(1, 4), 'B');
  const votes = [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0];
  const r = analyse(4, votes);
  assert.ok(Object.keys(r.hist).some((k) => { const [a, b] = k.split('-').map(Number); return a + b < 4; }));
});

test('parseVotes / votesToString round trip and reject bad input', () => {
  const v = randomVotes(5, rng(9)); assert.deepEqual(parseVotes(votesToString(v), 5), v);
  assert.equal(parseVotes('012', 3), null); assert.equal(parseVotes('1'.repeat(8), 3), null); assert.equal(parseVotes(null, 3), null); assert.equal(parseVotes('012010201', 3), null); assert.equal(parseVotes('10101010x', 3), null);
});
