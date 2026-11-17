// Strip Folds engine: flat-folding a 1-D strip along creases.
// A strip has n+1 segments joined by n creases, each 'M' (mountain) or 'V' (valley),
// viewed from the strip's top face. Segment lengths are positive integers.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Fold = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Fold-line x of each vertex when the strip is flat folded: x[0]=0, direction alternates.
  function vertexXs(lengths) {
    const x = [0];
    for (let i = 0; i < lengths.length; i++) x.push(x[i] + (i % 2 === 0 ? 1 : -1) * lengths[i]);
    return x;
  }

  // Does the segment [lo,hi] poke through a fold at x that bulges to `side` (+1 right, -1 left)?
  // The fold wraps around the paper edge, so a segment that starts exactly at x and extends
  // to the bulge side is also in the way; one that ends at x on the paper side is not.
  function inLoop(lo, hi, x, side) {
    return side > 0 ? lo <= x && x < hi : lo < x && x <= hi;
  }

  // Does crease k require segment k+1 above (true) or below (false) segment k?
  function wantsAbove(creases, k) {
    return (creases[k] === 'V') === (k % 2 === 0);
  }

  // Full check of a complete layer assignment pos[i] (0 = bottom). Independent of the search.
  function verify(pos, creases, lengths) {
    const m = lengths.length, x = vertexXs(lengths);
    if (pos.length !== m || creases.length !== m - 1) return false;
    if (new Set(pos).size !== m) return false;
    for (let k = 0; k < m - 1; k++) if ((pos[k + 1] > pos[k]) !== wantsAbove(creases, k)) return false;
    for (let k = 0; k < m - 1; k++) {
      const lo = Math.min(pos[k], pos[k + 1]), hi = Math.max(pos[k], pos[k + 1]);
      for (let i = 0; i < m; i++) {
        if (i === k || i === k + 1) continue;
        const a = Math.min(x[i], x[i + 1]), b = Math.max(x[i], x[i + 1]);
        if (inLoop(a, b, x[k + 1], k % 2 === 0 ? 1 : -1) && lo < pos[i] && pos[i] < hi) return false;
      }
      for (let j = k + 1; j < m - 1; j++) {
        if (x[j + 1] !== x[k + 1]) continue;
        const a = Math.min(pos[j], pos[j + 1]), b = Math.max(pos[j], pos[j + 1]);
        if ((a < lo && lo < b && b < hi) || (lo < a && a < hi && hi < b)) return false;
      }
    }
    return true;
  }

  // Search every valid stacking by inserting segments one at a time.
  // Returns {count, complete, orders} where orders[i] lists pos[] arrays (bottom = 0).
  function solve(creases, lengths, opts) {
    const o = Object.assign({ keep: 50, maxNodes: 3e6 }, opts || {});
    const m = creases.length + 1;
    lengths = lengths || new Array(m).fill(1);
    const x = vertexXs(lengths);
    let count = 0, nodes = 0, stopped = false;
    const orders = [];

    // Check only the pairs involving segment s = k+1 and crease k, given the stack `stack`.
    function okAfterInsert(stack, s) {
      const pos = new Array(s + 1);
      for (let i = 0; i < stack.length; i++) pos[stack[i]] = i;
      const k = s - 1;
      const lo = Math.min(pos[k], pos[s]), hi = Math.max(pos[k], pos[s]);
      for (let i = 0; i < k; i++) {                    // crease k against older segments
        const a = Math.min(x[i], x[i + 1]), b = Math.max(x[i], x[i + 1]);
        if (inLoop(a, b, x[s], k % 2 === 0 ? 1 : -1) && lo < pos[i] && pos[i] < hi) return false;
      }
      for (let j = 0; j < k; j++) {                    // older creases against segment s
        const l2 = Math.min(pos[j], pos[j + 1]), h2 = Math.max(pos[j], pos[j + 1]);
        const a = Math.min(x[s], x[s + 1]), b = Math.max(x[s], x[s + 1]);
        if (inLoop(a, b, x[j + 1], j % 2 === 0 ? 1 : -1) && l2 < pos[s] && pos[s] < h2) return false;
      }
      for (let j = 0; j < k; j++) {                    // crease k against older creases
        if (x[j + 1] !== x[s]) continue;
        const a = Math.min(pos[j], pos[j + 1]), b = Math.max(pos[j], pos[j + 1]);
        if ((a < lo && lo < b && b < hi) || (lo < a && a < hi && hi < b)) return false;
      }
      return true;
    }

    function go(stack, s) {
      if (stopped) return;
      if (s === m) {
        count++;
        if (orders.length < o.keep) {
          const pos = new Array(m);
          for (let i = 0; i < m; i++) pos[stack[i]] = i;
          orders.push(pos);
        }
        return;
      }
      const at = stack.indexOf(s - 1);
      const from = wantsAbove(creases, s - 1) ? at + 1 : 0;
      const to = wantsAbove(creases, s - 1) ? stack.length : at;
      for (let p = from; p <= to; p++) {
        if (++nodes > o.maxNodes) { stopped = true; return; }
        const next = stack.slice(0, p).concat([s], stack.slice(p));
        if (okAfterInsert(next, s)) go(next, s + 1);
        if (stopped) return;
      }
    }
    go([0], 1);
    return { count, complete: !stopped, orders, nodes };
  }

  // Parse "VVMVM" (spaces/commas ignored). Returns {creases} or {error}.
  function parseCreases(text) {
    const s = String(text).toUpperCase().replace(/[\s,]/g, '');
    if (!/^[MV]*$/.test(s)) return { error: 'Creases may only be M (mountain) or V (valley).' };
    if (s.length > 40) return { error: 'At most 40 creases.' };
    return { creases: s };
  }
  function parseLengths(text, m) {
    const t = String(text).trim();
    if (!t) return { lengths: new Array(m).fill(1) };
    const parts = t.split(/[\s,]+/).filter(Boolean);
    if (parts.length !== m) return { error: `Need ${m} lengths (one per segment), got ${parts.length}.` };
    const lengths = parts.map(Number);
    if (!lengths.every((v) => Number.isInteger(v) && v > 0 && v <= 99)) return { error: 'Lengths must be whole numbers from 1 to 99.' };
    return { lengths };
  }

  // Regular paper-folding sequence: fold a strip in half n times, unfold.
  function dragon(n) {
    let s = 'V';
    for (let i = 1; i < n; i++) {
      const rc = s.split('').reverse().map((c) => (c === 'V' ? 'M' : 'V')).join('');
      s = s + 'V' + rc;
    }
    return n < 1 ? '' : s;
  }

  // Unfold every crease to 90 degrees: V turns left, M turns right. Returns integer vertices.
  function curve(creases, lengths) {
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    let d = 0, px = 0, py = 0;
    const pts = [[0, 0]];
    for (let i = 0; i <= creases.length; i++) {
      px += dirs[d][0] * lengths[i]; py += dirs[d][1] * lengths[i];
      pts.push([px, py]);
      if (i < creases.length) d = (d + (creases[i] === 'V' ? 1 : 3)) % 4;
    }
    return pts;
  }

  return { vertexXs, wantsAbove, verify, solve, parseCreases, parseLengths, dragon, curve };
});
