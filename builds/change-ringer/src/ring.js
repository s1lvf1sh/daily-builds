// Change ringing engine: place notation, rows, truth checking, composition search.
// Works in Node (module.exports) and in the browser (window.Ring).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Ring = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SYM = '1234567890ET';
  const placeVal = (ch) => { const i = SYM.indexOf(ch.toUpperCase()); return i < 0 ? -1 : i + 1; };
  const placeChar = (v) => SYM[v - 1];
  const factorial = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

  // A change is a sorted list of the places that stay put; [] means "cross" (swap every pair).
  function validateChange(places, n, idx) {
    if (places.length === 0 && n % 2) return `change ${idx + 1}: "x" needs an even number of bells`;
    let prev = 0;
    for (const p of [...places, n + 1]) {
      if ((p - prev - 1) % 2) return `change ${idx + 1} (${places.map(placeChar).join('') || 'x'}): bells ${prev + 1}-${p - 1} cannot pair up`;
      prev = p;
    }
    return null;
  }

  // Place notation. A comma (or a leading &) makes each block mirror itself, as is standard.
  function parseNotation(str, n) {
    const fail = (error) => ({ changes: null, error });
    if (!Number.isInteger(n) || n < 3 || n > 12) return fail('bells must be between 3 and 12');
    let s = String(str).replace(/\s+/g, '');
    if (!s) return fail('empty place notation');
    const sym = s.startsWith('&') || s.includes(',');
    s = s.replace(/^&/, '');
    const blocks = [];
    for (const blockStr of s.split(',')) {
      const seq = []; let cur = [];
      const flush = () => { if (cur.length) { seq.push([...new Set(cur)].sort((a, b) => a - b)); cur = []; } };
      for (const ch of blockStr) {
        if (ch === 'x' || ch === 'X' || ch === '-') { flush(); seq.push([]); }
        else if (ch === '.') flush();
        else { const v = placeVal(ch); if (v < 1) return fail(`unexpected character "${ch}"`); if (v > n) return fail(`place ${ch} is higher than ${n} bells`); cur.push(v); }
      }
      flush();
      if (!seq.length) return fail('empty block in place notation');
      blocks.push(sym ? seq.concat(seq.slice(0, -1).reverse()) : seq);
    }
    const changes = [].concat(...blocks);
    for (let i = 0; i < changes.length; i++) { const e = validateChange(changes[i], n, i); if (e) return fail(e); }
    return { changes, error: null };
  }

  function applyChange(row, places) {
    const out = row.slice(); const n = row.length; const fixed = new Set(places);
    let p = 1;
    while (p <= n) { if (fixed.has(p)) p++; else { const t = out[p - 1]; out[p - 1] = out[p]; out[p] = t; p += 2; } }
    return out;
  }
  const rounds = (n) => Array.from({ length: n }, (_, i) => i + 1);
  const rowStr = (r) => r.map(placeChar).join('');
  const rowKey = (r) => { let k = 0; for (const b of r) k = k * 13 + b; return k; };

  // A method: lead changes plus the replacement for the last change under a bob and a single.
  function makeMethod(n, notation, bob, single) {
    const m = parseNotation(notation, n);
    if (m.error) return { error: 'method: ' + m.error };
    const calls = {};
    for (const [k, s] of [['b', bob], ['s', single]]) {
      if (s == null || String(s).trim() === '') continue;
      const c = parseNotation(s, n);
      if (c.error) return { error: (k === 'b' ? 'bob: ' : 'single: ') + c.error };
      if (c.changes.length !== 1) return { error: (k === 'b' ? 'bob' : 'single') + ' must be one change' };
      calls[k] = c.changes[0];
    }
    return { n, changes: m.changes, calls, error: null };
  }

  function parseComposition(str) {
    const out = [];
    for (const ch of String(str)) {
      if (/[\s,.]/.test(ch)) continue;
      const c = ch.toLowerCase();
      if (c === 'p') out.push('p'); else if (c === 'b' || c === '-') out.push('b'); else if (c === 's') out.push('s');
      else return { calls: null, error: `unexpected "${ch}" (use p, b or - , s)` };
    }
    return { calls: out, error: null };
  }

  // Rows R0 (rounds) .. RN for a sequence of lead calls.
  function ring(method, calls) {
    const { n, changes } = method; const L = changes.length; const rows = [rounds(n)]; const leadEnds = [];
    for (const c of calls) {
      let cur = rows[rows.length - 1];
      for (let j = 0; j < L; j++) {
        let ch = changes[j];
        if (j === L - 1 && c !== 'p') { ch = method.calls[c]; if (!ch) return { error: `no ${c === 'b' ? 'bob' : 'single'} defined` }; }
        cur = applyChange(cur, ch); rows.push(cur);
      }
      leadEnds.push(rows.length - 1);
    }
    return { rows, leadEnds, error: null };
  }

  function analyse(rows, n) {
    const N = rows.length - 1; const first = rowKey(rows[0]);
    const comesRound = N > 0 && rowKey(rows[N]) === first;
    const upto = comesRound ? N : N + 1; // R_N == R_0 is the closing rounds, not a repeat
    const seen = new Map(); const groups = new Map();
    for (let i = 0; i < upto; i++) { const k = rowKey(rows[i]); if (seen.has(k)) { if (!groups.has(k)) groups.set(k, [seen.get(k)]); groups.get(k).push(i); } else seen.set(k, i); }
    const falseGroups = [...groups.values()];
    const distinct = falseGroups.length === 0;
    return { length: N, comesRound, distinct, falseGroups, true: comesRound && distinct, extent: comesRound && distinct && N === factorial(n) };
  }

  // Prefix permutations of a lead: row_j = head[P_j[i]].
  function leadPerms(method, call) {
    const { n, changes } = method; const L = changes.length; const out = []; let cur = rounds(n).map((_, i) => i);
    for (let j = 0; j < L; j++) {
      let ch = changes[j]; if (j === L - 1 && call !== 'p') ch = method.calls[call];
      cur = applyChange(cur.map((x) => x + 1), ch).map((x) => x - 1) ; // positions are labels 1..n, subtract back
      out.push(cur);
    }
    return out;
  }

  // Depth-first search for true touches (all rows distinct, ending in rounds).
  // opts: maxLeads, allow ('pbs' subset), limit (max stored), nodeBudget, extentOnly
  function search(method, opts = {}) {
    const { n } = method; const L = method.changes.length;
    const maxLeads = opts.maxLeads ?? 12; const allow = (opts.allow ?? 'pbs').split('').filter((c) => c === 'p' || method.calls[c]);
    const limit = opts.limit ?? 50; const budget = opts.nodeBudget ?? 2000000; const extentOnly = !!opts.extentOnly;
    const perms = {}; for (const c of allow) perms[c] = leadPerms(method, c);
    const roundsKey = rowKey(rounds(n)); const found = []; const countByLeads = {}; let nodes = 0; let stopped = false; let total = 0;
    const seen = new Set([roundsKey]); const path = [];
    const need = factorial(n);
    function dfs(head, depth) {
      if (stopped) return;
      for (const c of allow) {
        if (++nodes > budget) { stopped = true; return; }
        const P = perms[c]; const added = []; let ok = true; let last = null;
        for (let j = 0; j < L; j++) {
          const row = P[j].map((p) => head[p]); const k = rowKey(row);
          if (j === L - 1) { last = row; if (k === roundsKey) break; }
          if (seen.has(k)) { ok = false; break; }
          seen.add(k); added.push(k);
        }
        if (ok) {
          path.push(c); const lastKey = rowKey(last);
          if (lastKey === roundsKey) {
            const rowsN = path.length * L;
            if (!extentOnly || rowsN === need) { total++; countByLeads[path.length] = (countByLeads[path.length] || 0) + 1; if (found.length < limit) found.push(path.join('')); }
          } else if (depth + 1 < maxLeads) { seen.add(lastKey); dfs(last, depth + 1); seen.delete(lastKey); }
          path.pop();
        }
        for (const k of added) seen.delete(k);
        if (stopped) return;
      }
    }
    dfs(rounds(n), 0);
    return { touches: found, total, countByLeads, nodes, complete: !stopped };
  }

  // Plain course: no calls until the lead head repeats rounds.
  function plainCourse(method, capLeads = 720) {
    const calls = []; const rows = [rounds(method.n)]; const first = rowKey(rows[0]);
    for (let i = 0; i < capLeads; i++) {
      calls.push('p'); let cur = rows[rows.length - 1];
      for (const ch of method.changes) { cur = applyChange(cur, ch); rows.push(cur); }
      if (rowKey(cur) === first) break;
    }
    return { calls, ...analyse(rows, method.n), rows };
  }

  return { SYM, parseNotation, applyChange, makeMethod, parseComposition, ring, analyse, search, plainCourse, rounds, rowStr, rowKey, factorial, validateChange };
});
