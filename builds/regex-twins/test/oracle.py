# Independent oracle: Python's `re` module (a different regex engine from JS) judges the
# verdicts recorded by the Node code. Usage: python3 oracle.py cases.json
import json, re, sys
cases = json.load(open(sys.argv[1]))
n = bad = 0
for c in cases:
    p = re.compile(c['src'])
    for s, mine in c['strings']:
        n += 1
        theirs = p.fullmatch(s) is not None
        if theirs != mine:
            bad += 1
            print('MISMATCH', c['src'], repr(s), mine, theirs)
print(f'python re oracle: {len(cases)} regexes, {n} strings, {bad} mismatches')
sys.exit(1 if bad else 0)
