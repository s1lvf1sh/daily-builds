// Generates oracle_cases.json: seeded random inputs plus the engine's answers. node test/gen.js
const C = require('../src/cut.js'); const fs = require('fs'); const path = require('path');
let s = 12345; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const cases = []; let betterThanFF = 0, multi = 0, priced = 0, truncated = 0;
while (cases.length < 400) {
  const nStock = ri(1, 3), L = ri(40, 120);
  const stocks = []; const used = new Set();
  for (let i = 0; i < nStock; i++) { let l = i === 0 ? L : ri(20, 160); while (used.has(l)) l++; used.add(l); stocks.push(l); }
  const costed = rnd() < 0.4;
  const stockObjs = stocks.map((l) => ({ len: l, cost: costed ? Math.round(l * (0.6 + rnd() * 0.9) * 10) : null }));
  if (!costed) stockObjs.forEach((x) => (x.cost = x.len));
  const maxL = Math.max(...stocks);
  const types = ri(1, 5), pieces = []; let total = 0; const seen = new Set();
  for (let t = 0; t < types; t++) {
    let len = ri(3, Math.min(maxL, Math.max(8, Math.floor(maxL * (rnd() < 0.3 ? 0.9 : 0.6))))); while (seen.has(len)) len++; if (len > maxL) continue; seen.add(len);
    const q = Math.min(ri(1, 4), (rnd() < 0.25 ? 13 : 10) - total); if (q < 1) break; total += q; pieces.push({ len, qty: q });
  }
  if (!pieces.length) continue;
  const kerf = rnd() < 0.5 ? 0 : ri(1, 4);
  const input = { pieces, stocks: stockObjs.sort((a, b) => a.len - b.len), kerf, costed };
  const r = C.solve(input); if (r.error) continue;
  if (r.cost < r.baseline.cost) betterThanFF++; if (nStock > 1) multi++; if (costed) priced++; if (!r.optimal) truncated++;
  cases.push({ input, cost: r.cost, nBoards: r.nBoards, baseline: r.baseline, optimal: r.optimal });
}
fs.writeFileSync(path.join(__dirname, 'oracle_cases.json'), JSON.stringify(cases));
console.log(`${cases.length} cases; engine beat first-fit on ${betterThanFF}; ${multi} with several board lengths; ${priced} priced; ${truncated} not proven`);
