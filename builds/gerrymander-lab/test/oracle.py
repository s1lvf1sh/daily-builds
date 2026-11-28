"""Independent oracle for Gerrymander Lab. Shares no code with src/gerry.js.
Method: list every connected n-cell set of the n x n grid (growth by BFS closure), then count exact covers
with a memoised DP over bitmasks of used cells, tracking the distribution of (A seats, B seats).
Also a third check for n=3: brute force over all labelled assignments of cells to groups.
Usage: oracle.py n votes-string   -> JSON {total, hist}; or: oracle.py bf3 votes -> JSON (n=3 brute force)"""
import sys, json, itertools
from collections import Counter
from functools import lru_cache

def adj(n):
    A = []
    for i in range(n * n):
        r, c = divmod(i, n)
        A.append([(r + dr) * n + (c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                  if 0 <= r + dr < n and 0 <= c + dc < n])
    return A

def connected_sets(n):
    A = adj(n)
    level = {frozenset([i]) for i in range(n * n)}
    for _ in range(n - 1):
        nxt = set()
        for s in level:
            for x in s:
                for y in A[x]:
                    if y not in s:
                        nxt.add(s | {y})
        level = nxt
    return level

def verdict(k, n):
    return 'A' if 2 * k > n else 'B' if 2 * k < n else 'T'

def solve(n, votes):
    sets = connected_sets(n)
    by_low = {}
    for s in sets:
        m = 0
        for i in s: m |= 1 << i
        k = sum(votes[i] for i in s)
        by_low.setdefault(min(s), []).append((m, verdict(k, n)))
    full = (1 << (n * n)) - 1

    @lru_cache(maxsize=None)
    def go(used):
        if used == full:
            return {(0, 0): 1}
        low = 0
        while used >> low & 1: low += 1
        out = Counter()
        for m, w in by_low.get(low, []):
            if m & used: continue
            for (a, b), c in go(used | m).items():
                out[(a + (w == 'A'), b + (w == 'B'))] += c
        return dict(out)
    h = go(0)
    return {'total': sum(h.values()), 'hist': {f'{a}-{b}': c for (a, b), c in sorted(h.items())}}

def brute3(votes):
    n = 3
    A = adj(n)
    seen = set(); hist = Counter(); total = 0
    for labels in itertools.product(range(3), repeat=9):
        if any(labels.count(g) != 3 for g in range(3)): continue
        groups = [frozenset(i for i in range(9) if labels[i] == g) for g in range(3)]
        key = frozenset(groups)
        if key in seen: continue
        ok = True
        for g in groups:
            st = [min(g)]; sn = {st[0]}
            while st:
                x = st.pop()
                for y in A[x]:
                    if y in g and y not in sn: sn.add(y); st.append(y)
            if sn != g: ok = False
        if not ok: continue
        seen.add(key); total += 1
        a = sum(verdict(sum(votes[i] for i in g), 3) == 'A' for g in groups)
        b = sum(verdict(sum(votes[i] for i in g), 3) == 'B' for g in groups)
        hist[f'{a}-{b}'] += 1
    return {'total': total, 'hist': dict(sorted(hist.items()))}

if __name__ == '__main__':
    mode, v = sys.argv[1], [int(ch) for ch in sys.argv[2]]
    if mode == 'bf3': print(json.dumps(brute3(v)))
    else: print(json.dumps(solve(int(mode), v)))
