// Gerrymander Lab engine. An n x n grid of voters (cell = 1 for party A, 0 for party B)
// is cut into n connected districts of n cells each. Pure functions, no DOM.
export const SIZES = [3, 4, 5, 6];

export function neighbours(n) {
  const nb = [];
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, a = [];
    if (r > 0) a.push(i - n);
    if (c > 0) a.push(i - 1);
    if (c < n - 1) a.push(i + 1);
    if (r < n - 1) a.push(i + n);
    nb.push(a);
  }
  return nb;
}

// Winner of a district with k A-voters out of n: 'A', 'B' or 'T' (tie, nobody gets the seat).
export function winner(k, n) { return 2 * k > n ? 'A' : 2 * k < n ? 'B' : 'T'; }

// Check a user-drawn map. assign[i] = district id (0..n-1) or -1 for unassigned.
export function judge(n, votes, assign) {
  const nb = neighbours(n), N = n * n;
  const sizes = Array(n).fill(0), aVotes = Array(n).fill(0);
  let unassigned = 0;
  for (let i = 0; i < N; i++) {
    const d = assign[i];
    if (d < 0) { unassigned++; continue; }
    if (d >= n) throw new Error('district id out of range');
    sizes[d]++; aVotes[d] += votes[i];
  }
  const connected = Array(n).fill(true);
  for (let d = 0; d < n; d++) {
    const cells = []; for (let i = 0; i < N; i++) if (assign[i] === d) cells.push(i);
    if (!cells.length) continue;
    const seen = new Set([cells[0]]), stack = [cells[0]];
    while (stack.length) for (const j of nb[stack.pop()]) if (assign[j] === d && !seen.has(j)) { seen.add(j); stack.push(j); }
    connected[d] = seen.size === cells.length;
  }
  const full = unassigned === 0 && sizes.every((s) => s === n);
  const valid = full && connected.every(Boolean);
  const win = aVotes.map((k) => winner(k, n));
  return {
    sizes, aVotes, connected, unassigned, valid, win,
    seatsA: valid ? win.filter((w) => w === 'A').length : null,
    seatsB: valid ? win.filter((w) => w === 'B').length : null,
  };
}

// Enumerate EVERY way to cut the grid into n connected districts of n cells (unordered districts).
// Calls visit(assign, seatsA, seatsB) at each leaf; assign is a reused Int8Array (copy it to keep it).
// Returns the number of partitions. Redelmeier's algorithm lists each connected cell set once;
// a partial cut is pruned as soon as some free region has a size that is not a multiple of n.
export function enumerate(n, votes, visit) {
  const N = n * n, nb = neighbours(n);
  const assign = new Int8Array(N).fill(-1);
  let count = 0;

  function freeRegionsOk() {
    const seen = new Uint8Array(N);
    for (let s = 0; s < N; s++) {
      if (assign[s] !== -1 || seen[s]) continue;
      let size = 0; const st = [s]; seen[s] = 1;
      while (st.length) { const x = st.pop(); size++; for (const y of nb[x]) if (assign[y] === -1 && !seen[y]) { seen[y] = 1; st.push(y); } }
      if (size % n) return false;
    }
    return true;
  }

  function place(region, a, b, d) {
    // region: cells of district d chosen; it is a full district
    const k = region.reduce((s, i) => s + votes[i], 0);
    const w = winner(k, n);
    return [a + (w === 'A'), b + (w === 'B')];
  }

  function recurse(d, a, b) {
    if (d === n) { count++; if (visit) visit(assign, a, b); return; }
    let s = 0; while (assign[s] !== -1) s++;           // lowest free cell anchors the next district
    const chosen = [s]; assign[s] = d;
    const mark = new Uint8Array(N); mark[s] = 1;      // cells ever added to the untried list
    // cells below s are all assigned, so only cells above s are candidates
    const grow = (untried) => {
      if (chosen.length === n) {
        if (freeRegionsOk()) { const [a2, b2] = place(chosen, a, b, d); recurse(d + 1, a2, b2); }
        return;
      }
      const list = untried.slice();
      while (list.length) {
        const x = list.pop();
        chosen.push(x); assign[x] = d;
        const added = [];
        for (const y of nb[x]) if (assign[y] === -1 && !mark[y]) { mark[y] = 1; added.push(y); }
        grow(list.concat(added));
        for (const y of added) mark[y] = 0;
        chosen.pop(); assign[x] = -1;
      }
    };
    const init = [];
    for (const y of nb[s]) if (assign[y] === -1) { mark[y] = 1; init.push(y); }
    grow(init);
    assign[s] = -1;
  }
  recurse(0, 0, 0);
  return count;
}

// Full analysis of a vote map: how many partitions give each (seatsA, seatsB), and example maps for extremes.
export function analyse(n, votes) {
  const hist = {}; // key "a-b" -> count
  let maxA = null, minA = null, maxB = null, total = 0;
  const copy = (x) => Array.from(x);
  total = enumerate(n, votes, (assign, a, b) => {
    const key = a + '-' + b; hist[key] = (hist[key] || 0) + 1;
    if (!maxA || a > maxA.a || (a === maxA.a && b < maxA.b)) maxA = { a, b, assign: copy(assign) };
    if (!minA || a < minA.a || (a === minA.a && b > minA.b)) minA = { a, b, assign: copy(assign) };
    if (!maxB || b > maxB.b || (b === maxB.b && a < maxB.a)) maxB = { a, b, assign: copy(assign) };
  });
  const aTotal = votes.reduce((s, v) => s + v, 0);
  const bySeatsA = {}; // seats for A -> count
  for (const [k, c] of Object.entries(hist)) { const a = +k.split('-')[0]; bySeatsA[a] = (bySeatsA[a] || 0) + c; }
  return { n, total, aTotal, hist, bySeatsA, maxA, minA, maxB, voteShareA: aTotal / (n * n) };
}

export function parseVotes(s, n) {
  if (typeof s !== 'string' || s.length !== n * n || /[^01]/.test(s)) return null;
  return Array.from(s, Number);
}
export const votesToString = (v) => v.join('');
