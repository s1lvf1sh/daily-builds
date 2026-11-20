// node test/test.js            run all checks on the real engine
// node test/test.js --mutants  run on 9 deliberately broken engines; each must fail
const fs = require('fs'); const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '../src/cut.js'), 'utf8');
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle_cases.json'), 'utf8'));
function load(src) { const m = { exports: {} }; new Function('module', 'self', src)(m, undefined); return m.exports; }

function suite(C) {
  let pass = 0, fail = 0; const first = [];
  const ok = (c, n, e) => { if (c) pass++; else { fail++; if (first.length < 6) first.push(n + (e !== undefined ? ' :: ' + e : '')); } };
  const run = (p, s, k, u) => { const i = C.parseInput(p, s, k, u); const r = i.error ? i : C.solve(i); r.input = i; return r; };
  try {
    // --- parsing and formatting (hand-derived: 1 in = 64 ticks, 1 mm = 10, 1 cm = 100)
    ok(C.parseNum('3 1/2') === 3.5 && C.parseNum('3-1/2') === 3.5 && C.parseNum('1/8') === 0.125 && C.parseNum('.5') === 0.5 && C.parseNum('36') === 36, 'parseNum');
    ok(Number.isNaN(C.parseNum('abc')) && Number.isNaN(C.parseNum('1/0')) && Number.isNaN(C.parseNum('')) && Number.isNaN(C.parseNum('-3')), 'parseNum rejects');
    ok(C.toTicks(3.5, 'in') === 224 && C.toTicks(1.25, 'mm') === 13 && C.toTicks(2, 'cm') === 200, 'toTicks');
    ok(C.fmt(224, 'in') === '3 1/2' && C.fmt(8, 'in') === '1/8' && C.fmt(64, 'in') === '1' && C.fmt(63, 'in') === '63/64' && C.fmt(2400, 'mm') === '240' && C.fmt(125, 'cm') === '1.25', 'fmt');
    let i = C.parseInput('36 x 4\n# comment\n24\n36 x 1', '96 @ 12.5\n144 @ 20', '1/8', 'in');
    ok(!i.error && i.pieces.length === 2 && i.pieces.find((p) => p.len === 36 * 64).qty === 5 && i.costed && i.stocks[0].cost === 1250 && i.kerf === 8, 'parseInput merges duplicates and reads prices', JSON.stringify(i));
    ok(/price for every/.test(C.parseInput('5', '96 @ 3\n120', '', 'in').error || ''), 'mixed priced/unpriced rejected');
    ok(/line 2/.test(C.parseInput('5\nxyz', '10', '', 'in').error || ''), 'bad piece line reported with its number');
    ok(/at least one piece/.test(C.parseInput('', '10', '', 'in').error || '') && /board length/.test(C.parseInput('5', '', '', 'in').error || ''), 'empty inputs rejected');
    ok(/Saw kerf/.test(C.parseInput('5', '10', 'zz', 'in').error || ''), 'bad kerf rejected');
    ok(/quantity/.test(C.parseInput('5 x 0', '10', '', 'in').error || ''), 'quantity 0 rejected');
    // --- hand-derived plans (units: plain numbers in mm, ticks = 10 per mm)
    let r = run('40 x 2\n30 x 2', '100', '', 'mm'); ok(r.nBoards === 2 && r.optimal, '2x40 + 2x30 on 100 needs two boards (40+30+30 =100 fits, 40+40... )', r.nBoards);
    r = run('50 x 2', '100', '0', 'mm'); ok(r.nBoards === 1, 'two 50s exactly fill one 100 with zero kerf', r.nBoards);
    r = run('50 x 2', '100', '1', 'mm'); ok(r.nBoards === 2, 'a 1 mm kerf pushes the second 50 to a new board', r.nBoards);
    r = run('49.5 x 2', '100', '1', 'mm'); ok(r.nBoards === 1, '49.5+1+49.5 = 100 fits exactly', r.nBoards);
    r = run('60 x 3', '100\n200', '', 'mm'); ok(r.cost === 2000 && r.nBoards === 1, 'three 60s -> one 200 board (200 mm = 2000 ticks) beats three 100s (3000)', r.cost + ' ' + r.nBoards);
    r = run('60 x 3', '100 @ 4\n200 @ 9', '', 'mm'); ok(r.cost === 900 && r.nBoards === 1, 'priced: one 200 at 9.00 beats three 100s at 4.00', r.cost);
    r = run('60 x 3', '100 @ 4\n200 @ 13', '', 'mm'); ok(r.cost === 1200 && r.nBoards === 3, 'priced: three 100s at 4.00 beat one 200 at 13.00', r.cost);
    r = run('101', '100', '', 'mm'); ok(/longer than every board/.test(r.error || ''), 'piece longer than every board is reported');
    r = run('36 x 8', '96', '1/8', 'in'); ok(r.nBoards === 4 && r.boards.every((b) => b.pieces.length === 2), 'eight 36" from 96": two per board (72+1/8 <= 96, three do not fit), four boards', r.nBoards);
    r = run('48 x 4', '96', '1/8', 'in'); ok(r.nBoards === 4, 'kerf makes two 48" not fit one 96" board', r.nBoards);
    r = run('3 x 1', '10', '', 'mm'); ok(r.boards[0].waste === 70 && r.boards[0].used === 30, 'waste and used are reported in ticks', JSON.stringify(r.boards));
    // classic: first-fit decreasing is not optimal. Boards 10: pieces 6,6,5,5,4,4 -> optimum 3 boards (6+4 x2, 5+5); FFD packs 6,6,5,5 / 4,4... check FFD <= and exact == 3
    r = run('6 x 2\n5 x 2\n4 x 2', '10', '', 'mm'); ok(r.nBoards === 3, 'optimum is three boards of 10', r.nBoards);
    // a case where first-fit decreasing is wrong: bins of 100; 51,27,26,26,26,26 sorted; optimum 2 (51+26+... ) compute below via oracle instead
    // --- plan validity
    for (const t of [['36 x 8\n24 x 5\n18 x 4', '96\n144', '1/8', 'in'], ['700 x 4\n450 x 6\n300 x 3', '2400 @ 14', '3', 'mm']]) { const x = run(...t); ok(!x.error && C.validatePlan(x, x.input) === null && x.optimal, 'plan validates', x.error); }
    { const x = run('36 x 3', '96', '', 'in'); const bad = JSON.parse(JSON.stringify(x)); bad.boards[0].pieces.pop(); ok(C.validatePlan(bad, x.input) !== null, 'validatePlan catches a missing piece'); const bad2 = JSON.parse(JSON.stringify(x)); bad2.boards[0].pieces.push(5000); ok(C.validatePlan(bad2, x.input) !== null, 'validatePlan catches an overfull board'); }
    // --- every saved case: engine plan is feasible, cost matches the saved (oracle-checked) value, never worse than first-fit
    let nopt = 0, better = 0;
    for (let k = 0; k < cases.length; k++) {
      const c = cases[k]; const x = C.solve(c.input);
      const v = C.validatePlan(x, c.input);
      ok(!x.error && v === null && x.optimal, 'case ' + k + ' feasible', v);
      ok(x.cost === c.cost && x.nBoards === c.nBoards, 'case ' + k + ' value', x.cost + '/' + x.nBoards + ' vs ' + c.cost + '/' + c.nBoards);
      ok(x.cost <= x.baseline.cost, 'case ' + k + ' no worse than first-fit');
      if (x.cost < x.baseline.cost) better++; if (x.optimal) nopt++;
    }
    ok(better >= 50, 'sweep contains cases where exact beats first-fit', better);
    // --- a big realistic case finishes fast and exactly
    const t0 = Date.now(); const big = run('36 x 6\n30 x 5\n24 x 7\n18 x 8\n12 x 10', '96\n120\n144', '1/8', 'in'); const ms = Date.now() - t0;
    ok(!big.error && big.optimal && C.validatePlan(big, big.input) === null && ms < 4000, 'large cut list (36 pieces, 5 lengths, 3 boards) solved exactly in time', ms + ' ms');
    // lower bound: total length / longest board
    const need = big.input.pieces.reduce((a, p) => a + p.len * p.qty, 0); ok(big.boards.reduce((a, b) => a + b.stock, 0) >= need, 'bought length covers the pieces');
    // --- limits are honest: a cut list too large for the budget falls back and says so
    const hard = C.parseInput(Array.from({ length: 14 }, (_, q) => `${10 + q * 3} x 6`).join('\n'), '97\n143', '1', 'mm'); const h = C.solve(hard, { maxStates: 2000 });
    ok(h.optimal === false && /too large|too many/.test(h.reason) && C.validatePlan(h, hard) === null, 'oversized search falls back to first-fit and says so', h.reason);
  } catch (e) { fail++; first.push('threw: ' + e.message); }
  return { pass, fail, first };
}

