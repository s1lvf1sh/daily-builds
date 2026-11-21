// Sparse ruler engine. A ruler of length L is a set of marks in 0..L that always contains 0 and L.
// It "measures" a distance d if two marks are exactly d apart. Works in Node and in the browser.
(function (root) {
  'use strict';

  // all distances a set of marks can measure, as a sorted array
  function distances(marks) {
    const s = new Set();
    for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) s.add(Math.abs(marks[i] - marks[j]));
    return [...s].sort((a, b) => a - b);
  }

  // targets that the marks cannot measure
  function missing(marks, targets) {
    const have = new Set(distances(marks));
    return targets.filter((t) => !have.has(t));
  }

  // normalise a user ruler: integers, in range, unique, sorted
  function cleanMarks(marks, L) {
    const out = new Set([0, L]);
    for (const m of marks) {
      if (!Number.isInteger(m) || m < 0 || m > L) throw new Error('mark ' + m + ' is not a whole number from 0 to ' + L);
      out.add(m);
    }
    return [...out].sort((a, b) => a - b);
  }

  // Exact search: the fewest marks (ends included) whose differences cover every target.
  // targets: array of distances in 1..L. Returns {marks, count, proven, solutions?, palindromes?}
  // opts: deadlineMs (wall-clock budget), countAll (also count every optimal ruler, up to mirror image)
  function solve(L, targets, opts) {
    opts = opts || {};
    const deadline = opts.deadlineMs ? Date.now() + opts.deadlineMs : Infinity;
    const inT = new Uint8Array(L + 1);
    let need = 0;
    for (const t of targets) { if (t >= 1 && t <= L && !inT[t]) { inT[t] = 1; need++; } }
    if (need === 0) return { marks: [0, L], count: L === 0 ? 1 : 2, proven: true, solutions: 1, palindromes: 1 };
    const cnt = new Int32Array(L + 1);
    const marks = [];
    let uncovered = need, timedOut = false, ticks = 0;
    const add = (x) => {
      for (let i = 0; i < marks.length; i++) { const d = Math.abs(x - marks[i]); if (cnt[d]++ === 0 && inT[d]) uncovered--; }
      marks.push(x);
    };
    const del = () => {
      const x = marks.pop();
      for (let i = 0; i < marks.length; i++) { const d = Math.abs(x - marks[i]); if (--cnt[d] === 0 && inT[d]) uncovered++; }
    };
    let found = null, solutions = 0, palindromes = 0;
    // k = total marks including both ends; choose k-2 interior marks in increasing order
    function dfs(lastPos, rem, k) {
      if (timedOut) return;
      if ((++ticks & 4095) === 0 && Date.now() > deadline) { timedOut = true; return; }
      if (uncovered === 0) {
        // fewer marks than k also works only if rem>0, which iterative deepening has already ruled out; here rem===0
        if (rem === 0) {
          solutions++;
          const m = marks.slice().sort((a, b) => a - b);
          if (m.every((v, i) => v === L - m[m.length - 1 - i])) palindromes++;
          if (!found) found = m;
        }
        return;
      }
      if (rem === 0) return;
      // each new mark adds at most (marks so far) new distances, the next one one more, and so on
      const m0 = marks.length;
      if (uncovered > rem * m0 + (rem * (rem - 1)) / 2) return;
      for (let x = lastPos + 1; x <= L - 1 - (rem - 1); x++) {
        add(x);
        dfs(x, rem - 1, k);
        del();
        if (found && !opts.countAll) return;
        if (timedOut) return;
      }
    }
    // smallest possible k: need distinct distances k(k-1)/2 >= need
    let kmin = 2;
    while ((kmin * (kmin - 1)) / 2 < need) kmin++;
    for (let k = Math.max(2, kmin); k <= L + 1; k++) {
      marks.length = 0; cnt.fill(0); uncovered = need; found = null; solutions = 0; palindromes = 0;
      add(0); if (L > 0) add(L);
      dfs(0, k - 2, k);
      if (timedOut) return { marks: found, count: found ? found.length : null, proven: false, timedOut: true, triedUpTo: k };
      if (found) return { marks: found, count: k, proven: true, solutions: Math.round((solutions + palindromes) / 2), palindromes };
    }
    return { marks: null, count: null, proven: true };
  }

  // Heuristic for lengths too big for the exact search: simulated annealing on a fixed number of marks.
  // Never claims optimality. rng: function returning [0,1).
  function anneal(L, targets, k, opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random;
    const deadline = Date.now() + (opts.deadlineMs || 1500);
    const T = targets.filter((t) => t >= 1 && t <= L);
    const inner = k - 2;
    if (inner < 0 || inner > L - 1) return null;
    const pool = [];
    for (let i = 1; i < L; i++) pool.push(i);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    let cur = pool.slice(0, inner);
    const cost = (c) => missing([0, L, ...c], T).length;
    let cc = cost(cur);
    let best = cc;
    let temp = 1.0;
    while (cc > 0 && Date.now() < deadline) {
      for (let it = 0; it < 200 && cc > 0; it++) {
        const idx = Math.floor(rng() * inner);
        let nx = 1 + Math.floor(rng() * (L - 1));
        if (rng() < 0.6) nx = Math.min(L - 1, Math.max(1, cur[idx] + Math.floor(rng() * 5) - 2));
        if (nx === cur[idx] || cur.includes(nx)) continue;
        const next = cur.slice(); next[idx] = nx;
        const nc = cost(next);
        if (nc <= cc || rng() < Math.exp((cc - nc) / temp)) { cur = next; cc = nc; if (cc < best) best = cc; }
      }
      temp = Math.max(0.15, temp * 0.97);
    }
    return cc === 0 ? [0, L, ...cur].sort((a, b) => a - b) : null;
  }

  // Wichmann ruler W(r,s): a known family of complete rulers with few marks.
  // Steps: 1 x r, r+1, (2r+1) x r, (4r+3) x s, (2r+2) x (r+1), 1 x r.
  // Length 4r(r+s+2)+3(s+1), marks 4r+s+3. Returns the marks.
  function wichmann(r, s) {
    const steps = [];
    for (let i = 0; i < r; i++) steps.push(1);
    steps.push(r + 1);
    for (let i = 0; i < r; i++) steps.push(2 * r + 1);
    for (let i = 0; i < s; i++) steps.push(4 * r + 3);
    for (let i = 0; i < r + 1; i++) steps.push(2 * r + 2);
    for (let i = 0; i < r; i++) steps.push(1);
    const marks = [0];
    let p = 0;
    for (const st of steps) { p += st; marks.push(p); }
    return marks;
  }

  // A lower bound on the marks any complete ruler of length L needs: k(k-1)/2 >= L.
  function lowerBound(L) { let k = 2; while ((k * (k - 1)) / 2 < L) k++; return k; }

  const api = { distances, missing, cleanMarks, solve, anneal, wichmann, lowerBound };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Ruler = api;
})(typeof self !== 'undefined' ? self : this);
