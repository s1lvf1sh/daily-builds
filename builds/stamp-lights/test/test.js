// Run: node test/test.js   (needs python3 for the oracle)
const L = require('../src/lamp.js');
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL', m)); };

// Unit checks
ok(L.rng(5)() === L.rng(5)(), 'rng deterministic');
ok(L.pressMask(3, 3, [[0, 0], [1, 0]], 2, 0) === 1n << 2n, 'stamp clipped at the edge');
ok(L.pressMask(3, 3, [[0, 0], [1, 0], [0, 1]], 0, 0) === (1n | 2n | 8n), 'stamp mask');
ok(L.solve(3, 3, [[0, 0]], 0n).count === 0, 'solved board needs 0 presses');
ok(L.solve(3, 3, [[0, 0]], 0b101n).count === 2, 'single-cell stamp = count of lit cells');
const plus = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
let uns = 0; for (let v = 0; v < 4096; v++) if (!L.solve(4, 4, plus, BigInt(v)).solvable) uns++;
ok(uns > 0 && L.solve(4, 4, plus, 0n).nullity === 4, 'classic 4x4 plus stamp: unsolvable boards exist, nullity 4 (' + uns + ' of 4096)');

// Puzzle properties over many seeds
for (const lv of ['easy', 'medium', 'hard']) {
  let bad = 0, parSum = 0;
  for (let s = 1; s <= 150; s++) {
    const p = L.makePuzzle(s, lv);
    const r = L.solve(p.w, p.h, p.stamp, p.board);
    if (!r.solvable || L.apply(p.w, p.h, p.stamp, p.board, r.presses) !== 0n || r.count !== p.par) bad++;
    if (p.board === 0n) bad++;
    parSum += p.par;
  }
  ok(bad === 0, lv + ' puzzles solvable, solution clears board, par matches (' + bad + ' bad)');
  console.log(lv + ': mean par ' + (parSum / 150).toFixed(2));
}
ok(JSON.stringify(L.makePuzzle(42, 'medium'), (k, v) => typeof v === 'bigint' ? v.toString() : v) ===
   JSON.stringify(L.makePuzzle(42, 'medium'), (k, v) => typeof v === 'bigint' ? v.toString() : v), 'same seed, same puzzle');

// Minimality without the oracle: no press set found by random search beats par
{
  const rand = L.rng(9); let bad = 0;
  for (let t = 0; t < 60; t++) {
    const p = L.makePuzzle(1000 + t, 'easy'); const n = p.w * p.h;
    for (let i = 0; i < 300; i++) { const x = BigInt(Math.floor(rand() * (1 << n)));
      if (L.apply(p.w, p.h, p.stamp, p.board, x) === 0n && L.popcount(x) < p.par) bad++; }
  }
  ok(bad === 0, 'random press sets never beat par');
}

// Oracle sweep
const rand = L.rng(2026); const cfgs = [];
function config(w, h, nStamps, nBoards) {
  for (let s = 0; s < nStamps; s++) {
    const stamp = L.randomStamp(rand, 2 + Math.floor(rand() * 4));
    const boards = [];
    for (let b = 0; b < nBoards; b++) {
      let v = 0n; for (let i = 0; i < w * h; i++) if (rand() < 0.5) v |= 1n << BigInt(i);
      if (b === 0) v = (1n << BigInt(w * h)) - 1n; // all lit
      const r = L.solve(w, h, stamp, v);
      boards.push({ board: v.toString(), solvable: r.solvable, count: r.count });
    }
    cfgs.push({ w, h, stamp, boards });
  }
}
config(4, 4, 25, 40); config(3, 5, 20, 40); config(5, 3, 10, 40); config(2, 2, 10, 16); config(4, 5, 3, 40);
const f = path.join(os.tmpdir(), 'stamp-lights-cases.json');
fs.writeFileSync(f, JSON.stringify(cfgs));
let solvable = 0, total = 0; for (const c of cfgs) for (const b of c.boards) { total++; if (b.solvable) solvable++; }
console.log('oracle cases: ' + total + ' boards, ' + solvable + ' solvable by JS');
ok(solvable > 0.2 * total && solvable < 0.95 * total, 'sweep contains both solvable and unsolvable boards');
const r = cp.spawnSync('python3', [path.join(__dirname, 'oracle.py'), f], { encoding: 'utf8' });
console.log(r.stdout.trim()); if (r.stderr) console.log(r.stderr);
ok(r.status === 0, 'Python BFS oracle agrees');
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
