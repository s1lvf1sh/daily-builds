"""Independent oracle for Tuning Fit.
Reads JSON on stdin: {"cases":[{"n":..,"ratio":"a/b","equave":"p/q"}...]}
Decides the nearest step with EXACT big-integer comparisons (no logarithms), and computes the error
in cents with 60-digit Decimal arithmetic. Prints JSON list of {step, err}."""
import sys, json, math
from fractions import Fraction
from decimal import Decimal, getcontext
getcontext().prec = 60

def frac(s):
    a, b = s.split('/'); return Fraction(int(a), int(b))

def below_half(n, r, E, m):
    # x = n*log_E(r). Is x < m + 1/2 ?  <=>  r^(2n) < E^(2m+1)   (r, E > 1)
    return r.numerator**(2*n) * E.denominator**(2*m+1) < E.numerator**(2*m+1) * r.denominator**(2*n)

def exact_step(n, r, E):
    m = max(0, int(n * math.log(r) / math.log(E)) - 2)
    # walk to the m with x in [m - 1/2, m + 1/2): first m for which x < m + 1/2 (ties go up, so equal is NOT below)
    while not below_half(n, r, E, m):
        m += 1
    return m

def dcents(fr):
    return Decimal(1200) * (Decimal(fr.numerator).ln() - Decimal(fr.denominator).ln()) / Decimal(2).ln()

req = json.load(sys.stdin)
out = []
for c in req["cases"]:
    r, E, n = frac(c["ratio"]), frac(c["equave"]), c["n"]
    k = exact_step(n, r, E)
    err = Decimal(k) * dcents(E) / Decimal(n) - dcents(r)
    out.append({"step": k, "err": float(err)})
json.dump(out, sys.stdout)
