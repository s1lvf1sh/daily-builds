// Run: node test/test.js   (needs python3 for the oracle)
const K = require('../src/knot.js'); const { execFileSync } = require('child_process'); const path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const sortedLens = (a) => a.strands.map((s) => s.segs.length).sort((x, y) => x - y);

// 1. Closed form: an empty a x b rectangle has exactly gcd(a,b) strands (diagonal billiard).
let bad = 0; for (let a = 1; a <= 24; a++) for (let b = 1; b <= 24; b++) { const A = K.analyze(K.createGrid(a, b)); if (A.count !== gcd(a, b)) bad++; }
ok(bad === 0, 'empty a x b grid has gcd(a,b) strands for all 576 sizes (bad=' + bad + ')');
{ const A = K.analyze(K.createGrid(7, 5)); ok(A.count === 1 && A.strands[0].segs.length === 140, '7x5 is one strand through all 140 segments'); }
{ const A = K.analyze(K.createGrid(6, 4)); ok(A.count === 2 && sortedLens(A).join() === '48,48', '6x4 gives 2 strands of 48 (96 segments split evenly)'); }

// 2. Random walls: engine vs the independent Python oracle (count, strand lengths, alternation).
const cases = [], grids = []; const R = K.rng(12345);
for (let i = 0; i < 1500; i++) {
  const w = 1 + ((R() * 12) | 0), h = 1 + ((R() * 12) | 0), g = K.createGrid(w, h); K.shuffle(g, 'none', 1000 + i, R() * 0.8); grids.push(g);
  cases.push({ W: w, H: h, h: g.h, v: g.v });
}
const res = JSON.parse(execFileSync('python3', [path.join(__dirname, 'oracle.py')], { input: JSON.stringify(cases), maxBuffer: 1 << 28 }));
let cm = 0, lm = 0, am = 0, altEngine = 0, multi = 0, singles = 0;
grids.forEach((g, i) => { const A = K.analyze(g), o = res[i];
  if (A.count !== o.strands) cm++; if (sortedLens(A).join() !== o.lengths.join()) lm++;
  if (!o.alternates) am++; if (!A.strands.every(K.alternates)) altEngine++;
  if (A.count > 1) multi++; else singles++; });
ok(cm === 0, `strand count agrees with oracle on ${grids.length} random grids (mismatches ${cm}; ${singles} single-strand, ${multi} multi-strand)`);
ok(lm === 0, `strand lengths agree with oracle (mismatches ${lm})`);
ok(am === 0 && altEngine === 0, `over/under alternates round every strand, in oracle and engine (${am}, ${altEngine} violations)`);

// 3. Structure: every segment on exactly one strand; every crossing joins two strand passes.
{ let badS = 0, badC = 0; for (const g of grids.slice(0, 300)) { const A = K.analyze(g);
    if (A.strands.reduce((n, s) => n + s.segs.length, 0) !== 4 * g.W * g.H) badS++;
    const passes = A.strands.reduce((n, s) => n + s.over.length, 0); if (passes !== 2 * A.crossings.length) badC++; }
  ok(badS === 0 && badC === 0, 'segments partition and crossing passes = 2 x crossings'); }

