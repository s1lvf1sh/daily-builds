// node test/test.js            run the checks against the real engine
// node test/test.js --mutants  run them against deliberately broken engines (each must fail)
// python3 test/oracle.py       independent oracle (separate step; takes about 80 s)
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '../src/ring.js'), 'utf8');
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle_cases.json'), 'utf8'));
function load(src) { const m = { exports: {} }; vm.runInNewContext(src, { module: m, console }); return m.exports; }

function suite(R) {
  let pass = 0, fail = 0; const out = [];
  const ok = (c, n, e) => { if (c) pass++; else { fail++; out.push('FAIL ' + n + (e !== undefined ? ' ' + e : '')); } };
  const safe = (f) => { try { return f(); } catch (e) { return { thrown: String(e) }; } };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const PB = (n, nt) => R.makeMethod(n, nt, '14', n === 5 ? '123' : '1234');
  const pb = { 4: PB(4, '&x14x14,12'), 6: PB(6, '&x16x16x16,12'), 8: PB(8, '&x18x18x18x18,12'), 5: R.makeMethod(5, '&5.1.5.1.5,125', '145', '123') };
  // --- place notation by hand (derived from the definition of a change)
  const rd = (n, nt, row) => { const p = R.parseNotation(nt, n); return R.rowStr(R.applyChange(row, p.changes[0])); };
  ok(safe(() => rd(6, 'x', R.rounds(6))) === '214365', 'cross on rounds');
  ok(safe(() => rd(6, '16', R.rounds(6))) === '132546', '16 on rounds');
  ok(safe(() => rd(5, '5', R.rounds(5))) === '21435', '5 on 5 bells');
  ok(safe(() => rd(6, '12', [3, 1, 2, 6, 5, 4])) === '316245', '12 on a scrambled row');
  for (const [n, nt, why] of [[5, 'x', 'cross on odd bells'], [6, '13', 'odd gap'], [6, '7', 'place above n'], [6, '1q', 'junk'], [6, '', 'empty'], [6, 'x,', 'empty block']]) {
    const e = safe(() => R.parseNotation(nt, n).error);
    ok(typeof e === 'string' && e.length > 0, 'rejects ' + why, JSON.stringify(e));
  }
  ok(safe(() => R.parseNotation('&x16x16x16,12', 6).changes.length) === 12, 'Plain Bob Minor lead has 12 changes');
  ok(safe(() => R.parseNotation('x16x16x16,12', 6).changes.length) === 12, 'a comma alone mirrors each block');
  ok(safe(() => R.parseNotation('x14x14x14x14', 4).changes.length) === 8, 'unmirrored sequence kept literal');
  // --- plain hunt: 2n rows then rounds, true, for every stage
  for (let n = 3; n <= 8; n++) {
    const nt = n % 2 ? Array(n).fill(n + '.1').join('.') : Array(n).fill('x1' + n).join('').replace(/^/, '');
    const m = R.makeMethod(n, nt); const calls = ['p'];
    const r = safe(() => R.ring(m, calls)); const a = safe(() => R.analyse(r.rows, n));
    ok(a.length === 2 * n && a.true === true, `plain hunt on ${n} bells: ${2 * n} rows, true`, JSON.stringify(a.length));
  }
  // --- published plain-course lengths
  for (const [n, len] of [[4, 24], [5, 40], [6, 60], [8, 112]]) {
    const pc = safe(() => R.plainCourse(pb[n])); ok(pc.length === len && pc.true === true, `Plain Bob plain course on ${n} bells has ${len} rows`, pc.length);
  }
  ok(safe(() => R.plainCourse(pb[4]).extent) === true, 'Plain Bob Minimus plain course is the extent');
  ok(safe(() => R.plainCourse(pb[6]).extent) === false, 'Plain Bob Minor plain course is not the extent');
  // --- truth detection
  const a1 = safe(() => R.analyse(R.ring(pb[6], 'pppppp'.split('')).rows, 6)); ok(a1.distinct === false && a1.true === false, 'six plain leads of Minor repeat rows');
  const a2 = safe(() => R.analyse(R.ring(pb[6], 'pppp'.split('')).rows, 6)); ok(a2.comesRound === false && a2.true === false, 'four plain leads do not come round');
  const a3 = safe(() => R.analyse(R.ring(pb[6], 'ppppp'.split('')).rows, 6)); ok(a3.true === true && a3.length === 60, 'five plain leads: true and round');
  ok(safe(() => R.analyse([[1, 2], [2, 1], [1, 2], [2, 1], [1, 2]], 2)).falseGroups.length >= 1, 'analyse flags a repeated row');
  ok(safe(() => R.analyse([[1, 2], [2, 1], [1, 2]], 2)).true === true, 'closing rounds is not a repeat');
  // --- Plain Bob Doubles extent exists (12 leads), and its rows are all 120 distinct
  const sr = safe(() => R.search(pb[5], { maxLeads: 12, extentOnly: true, limit: 100 }));
  ok(sr.total === 12 && sr.complete === true, 'search finds 12 Doubles extents', sr.total);
  const ex = safe(() => R.analyse(R.ring(pb[5], sr.touches[0].split('')).rows, 5)); ok(ex.extent === true && ex.length === 120, 'first found extent re-checks as true, 120 rows');
  // --- calls
  ok(safe(() => R.ring(R.makeMethod(6, '&x16x16x16,12'), ['b'])).error !== null, 'a call without a definition is an error');
  ok(safe(() => R.makeMethod(6, '&x16x16x16,12', '15')).error !== null, 'an invalid bob is rejected');
  ok(safe(() => R.parseComposition('p - s b P').calls.join('')) === 'pbsbp', 'composition parser');
  ok(safe(() => R.parseComposition('pxq').error) !== null, 'composition parser rejects junk');
  // --- engine answers against saved oracle-checked cases
  for (const c of cases) {
    if (c.kind === 'notation' && c.valid) {
      const p = safe(() => R.parseNotation(c.s, c.n)); if (!p.changes) { ok(false, 'valid notation parsed ' + c.s); continue; }
      const m = { n: c.n, changes: p.changes, calls: {} }; const r = safe(() => R.ring(m, c.comp.split('')));
      ok(eq(safe(() => r.rows.map(R.rowStr)), c.rows), 'rows ' + c.s);
      const a = safe(() => R.analyse(r.rows, c.n)); ok(a.length === c.analysis.length && a.comesRound === c.analysis.comesRound && a.distinct === c.analysis.distinct, 'analysis ' + c.s);
    } else if (c.kind === 'notation') { ok(safe(() => !!R.parseNotation(c.s, c.n).error), 'invalid stays invalid ' + c.s); }
    else if (c.kind === 'touch') {
      const m = R.makeMethod(c.n, c.pn, c.bob, c.single); const r = safe(() => R.ring(m, c.comp.split(''))); const a = safe(() => R.analyse(r.rows, c.n));
      ok(eq(safe(() => r.rows.map(R.rowStr)), c.rows) && a.length === c.analysis.length && a.comesRound === c.analysis.comesRound && a.distinct === c.analysis.distinct, `touch ${c.name} ${c.comp}`);
    } else if (c.kind === 'search' && (c.K <= 9)) {
      const m = R.makeMethod(c.n, c.pn, c.bob, c.single); const r = safe(() => R.search(m, { maxLeads: c.K, limit: 1e9, nodeBudget: 3e6, extentOnly: c.extentOnly }));
      ok(r.complete === true && r.total === c.total && eq((r.touches || []).slice().sort(), c.touches) && eq(r.countByLeads, c.countByLeads), `search ${c.name} K=${c.K}`);
    }
  }
  // --- budget stops the search honestly
  const b = safe(() => R.search(pb[6], { maxLeads: 20, nodeBudget: 50 })); ok(b.complete === false && b.nodes <= 51, 'node budget stops a search and says so');
  return { pass, fail, out };
}

