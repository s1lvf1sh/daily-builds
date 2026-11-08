"""Independent oracle. Pure Python, no numpy.
Builds the 5-point finite-difference Laplacian (Dirichlet) on an N x N grid and
(1) gets its eigenvalues by Sturm-sequence bisection on the 1-D tridiagonal matrix (no trig formula),
    summing pairs to get 2-D eigenvalues, and prints the lowest ones scaled to units of pi^2;
(2) reads sample fields from stdin (JSON: {m,n,s,values}) and prints the relative residual
    ||L v - lam v|| / ||v|| using the discrete eigenvalue closest to pi^2 (m^2+n^2).
"""
import json, math, sys

N = 40
h = 1.0 / (N + 1)

def sturm_count(x):  # number of eigenvalues of T=tridiag(-1,2,-1)/h^2 below x
    cnt, d = 0, 1.0
    for i in range(N):
        d = (2.0 / h**2 - x) - ((1.0 / h**2) ** 2 / d if i else 0.0)
        if d == 0: d = 1e-300
        if d < 0: cnt += 1
    return cnt

def eig1d(k):  # k-th (0-based) eigenvalue by bisection
    lo, hi = 0.0, 4.0 / h**2 + 1
    for _ in range(200):
        mid = (lo + hi) / 2
        if sturm_count(mid) > k: hi = mid
        else: lo = mid
    return (lo + hi) / 2

e1 = [eig1d(k) for k in range(N)]

def lap_residual(vals, lam):
    # vals: N*N row-major samples at (i+1)h,(j+1)h ; interior Dirichlet Laplacian (-Lap)
    def at(i, j): return vals[j * N + i] if 0 <= i < N and 0 <= j < N else 0.0
    num = den = 0.0
    for j in range(N):
        for i in range(N):
            v = at(i, j)
            lv = (4 * v - at(i-1, j) - at(i+1, j) - at(i, j-1) - at(i, j+1)) / h**2
            num += (lv - lam * v) ** 2; den += v * v
    return math.sqrt(num / den)

if __name__ == '__main__':
    req = json.load(sys.stdin)
    two = sorted(a + b for a in e1[:12] for b in e1[:12])
    out = {'eig2d_over_pi2': [x / math.pi**2 for x in two[:30]], 'residuals': []}
    for f in req['fields']:
        lam = e1[f['m'] - 1] + e1[f['n'] - 1]   # discrete eigenvalue of the (m,n) product mode
        out['residuals'].append(lap_residual(f['values'], lam))
    json.dump(out, sys.stdout)
