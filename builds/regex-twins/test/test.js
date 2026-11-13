// Regex Twins checks. Run: node test/test.js   (needs python3 for the oracle step)
const R = require('../src/regex.js');
const { execFileSync } = require('child_process');
const path = require('path');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a, (k, v) => typeof v === 'bigint' ? String(v) : v) === JSON.stringify(b, (k, v) => typeof v === 'bigint' ? String(v) : v), m + ' got ' + String(JSON.stringify(a, (k, v) => typeof v === 'bigint' ? String(v) : v)));

// deterministic PRNG
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = (a) => a[Math.floor(rnd() * a.length)];

// ---- hand-derived facts ----
const dfa = (s) => R.compile(s);
eq(dfa('(a|b)*abb').trans.length, 5, 'classic abb DFA has 4 live + 1 dead states');
eq(dfa('a').trans.length, 3, 'single char: start, accept, dead');
eq(dfa('.*').trans.length, 1, '.* is one state');
eq(dfa('[^\\s\\S]').dead[0], true, 'empty language: start is dead');
eq(R.compare(dfa('(a*b*)*'), dfa('(a|b)*')).equal, true, '(a*b*)* == (a|b)*');
eq(R.compare(dfa('a+'), dfa('a*')), { equal: false, onlyA: null, onlyB: '' }, 'a* adds the empty string');
eq(R.compare(dfa('a|b'), dfa('[ab]')).equal, true, 'a|b == [ab]');
eq(R.compare(dfa('\\d{3}'), dfa('\\d\\d\\d')).equal, true, '{3} expands');
eq(R.compare(dfa('x{2,}'), dfa('xx+')).equal, true, '{2,} == xx+');
eq(R.compare(dfa('a?a?a?'), dfa('a{0,3}')).equal, true, 'a?a?a? == a{0,3}');
eq(R.compare(dfa('\\w'), dfa('[A-Za-z0-9_]')).equal, true, '\\w set');
eq(R.compare(dfa('\\D'), dfa('[^0-9]')).equal, true, '\\D set');
eq(R.compare(dfa('a.c'), dfa('a[^]c')).equal, true, '[^] matches anything, as in JS (universe has no newline)');
eq(R.compare(dfa('ab'), dfa('ba')), { equal: false, onlyA: 'ab', onlyB: 'ba' }, 'counterexamples on both sides');
eq(R.examples(dfa('(a|b)*abb'), 3), ['abb', 'aabb', 'babb'], 'shortest examples in order');
eq(R.countByLength(dfa('[01]{3}'), 4), [0n, 0n, 0n, 8n, 0n], 'counts by length');
eq(R.countByLength(dfa('.'), 2), [0n, 95n, 0n], 'dot counts 95');
eq(R.countByLength(dfa('..'), 2), [0n, 0n, 9025n], 'two dots count 95^2');
eq(R.isFinite(dfa('ab|c{1,3}')), true, 'finite');
eq(R.isFinite(dfa('ab*')), false, 'infinite');
eq(R.isFinite(dfa('[^\\s\\S]*x')), true, 'only dead loops: finite (empty)');
for (const bad of ['(a', 'a)', '[a', '*a', '(?=a)', '\\1', '^a', 'a$', '\\b', 'a{3,2}', 'a{99}']) {
  let threw = false; try { R.compile(bad); } catch (e) { threw = e instanceof R.RegexError; } ok(threw, 'rejects ' + bad);
}
// a**: native JS rejects, ours accepts stacked quantifiers? keep behaviour documented: stacked allowed
ok((() => { try { R.compile('a**'); return false; } catch (e) { return e instanceof R.RegexError; } })(), 'a** rejected like JS');
ok(R.compare(dfa('a+?'), dfa('a+')).equal, 'lazy quantifier has the same full-match language');

