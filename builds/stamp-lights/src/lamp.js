// Stamp Lights core: a Lights-Out family where each puzzle has its own stamp shape.
// Pressing cell c toggles every cell c+offset that lies on the board. Presses commute and undo
// themselves, so a board is a vector over GF(2) and solving is linear algebra.
(function (root) {
  'use strict';

  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A stamp is a list of [dx, dy] offsets and always contains [0, 0].
  function randomStamp(rand, size) {
    const cells = new Map([['0,0', [0, 0]]]);
    while (cells.size < size) {
      const keys = [...cells.values()];
      const [x, y] = keys[Math.floor(rand() * keys.length)];
      const d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rand() * 4)];
      const nx = x + d[0], ny = y + d[1];
      if (Math.abs(nx) > 2 || Math.abs(ny) > 2) continue;
      cells.set(nx + ',' + ny, [nx, ny]);
    }
    return [...cells.values()];
  }

  // Mask (BigInt, bit i = cell y*w+x) toggled by pressing cell (x, y).
  function pressMask(w, h, stamp, x, y) {
    let m = 0n;
    for (const [dx, dy] of stamp) {
      const cx = x + dx, cy = y + dy;
      if (cx >= 0 && cx < w && cy >= 0 && cy < h) m |= 1n << BigInt(cy * w + cx);
    }
    return m;
  }

  function popcount(v) { let c = 0; while (v) { c += Number(v & 1n); v >>= 1n; } return c; }

  // Returns { solvable, nullity, presses (bitmask of cells to press, minimum count), count }.
  function solve(w, h, stamp, board) {
    const n = w * h;
    const cols = [];
    for (let i = 0; i < n; i++) cols.push(pressMask(w, h, stamp, i % w, Math.floor(i / w)));
    // Row r (cell r) has bit j set when pressing j toggles r; extra bit n holds the target.
    const rows = [];
    for (let r = 0; r < n; r++) {
      let v = 0n;
      for (let j = 0; j < n; j++) if ((cols[j] >> BigInt(r)) & 1n) v |= 1n << BigInt(j);
      if ((board >> BigInt(r)) & 1n) v |= 1n << BigInt(n);
      rows.push(v);
    }
    const pivotOfCol = new Array(n).fill(-1);
    let rank = 0;
    for (let c = 0; c < n && rank < n; c++) {
      let p = -1;
      for (let r = rank; r < n; r++) if ((rows[r] >> BigInt(c)) & 1n) { p = r; break; }
      if (p < 0) continue;
      [rows[rank], rows[p]] = [rows[p], rows[rank]];
      for (let r = 0; r < n; r++) if (r !== rank && ((rows[r] >> BigInt(c)) & 1n)) rows[r] ^= rows[rank];
      pivotOfCol[c] = rank; rank++;
    }
    for (let r = rank; r < n; r++) if ((rows[r] >> BigInt(n)) & 1n) return { solvable: false, nullity: n - rank };
    const free = [];
    for (let c = 0; c < n; c++) if (pivotOfCol[c] < 0) free.push(c);
    const d = free.length;
    if (d > 20) return { solvable: true, nullity: d, presses: null, count: null, capped: true };
    const colMask = (1n << BigInt(n)) - 1n;
    let best = null, bestCount = Infinity;
    for (let s = 0; s < (1 << d); s++) {
      let x = 0n;
      for (let k = 0; k < d; k++) if ((s >> k) & 1) x |= 1n << BigInt(free[k]);
      for (let c = 0; c < n; c++) {
        const pr = pivotOfCol[c];
        if (pr < 0) continue;
        // x_c = target bit XOR (row pr restricted to free columns) . x
        const rest = rows[pr] & colMask & ~(1n << BigInt(c));
        const bit = Number(((rows[pr] >> BigInt(n)) & 1n) ^ BigInt(popcount(rest & x) & 1));
        if (bit) x |= 1n << BigInt(c);
      }
      const k = popcount(x);
      if (k < bestCount) { bestCount = k; best = x; }
    }
    return { solvable: true, nullity: d, presses: best, count: bestCount };
  }

  function apply(w, h, stamp, board, presses) {
    for (let i = 0; i < w * h; i++) if ((presses >> BigInt(i)) & 1n) board ^= pressMask(w, h, stamp, i % w, Math.floor(i / w));
    return board;
  }

  // Build a puzzle from a seed: choose a stamp, scramble a solved board with random presses.
  // Reject boards that are already solved or whose minimum is too easy for the requested level.
  function makePuzzle(seed, level) {
    const L = { easy: { w: 4, h: 4, st: 3, min: 3 }, medium: { w: 5, h: 5, st: 4, min: 5 }, hard: { w: 6, h: 6, st: 5, min: 7 } }[level] || null;
    if (!L) throw new Error('unknown level ' + level);
    const rand = rng(seed);
    for (let tries = 0; tries < 500; tries++) {
      const stamp = randomStamp(rand, L.st);
      let board = 0n;
      const n = L.w * L.h;
      const k = L.min + 2 + Math.floor(rand() * 4);
      for (let i = 0; i < k; i++) {
        const c = Math.floor(rand() * n);
        board ^= pressMask(L.w, L.h, stamp, c % L.w, Math.floor(c / L.w));
      }
      const s = solve(L.w, L.h, stamp, board);
      if (s.solvable && !s.capped && s.count >= L.min) return { w: L.w, h: L.h, stamp, board, par: s.count, nullity: s.nullity, level, seed };
    }
    throw new Error('no puzzle found');
  }

  const api = { rng, randomStamp, pressMask, solve, apply, makePuzzle, popcount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Lamp = api;
})(typeof self !== 'undefined' ? self : this);
