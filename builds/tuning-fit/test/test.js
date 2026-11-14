// Run: node test/test.js   (needs python3 for the oracle)
const T = require('../src/edo.js'); const { execFileSync } = require('child_process'); const path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, e) => Math.abs(a - b) <= e;
const R = (s) => T.parseRatio(s), L = (s) => T.parseList(s);

// --- known facts from the tuning literature (independent of this code's logic)
{
  const f12 = T.fit(12, L('3/2'), R('2'));
  ok(near(f12.rows[0].err, -1.955, 0.001) && f12.rows[0].step === 7, '12-EDO fifth is 7 steps, 1.955 cents flat: ' + f12.rows[0].err);
  const f53 = T.fit(53, L('3/2'), R('2')); ok(f53.rows[0].step === 31 && near(f53.rows[0].err, -0.068, 0.001), '53-EDO fifth 31 steps -0.068 (31*1200/53=701.887 vs 701.955)');
  const f31 = T.fit(31, L('5/4'), R('2')); ok(f31.rows[0].step === 10 && near(f31.rows[0].err, 0.783, 0.001), '31-EDO major third 10 steps +0.783 (387.097 vs 386.314): ' + f31.rows[0].err);
  const f19 = T.fit(19, L('6/5'), R('2')); ok(f19.rows[0].step === 5 && near(f19.rows[0].err, 0.148, 0.001), '19-EDO minor third 5 steps +0.148 (315.789 vs 315.641): ' + f19.rows[0].err);
  const f12b = T.fit(12, L('5/4'), R('2')); ok(f12b.rows[0].step === 4 && near(f12b.rows[0].err, 13.686, 0.001), '12-EDO major third +13.686');
  const bp = T.fit(13, L('5/3 7/3'), R('3')); ok(bp.rows[0].step === 6 || bp.rows[0].step === 7, 'Bohlen-Pierce 13 steps of 3/1: 5/3 near step ' + bp.rows[0].step);
  ok(near(bp.stepCents, 146.304, 0.001), 'BP step 146.304 cents');
  const bp7 = T.fit(13, L('7/3'), R('3')); ok(bp7.rows[0].step === 10 && near(bp7.rows[0].err, 0.0 + bp7.rows[0].tempered - bp7.rows[0].just, 1e-9), 'BP 7/3 step 10');
  // classic: records for the 5-limit set 3/2 5/4 6/5 should include 12, 19, 31, 53 (well known good divisions)
  const rec = T.scan(72, L('3/2 5/4 6/5'), R('2'), 'rms').filter((x) => x.record).map((x) => x.n);
  for (const n of [12, 19, 31, 53]) ok(rec.includes(n), n + '-EDO is a record for the 5-limit set: ' + rec);
  const rec3 = T.scan(72, L('3/2'), R('2'), 'rms').filter((x) => x.record).map((x) => x.n);
  ok(JSON.stringify(rec3.slice(0, 5)) === '[1,2,5,7,12]' || rec3.includes(12) && rec3.includes(53), 'fifth-only records contain 12 and 53: ' + rec3);
}
// --- parsing
{
  ok(R('3/2').text === '3/2' && R('6/4').text === '3/2' && R(' 5 ').text === '5/1' && R('1.5').text === '3/2', 'parse/reduce');
  for (const bad of ['', 'a', '3/', '/2', '0/1', '1/0', '-3/2', '3/2/1', '1e3', '2000000/1']) { let t = false; try { R(bad); } catch (e) { t = /ratio|positive|large/.test(e.message); } ok(t, 'rejects ' + JSON.stringify(bad)); }
  for (const bad of ['1/1', '2/3', '']) { let t = false; try { L(bad); } catch (e) { t = true; } ok(t, 'list rejects ' + JSON.stringify(bad)); }
  ok(L('3/2, 5/4 3/2;6/5').length === 3, 'list dedupes and splits');
  let t = false; try { T.scan(0, L('3/2'), R('2')); } catch (e) { t = true; } ok(t, 'scan rejects 0');
  t = false; try { T.scan(401, L('3/2'), R('2')); } catch (e) { t = true; } ok(t, 'scan rejects 401');
}
// --- frequencies
ok(near(T.freq(220, 12, 12, R('2')), 440, 1e-9) && near(T.freq(220, 0, 7, R('2')), 220, 1e-12) && near(T.freq(100, 13, 13, R('3')), 300, 1e-9), 'freq of the equave');
ok(near(T.freq(440, 7, 12, R('2')), 659.255, 0.001), 'freq of the 12-EDO fifth above A440');

