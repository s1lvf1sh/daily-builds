// Regex Twins engine: parse a regular subset of JS regex syntax, build a DFA,
// minimise it, and compare two languages exactly. Full-string matching over
// printable ASCII (codes 32..126). UMD: works in a browser and in Node.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RegexTwins = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LO = 32, HI = 126, N = HI - LO + 1;           // universe
  const CH = (i) => String.fromCharCode(LO + i);
  const IDX = (c) => c.charCodeAt(0) - LO;

  class RegexError extends Error {
    constructor(msg, pos) { super(msg); this.pos = pos; }
  }

  // ---- sets: arrays of N booleans ----
  const emptySet = () => new Array(N).fill(false);
  const setOf = (pred) => { const s = emptySet(); for (let i = 0; i < N; i++) s[i] = pred(CH(i)); return s; };
  const CLASSES = {
    d: (c) => c >= '0' && c <= '9',
    w: (c) => /[A-Za-z0-9_]/.test(c),
    s: (c) => c === ' ',
  };

  // ---- parser: source -> AST ----
  // AST: {t:'set',set} | {t:'cat',xs} | {t:'alt',xs} | {t:'rep',x,min,max} | {t:'eps'}
  function parse(src) {
    let i = 0;
    const peek = () => src[i];
    const err = (m, p = i) => { throw new RegexError(m, p); };
    function alt() {
      const xs = [cat()];
      while (peek() === '|') { i++; xs.push(cat()); }
      return xs.length === 1 ? xs[0] : { t: 'alt', xs };
    }
    function cat() {
      const xs = [];
      while (i < src.length && peek() !== '|' && peek() !== ')') xs.push(rep());
      return xs.length === 0 ? { t: 'eps' } : xs.length === 1 ? xs[0] : { t: 'cat', xs };
    }
    function rep() {
      let a = atom();
      for (let once = true; once; once = false) {
        const c = peek();
        let min, max;
        if (c === '*') { min = 0; max = Infinity; i++; }
        else if (c === '+') { min = 1; max = Infinity; i++; }
        else if (c === '?') { min = 0; max = 1; i++; }
        else if (c === '{') {
          const m = /^\{(\d+)(?:(,)(\d*))?\}/.exec(src.slice(i));
          if (!m) err('Malformed {n,m} quantifier');
          min = +m[1]; max = m[2] ? (m[3] === '' ? Infinity : +m[3]) : min;
          if (max < min) err('Quantifier {n,m} has n > m');
          if ((min > 50 && min !== Infinity) || (max !== Infinity && max > 50)) err('Repeat counts above 50 are not supported');
          i += m[0].length;
        } else break;
        if (peek() === '?') i++;                       // lazy: same language when matching the whole string
        a = { t: 'rep', x: a, min, max };
      }
      return a;
    }
    function escSet(c, inClass) {
      if (CLASSES[c]) return setOf(CLASSES[c]);
      if (CLASSES[c.toLowerCase()] && c === c.toUpperCase()) { const f = CLASSES[c.toLowerCase()]; return setOf((x) => !f(x)); }
      return null;
    }
    function atom() {
      const c = peek(), p = i;
      if (c === '(') {
        i++;
        if (src.startsWith('?:', i)) i += 2;
        else if (peek() === '?') err('Lookaround and named groups are not regular and are not supported');
        const a = alt();
        if (peek() !== ')') err('Missing )', p);
        i++; return a;
      }
      if (c === '[') return cls();
      if (c === '.') { i++; return { t: 'set', set: setOf(() => true) }; }
      if (c === '^' || c === '$') err('^ and $ are not needed: the whole string is always matched');
      if (c === '*' || c === '+' || c === '?' || c === '{') err('Nothing to repeat');
      if (c === '\\') {
        i++; const e = src[i++];
        if (e === undefined) err('Trailing backslash', p);
        if (/[1-9]/.test(e)) err('Backreferences are not regular and are not supported', p);
        if (e === 'b' || e === 'B') err('Word boundaries are not supported', p);
        const s = escSet(e);
        if (s) return { t: 'set', set: s };
        return lit(e === 't' ? '\t' : e === 'n' ? '\n' : e);
      }
      i++; return lit(c);
    }
    function lit(c) {
      const code = c.charCodeAt(0);
      if (code < LO || code > HI) return { t: 'set', set: emptySet() };   // outside the universe: matches nothing
      const s = emptySet(); s[IDX(c)] = true; return { t: 'set', set: s };
    }
    function cls() {
      const p = i; i++;
      let neg = false; if (peek() === '^') { neg = true; i++; }
      const s = emptySet(); let first = true;
      const one = () => {
        let c = src[i++];
        if (c === undefined) err('Missing ]', p);
        if (c === '\\') {
          const e = src[i++]; if (e === undefined) err('Missing ]', p);
          const es = escSet(e, true);
          if (es) return { set: es };
          return { ch: e === 't' ? '\t' : e === 'n' ? '\n' : e };
        }
        return { ch: c };
      };
      while (peek() !== ']') {
        if (i >= src.length) err('Missing ]', p);
        first = false;
        const a = one();
        if (a.set) { for (let k = 0; k < N; k++) if (a.set[k]) s[k] = true; continue; }
        if (peek() === '-' && src[i + 1] !== ']' && src[i + 1] !== undefined) {
          i++; const b = one();
          if (b.set) err('Bad range in [ ]', p);
          if (b.ch.charCodeAt(0) < a.ch.charCodeAt(0)) err('Range out of order in [ ]', p);
          for (let k = a.ch.charCodeAt(0); k <= b.ch.charCodeAt(0); k++) if (k >= LO && k <= HI) s[k - LO] = true;
        } else if (a.ch.charCodeAt(0) >= LO && a.ch.charCodeAt(0) <= HI) s[IDX(a.ch)] = true;
      }
      i++;
      return { t: 'set', set: neg ? s.map((v) => !v) : s };
    }
    const ast = alt();
    if (i < src.length) err(peek() === ')' ? 'Unmatched )' : 'Unexpected character');
    return ast;
  }

  // ---- AST -> NFA (Thompson) ----
  function toNFA(ast) {
    const eps = [], tr = [];                 // eps[s]: [to], tr[s]: [{set,to}]
    const mk = () => { eps.push([]); tr.push([]); return eps.length - 1; };
    function build(a) {
      switch (a.t) {
        case 'eps': { const s = mk(), e = mk(); eps[s].push(e); return [s, e]; }
        case 'set': { const s = mk(), e = mk(); tr[s].push({ set: a.set, to: e }); return [s, e]; }
        case 'cat': {
          let [s, e] = build(a.xs[0]);
          for (let k = 1; k < a.xs.length; k++) { const [s2, e2] = build(a.xs[k]); eps[e].push(s2); e = e2; }
          return [s, e];
        }
        case 'alt': {
          const s = mk(), e = mk();
          for (const x of a.xs) { const [s2, e2] = build(x); eps[s].push(s2); eps[e2].push(e); }
          return [s, e];
        }
        case 'rep': {
          const s = mk(); let e = s;
          for (let k = 0; k < a.min; k++) { const [s2, e2] = build(a.x); eps[e].push(s2); e = e2; }
          if (a.max === Infinity) {
            const [s2, e2] = build(a.x), f = mk();
            eps[e].push(s2, f); eps[e2].push(s2, f); e = f;
          } else {
            const f = mk(); eps[e].push(f);
            for (let k = a.min; k < a.max; k++) { const [s2, e2] = build(a.x); eps[e].push(s2); eps[e2].push(f); e = e2; }
            eps[e].push(f); e = f;
          }
          return [s, e];
        }
      }
    }
    const [start, accept] = build(ast);
    return { eps, tr, start, accept };
  }

  // ---- NFA -> DFA over the 95-character universe, then minimise ----
  // dfa: {trans: Int32Array[states][N], acc: bool[], start:0}. State -1 never used: a dead state is explicit.
  function toDFA(nfa) {
    const closure = (set) => {
      const stack = [...set], seen = new Set(set);
      while (stack.length) for (const t of nfa.eps[stack.pop()]) if (!seen.has(t)) { seen.add(t); stack.push(t); }
      return [...seen].sort((a, b) => a - b);
    };
    const key = (s) => s.join(',');
    const ids = new Map(), states = [], trans = [], acc = [];
    const add = (s) => { const k = key(s); if (ids.has(k)) return ids.get(k); const id = states.length; ids.set(k, id); states.push(s); trans.push(null); acc.push(s.includes(nfa.accept)); return id; };
    add(closure([nfa.start]));
    for (let q = 0; q < states.length; q++) {
      const row = new Array(N);
      for (let c = 0; c < N; c++) {
        const nx = [];
        for (const s of states[q]) for (const t of nfa.tr[s]) if (t.set[c]) nx.push(t.to);
        row[c] = add(closure(nx));
        if (states.length > 5000) throw new RegexError('Too many states (over 5000): simplify the pattern');
      }
      trans[q] = row;
    }
    return { trans, acc, start: 0 };
  }

  function minimise(d) {
    const n = d.trans.length;
    let cls = d.acc.map((a) => (a ? 1 : 0));
    for (;;) {
      const sig = new Map(); const next = new Array(n);
      for (let s = 0; s < n; s++) {
        const k = cls[s] + '|' + d.trans[s].map((t) => cls[t]).join(',');
        if (!sig.has(k)) sig.set(k, sig.size);
        next[s] = sig.get(k);
      }
      const before = new Set(cls).size;
      cls = next;
      if (sig.size === before) break;
    }
    // renumber so that the start state is 0, others in BFS order
    const order = [], map = new Map(), rep = new Map();
    for (let s = 0; s < n; s++) if (!rep.has(cls[s])) rep.set(cls[s], s);
    const q = [cls[d.start]]; map.set(cls[d.start], 0); order.push(cls[d.start]);
    for (let h = 0; h < q.length; h++) for (let c = 0; c < N; c++) {
      const t = cls[d.trans[rep.get(q[h])][c]];
      if (!map.has(t)) { map.set(t, order.length); order.push(t); q.push(t); }
    }
    const trans = order.map((k) => d.trans[rep.get(k)].map((t) => map.get(cls[t])));
    const acc = order.map((k) => d.acc[rep.get(k)]);
    return { trans, acc, start: 0 };
  }

  function compile(src) {
    const dfa = minimise(toDFA(toNFA(parse(src))));
    // dead = non-accepting state that only reaches itself
    dfa.dead = dfa.trans.map((row, s) => !dfa.acc[s] && row.every((t) => t === s));
    return dfa;
  }

  function accepts(dfa, str) {
    let s = dfa.start;
    for (const ch of str) {
      const code = ch.charCodeAt(0);
      if (code < LO || code > HI) return false;
      s = dfa.trans[s][code - LO];
    }
    return dfa.acc[s];
  }

  // ---- analyses ----
  // shortest strings accepted, in length then character order (BFS over the DFA, deduplicating nothing: lists distinct strings)
  function examples(dfa, limit = 8, maxLen = 12) {
    const out = []; let layer = [['', dfa.start]];
    for (let len = 0; len <= maxLen && layer.length && out.length < limit; len++) {
      const nextLayer = [];
      for (const [str, s] of layer) {
        if (dfa.acc[s]) { out.push(str); if (out.length >= limit) return out; }
        if (len < maxLen) for (let c = 0; c < N; c++) { const t = dfa.trans[s][c]; if (!dfa.dead[t]) nextLayer.push([str + CH(c), t]); }
      }
      layer = nextLayer.length > 20000 ? nextLayer.slice(0, 20000) : nextLayer;
    }
    return out;
  }
  // number of accepted strings of each length 0..maxLen (BigInt, exact)
  function countByLength(dfa, maxLen) {
    let cur = dfa.trans.map((_, s) => (s === dfa.start ? 1n : 0n));
    const out = [];
    for (let len = 0; len <= maxLen; len++) {
      out.push(cur.reduce((a, v, s) => a + (dfa.acc[s] ? v : 0n), 0n));
      const nx = new Array(cur.length).fill(0n);
      for (let s = 0; s < cur.length; s++) if (cur[s]) for (let c = 0; c < N; c++) nx[dfa.trans[s][c]] += cur[s];
      cur = nx;
    }
    return out;
  }
  // language is finite iff no cycle among live states reachable from start that can reach acceptance
  function isFinite_(dfa) {
    const n = dfa.trans.length, live = new Array(n).fill(false);
    const rev = Array.from({ length: n }, () => []);
    dfa.trans.forEach((row, s) => row.forEach((t) => rev[t].push(s)));
    const st = []; dfa.acc.forEach((a, s) => { if (a) { live[s] = true; st.push(s); } });
    while (st.length) for (const p of rev[st.pop()]) if (!live[p]) { live[p] = true; st.push(p); }
    const color = new Array(n).fill(0);
    const dfs = (s) => {
      color[s] = 1;
      for (const t of new Set(dfa.trans[s])) if (live[t]) { if (color[t] === 1) return true; if (color[t] === 0 && dfs(t)) return true; }
      color[s] = 2; return false;
    };
    return !(live[dfa.start] && dfs(dfa.start));
  }

  // Compare two DFAs: shortest string in the symmetric difference per side, or null.
  function compare(a, b) {
    const seen = new Set(), q = [[a.start, b.start, '']]; seen.add(a.start + ':' + b.start);
    let onlyA = null, onlyB = null;
    for (let h = 0; h < q.length; h++) {
      const [x, y, str] = q[h];
      if (a.acc[x] !== b.acc[y]) {
        if (a.acc[x] && onlyA === null) onlyA = str;
        if (b.acc[y] && onlyB === null) onlyB = str;
        if (onlyA !== null && onlyB !== null) break;
      }
      for (let c = 0; c < N; c++) {
        const nx = a.trans[x][c], ny = b.trans[y][c], k = nx + ':' + ny;
        if (!seen.has(k)) { seen.add(k); q.push([nx, ny, str + CH(c)]); }
      }
    }
    return { equal: onlyA === null && onlyB === null, onlyA, onlyB };
  }

  // Edge list for drawing: merge characters that share (from,to), omitting transitions into the dead state.
  function edges(dfa) {
    const out = [];
    dfa.trans.forEach((row, s) => {
      const by = new Map();
      row.forEach((t, c) => { if (dfa.dead[t]) return; if (!by.has(t)) by.set(t, []); by.get(t).push(c); });
      for (const [t, cs] of by) out.push({ from: s, to: t, label: labelFor(cs) });
    });
    return out;
  }
  function labelFor(cs) {
    if (cs.length === N) return 'any';
    const isSet = (f) => { let k = 0; for (let c = 0; c < N; c++) if (f(CH(c))) k++; return k === cs.length && cs.every((c) => f(CH(c))); };
    if (isSet(CLASSES.w)) return '\\w';
    if (isSet((c) => !CLASSES.w(c))) return '\\W';
    if (isSet(CLASSES.d)) return '0–9';
    if (isSet((c) => !CLASSES.d(c))) return '\\D';
    const neg = N - cs.length;
    const ranges = (list) => {
      const parts = []; let i = 0;
      while (i < list.length) {
        let j = i; while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
        const show = (c) => (CH(c) === ' ' ? '␣' : CH(c));
        parts.push(j - i >= 2 ? show(list[i]) + '–' + show(list[j]) : list.slice(i, j + 1).map(show).join(''));
        i = j + 1;
      }
      return parts.join(' ');
    };
    if (cs.length > 40) { const rest = []; for (let c = 0; c < N; c++) if (!cs.includes(c)) rest.push(c); return 'not ' + ranges(rest); }
    void neg; return ranges(cs);
  }

  return { compile, accepts, examples, countByLength, isFinite: isFinite_, compare, edges, parse, RegexError, N, LO, HI };
});
