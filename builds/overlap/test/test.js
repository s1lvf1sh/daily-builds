// Run: node test/test.js   (needs python3 for the oracle sweep)
const O = require('../src/overlap.js'); const { execFileSync } = require('child_process'); const path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };
const U = (y, mo, d, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h, mi);
const WK = [1, 2, 3, 4, 5]; const P = (zone, start = '09:00', end = '17:00', days = WK) => ({ zone, start, end, days });
const iso = (iv) => iv.map(([a, b]) => new Date(a).toISOString().slice(5, 16) + '..' + new Date(b).toISOString().slice(11, 16));

// --- hand-checked facts (from published DST rules, not from the code) ---
ok(O.offsetAt('America/New_York', U(2026, 1, 15)) === -300, 'NY winter -5');
ok(O.offsetAt('America/New_York', U(2026, 7, 15)) === -240, 'NY summer -4');
ok(O.offsetAt('Asia/Kolkata', U(2026, 7, 15)) === 330, 'India +5:30');
ok(O.offsetAt('Asia/Kathmandu', U(2026, 7, 15)) === 345, 'Nepal +5:45');
// US springs forward 2026-03-08 07:00 UTC; EU 2026-03-29 01:00 UTC
let seg = O.segments('America/New_York', U(2026, 3, 1), U(2026, 4, 1));
ok(seg.length === 2 && seg[0].end === U(2026, 3, 8, 7), 'NY transition found to the minute');
seg = O.segments('Europe/London', U(2026, 3, 1), U(2026, 4, 1));
ok(seg.length === 2 && seg[0].end === U(2026, 3, 29, 1), 'London transition found to the minute');
ok(O.segments('Asia/Tokyo', U(2026, 1, 1), U(2027, 1, 1)).length === 1, 'Tokyo never changes');
// NY+London 9-17 weekday overlap: normally 14:00-17:00 London time, 4h in UTC terms 13..17 when both... check the odd weeks
let w = O.commonWindows([P('America/New_York'), P('Europe/London')], U(2026, 3, 23), U(2026, 3, 28));
ok(iso(w).join() === '03-23T13:00..17:00,03-24T13:00..17:00,03-25T13:00..17:00,03-26T13:00..17:00,03-27T13:00..17:00', 'NY/London before the UK change: 4h');
w = O.commonWindows([P('America/New_York'), P('Europe/London')], U(2026, 3, 30), U(2026, 4, 1));
ok(iso(w).join() === '03-30T13:00..16:00,03-31T13:00..16:00', 'NY/London after both changed (EDT 13-21, BST 8-16 UTC): 3h');
w = O.commonWindows([P('America/New_York'), P('Europe/London')], U(2026, 3, 9), U(2026, 3, 14));
ok(iso(w).join() === '03-09T13:00..17:00,03-10T13:00..17:00,03-11T13:00..17:00,03-12T13:00..17:00,03-13T13:00..17:00', 'NY/London in the mismatch week: US on EDT (13-21 UTC), UK on GMT (9-17 UTC) -> 13..17 UTC');
// day boundaries: Auckland weekday window falls on the previous UTC day
w = O.commonWindows([P('Pacific/Auckland')], U(2026, 6, 14), U(2026, 6, 15, 12));
ok(iso(w).join() === '06-14T21:00..05:00', 'Auckland Monday 9-17 NZST (+12) is Sunday 21:00 UTC');
// overnight shift
w = O.workIntervals(P('UTC', '22:00', '06:00', [5]), U(2026, 6, 1), U(2026, 6, 10));
ok(iso(w).join() === '06-05T22:00..06:00', 'overnight shift Friday: one run');
ok(O.workIntervals(P('UTC', '22:00', '06:00', [5]), U(2026, 6, 5), U(2026, 6, 7))[0][1] === U(2026, 6, 6, 6), 'overnight shift ends Saturday 06:00');
// 24h
ok(O.workIntervals(P('UTC', '00:00', '00:00', [2]), U(2026, 6, 1), U(2026, 6, 10))[0].join() === [U(2026, 6, 2), U(2026, 6, 3)].join(), 'start==end is the whole day');
// meeting search
const bs = O.bestSlots([P('America/New_York'), P('Europe/London'), P('Asia/Tokyo')], U(2026, 6, 1), U(2026, 6, 6), 30);
ok(bs.length > 0 && bs[0].count === 2, 'NY+London+Tokyo has no common time, best is two people');
ok(O.bestSlots([P('Europe/Paris'), P('Europe/Berlin')], U(2026, 6, 1), U(2026, 6, 2), 60)[0].count === 2, 'same-offset pair fully overlaps');
ok(O.bestSlots([], U(2026, 6, 1), U(2026, 6, 2), 60)[0].count === 0, 'no people: count 0 slots');
ok(O.localToInstant('America/New_York', U(2026, 3, 8, 2, 30)) === U(2026, 3, 8, 7), 'wall time inside the spring gap maps to the end of the gap');
ok(O.localToInstant('America/New_York', U(2026, 11, 1, 1, 30)) === U(2026, 11, 1, 5, 30), 'ambiguous wall time maps to its first occurrence');

