"""Independent oracle for sparse rulers: tries every set of marks, smallest size first.
Shares no code with src/ruler.js. Writes oracle_cases.json: for each case the fewest marks
(ends included), the number of optimal rulers up to mirror image, and one list of all optimal rulers."""
import itertools, json, random, sys

def covers(marks, targets):
    ds = {abs(a - b) for a, b in itertools.combinations(marks, 2)}
    return all(t in ds for t in targets)

def brute(L, targets):
    targets = sorted(set(targets))
    if not targets:
        return 2, 1, [(0, L)]
    for k in range(2, L + 2):
        found = []
        for inner in itertools.combinations(range(1, L), k - 2):
            m = (0,) + inner + (L,)
            if covers(m, targets):
                found.append(m)
        if found:
            seen = set()
            for m in found:
                mirror = tuple(sorted(L - x for x in m))
                seen.add(min(m, mirror))
            return k, len(seen), sorted(seen)
    raise SystemExit('unreachable')

random.seed(2026)
cases = []
# every complete ruler up to length 22
for L in range(1, 23):
    k, n, all_ = brute(L, list(range(1, L + 1)))
    cases.append({'L': L, 'targets': list(range(1, L + 1)), 'k': k, 'optimal': n, 'rulers': [list(r) for r in all_]})
# random target subsets
for _ in range(260):
    L = random.randint(2, 20)
    size = random.randint(1, min(L, 12))
    T = sorted(random.sample(range(1, L + 1), size))
    k, n, all_ = brute(L, T)
    cases.append({'L': L, 'targets': T, 'k': k, 'optimal': n, 'rulers': [list(r) for r in all_]})
json.dump(cases, open(sys.argv[1] if len(sys.argv) > 1 else 'oracle_cases.json', 'w'))
print(len(cases), 'cases;', sum(1 for c in cases if c['optimal'] > 1), 'with several optimal rulers')