if (process.argv.includes('--mutants')) {
  const muts = [
    ['kerf counted k times instead of k-1', (s) => s.replace('sum + kerf * (k - 1) <= L', 'sum + kerf * k <= L')],
    ['fit uses < instead of <=', (s) => s.replace('sum + kerf * (k - 1) <= L', 'sum + kerf * (k - 1) < L')],
    ['picks the worst plan instead of the best', (s) => s.replace('if (v < best)', 'if (best === Infinity || v > best)')],
    ['ignores the board-count tie-break', (s) => s.replace('st.cost * 1e6 + 1 + sub', 'st.cost * 1e6 + sub')],
    ['only removes the first piece type from the remainder', (s) => s.replace('for (let j = i; j < T; j++) { nr[j] -= pt.p[j]; nk -= pt.p[j] * mult[j]; }', 'nr[i] -= pt.p[i]; nk -= pt.p[i] * mult[i];')],
    ['plans may skip stocks other than the first', (s) => s.replace('for (const st of stocks) {\n        if (st.len < lens[i]) continue;', 'for (const st of stocks.slice(0, 1)) {\n        if (st.len < lens[i]) continue;')],
    ['unpriced boards cost 1 each', (s) => s.replace('s.cost = s.len;', 's.cost = 1;')],
    ['mixed fraction parsed as whole + numerator', (s) => s.replace('+m[1] + m[2] / m[3]', '+m[1] + +m[2]')],
    ['validatePlan ignores missing pieces', (s) => s.replace('if (got.get(len) !== q) return', 'if (false) return')],
  ];
  let allCaught = true;
  muts.forEach(([name, f], idx) => {
    if (process.env.ONLY && +process.env.ONLY !== idx + 1) return;
    const src = f(SRC); if (src === SRC) { console.log('MUTANT DID NOT APPLY:', name); allCaught = false; return; }
    const r = suite(load(src)); const caught = r.fail > 0; if (!caught) allCaught = false;
    console.log(`${caught ? 'caught' : 'SURVIVED'}  ${idx + 1}. ${name}  (${r.fail} failing checks)`);
  });
  console.log(allCaught ? 'all mutants caught' : 'SOME MUTANTS SURVIVED'); process.exitCode = allCaught ? 0 : 1;
} else {
  const r = suite(load(SRC)); r.first.forEach((m) => console.log('FAIL', m)); console.log(`${r.pass} passed, ${r.fail} failed`); process.exitCode = r.fail ? 1 : 0;
}
