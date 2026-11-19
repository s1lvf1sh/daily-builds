#!/usr/bin/env python3
"""Independent oracle for Change Ringer. Shares no code with src/ring.js.

Reads oracle_cases.json (engine answers) and recomputes everything from the
definition of a change: place notation -> tuple permutations, rows by
explicit swapping, truth by counting, searches by trying every call string.
Usage: python3 oracle.py [--quick]   (quick skips the 12-lead Doubles search)
"""
import itertools, json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DIG = "1234567890ET"


def parse(src, n):
    """Return list of tuples of fixed places (empty tuple = cross), or None if invalid."""
    t = re.sub(r"\s+", "", src)
    if not t:
        return None
    mirror = t.startswith("&") or "," in t
    t = t.lstrip("&") if t.startswith("&") else t
    out = []
    for blk in t.split(","):
        # tokens: a cross, or a run of place digits
        toks = re.findall(r"[xX\-]|[^xX\-.]+", blk.replace(".", " ").replace("x", " x ").replace("X", " x ").replace("-", " x "))
        toks = [w for w in re.split(r"\s+", " ".join(toks)) if w]
        seq = []
        for w in toks:
            if w == "x":
                seq.append(())
            else:
                vals = []
                for ch in w:
                    i = DIG.find(ch.upper())
                    if i < 0 or i + 1 > n:
                        return None
                    vals.append(i + 1)
                seq.append(tuple(sorted(set(vals))))
        if not seq:
            return None
        out.append(seq + seq[-2::-1] if mirror else seq)
    flat = [c for b in out for c in b]
    for c in flat:
        fixed = set(c)
        free = [p for p in range(1, n + 1) if p not in fixed]
        # free places must come in runs of even length
        run = 0
        for p in range(1, n + 2):
            if p in fixed or p == n + 1:
                if run % 2:
                    return None
                run = 0
            else:
                run += 1
        if not c and n % 2:
            return None
    return flat


def step(row, fixed, n):
    row = list(row)
    free = [p for p in range(1, n + 1) if p not in set(fixed)]
    for a in range(0, len(free), 2):
        i, j = free[a] - 1, free[a + 1] - 1
        row[i], row[j] = row[j], row[i]
    return tuple(row)


def rows_of(n, lead, calls, comp):
    r = tuple(range(1, n + 1))
    rows = [r]
    for c in comp:
        for j, ch in enumerate(lead):
            if j == len(lead) - 1 and c != "p":
                ch = calls[c]
            r = step(r, ch, n)
            rows.append(r)
    return rows


def text(r):
    return "".join(DIG[b - 1] for b in r)


def truth(rows):
    N = len(rows) - 1
    rnd = N > 0 and rows[N] == rows[0]
    span = rows[:N] if rnd else rows
    seen = {}
    for i, r in enumerate(span):
        seen.setdefault(r, []).append(i)
    groups = sorted(v for v in seen.values() if len(v) > 1)
    return N, rnd, not groups, groups


def method_parts(case):
    lead = parse(case["pn"], case["n"])
    b = parse(case["bob"], case["n"])[0]
    s = parse(case["single"], case["n"])[0]
    return lead, {"b": b, "s": s}


def main():
    quick = "--quick" in sys.argv
    cases = json.load(open(os.path.join(HERE, "oracle_cases.json")))
    bad = 0
    counts = {}

    def fail(msg):
        nonlocal bad
        bad += 1
        if bad <= 15:
            print("MISMATCH", msg)

    def bump(k):
        counts[k] = counts.get(k, 0) + 1

    for c in cases:
        k = c["kind"]
        if k == "notation":
            p = parse(c["s"], c["n"])
            bump("notation")
            if (p is not None) != c["valid"]:
                fail(f"validity of {c['s']!r} n={c['n']}: oracle {p is not None}, engine {c['valid']}")
                continue
            if p is None:
                bump("invalid agreed")
                continue
            if [",".join(map(str, x)) for x in p] != c["changes"]:
                fail(f"changes of {c['s']!r}")
                continue
            rows = rows_of(c["n"], p, {}, c["comp"])
            if [text(r) for r in rows] != c["rows"]:
                fail(f"rows of {c['s']!r}")
            N, rnd, dist, groups = truth(rows)
            a = c["analysis"]
            if (N, rnd, dist, groups) != (a["length"], a["comesRound"], a["distinct"], sorted(list(g) for g in a["groups"])):
                fail(f"truth of {c['s']!r}: oracle {(N, rnd, dist, groups)} engine {a}")
            if rnd:
                bump("comes round")
            if not dist:
                bump("false")
        elif k == "touch":
            lead, calls = method_parts(c)
            rows = rows_of(c["n"], lead, calls, c["comp"])
            bump("touch")
            if [text(r) for r in rows] != c["rows"]:
                fail(f"rows of {c['name']} {c['comp']}")
            N, rnd, dist, groups = truth(rows)
            a = c["analysis"]
            if (N, rnd, dist, groups) != (a["length"], a["comesRound"], a["distinct"], sorted(list(g) for g in a["groups"])):
                fail(f"truth of {c['name']} {c['comp']}")
            if rnd and dist:
                bump("true touch")
            if rnd and not dist:
                bump("round but false")
        elif k == "search":
            if quick and c["K"] >= 12:
                continue
            lead, calls = method_parts(c)
            n = c["n"]
            need = math.factorial(n)
            found = []
            byk = {}
            for kk in range(1, c["K"] + 1):
                if c["extentOnly"] and kk * len(lead) != need:
                    continue
                for comp in itertools.product("pbs", repeat=kk):
                    rows = rows_of(n, lead, calls, comp)
                    N, rnd, dist, _ = truth(rows)
                    if rnd and dist and (not c["extentOnly"] or N == need):
                        found.append("".join(comp))
                        byk[kk] = byk.get(kk, 0) + 1
            bump("search")
            ok = sorted(found) == c["touches"] and len(found) == c["total"] and {int(a): b for a, b in c["countByLeads"].items()} == byk
            print(f"search {c['name']} K={c['K']} extentOnly={c['extentOnly']}: oracle {len(found)} engine {c['total']} -> {'agree' if ok else 'DISAGREE'}")
            if not ok:
                fail(f"search {c['name']}")
    print("checked", counts)
    print("mismatches", bad)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
