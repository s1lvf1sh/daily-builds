# Independent oracle. Reads JSON cases [{cands:[..], ballots:[[count,[names]],..]}] on stdin, prints winners per method.
# Shares no code with src/vote.js: expands every voter individually, uses exact Fractions, and finds Schulze by
# enumerating every simple path rather than by Floyd-Warshall.
import sys, json, itertools
from fractions import Fraction

def voters(case):
    for cnt, ranks in case['ballots']:
        for _ in range(cnt): yield ranks

def prefers(r, a, b, n):  # strict preference with unlisted tied last
    pa = r.index(a) if a in r else len(r); pb = r.index(b) if b in r else len(r)
    return pa < pb

def pw(case):
    C = case['cands']; d = {(a, b): 0 for a in C for b in C if a != b}
    for r in voters(case):
        for a in C:
            for b in C:
                if a != b and prefers(r, a, b, len(C)): d[(a, b)] += 1
    return d

def best(C, score): m = max(score[c] for c in C); return sorted(c for c in C if score[c] == m)

def plurality(case):
    C = case['cands']; s = {c: 0 for c in C}
    for r in voters(case): s[r[0]] += 1
    return best(C, s)

def irv(case):
    alive = list(case['cands'])
    while True:
        t = {c: 0 for c in alive}
        for r in voters(case):
            for x in r:
                if x in alive: t[x] += 1; break
        act = sum(t.values())
        maj = [c for c in alive if Fraction(t[c], 1) > Fraction(act, 2)]
        if maj: return sorted(maj)
        if len(alive) == 1: return alive
        lo = min(t.values()); out = [c for c in alive if t[c] == lo]
        if len(out) == len(alive): return sorted(alive)
        alive = [c for c in alive if c not in out]

def borda(case):
    C = case['cands']; d = pw(case); n = sum(1 for _ in voters(case)); s = {}
    for a in C: s[a] = sum(Fraction(d[(a, b)]) + Fraction(n - d[(a, b)] - d[(b, a)], 2) for b in C if b != a)
    return best(C, s)

def copeland(case):
    C = case['cands']; d = pw(case); s = {}
    for a in C: s[a] = sum(Fraction(1) if d[(a, b)] > d[(b, a)] else Fraction(1, 2) if d[(a, b)] == d[(b, a)] else 0 for b in C if b != a)
    return best(C, s)

def minimax(case):
    C = case['cands']; d = pw(case)
    return best(C, {a: min(d[(a, b)] - d[(b, a)] for b in C if b != a) for a in C})

def schulze(case):
    C = case['cands']; d = pw(case)
    def edge(a, b): return d[(a, b)] if d[(a, b)] > d[(b, a)] else 0
    def strength(a, b):  # best over every simple path a -> ... -> b of the weakest edge
        others = [c for c in C if c not in (a, b)]; top = edge(a, b)
        for k in range(1, len(others) + 1):
            for mid in itertools.permutations(others, k):
                p = (a,) + mid + (b,); top = max(top, min(edge(p[i], p[i + 1]) for i in range(len(p) - 1)))
        return top
    S = {(a, b): strength(a, b) for a in C for b in C if a != b}
    return sorted(a for a in C if all(S[(a, b)] >= S[(b, a)] for b in C if b != a))

cases = json.load(sys.stdin)
out = []
for c in cases:
    d = pw(c); C = c['cands']
    cw = [a for a in C if all(d[(a, b)] > d[(b, a)] for b in C if b != a)]
    out.append({'plurality': plurality(c), 'irv': irv(c), 'borda': borda(c), 'copeland': copeland(c), 'minimax': minimax(c), 'schulze': schulze(c), 'condorcet': cw[0] if cw else None,
                'pairwise': [[d[(a, b)] if a != b else 0 for b in C] for a in C]})
print(json.dumps(out))