// --- oracle sweep: random people, random spans, compared minute-by-minute with Python zoneinfo ---
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; const pick = (a) => a[Math.floor(rnd() * a.length)];
const zones = ['America/New_York', 'America/Los_Angeles', 'America/Sao_Paulo', 'America/St_Johns', 'America/Havana', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow', 'Africa/Cairo', 'Asia/Kolkata', 'Asia/Kathmandu', 'Asia/Tokyo', 'Asia/Tehran', 'Australia/Sydney', 'Australia/Lord_Howe', 'Pacific/Auckland', 'Pacific/Chatham', 'Pacific/Apia', 'Asia/Beirut', 'UTC'];
const hours = ['00:00', '06:30', '08:00', '09:00', '09:30', '12:00', '17:00', '18:45', '22:00', '23:30', '02:30'];
// spans centred on DST dates of 2026 plus random ones
const anchors = [U(2026, 3, 8), U(2026, 3, 29), U(2026, 4, 5), U(2026, 9, 27), U(2026, 10, 4), U(2026, 10, 25), U(2026, 11, 1), U(2026, 9, 25)];
const cases = [];
for (let i = 0; i < 160; i++) {
  const n = 1 + Math.floor(rnd() * 4);
  const people = Array.from({ length: n }, () => ({ zone: pick(zones), start: pick(hours), end: pick(hours), days: [0, 1, 2, 3, 4, 5, 6].filter(() => rnd() < 0.7) }));
  const from = (i < 80 ? pick(anchors) - Math.floor(rnd() * 4) * O.DAY : U(2026, 1, 1) + Math.floor(rnd() * 330) * O.DAY) + Math.floor(rnd() * 96) * 15 * O.MIN;
  const to = from + (2 + Math.floor(rnd() * 5)) * O.DAY;
  const len = pick([15, 30, 60, 90]);
  const sl = O.slots(people, from, to, len);
  const sample = sl.filter((_, k) => k % 7 === 0).map(({ start, who }) => ({ start, who }));
  cases.push({ people, from, to, len, common: O.commonWindows(people, from, to), slots: sample, best: sl.length ? Math.max(...sl.map((x) => x.count)) : 0 });
}
if (process.env.DUMP) require('fs').writeFileSync(process.env.DUMP, JSON.stringify(cases));
const out = JSON.parse(execFileSync('python3', [path.join(__dirname, 'oracle.py')], { input: JSON.stringify(cases), maxBuffer: 1 << 28, timeout: 300000 }).toString());
ok(out.nbad === 0, 'oracle agrees on all ' + out.cases + ' cases; disagreements: ' + out.nbad + ' ' + JSON.stringify(out.bad.slice(0, 2)));
const nonEmpty = cases.filter((c) => c.common.length).length, empty = cases.length - nonEmpty;
console.log('overlap cases', nonEmpty, 'empty', empty); ok(nonEmpty >= 30 && empty >= 30, 'sweep contains both overlapping (' + nonEmpty + ') and empty (' + empty + ') cases');
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