// ---- random regexes vs native RegExp ----
const ALPHA = ['a', 'b', 'c', '0', '1', ' ', '-'];
function gen(d) {
  const r = rnd();
  if (d <= 0 || r < 0.3) return pick(['a', 'b', 'c', '0', '1', '.', '[ab]', '[^a]', '[a-c1]', '\\d', '\\w', '\\s', '\\D', ' ', '-']);
  if (r < 0.5) return gen(d - 1) + gen(d - 1);
  if (r < 0.68) return '(?:' + gen(d - 1) + '|' + gen(d - 1) + ')';
  if (r < 0.9) return '(?:' + gen(d - 1) + ')' + pick(['*', '+', '?', '{2}', '{1,3}', '{0,2}', '{2,}']);
  return '(' + gen(d - 1) + ')';
}
const strings = [''];
(function () { let layer = ['']; for (let L = 1; L <= 6; L++) { const nx = []; for (const s of layer) for (const c of ALPHA) nx.push(s + c); strings.push(...nx); layer = nx; } })();
const cases = []; let bad = 0, total = 0, accN = 0;
for (let k = 0; k < 150; k++) {
  const src = gen(3), d = dfa(src), re = new RegExp('^(?:' + src + ')$');
  const cmp = [];
  for (const s of strings) { total++; const mine = R.accepts(d, s), nat = re.test(s); if (mine !== nat) { bad++; if (bad < 5) console.log('MISMATCH', src, JSON.stringify(s), mine, nat); } if (mine) accN++; if (k < 100 && cmp.length < 40 && (rnd() < 0.002 || (mine && rnd() < 0.01))) cmp.push([s, mine]); }
  // examples must actually match natively; counts of length<=2 over the whole universe must equal brute force
  for (const e of R.examples(d, 5, 6)) ok(re.test(e), 'example matches natively: ' + src + ' ' + JSON.stringify(e));
  const cnt = R.countByLength(d, 2); let b1 = 0, b2 = 0;
  for (let i = 0; i < R.N; i++) { if (re.test(String.fromCharCode(R.LO + i))) b1++; }
  for (let i = 0; i < R.N; i++) for (let j = 0; j < R.N; j++) if (re.test(String.fromCharCode(R.LO + i) + String.fromCharCode(R.LO + j))) b2++;
  ok(cnt[1] === BigInt(b1) && cnt[2] === BigInt(b2), 'counts ' + src + ' ' + cnt + ' vs ' + [b1, b2]);
  cases.push({ src, strings: cmp });
}
ok(bad === 0, `DFA vs native RegExp on ${total} (regex,string) pairs, ${accN} accepted, ${bad} mismatches`);
ok(accN > 5000 && accN < total * 0.9, 'sweep has both accepted and rejected strings (' + accN + '/' + total + ')');
console.log(`native sweep: ${total} pairs, ${accN} accepted, ${bad} mismatches`);

// ---- equivalence: counterexamples verified natively, equal verdicts brute-forced ----
let pairs = 0, eqPairs = 0, neqPairs = 0, cexBad = 0, eqBad = 0;
const pool = []; for (let k = 0; k < 60; k++) pool.push(gen(2));
// add equal-by-construction twins
const twins = pool.map((s) => [s, '(?:' + s + '|' + s + ')'])
  .concat(pool.map((s) => ['(?:' + s + ')*', '(?:(?:' + s + ')*)*']))
  .concat(pool.slice(0, 30).map((s, i) => [s + '|' + pool[i + 30], pool[i + 30] + '|' + s]));
const all = twins.concat(pool.slice(0, 50).map((s, i) => [s, pool[(i * 7 + 3) % pool.length]]));
for (const [x, y] of all) {
  const a = dfa(x), b = dfa(y), c = R.compare(a, b), ra = new RegExp('^(?:' + x + ')$'), rb = new RegExp('^(?:' + y + ')$');
  pairs++;
  if (c.equal) {
    eqPairs++;
    for (const s of strings) if (ra.test(s) !== rb.test(s)) { eqBad++; console.log('EQ-WRONG', x, y, JSON.stringify(s)); break; }
  } else {
    neqPairs++;
    if (c.onlyA !== null && !(ra.test(c.onlyA) && !rb.test(c.onlyA))) { cexBad++; console.log('CEX-A BAD', x, y, JSON.stringify(c.onlyA)); }
    if (c.onlyB !== null && !(rb.test(c.onlyB) && !ra.test(c.onlyB))) { cexBad++; console.log('CEX-B BAD', x, y, JSON.stringify(c.onlyB)); }
    // shortest: no shorter distinguishing string over the small alphabet
    const L = Math.min(...[c.onlyA, c.onlyB].filter((v) => v !== null).map((v) => v.length));
    for (const s of strings) if (s.length < L && ra.test(s) !== rb.test(s)) { cexBad++; console.log('NOT SHORTEST', x, y, JSON.stringify(s)); break; }
  }
}
ok(cexBad === 0 && eqBad === 0 && eqPairs > 40 && neqPairs > 20, `equivalence: ${pairs} pairs, ${eqPairs} equal, ${neqPairs} different, ${cexBad} bad counterexamples, ${eqBad} wrong equal verdicts`);
console.log(`equivalence: ${pairs} pairs, ${eqPairs} equal, ${neqPairs} different`);

// ---- Python oracle (re module) on the same cases ----
require('fs').writeFileSync(path.join(__dirname, 'cases.json'), JSON.stringify(cases.filter((c) => c.strings.length)));
try {
  const out = execFileSync('python3', [path.join(__dirname, 'oracle.py'), path.join(__dirname, 'cases.json')], { encoding: 'utf8' });
  console.log(out.trim());
  ok(/ 0 mismatches/.test(out), 'python re oracle agrees');
} catch (e) { ok(false, 'oracle failed: ' + e.message); }
require('fs').unlinkSync(path.join(__dirname, 'cases.json'));

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
