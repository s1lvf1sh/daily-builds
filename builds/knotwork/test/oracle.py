"""Independent oracle for Knotwork. Reads JSON cases from stdin, prints JSON results.
Models a strand as a point moving diagonally through wall/crossing midpoints in half-unit coordinates and
reflecting off walls (a billiard). It shares no code or data layout with src/knot.js (which links cell segments)."""
import json, sys

def solve(case):
    W, H, hw, vw = case['W'], case['H'], case['h'], case['v']
    def wall(X, Y):
        return vw[(Y - 1) // 2][X // 2] if X % 2 == 0 else hw[Y // 2][(X - 1) // 2]
    def step(st):
        X, Y, dx, dy = st
        if wall(X, Y):
            if X % 2 == 0: dx = -dx
            else: dy = -dy
        return (X + dx, Y + dy, dx, dy)
    states = []
    for cx in range(W):
        for cy in range(H):
            N, E, S, Wm = (2*cx+1, 2*cy), (2*cx+2, 2*cy+1), (2*cx+1, 2*cy+2), (2*cx, 2*cy+1)
            for P, Q in ((N, E), (E, S), (S, Wm), (Wm, N)):
                states.append((Q[0], Q[1], Q[0]-P[0], Q[1]-P[1]))
                states.append((P[0], P[1], P[0]-Q[0], P[1]-Q[1]))
    parent = {s: s for s in states}
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]; a = parent[a]
        return a
    def union(a, b):
        a, b = find(a), find(b)
        if a != b: parent[a] = b
    for s in states:
        union(s, step(s))
        X, Y, dx, dy = s
        union(s, (X - dx, Y - dy, -dx, -dy))
    comps = {}
    for s in states: comps.setdefault(find(s), []).append(s)
    lengths = sorted(len(c) // 2 for c in comps.values())
    # alternation: walk one directed orbit of each strand; a crossing is a non-wall midpoint.
    alt = True
    seenorb = set()
    for s0 in states:
        if s0 in seenorb: continue
        orb = []; s = s0
        while True:
            seenorb.add(s); orb.append(s); s = step(s)
            if s == s0: break
        # mark the reverse orbit as seen so each strand is checked once
        for (X, Y, dx, dy) in orb: seenorb.add((X - dx, Y - dy, -dx, -dy))
        seq = []
        for (X, Y, dx, dy) in orb:
            if not wall(X, Y):
                slash = (dx * dy) < 0  # moving up-right or down-left
                top_slash = (((X - Y) // 2) + ((X + Y) // 2)) % 2 == 0
                seq.append(slash == top_slash)
        n = len(seq)
        if any(seq[i] == seq[(i + 1) % n] for i in range(n)): alt = False
    return {'strands': len(comps), 'lengths': lengths, 'alternates': alt}

if __name__ == '__main__':
    cases = json.load(sys.stdin)
    json.dump([solve(c) for c in cases], sys.stdout)
