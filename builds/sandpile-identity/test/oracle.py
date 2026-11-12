"""Independent oracle for the sandpile identity. Shares no code with src/sandpile.js.
Usage: python3 oracle.py            -> prints JSON of identities for several sizes (computed by a different method)
       python3 oracle.py brute      -> brute-force group checks on tiny grids
The identity here is found by a different route: the group is finite, so e = a^k for ... no: we use the
definition directly. e is the unique recurrent configuration with e+r = r for all recurrent r (brute force on
tiny grids), and on larger grids e is built by the one-grain-at-a-time topple order and the formula e = s(2c - s(2c)).
"""
import sys, json, itertools
from fractions import Fraction

def neighbours(x, y, w, h):
    return [(x+dx, y+dy) for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)) if 0 <= x+dx < w and 0 <= y+dy < h]

def slow_stabilize(g, w, h):
    """Topple one cell at a time, always the first unstable cell in row-major order, one topple (4 grains) at a time."""
    g = [row[:] for row in g]
    changed = True
    while changed:
        changed = False
        for y in range(h):
            for x in range(w):
                while g[y][x] >= 4:
                    g[y][x] -= 4
                    for nx, ny in neighbours(x, y, w, h):
                        g[ny][nx] += 1
                    changed = True
    return g

def identity(w, h):
    t = slow_stabilize([[6]*w for _ in range(h)], w, h)
    d = [[6 - t[y][x] for x in range(w)] for y in range(h)]
    return slow_stabilize(d, w, h)

def add(a, b, w, h):
    return slow_stabilize([[a[y][x]+b[y][x] for x in range(w)] for y in range(h)], w, h)

def det(m):
    n = len(m); m = [[Fraction(v) for v in r] for r in m]; d = Fraction(1)
    for i in range(n):
        p = next((r for r in range(i, n) if m[r][i] != 0), None)
        if p is None: return 0
        if p != i: m[i], m[p] = m[p], m[i]; d = -d
        d *= m[i][i]
        for r in range(i+1, n):
            f = m[r][i] / m[i][i]
            for c in range(i, n): m[r][c] -= f * m[i][c]
    return int(d)

def laplacian_det(w, h):
    n = w*h; L = [[0]*n for _ in range(n)]
    for y in range(h):
        for x in range(w):
            i = y*w+x; L[i][i] = 4
            for nx, ny in neighbours(x, y, w, h): L[i][ny*w+nx] = -1
    return det(L)

def is_recurrent_reachable(g, w, h, stable_all):
    """Recurrent iff reachable from every stable config: tested as 'adding some config to a lower-bound dominated start reaches g'.
    Here: g is recurrent iff g + (s(c_max + ... )) ... use the standard fact that recurrent = reachable from c_max (all 3) by adding grains."""
    raise NotImplementedError

def brute(w, h):
    cells = w*h
    # recurrent set = everything reachable from all-3 by adding grains and stabilizing (closure under adding single grains)
    start = tuple([3]*cells)
    seen = {start}; frontier = [start]
    while frontier:
        nxt = []
        for s in frontier:
            for i in range(cells):
                g = [list(s[y*w:(y+1)*w]) for y in range(h)]
                g[i//w][i % w] += 1
                r = slow_stabilize(g, w, h)
                t = tuple(v for row in r for v in row)
                if t not in seen: seen.add(t); nxt.append(t)
        frontier = nxt
    rec = sorted(seen)
    ids = []
    for e in rec:
        eg = [list(e[y*w:(y+1)*w]) for y in range(h)]
        ok = True
        for r in rec:
            rg = [list(r[y*w:(y+1)*w]) for y in range(h)]
            s = add(eg, rg, w, h)
            if tuple(v for row in s for v in row) != r: ok = False; break
        if ok: ids.append(e)
    return {"w": w, "h": h, "recurrent": len(rec), "spanning_trees": laplacian_det(w, h), "identities": [list(i) for i in ids]}

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'brute':
        print(json.dumps([brute(w, h) for w, h in ((1,1),(2,2),(1,3),(2,3),(3,3))]))
    else:
        sizes = [(1,1),(2,2),(3,3),(4,4),(5,5),(7,5),(8,8),(11,11),(16,16),(21,21),(25,13)]
        print(json.dumps([{"w": w, "h": h, "e": [v for row in identity(w, h) for v in row]} for w, h in sizes]))
