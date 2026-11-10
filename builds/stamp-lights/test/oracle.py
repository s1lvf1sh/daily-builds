"""Independent oracle. Reads JS answers (JSON on argv[1]) and recomputes the minimum number of
presses by breadth-first search over ALL 2^n board states, using plain ints. It shares no code or
algorithm with the JS solver (which uses Gaussian elimination over GF(2))."""
import json, sys
from collections import deque

def masks(w, h, stamp):
    out = []
    for y in range(h):
        for x in range(w):
            m = 0
            for dx, dy in stamp:
                cx, cy = x + dx, y + dy
                if 0 <= cx < w and 0 <= cy < h:
                    m |= 1 << (cy * w + cx)
            out.append(m)
    return out

def bfs(n, ms):
    dist = {0: 0}
    q = deque([0])
    while q:
        s = q.popleft()
        d = dist[s] + 1
        for m in ms:
            t = s ^ m
            if t not in dist:
                dist[t] = d
                q.append(t)
    return dist

data = json.load(open(sys.argv[1]))
checked = bad = unsolv = 0
for cfg in data:
    w, h = cfg['w'], cfg['h']
    dist = bfs(w * h, masks(w, h, cfg['stamp']))
    for b in cfg['boards']:
        board = int(b['board'])
        want = dist.get(board)
        checked += 1
        if want is None:
            unsolv += 1
            if b['solvable']:
                bad += 1; print('JS says solvable, oracle says not:', cfg['stamp'], board)
        else:
            if not b['solvable'] or b['count'] != want:
                bad += 1; print('mismatch', w, h, cfg['stamp'], board, 'js', b, 'oracle', want)
print(f'oracle: {checked} boards checked ({unsolv} unsolvable), {bad} disagreements')
sys.exit(1 if bad else 0)