const mutants = {
  1: ['applyChange swaps overlapping pairs', (s) => s.replace('out[p - 1] = out[p]; out[p] = t; p += 2;', 'out[p - 1] = out[p]; out[p] = t; p += 1;')],
  2: ['closing rounds counted as a repeat', (s) => s.replace('const upto = comesRound ? N : N + 1;', 'const upto = N + 1;')],
  3: ['search never prunes false rows', (s) => s.replace('if (seen.has(k)) { ok = false; break; }', 'if (false) { ok = false; break; }')],
  4: ['mirror repeats the turning change', (s) => s.replace('seq.concat(seq.slice(0, -1).reverse())', 'seq.concat(seq.slice(0).reverse())')],
  5: ['row key collides', (s) => s.replace('k = k * 13 + b', 'k = k + b')],
  6: ['calls ignored in ring', (s) => s.replace("if (j === L - 1 && c !== 'p') {", "if (false) {")],
  7: ['bob and single swapped', (s) => s.replace("[['b', bob], ['s', single]]", "[['b', single], ['s', bob]]")],
  8: ['comes-round test ignores the last row', (s) => s.replace('rowKey(rows[N]) === first', 'true')],
};

if (process.argv.includes('--mutants')) {
  let caught = 0;
  for (const [id, [name, f]] of Object.entries(mutants)) {
    if (process.env.ONLY && process.env.ONLY !== id) continue;
    const src = f(SRC); if (src === SRC) { console.log(`mutant ${id}: patch did not apply (${name})`); process.exitCode = 1; continue; }
    let r; try { r = suite(load(src)); } catch (e) { r = { fail: 1, pass: 0, out: [String(e)] }; }
    console.log(`mutant ${id} (${name}): ${r.fail} failures` + (r.fail ? ' -> caught' : ' -> SURVIVED')); if (r.fail) caught++;
  }
  console.log(`${caught} of ${Object.keys(mutants).length} mutants caught`); process.exitCode = process.exitCode || (caught === Object.keys(mutants).length ? 0 : 1);
} else {
  const r = suite(load(SRC)); r.out.slice(0, 20).forEach((l) => console.log(l)); console.log(`${r.pass} passed, ${r.fail} failed`); process.exitCode = r.fail ? 1 : 0;
}
