# Independent oracle: brute-force enumeration of every die outcome. Shares no code with src/dice.js.
# Usage: python3 test/oracle.py [seed] > cases.json   (prints {expr: {value: count}})
import itertools, json, random, sys
from collections import Counter
seed = int(sys.argv[1]) if len(sys.argv) > 1 else 1
rnd = random.Random(seed)

def pool(n, s, mode, k):
    c = Counter()
    for roll in itertools.product(range(1, s + 1), repeat=n):
        r = sorted(roll)
        kept = r[-k:] if mode == 'kh' and k > 0 else r[:k] if mode == 'kl' else []
        c[sum(kept)] += 1
    return c

def gen_pool():
    n = rnd.randint(1, 4); s = rnd.choice([2, 3, 4, 6, 8]) if n > 2 else rnd.choice([4, 6, 8, 12, 20])
    if n == 1 and rnd.random() < .5: return f"d{s}", pool(n, s, 'kh', 1), 1
    form = rnd.choice(['plain', 'kh', 'kl', 'dh', 'dl'])
    if form == 'plain': return f"{n}d{s}", pool(n, s, 'kh', n), 1
    a = rnd.randint(0, n)
    if form == 'kh': return f"{n}d{s}kh{a}", pool(n, s, 'kh', a), 1
    if form == 'kl': return f"{n}d{s}kl{a}", pool(n, s, 'kl', a), 1
    if form == 'dh': return f"{n}d{s}dh{a}", pool(n, s, 'kl', max(0, n - a)), 1
    return f"{n}d{s}dl{a}", pool(n, s, 'kh', max(0, n - a)), 1

def comb(a, b, f):
    c = Counter()
    for x, p in a.items():
        for y, q in b.items(): c[f(x, y)] += p * q
    return c

def factor():
    if rnd.random() < .3:
        k = rnd.randint(0, 6); return str(k), Counter({k: 1})
    e, d, _ = gen_pool(); return e, d

def term():
    e, d = factor()
    if rnd.random() < .3:
        e2, d2 = factor(); e, d = f"{e}*{e2}", comb(d, d2, lambda x, y: x * y)
    return e, d

def gen():
    e, d = term()
    for _ in range(rnd.randint(0, 2)):
        op = rnd.choice('+-'); e2, d2 = term()
        if sum(d2.values()) * sum(d.values()) > 3_000_000: continue
        e, d = f"{e}{op}{e2}", comb(d, d2, (lambda x, y: x + y) if op == '+' else (lambda x, y: x - y))
    return e, d

out = {}
while len(out) < 120:
    e, d = gen(); out[e] = {str(k): v for k, v in sorted(d.items())}
print(json.dumps(out))
