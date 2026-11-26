# Independent re-implementation of the lichen rules, written from the README spec.
# Usage: python3 oracle.py < cases.json  -> prints one digest per case.
import json, sys
M = 0xFFFFFFFF
def mix(a, b, c):
    h = ((a ^ 0x9e3779b9) * 0x85ebca6b) & M
    h ^= h >> 15
    h = ((h ^ b) * 0xc2b2ae35) & M
    h ^= h >> 13
    h = ((h ^ c) * 0x27d4eb2f) & M
    return h ^ (h >> 16)
W = H = 48
def warmth(day):
    ph = (day - 25) % 360
    return 180 - abs(ph - 180)
def run(to, spores):
    cells = {}  # (x,y) -> [species, age]
    for x, y, s in [(12, 12, 1), (35, 14, 2), (24, 36, 3)]:
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]:
            cells[(x + dx, y + dy)] = [s, 0]
    for day in range(0, to + 1):
        today = [s for s in spores if s['day'] == day][:3]
        for s in today:
            if 0 <= s['x'] < W and 0 <= s['y'] < H and s['k'] in (1, 2, 3):
                cells[(s['x'], s['y'])] = [s['k'], 0]
        wm = warmth(day); g = 16 + wm
        dp = (30 - wm) // 8 if wm < 30 else 0
        new = {}
        for y in range(H):
            for x in range(W):
                i = y * W + x
                nb = []
                empty = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dx == 0 and dy == 0: continue
                        c = cells.get((x + dx, y + dy))
                        if not (0 <= x + dx < W and 0 <= y + dy < H) or c is None: empty += 1
                        else: nb.append(c[0])
                cnt = {k: nb.count(k) for k in (1, 2, 3)}
                me = cells.get((x, y))
                if me is None:
                    total = len(nb)
                    if total and (mix(day, i, 1) & 255) < min(255, (g * total) // 16):
                        best = max(cnt.values())
                        tied = [k for k in (1, 2, 3) if cnt[k] == best]
                        new[(x, y)] = [tied[mix(day, i, 2) % len(tied)], 0]
                else:
                    a = min(255, me[1] + 1)
                    if a >= 240 and (mix(day, i, 3) & 15) == 0: continue
                    if empty > 0 and dp > 0 and (mix(day, i, 5) & 255) < dp: continue
                    pred = me[0] % 3 + 1
                    if cnt[pred] >= 3 and (mix(day, i, 4) & 7) == 0:
                        new[(x, y)] = [pred, 0]
                    else:
                        new[(x, y)] = [me[0], a]
        cells = new
    h = 0x811c9dc5
    for i in range(W * H):
        c = cells.get((i % W, i // W), [0, 0])
        h = ((h ^ c[0]) * 0x01000193) & M
        h = ((h ^ c[1]) * 0x01000193) & M
    return h
cases = json.load(sys.stdin)
print(json.dumps([run(c['to'], c['spores']) for c in cases]))
