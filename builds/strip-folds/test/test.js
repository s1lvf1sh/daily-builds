// node test/test.js  (optional: MUTANT=n to run a deliberately broken engine)
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '../src/fold.js'), 'utf8');
const MUT = {
  1: ["(creases[k] === 'V') === (k % 2 === 0)", "(creases[k] === 'V') === (k % 2 === 1)"],
  2: ["return side > 0 ? lo <= x && x < hi : lo < x && x <= hi;", "return lo < x && x < hi;"],
  3: ["if ((a < lo && lo < b && b < hi) || (lo < a && a < hi && hi < b)) return false;\n      }\n      return true;", "if ((a < lo && lo < b && b < hi)) return false;\n      }\n      return true;"],
  4: ["x.push(x[i] + (i % 2 === 0 ? 1 : -1) * lengths[i])", "x.push(x[i] + lengths[i])"],
  5: ["const to = wantsAbove(creases, s - 1) ? stack.length : at;", "const to = wantsAbove(creases, s - 1) ? stack.length : at - 1;"],
  6: ["s = s + 'V' + rc;", "s = s + 'M' + rc;"],
};
if (process.env.MUTANT) { const [a, b] = MUT[process.env.MUTANT]; if (!src.includes(a)) throw new Error('mutant target not found'); src = src.replace(a, b); }
const m = { exports: {} }; new Function('module', 'self', src)(m, undefined); const F = m.exports;

let pass = 0, fail = 0;
const ok = (c, name, extra) => { if (c) pass++; else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, JSON.stringify(a) + ' vs ' + JSON.stringify(b));

// 1. Published stamp-folding numbers (OEIS A000136): sum over all M/V patterns of unit strips
const A000136 = [1, 2, 6, 16, 50, 144, 462, 1392, 4536, 14060];
for (let n = 1; n <= A000136.length; n++) {
  let tot = 0;
  for (let b = 0; b < (1 << (n - 1)); b++) { let c = ''; for (let i = 0; i < n - 1; i++) c += (b >> i & 1) ? 'V' : 'M'; tot += F.solve(c).count; }
  eq(tot, A000136[n - 1], 'A000136 n=' + n);
}

// 2. Independent oracle (Python brute force over permutations, float geometry)
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'oracle_cases.json'), 'utf8'));
let bad = 0;
for (const c of cases) { const r = F.solve(c.creases, c.lengths, { keep: 0 }); if (r.count !== c.count || !r.complete) { bad++; if (bad < 4) console.log('  mismatch', c, r.count); } }
ok(bad === 0, `oracle: ${cases.length} cases, mismatches=${bad}`);

// 3. Every listed folding passes the full checker; the full checker rejects a bad one
let allVerified = true, listed = 0;
for (const c of cases) for (const pos of F.solve(c.creases, c.lengths, { keep: 20 }).orders) { listed++; if (!F.verify(pos, c.creases, c.lengths)) allVerified = false; }
ok(allVerified && listed > 500, 'verify() accepts every listed folding', listed);
ok(F.verify([0, 1, 2], 'VV', [1, 1, 1]) === false, 'verify rejects wrong mountain/valley');
ok(F.verify([0, 1, 2], 'VM', [1, 1, 1]) === true, 'verify accepts VM zigzag? (see engine)');
// verify() against the oracle's counts by brute force on small cases (a different route from solve())
function perms(n) { const out = []; const rec = (a, rest) => { if (!rest.length) out.push(a); rest.forEach((v, i) => rec(a.concat(v), rest.filter((_, j) => j !== i))); }; rec([], [...Array(n).keys()]); return out; }
let vb = 0, vtot = 0;
for (const c of cases.filter((c) => c.lengths.length <= 6)) { vtot++; const n = perms(c.lengths.length).filter((p) => F.verify(p, c.creases, c.lengths)).length; if (n !== c.count) vb++; }
ok(vb === 0, `verify() brute force over permutations agrees with oracle on ${vtot} cases`, vb);

// 4. Facts
eq(F.solve('VMVM').count > 0, true, 'accordion folds');
eq(F.solve('VMVM').orders[0].length, 5, 'accordion has 5 layers');
ok(F.solve('VMVM', [1, 1, 1, 1, 1]).count > 0, 'accordion unit');
// a 4-segment strip with lengths 1,2,1,2 and creases that cannot fold
const unf = cases.find((c) => c.count === 0);
ok(!!unf && F.solve(unf.creases, unf.lengths).count === 0, 'known unfoldable case stays unfoldable');
// every unit strip folds (up to 12 creases), checked on a sample of patterns
let allFold = true; for (let b = 0; b < 4096; b += 7) { let c = ''; for (let i = 0; i < 12; i++) c += (b >> i & 1) ? 'V' : 'M'; if (F.solve(c, null, { keep: 1, maxNodes: 5e5 }).count < 1) allFold = false; }
ok(allFold, 'every sampled unit strip with 12 creases folds flat');
eq(F.dragon(1), 'V', 'dragon 1'); eq(F.dragon(2), 'VVM', 'dragon 2'); eq(F.dragon(3), 'VVMVVMM', 'dragon 3');
ok(F.solve(F.dragon(4), null, { keep: 1 }).count >= 1, 'dragon(4) folds');
// dragon curve at 90 degrees never crosses itself and has 2^n+... vertices
const pts = F.curve(F.dragon(8), new Array(256).fill(1)); const seen = new Set(pts.map((p) => p.join(',')));
const edges = new Set(); for (let i = 0; i < 256; i++) { const a = pts[i].join(','), b = pts[i + 1].join(','); edges.add(a < b ? a + '|' + b : b + '|' + a); }
ok(pts.length === 257, 'curve vertex count'); ok(edges.size === 256, 'dragon curve never reuses an edge', edges.size);
eq(F.curve('V', [1, 1]), [[0, 0], [1, 0], [1, 1]], 'V turns left'); eq(F.curve('M', [1, 1]), [[0, 0], [1, 0], [1, -1]], 'M turns right');
// parsing
eq(F.parseCreases('v m, v').creases, 'VMV', 'parse creases'); ok(!!F.parseCreases('VXM').error, 'bad crease letter'); ok(!!F.parseCreases('V'.repeat(41)).error, 'too long');
ok(!!F.parseLengths('1 2', 3).error, 'length count'); ok(!!F.parseLengths('1 0 2', 3).error, 'zero length'); ok(!!F.parseLengths('1 1.5 2', 3).error, 'non-integer'); eq(F.parseLengths('', 3).lengths, [1, 1, 1], 'default lengths');
// single segment
eq(F.solve('').count, 1, 'one segment'); eq(F.solve('').orders[0], [0], 'one segment order');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
