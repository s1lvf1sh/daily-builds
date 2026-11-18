"""Independent oracle for envy-free maximin rent division.
Different method from the engine: for EVERY assignment (not just welfare-maximising ones) it enumerates the
vertices of the polyhedron {prices, u} by solving linear systems with Fractions, and keeps the best feasible u.
Usage: python3 oracle.py gen   -> writes oracle_cases.json
"""
import itertools, json, random, sys
from fractions import Fraction as Fr

def solve_linear(A, b):
    n = len(A); M = [row[:] + [bb] for row, bb in zip(A, b)]
    for c in range(n):
        p = next((r for r in range(c, n) if M[r][c] != 0), None)
        if p is None: return None
        M[c], M[p] = M[p], M[c]; pv = M[c][c]; M[c] = [x / pv for x in M[c]]
        for r in range(n):
            if r != c and M[r][c] != 0:
                f = M[r][c]; M[r] = [x - f * y for x, y in zip(M[r], M[c])]
    return [M[i][n] for i in range(n)]

def constraints(v, sigma):
    n = len(v); cons = []  # (coeffs over p_0..p_{n-1}, u ; rhs) meaning coeffs.x >= rhs
    for i in range(n):
        r = sigma[i]
        a = [Fr(0)] * (n + 1); a[r] = Fr(-1); a[n] = Fr(-1)       # v_ir - p_r - u >= 0
        cons.append((a, -Fr(v[i][r])))
        for j in range(n):
            if j == r: continue
            a = [Fr(0)] * (n + 1); a[j] = Fr(1); a[r] = Fr(-1)    # p_j - p_r >= v_ij - v_ir
            cons.append((a, Fr(v[i][j]) - Fr(v[i][r])))
    return cons

def best_u(v, rent):
    n = len(v); best = None
    for sigma in itertools.permutations(range(n)):
        cons = constraints(v, sigma); eq = ([Fr(1)] * n + [Fr(0)], Fr(rent))
        for pick in itertools.combinations(range(len(cons)), n):
            A = [eq[0]] + [cons[k][0] for k in pick]; b = [eq[1]] + [cons[k][1] for k in pick]
            x = solve_linear(A, b)
            if x is None: continue
            if all(sum(c * xi for c, xi in zip(a, x)) >= h for a, h in cons):
                if best is None or x[n] > best: best = x[n]
    return best

def feasible(v, rent, sigma, prices):
    """Is (sigma, prices) envy-free and exact? Returns the minimum utility, or None."""
    n = len(v)
    if sum(prices) != rent or sorted(sigma) != list(range(n)): return None
    mine = [Fr(v[i][sigma[i]]) - prices[sigma[i]] for i in range(n)]
    for i in range(n):
        for j in range(n):
            if Fr(v[i][j]) - prices[j] > mine[i]: return None
    return min(mine)

def gen(seed=7):
    rnd = random.Random(seed); cases = []
    def add(n, count, hi, tie):
        for _ in range(count):
            v = [[rnd.randint(0, hi) for _ in range(n)] for _ in range(n)]
            if tie and rnd.random() < 0.5: v[rnd.randrange(n)] = v[rnd.randrange(n)][:]   # identical tastes -> ties
            rent = rnd.randint(0, hi * n)
            u = best_u(v, rent); cases.append({"v": v, "rent": rent, "u": str(u)})
    add(2, 150, 12, True); add(3, 150, 12, True); add(3, 60, 3, True); add(4, 40, 9, True); add(4, 20, 2, True)
    json.dump(cases, open("oracle_cases.json", "w")); print(len(cases), "cases")

if __name__ == "__main__":
    if sys.argv[1:] == ["gen"]: gen()
