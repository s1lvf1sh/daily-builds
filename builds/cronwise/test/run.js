// Run: node test/run.js   (needs python3 for the oracle)
const { execFileSync } = require('child_process');
const path = require('path');
const C = require('../src/cron.js');
let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
};
const throws = (name, expr) => { try { C.parse(expr); fail++; console.log('FAIL should reject', name, expr); } catch (e) { pass++; } };

// 1. Oracle comparison (independent Python implementation)
const cases = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py'), '400'], { maxBuffer: 1 << 28 }).toString());
for (const k of cases) {
  const got = C.nextN(C.parse(k.expr), new Date(k.start), 6).map((d) => d.toISOString());
  eq('oracle ' + k.expr + ' from ' + k.start, got, k.expect);
}
console.log(`oracle: ${cases.length} expressions compared`);

// 2. Brute-force self check: minute-by-minute matches() over 40 days must equal next()'s chain
for (const e of ['*/7 */5 * * *', '0 9 * * 1-5', '30 2 1,15 * *', '0 0 13 * 5', '5 4 * * sun']) {
  const c = C.parse(e); const t0 = Date.UTC(2026, 10, 6, 12, 0), brute = [];
  for (let t = t0 + 60000; t < t0 + 40 * 86400000; t += 60000) if (C.matches(c, new Date(t))) brute.push(new Date(t).toISOString());
  const fast = []; let cur = new Date(t0);
  for (;;) { const x = C.next(c, cur); if (!x || x.getTime() >= t0 + 40 * 86400000) break; fast.push(x.toISOString()); cur = x; }
  eq('brute ' + e, fast, brute);
}

// 3. Semantics
eq('dom|dow OR', C.nextN(C.parse('0 0 13 * 5'), new Date('2026-11-06T12:00:00Z'), 3).map((d) => d.toISOString().slice(0, 10)), ['2026-11-13', '2026-11-20', '2026-11-27']);
eq('feb 30 never', C.next(C.parse('0 0 30 2 *'), new Date('2026-01-01T00:00:00Z')), null);
eq('feb 29 leap', C.next(C.parse('0 0 29 2 *'), new Date('2026-11-06T00:00:00Z')).toISOString(), '2028-02-29T00:00:00.000Z');
eq('strictly after', C.next(C.parse('0 12 * * *'), new Date('2026-11-06T12:00:00Z')).toISOString(), '2026-11-07T12:00:00.000Z');
eq('year rollover', C.next(C.parse('59 23 31 12 *'), new Date('2026-12-31T23:59:00Z')).toISOString(), '2027-12-31T23:59:00.000Z');
eq('macro', C.parse('@hourly').source, '0 * * * *');
eq('7 is sunday', [...C.parse('0 0 * * 7').dow], [0]);

// 4. Rejections
['', '* * * *', '* * * * * *', '60 * * * *', '* 24 * * *', '* * 0 * *', '* * * 13 *', '* * * * 8', '5-1 * * * *', '*/0 * * * *', 'a * * * *', '1,,2 * * * *', '@nope', '1//2 * * * *'].forEach((e) => throws('bad', e));

// 5. English
const d = (e) => C.describe(C.parse(e));
eq('d1', d('0 9 * * 1-5'), 'At 09:00, on Monday through Friday.');
eq('d2', d('*/15 * * * *'), 'Every 15 minutes.');
eq('d3', d('0 0 1 1,4,7,10 *'), 'At 00:00, on the 1st of the month, in January, April, July and October.');
eq('d4', d('* * * * *'), 'Every minute.');
eq('d5', d('0 0 13 * 5'), 'At 00:00, on the 13th of the month, or on Friday (when both day fields are set, either one triggers it).');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
