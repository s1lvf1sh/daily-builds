"""Independent oracle for Even Split. Reads cases.json written by test.js.
Each case: text (canonical lines), bal (JS balances in cents), count (JS transfer count).
Checks, using only the text and Python's Fraction:
 1. each person's balance is within (number of expenses) cents of the exact fractional balance
 2. balances sum to 0
 3. fewest transfers by iterative-deepening search over transfers (no subset DP)
"""
import json, re, sys
from fractions import Fraction

def parse(text):
    exp, tr, people = [], [], []
    def add(n):
        if n not in people: people.append(n)
    for ln in text.splitlines():
        ln = ln.strip()
        if not ln: continue
        m = re.fullmatch(r'(\w+) sent (\w+) (\d+)\.(\d\d)', ln)
        if m:
            add(m[1]); add(m[2]); tr.append((m[1], m[2], int(m[3])*100+int(m[4]))); continue
        m = re.fullmatch(r'(\w+) paid (\d+)\.(\d\d) x for (.*)', ln)
        assert m, ln
        add(m[1])
        ws = []
        for tok in m[4].split(', '):
            n, _, w = tok.partition(':')
            add(n); ws.append((n, Fraction(w) if w else Fraction(1)))
        exp.append((m[1], int(m[2])*100+int(m[3]), ws))
    return people, exp, tr

def exact_balances(people, exp, tr):
    b = {p: Fraction(0) for p in people}
    for payer, c, ws in exp:
        tot = sum(w for _, w in ws)
        b[payer] += c
        for n, w in ws: b[n] -= Fraction(c) * w / tot
    for f, t, c in tr: b[f] += c; b[t] -= c
    return b

def min_transfers(vals):
    vals = tuple(sorted(v for v in vals if v))
    def dfs(v, k):
        v = [x for x in v if x]
        if not v: return True
        if k == 0: return False
        # each transfer fully clears one participant (standard lemma); try every debtor->creditor pair
        for i in range(len(v)):
            if v[i] >= 0: continue
            for j in range(len(v)):
                if v[j] <= 0: continue
                a = min(-v[i], v[j]); w = list(v); w[i] += a; w[j] -= a
                if dfs(w, k-1): return True
        return False
    k = 0
    while not dfs(list(vals), k): k += 1
    return k

cases = json.load(open(sys.argv[1]))
bad = 0
for ci, c in enumerate(cases):
    people, exp, tr = parse(c['text'])
    ex = exact_balances(people, exp, tr)
    js = c['bal']
    if sum(js.values()) != 0: print('case', ci, 'sum nonzero'); bad += 1
    for p in people:
        if abs(Fraction(js[p]) - ex[p]) > len(exp):
            print('case', ci, p, 'balance off', js[p], float(ex[p])); bad += 1
    if sum(js.values()) != 0: continue  # cannot be settled; already reported
    k = min_transfers(list(js.values()))
    if k != c['count']:
        print('case', ci, 'transfer count JS', c['count'], 'oracle', k); bad += 1
print(len(cases), 'cases,', bad, 'failures')
sys.exit(1 if bad else 0)
