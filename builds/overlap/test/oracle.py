"""Independent oracle for Overlap. Reads cases (JSON on stdin) written by test.js, recomputes every answer
minute by minute with Python's zoneinfo (a different tz database reader, a different algorithm: no
offset segments, no interval arithmetic) and prints the disagreements as JSON."""
import json, sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

def working(p, zi, minute):
    t = datetime.fromtimestamp(minute * 60, timezone.utc).astimezone(zi)
    sh, sm = map(int, p["start"].split(":")); eh, em = map(int, p["end"].split(":"))
    s, e, now = sh * 60 + sm, eh * 60 + em, t.hour * 60 + t.minute
    dow = (t.weekday() + 1) % 7            # python Monday=0 -> JS Sunday=0
    prev = (dow + 6) % 7
    days = set(p["days"])
    if s == e: return dow in days
    if s < e: return dow in days and s <= now < e
    return (dow in days and now >= s) or (prev in days and now < e)

def runs(flags, m0):
    out, start = [], None
    for i, f in enumerate(flags):
        if f and start is None: start = i
        if not f and start is not None: out.append([(m0 + start) * 60000, (m0 + i) * 60000]); start = None
    if start is not None: out.append([(m0 + start) * 60000, (m0 + len(flags)) * 60000])
    return out

bad = []
for n, c in enumerate(json.load(sys.stdin)):
    m0, m1 = c["from"] // 60000, c["to"] // 60000
    zis = [ZoneInfo(p["zone"]) for p in c["people"]]
    per = [[working(p, zi, m) for m in range(m0, m1)] for p, zi in zip(c["people"], zis)]
    common = [all(col) for col in zip(*per)] if per else []
    exp_common = runs(common, m0)
    if exp_common != c["common"]: bad.append({"case": n, "what": "common", "expected": exp_common, "got": c["common"]})
    L = c["len"]
    for s in c["slots"]:                      # every reported slot start: who is inside for the whole meeting?
        i = s["start"] // 60000 - m0
        who = [all(row[i:i + L]) for row in per]
        if who != s["who"]: bad.append({"case": n, "what": "slot", "start": s["start"], "expected": who, "got": s["who"]})
    # best count over the whole grid must match too
    best = 0
    step = 15
    t = -(-m0 // step) * step
    while t + L <= m1:
        best = max(best, sum(all(row[t - m0:t - m0 + L]) for row in per)); t += step
    if best != c["best"]: bad.append({"case": n, "what": "best", "expected": best, "got": c["best"]})
print(json.dumps({"cases": n + 1, "bad": bad[:10], "nbad": len(bad)}))