// 4. Symmetry: toggling keeps the grid invariant under the chosen symmetry.
{ let badSym = 0; const flipLR = (g) => g.h.map((r) => r.slice().reverse()).join() + '|' + g.v.map((r) => r.slice().reverse()).join();
  for (let i = 0; i < 100; i++) { const g = K.createGrid(5 + (i % 4), 4 + (i % 3)); K.shuffle(g, 'lr', i, 0.4);
    const m = K.createGrid(g.W, g.H); K.interiorEdges(g).forEach((e) => { const X = e.t === 'h' ? 2 * e.x + 1 : 2 * e.x; if (K.getWall(g, e.t, e.x, e.y) !== K.getWall(g, e.t, e.t === 'h' ? g.W - 1 - e.x : g.W - e.x, e.y)) badSym++; }); }
  ok(badSym === 0, 'lr shuffle gives mirror-symmetric walls'); 
  const g = K.createGrid(6, 6); K.toggle(g, { t: 'h', x: 1, y: 2 }, 'rot4'); const n = K.interiorEdges(g).filter((e) => K.getWall(g, e.t, e.x, e.y)).length; ok(n === 4, 'rot4 toggle sets 4 edges: ' + n);
  // independent check: rotate the edge's two grid-point ends by 90 degrees about the centre and compare the edge sets
  { const N6 = 6, key = (a, b) => [a, b].sort((p, q) => p[0] - q[0] || p[1] - q[1]).map((p) => p.join(':')).join('-'), ends = (e) => (e.t === 'h' ? [[e.x, e.y], [e.x + 1, e.y]] : [[e.x, e.y], [e.x, e.y + 1]]);
    const rot = (p) => [N6 - p[1], p[0]]; let a = ends({ t: 'h', x: 1, y: 2 }); const want = new Set();
    for (let i = 0; i < 4; i++) { want.add(key(a[0], a[1])); a = a.map(rot); }
    const got = new Set(K.interiorEdges(g).filter((e) => K.getWall(g, e.t, e.x, e.y)).map((e) => key(...ends(e)))); ok([...want].sort().join() === [...got].sort().join(), 'rot4 orbit is the true 90-degree rotation set'); }
  K.toggle(g, { t: 'h', x: 1, y: 2 }, 'rot4'); ok(K.interiorEdges(g).every((e) => !K.getWall(g, e.t, e.x, e.y)), 'toggling again clears them');
  ok(K.toggle(K.createGrid(4, 4), { t: 'h', x: 0, y: 0 }, 'none') === null, 'border edges cannot be toggled'); }

// 5. Solver: reaches one strand, and the oracle agrees it is one.
{ let found = 0, tot = 0, oracleOne = 0; const cs = [];
  for (const [w, h] of [[4, 4], [6, 6], [8, 6], [8, 8], [10, 10], [12, 9], [6, 4], [9, 6], [12, 12], [5, 5]]) { const g = K.createGrid(w, h); const r = K.solve(g, 'none', w * 31 + h); tot++; if (r.found) found++; cs.push({ W: w, H: h, h: g.h, v: g.v, f: r.found }); }
  const o = JSON.parse(execFileSync('python3', [path.join(__dirname, 'oracle.py')], { input: JSON.stringify(cs) }));
  o.forEach((x, i) => { if (cs[i].f && x.strands === 1) oracleOne++; });
  ok(found === tot && oracleOne === found, `solver reaches one strand on ${found}/${tot} sizes, oracle confirms ${oracleOne}`);
  const g = K.createGrid(8, 8); const r = K.solve(g, 'both', 5); const oo = JSON.parse(execFileSync('python3', [path.join(__dirname, 'oracle.py')], { input: JSON.stringify([{ W: 8, H: 8, h: g.h, v: g.v }]) }))[0];
  ok(r.found === (oo.strands === 1) && r.count === oo.strands, `symmetric solve result matches oracle (found=${r.found}, strands=${oo.strands})`); }

// 6. Share-link round trip and rejection of junk.
{ let badRT = 0; for (let i = 0; i < 200; i++) { const g = K.createGrid(1 + (i % 11), 1 + ((i * 7) % 13)); K.shuffle(g, 'none', i, 0.5); const d = K.decode(K.encode(g, 'none')); if (!d || JSON.stringify(d.g) !== JSON.stringify(g)) badRT++; }
  ok(badRT === 0, 'encode/decode round-trips 200 grids');
  ok(K.decode('junk') === null && K.decode('4x4-none-zz') === null && K.decode('4x4-none-') === null && K.decode('99x4-none-00') === null, 'bad share strings rejected'); }

// 7. SVG output: one outline+colour path per strand, one over-piece per crossing.
{ const g = K.createGrid(5, 3); K.shuffle(g, 'none', 9, 0.3); const A = K.analyze(g), svg = K.renderSVG(g, A, { hit: true });
  ok((svg.match(/class="strand"/g) || []).length === A.count, 'one strand path per strand'); ok((svg.match(/class="hit"/g) || []).length === K.interiorEdges(g).length, 'one hit area per interior edge');
  ok(!/NaN|undefined/.test(svg), 'no NaN or undefined in SVG'); }

console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