// --- records are really records (brute force), and metrics are consistent
for (const set of ['3/2', '3/2 5/4 6/5', '3/2 5/4 6/5 7/4 7/5 7/6', '9/8 11/8 13/8', '5/4 7/4']) for (const metric of ['rms', 'max']) {
  const s = T.scan(120, L(set), R('2'), metric); let best = Infinity, good = true;
  s.forEach((x) => { const rec = x.score < best - 1e-12; if (rec !== x.record) good = false; best = Math.min(best, x.score); });
  ok(good, 'records match brute force ' + set + ' ' + metric);
  ok(s.every((x) => x.rms <= x.max + 1e-12 && x.max <= x.stepCents / 2 + 1e-9), 'rms<=max<=half a step ' + set);
}

// --- sweep against the exact oracle
const ratios = []; for (let a = 2; a <= 16; a++) for (let b = 1; b < a; b++) if (T.parseRatio(a + '/' + b).text === a + '/' + b) ratios.push(a + '/' + b);
const equaves = ['2/1', '3/1', '3/2', '4/1', '5/2'];
const cases = []; for (const E of equaves) for (const r of ratios) for (const n of [1, 2, 3, 5, 7, 12, 13, 17, 19, 22, 31, 41, 53, 72, 99, 171, 400]) cases.push({ n, ratio: r, equave: E });
const out = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py')], { input: JSON.stringify({ cases }), maxBuffer: 1 << 26 }).toString());
let stepBad = 0, errBad = 0, maxd = 0, ties = 0;
cases.forEach((c, i) => {
  const E = R(c.equave), r = R(c.ratio); const k = T.nearestStep(c.n, r, E); const e = T.errorCents(c.n, r, E, k);
  if (k !== out[i].step) { stepBad++; if (stepBad < 6) console.log('step mismatch', c, k, out[i].step); }
  const d = Math.abs(e - out[i].err); maxd = Math.max(maxd, d); if (d > 1e-9) errBad++;
  if (c.equave === '4/1' && c.ratio === '2/1') ties++;
});
ok(stepBad === 0, `nearest step agrees with exact integer oracle on ${cases.length} cases (${stepBad} mismatches)`);
ok(errBad === 0, `error in cents agrees to 1e-9 (max diff ${maxd.toExponential(2)})`);
console.log(`oracle cases: ${cases.length}, max cents diff ${maxd.toExponential(2)}, tie-type cases ${ties}`);
// rms and max recomputed from the oracle's own errors
{ let bad = 0, checked = 0;
  for (const n of [12, 19, 31, 53, 72, 171]) for (const set of ['3/2 5/4 6/5', '3/2 5/4 6/5 7/4 7/5 7/6', '9/8 11/8 13/8 15/8']) {
    const rs = L(set); const oc = rs.map((r) => ({ n, ratio: r.text, equave: '2/1' }));
    const o = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'oracle.py')], { input: JSON.stringify({ cases: oc }) }).toString());
    const rms = Math.sqrt(o.reduce((a, x) => a + x.err * x.err, 0) / o.length), mx = Math.max(...o.map((x) => Math.abs(x.err)));
    const f = T.fit(n, rs, R('2')); checked++; if (!near(f.rms, rms, 1e-9) || !near(f.max, mx, 1e-9)) bad++; }
  ok(bad === 0, `fit rms/max equal values recomputed from oracle errors (${checked} sets, ${bad} bad)`); }
// tie check explicitly: halfway ratio 2/1 in odd divisions of 4/1 goes up
ok(T.nearestStep(3, R('2'), R('4')) === 2 && T.nearestStep(5, R('2'), R('4')) === 3, 'exact half-way ties round up');

console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
