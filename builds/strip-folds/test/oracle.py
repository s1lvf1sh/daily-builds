"""Independent oracle for Strip Folds.
Brute force over every permutation of layers. A folded strip is drawn as a planar figure:
each segment is a horizontal line at its layer height; each crease is a small semicircle
(radius 0.01 per layer gap) joining its two layers, bulging away from the paper.
A stacking is valid iff no semicircle crosses a segment line or another semicircle.
Uses float geometry on actual shapes, not the JS pair rules.
Usage: python3 oracle.py gen   -> writes oracle_cases.json
"""
import itertools, json, math, random, sys

EPS = 0.01

def geometry(lengths):
    xs = [0]
    for i, l in enumerate(lengths):
        xs.append(xs[-1] + (l if i % 2 == 0 else -l))
    return xs

def valid(perm, creases, lengths):
    m = len(lengths); xs = geometry(lengths)
    # orientation: walk the strip, tracking which face is up; V folds the top faces together
    face = 1
    for k, c in enumerate(creases):
        up = (c == 'V') == (face == 1)
        if (perm[k + 1] > perm[k]) != up: return False
        face = -face
    arcs = []  # (x, side, centre, radius)
    for k in range(m - 1):
        a, b = sorted((perm[k], perm[k + 1]))
        side = 1 if k % 2 == 0 else -1   # strip lies on the left of crease k (even) or right (odd); arc bulges away
        arcs.append((xs[k + 1], side, (a + b) / 2, (b - a) / 2 * EPS * 2, a, b))
    # arc vs line: line at height perm[i] spans [min x, max x]
    for (x, side, cy, r, a, b), k in zip(arcs, range(m - 1)):
        for i in range(m):
            if i in (k, k + 1): continue
            h = perm[i]
            if not (a < h < b): continue
            dy = h - cy
            if abs(dy) >= (b - a) / 2 * EPS * 2 + 1e-12: 
                # arc height span is a..b only if radius equals (b-a)/2; we squash: ellipse
                pass
            # ellipse x-extent at height h: semi-axes (r_x = EPS*(b-a), r_y = (b-a)/2)
            ry = (b - a) / 2
            rx = EPS * (b - a)
            ex = x + side * rx * math.sqrt(max(0.0, 1 - (dy / ry) ** 2))
            lo, hi = sorted((xs[i], xs[i + 1]))
            if lo < ex < hi: return False
    # arc vs arc: ellipses with centres on one vertical line, same side only
    for p in range(m - 1):
        for q in range(p + 1, m - 1):
            if arcs[p][0] != arcs[q][0] or arcs[p][1] != arcs[q][1]: continue
            a1, b1 = arcs[p][4], arcs[p][5]; a2, b2 = arcs[q][4], arcs[q][5]
            if a1 < a2 < b1 < b2 or a2 < a1 < b2 < b1: return False
    return True

def count(creases, lengths, keep_orders=False):
    m = len(lengths)
    n = sum(1 for p in itertools.permutations(range(m)) if valid(p, creases, lengths))
    return n

if __name__ == '__main__':
    if sys.argv[1:] == ['gen']:
        rng = random.Random(1234)
        cases = []
        # exhaustive unit strips up to 7 segments
        for m in range(1, 8):
            for bits in itertools.product('MV', repeat=m - 1):
                c = ''.join(bits); cases.append({'creases': c, 'lengths': [1] * m, 'count': count(c, [1] * m)})
        # random lengths up to 8 segments
        for _ in range(260):
            m = rng.randint(2, 8)
            c = ''.join(rng.choice('MV') for _ in range(m - 1))
            L = [rng.randint(1, 3) for _ in range(m)]
            cases.append({'creases': c, 'lengths': L, 'count': count(c, L)})
        with open('oracle_cases.json', 'w') as f: json.dump(cases, f)
        z = sum(1 for c in cases if c['count'] == 0)
        print(len(cases), 'cases;', z, 'unfoldable;', sum(1 for c in cases if c['count'] > 1), 'with several folds')
