// Cut List engine: exact cutting-stock planner for one-dimensional stock (boards, pipe, tube, trim).
// Lengths are integers ("ticks"): 0.1 mm, 0.01 cm... see UNITS. Costs are integers (cents).
// Rule: k pieces fit on a board of length L when sum(lengths) + kerf*(k-1) <= L.
(function (root) {
  'use strict';
  const UNITS = { mm: { tick: 10, name: 'mm' }, cm: { tick: 100, name: 'cm' }, in: { tick: 64, name: 'in' } }; // ticks per unit

  function parseNum(s) {
    s = String(s).trim();
    let m;
    if ((m = /^(\d+)[\s-]+(\d+)\/(\d+)$/.exec(s))) return +m[3] ? +m[1] + m[2] / m[3] : NaN;
    if ((m = /^(\d+)\/(\d+)$/.exec(s))) return +m[2] ? m[1] / m[2] : NaN;
    if (/^(\d+\.?\d*|\.\d+)$/.test(s)) return parseFloat(s);
    return NaN;
  }
  const toTicks = (v, unit) => Math.round(v * UNITS[unit].tick);

  function fmt(t, unit) {
    if (unit === 'in') {
      const whole = Math.floor(t / 64); let n = t % 64, d = 64;
      while (n && n % 2 === 0) { n /= 2; d /= 2; }
      if (!n) return String(whole);
      return (whole ? whole + ' ' : '') + n + '/' + d;
    }
    const v = t / UNITS[unit].tick;
    return String(Math.round(v * 100) / 100);
  }

  // Parse the two text boxes. Returns {error} or {pieces:[{len,qty}], stocks:[{len,cost}], kerf, costed}
  function parseInput(piecesText, stockText, kerfText, unit) {
    if (!UNITS[unit]) return { error: 'Unknown unit.' };
    const pieces = [];
    const lines = String(piecesText).split('\n');
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].replace(/#.*/, '').trim(); if (!raw) continue;
      const m = /^(.+?)(?:\s*[x×*]\s*(\d+))?$/i.exec(raw);
      const v = m ? parseNum(m[1]) : NaN;
      if (!(v > 0)) return { error: `Piece line ${i + 1}: "${raw}" is not a length like "36", "36 x 4" or "3 1/2 x 2".` };
      const qty = m[2] === undefined ? 1 : parseInt(m[2], 10);
      if (qty < 1 || qty > 500) return { error: `Piece line ${i + 1}: quantity must be 1 to 500.` };
      const len = toTicks(v, unit); if (len < 1) return { error: `Piece line ${i + 1}: too short.` };
      pieces.push({ len, qty });
    }
    if (!pieces.length) return { error: 'Add at least one piece.' };
    const stocks = []; let priced = 0;
    const sl = String(stockText).split('\n');
    for (let i = 0; i < sl.length; i++) {
      const raw = sl[i].replace(/#.*/, '').trim(); if (!raw) continue;
      const m = /^(.+?)(?:\s*@\s*(\d+\.?\d*|\.\d+))?$/.exec(raw);
      const v = m ? parseNum(m[1]) : NaN;
      if (!(v > 0)) return { error: `Board line ${i + 1}: "${raw}" is not a length like "96" or "96 @ 12.50".` };
      const len = toTicks(v, unit);
      let cost = null; if (m[2] !== undefined) { cost = Math.round(parseFloat(m[2]) * 100); priced++; }
      stocks.push({ len, cost });
    }
    if (!stocks.length) return { error: 'Add at least one board length.' };
    if (priced && priced !== stocks.length) return { error: 'Give a price for every board length, or for none.' };
    const kv = String(kerfText).trim() === '' ? 0 : parseNum(kerfText);
    if (!(kv >= 0)) return { error: 'Saw kerf must be a length like "1/8" or "3", or empty.' };
    const kerf = toTicks(kv, unit);
    const costed = priced > 0;
    if (!costed) for (const s of stocks) s.cost = s.len; // no prices: minimise material bought
    // merge duplicate stock lengths (keep cheapest), duplicate piece lengths (add)
    const sm = new Map(); for (const s of stocks) { const o = sm.get(s.len); if (!o || s.cost < o.cost) sm.set(s.len, s); }
    const pm = new Map(); for (const p of pieces) pm.set(p.len, (pm.get(p.len) || 0) + p.qty);
    return { pieces: [...pm].map(([len, qty]) => ({ len, qty })), stocks: [...sm.values()].sort((a, b) => a.len - b.len), kerf, costed };
  }

  const fits = (sum, k, kerf, L) => sum + kerf * (k - 1) <= L;

  // Baseline for comparison: first-fit decreasing. A new board is the best-value one (lowest cost per length,
  // longer on ties) among those that hold the piece.
  function firstFit(pieces, stocks, kerf) {
    const list = []; for (const p of pieces) for (let i = 0; i < p.qty; i++) list.push(p.len);
    list.sort((a, b) => b - a);
    const boards = [];
    for (const len of list) {
      let b = boards.find((x) => fits(x.sum + len, x.pcs.length + 1, kerf, x.stock.len));
      if (!b) {
        let st = null;
        for (const s of stocks) if (s.len >= len && (!st || s.cost * st.len < st.cost * s.len || (s.cost * st.len === st.cost * s.len && s.len > st.len))) st = s;
        if (!st) return null;
        b = { stock: st, pcs: [], sum: 0 }; boards.push(b);
      }
      b.pcs.push(len); b.sum += len;
    }
    return boards;
  }

  function summarize(boards, kerf) {
    return boards.map((b) => {
      const used = b.sum + kerf * (b.pcs.length - 1);
      return { stock: b.stock.len, cost: b.stock.cost, pieces: b.pcs.slice().sort((x, y) => y - x), used, waste: b.stock.len - used };
    });
  }

  // Exact search. Types are distinct piece lengths, longest first. State = remaining count vector.
  // Value of a state = cost*1e6 + boards (cheapest, then fewest boards). Only maximal patterns are tried:
  // adding a piece to a board never hurts, so any plan can be converted to one that uses them.
  function solve(input, opts) {
    opts = opts || {};
    const maxStates = opts.maxStates || 1500000, deadline = Date.now() + (opts.ms || 4000);
    const { kerf } = input, stocks = input.stocks;
    const types = input.pieces.slice().sort((a, b) => b.len - a.len);
    const maxL = Math.max(...stocks.map((s) => s.len));
    const tooLong = types.filter((t) => t.len > maxL);
    if (tooLong.length) return { error: 'These pieces are longer than every board: ' + tooLong.map((t) => t.len).join(', ') + '.', tooLong: tooLong.map((t) => t.len) };
    const T = types.length, lens = types.map((t) => t.len);
    const mult = []; let prod = 1; for (let j = 0; j < T; j++) { mult.push(prod); prod *= types[j].qty + 1; }
    const baseline = firstFit(input.pieces, stocks, kerf);
    const baseCost = baseline.reduce((a, b) => a + b.stock.cost, 0);
    const baseline_ = { boards: baseline.length, cost: baseCost };
    if (prod > 9e15) return heuristic();
    const memo = new Map(); let visited = 0, aborted = false;
    const r = types.map((t) => t.qty);

    function heuristic() { return { optimal: false, boards: summarize(baseline, kerf), baseline: baseline_, cost: baseCost, nBoards: baseline.length, reason: 'too many different pieces to search exactly' }; }

    function patterns(rem, i, st, out) { // maximal patterns for stock st that contain at least one piece of type i
      const L = st.len, p = new Array(T).fill(0);
      (function rec(j, sum, k) {
        if (j === T) {
          if (p[i] < 1) return;
          for (let q = i; q < T; q++) if (rem[q] > p[q] && fits(sum + lens[q], k + 1, kerf, L)) return; // not maximal
          out.push({ p: p.slice(), st, k }); return;
        }
        const lo = j === i ? 1 : 0;
        for (let c = rem[j]; c >= lo; c--) {
          if (c > 0 && !fits(sum + c * lens[j], k + c, kerf, L)) continue;
          p[j] = c; rec(j + 1, sum + c * lens[j], k + c); p[j] = 0;
        }
      })(i, 0, 0);
    }

    function f(rem, key) {
      if (key === 0) return 0;
      const hit = memo.get(key); if (hit !== undefined) return hit.v;
      if (++visited > maxStates || ((visited & 1023) === 0 && Date.now() > deadline)) { aborted = true; return Infinity; }
      let i = 0; while (rem[i] === 0) i++;
      let best = Infinity, bestPat = null;
      for (const st of stocks) {
        if (st.len < lens[i]) continue;
        const pats = []; patterns(rem, i, st, pats);
        for (const pt of pats) {
          let nk = key; const nr = rem.slice();
          for (let j = i; j < T; j++) { nr[j] -= pt.p[j]; nk -= pt.p[j] * mult[j]; }
          const sub = f(nr, nk); if (aborted) return Infinity;
          const v = st.cost * 1e6 + 1 + sub;
          if (v < best) { best = v; bestPat = pt; }
        }
      }
      memo.set(key, { v: best, pat: bestPat });
      return best;
    }

    let key0 = 0; for (let j = 0; j < T; j++) key0 += r[j] * mult[j];
    const v = f(r.slice(), key0);
    if (aborted) { const h = heuristic(); h.reason = 'the search was too large to finish in the time allowed'; return h; }
    // rebuild
    const boards = []; let rem = r.slice(), key = key0;
    while (key !== 0) {
      const { pat } = memo.get(key); const pcs = []; let sum = 0;
      for (let j = 0; j < T; j++) { for (let c = 0; c < pat.p[j]; c++) pcs.push(lens[j]); sum += pat.p[j] * lens[j]; rem[j] -= pat.p[j]; key -= pat.p[j] * mult[j]; }
      boards.push({ stock: pat.st, pcs, sum });
    }
    const out = summarize(boards, kerf);
    return { optimal: true, boards: out, baseline: baseline_, cost: boards.reduce((a, b) => a + b.stock.cost, 0), nBoards: boards.length, states: visited };
  }

  // Independent checker for any plan: every piece cut exactly once, every board within its length.
  function validatePlan(plan, input) {
    const need = new Map(); for (const p of input.pieces) need.set(p.len, p.qty);
    const got = new Map();
    for (const b of plan.boards) {
      if (!input.stocks.some((s) => s.len === b.stock)) return 'unknown board length ' + b.stock;
      const sum = b.pieces.reduce((a, x) => a + x, 0);
      if (sum + input.kerf * (b.pieces.length - 1) > b.stock) return 'board overfull';
      for (const x of b.pieces) got.set(x, (got.get(x) || 0) + 1);
    }
    for (const [len, q] of need) if (got.get(len) !== q) return `piece ${len}: need ${q}, plan has ${got.get(len) || 0}`;
    for (const len of got.keys()) if (!need.has(len)) return 'extra piece ' + len;
    return null;
  }

  const api = { UNITS, parseNum, toTicks, fmt, parseInput, solve, firstFit, validatePlan, fits };
  if (typeof module !== 'undefined') module.exports = api; else root.Cut = api;
})(typeof self !== 'undefined' ? self : this);
