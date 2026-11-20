"""Independent oracle. Shares no code with src/cut.js.
For each saved case it lists every piece separately and runs a subset DP over all 2^n subsets:
best[mask] = cheapest way to cut exactly those pieces, by choosing which subset shares the board
holding the lowest-numbered piece. Compares (cost, boards) with the engine. python3 test/oracle.py"""
import json, os, sys, itertools
cases = json.load(open(os.path.join(os.path.dirname(__file__), 'oracle_cases.json')))
BIG = 10**6
bad = 0; optimal_beats = 0
for ci, c in enumerate(cases):
    inp = c['input']; kerf = inp['kerf']
    items = [p['len'] for p in inp['pieces'] for _ in range(p['qty'])]
    n = len(items); stocks = [(s['len'], s['cost']) for s in inp['stocks']]
    full = (1 << n) - 1
    ssum = [0] * (1 << n); cnt = [0] * (1 << n)
    for m in range(1, 1 << n):
        low = (m & -m).bit_length() - 1
        ssum[m] = ssum[m & (m - 1)] + items[low]; cnt[m] = cnt[m & (m - 1)] + 1
    cheapest = [None] * (1 << n)
    for m in range(1, 1 << n):
        need = ssum[m] + kerf * (cnt[m] - 1)
        ok = [co for (L, co) in stocks if need <= L]
        cheapest[m] = min(ok) if ok else None
    INF = float('inf'); best = [INF] * (1 << n); best[0] = 0
    for m in range(1, 1 << n):
        low = m & -m; rest = m ^ low; sub = rest
        while True:
            part = sub | low; co = cheapest[part]
            if co is not None:
                v = best[m ^ part] + co * BIG + 1
                if v < best[m]: best[m] = v
            if sub == 0: break
            sub = (sub - 1) & rest
    want_cost, want_boards = divmod(best[full], BIG)
    if (want_cost, want_boards) != (c['cost'], c['nBoards']):
        bad += 1
        if bad <= 10: print('MISMATCH case', ci, 'oracle', (want_cost, want_boards), 'engine', (c['cost'], c['nBoards']), json.dumps(inp))
    if c['baseline']['cost'] < want_cost:
        bad += 1; print('first-fit cheaper than the oracle optimum?!', ci)
print(f'{len(cases)} cases checked, {bad} mismatches')
sys.exit(1 if bad else 0)
