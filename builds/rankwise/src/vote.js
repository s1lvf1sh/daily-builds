// Rankwise engine: ranked-ballot voting methods. Pure functions, no DOM. Works in browsers and Node.
(function (root) {
  'use strict';
  const METHODS = ['plurality', 'irv', 'borda', 'copeland', 'minimax', 'schulze'];
  const NAMES = { plurality: 'Plurality', irv: 'Instant runoff', borda: 'Borda count', copeland: 'Copeland', minimax: 'Minimax', schulze: 'Schulze' };

  // Text format, one ballot group per line:  "3: A > B > C"  or  "3 x A > B"  or  "A > B".
  // Candidates not listed on a ballot are tied for last. '#' starts a comment.
  function parse(text) {
    const ballots = [], errors = [], cands = [];
    String(text).split(/\r?\n/).forEach((raw, i) => {
      const line = raw.replace(/#.*/, '').trim(); if (!line) return;
      let count = 1, body = line, m;
      if ((m = /^(\d+)\s*(?::|x|×)\s*(.*)$/i.exec(line))) { count = parseInt(m[1], 10); body = m[2]; }
      if (count < 1 || count > 1e9) { errors.push(`Line ${i + 1}: count must be between 1 and 1,000,000,000`); return; }
      const names = body.split('>').map((s) => s.trim().replace(/\s+/g, ' '));
      if (names.some((n) => !n)) { errors.push(`Line ${i + 1}: empty name next to ">"`); return; }
      if (names.some((n) => /[=,]/.test(n))) { errors.push(`Line ${i + 1}: use ">" only (ties are not supported; leave tied names off the ballot)`); return; }
      if (new Set(names).size !== names.length) { errors.push(`Line ${i + 1}: a name appears twice`); return; }
      names.forEach((n) => { if (!cands.includes(n)) cands.push(n); });
      ballots.push({ count, ranks: names });
    });
    if (cands.length > 12) errors.push('At most 12 candidates are supported (you have ' + cands.length + ')');
    if (!errors.length && cands.length < 2) errors.push('Need at least two candidates');
    return { ballots, candidates: cands, errors };
  }

  function pairwise(ballots, cands) {
    const n = cands.length, idx = new Map(cands.map((c, i) => [c, i])), d = cands.map(() => cands.map(() => 0));
    for (const b of ballots) {
      const pos = new Array(n).fill(b.ranks.length);
      b.ranks.forEach((c, r) => { pos[idx.get(c)] = r; });
      for (let a = 0; a < n; a++) for (let z = 0; z < n; z++) if (a !== z && pos[a] < pos[z]) d[a][z] += b.count;
    }
    return d;
  }
  const total = (ballots) => ballots.reduce((s, b) => s + b.count, 0);
  const pick = (cands, scores) => { const best = Math.max(...scores); return cands.filter((_, i) => scores[i] === best); };

  function plurality(ballots, cands) {
    const s = cands.map((c) => ballots.reduce((t, b) => t + (b.ranks[0] === c ? b.count : 0), 0));
    return { winners: pick(cands, s), scores: s, unit: 'first choices' };
  }

  function irv(ballots, cands) {
    let alive = cands.slice(); const rounds = [];
    for (;;) {
      const tally = alive.map((c) => ballots.reduce((t, b) => { const top = b.ranks.find((x) => alive.includes(x)); return t + (top === c ? b.count : 0); }, 0));
      const active = tally.reduce((a, b) => a + b, 0);
      const winner = alive.filter((c, i) => tally[i] * 2 > active);
      const round = { alive: alive.slice(), tally, active, eliminated: [] };
      rounds.push(round);
      if (winner.length) return { winners: winner, rounds, scores: cands.map((c) => { const i = alive.indexOf(c); return i < 0 ? 0 : tally[i]; }), unit: 'final-round votes' };
      if (alive.length === 1) return { winners: alive, rounds, scores: cands.map((c) => (c === alive[0] ? tally[0] : 0)), unit: 'final-round votes' };
      const low = Math.min(...tally); const out = alive.filter((c, i) => tally[i] === low);
      round.eliminated = out;
      if (out.length === alive.length) return { winners: alive, rounds, scores: cands.map((c) => tally[alive.indexOf(c)]), unit: 'final-round votes', tied: true };
      alive = alive.filter((c) => !out.includes(c));
    }
  }

  // Scores are doubled so half-points stay integers; display divides by 2.
  function borda(ballots, cands) {
    const d = pairwise(ballots, cands), n = cands.length, s = [];
    for (let a = 0; a < n; a++) { let t = 0; for (let z = 0; z < n; z++) if (a !== z) t += 2 * d[a][z] + (total(ballots) - d[a][z] - d[z][a]); s.push(t); }
    // doubled: 2*(wins) + ties; so per-ballot a pair counts 2 for a win, 1 for a tie
    return { winners: pick(cands, s), scores: s.map((x) => x / 2), unit: 'points' };
  }
  function copeland(ballots, cands) {
    const d = pairwise(ballots, cands), n = cands.length, s = [];
    for (let a = 0; a < n; a++) { let t = 0; for (let z = 0; z < n; z++) if (a !== z) t += d[a][z] > d[z][a] ? 2 : d[a][z] === d[z][a] ? 1 : 0; s.push(t); }
    return { winners: pick(cands, s), scores: s.map((x) => x / 2), unit: 'pairwise wins' };
  }
  function minimax(ballots, cands) {
    const d = pairwise(ballots, cands), n = cands.length, s = [];
    for (let a = 0; a < n; a++) { let w = Infinity; for (let z = 0; z < n; z++) if (a !== z) w = Math.min(w, d[a][z] - d[z][a]); s.push(w); }
    return { winners: pick(cands, s), scores: s, unit: 'worst margin' };
  }
  function schulze(ballots, cands) {
    const d = pairwise(ballots, cands), n = cands.length;
    const p = d.map((row, a) => row.map((v, z) => (a !== z && v > d[z][a] ? v : 0)));
    for (let k = 0; k < n; k++) for (let a = 0; a < n; a++) if (a !== k) for (let z = 0; z < n; z++) if (z !== a && z !== k) p[a][z] = Math.max(p[a][z], Math.min(p[a][k], p[k][z]));
    const winners = cands.filter((_, a) => p.every((_, z) => a === z || p[a][z] >= p[z][a]));
    const s = cands.map((_, a) => p.reduce((t, _, z) => t + (a !== z && p[a][z] > p[z][a] ? 1 : 0), 0));
    return { winners, scores: s, unit: 'strongest-path wins' };
  }
  const FN = { plurality, irv, borda, copeland, minimax, schulze };

  function condorcetWinner(ballots, cands) {
    const d = pairwise(ballots, cands);
    const w = cands.filter((_, a) => d[a].every((v, z) => a === z || v > d[z][a]));
    return w.length ? w[0] : null;
  }
  function analyze(text) {
    const P = typeof text === 'string' ? parse(text) : text;
    if (P.errors.length) return { errors: P.errors };
    const { ballots, candidates } = P, res = {};
    for (const m of METHODS) res[m] = FN[m](ballots, candidates);
    const cw = condorcetWinner(ballots, candidates);
    const keyOf = (r) => r.winners.slice().sort().join('|');
    const groups = {}; for (const m of METHODS) (groups[keyOf(res[m])] = groups[keyOf(res[m])] || []).push(m);
    return { errors: [], candidates, voters: total(ballots), pairwise: pairwise(ballots, candidates), results: res, condorcet: cw, groups: Object.values(groups).map((ms) => ({ methods: ms, winners: res[ms[0]].winners })) };
  }

  const api = { METHODS, NAMES, parse, pairwise, analyze, condorcetWinner, plurality, irv, borda, copeland, minimax, schulze };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Vote = api;
})(typeof self !== 'undefined' ? self : this);
