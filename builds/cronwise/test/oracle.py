"""Independent oracle for Cronwise. Written separately from src/cron.js, in another language,
with a different algorithm: it parses fields into sorted lists, walks calendar days with
datetime, and checks each (hour, minute) pair. Emits JSON cases for test/run.js to compare."""
import json, random, datetime as dt, sys

NAMES_M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
NAMES_D = ['SUN','MON','TUE','WED','THU','FRI','SAT']

def field(txt, lo, hi, names=None, off=0, dow=False):
    out = set()
    for item in txt.split(','):
        base, _, step = item.partition('/')
        step = int(step) if step else 1
        def v(x):
            if names and x.upper() in names: return names.index(x.upper()) + off
            return int(x)
        if base == '*': a, b = lo, (6 if dow else hi)
        elif '-' in base: x, y = base.split('-'); a, b = v(x), v(y)
        else: a = v(base); b = (6 if dow else hi) if step != 1 or '/' in item else a
        out.update(range(a, b + 1, step))
    if dow: out = {0 if x == 7 else x for x in out}
    return sorted(out)

def parse(expr):
    f = expr.split()
    star = lambda s: s[0] == '*'
    return dict(mi=field(f[0],0,59), h=field(f[1],0,23), dom=field(f[2],1,31),
                mo=field(f[3],1,12,NAMES_M,1), dow=field(f[4],0,7,NAMES_D,0,True),
                dstar=star(f[2]), wstar=star(f[4]))

def day_ok(c, d):
    wd = (d.weekday() + 1) % 7          # python Monday=0 -> cron Sunday=0
    a, b = d.day in c['dom'], wd in c['dow']
    return (a or b) if (not c['dstar'] and not c['wstar']) else (a and b)

def nexts(expr, start, n):
    c = parse(expr); out = []
    day = start.date(); end = day + dt.timedelta(days=366 * 60)
    while day <= end and len(out) < n:
        if day.month in c['mo'] and day_ok(c, day):
            for h in c['h']:
                for m in c['mi']:
                    t = dt.datetime(day.year, day.month, day.day, h, m)
                    if t > start: out.append(t)
                    if len(out) == n: break
                if len(out) == n: break
        day += dt.timedelta(days=1)
    return [t.strftime('%Y-%m-%dT%H:%M:00.000Z') for t in out]

def rand_item(rng, lo, hi, names=None, off=0):
    k = rng.random()
    nm = lambda x: names[x - off] if names and rng.random() < .4 else str(x)
    if k < .25: return '*'
    if k < .45: return '*/%d' % rng.choice([2,3,5,6,10,15])
    if k < .65:
        a = rng.randint(lo, hi); b = rng.randint(a, hi); return '%s-%s' % (nm(a), nm(b))
    if k < .75:
        a = rng.randint(lo, hi); return '%d-%d/%d' % (a, hi, rng.choice([2,3]))
    return nm(rng.randint(lo, hi))

def rand_field(rng, lo, hi, names=None, off=0):
    return ','.join(rand_item(rng, lo, hi, names, off) for _ in range(rng.choice([1,1,1,2,3])))

rng = random.Random(20261106)
cases = []
fixed = ['* * * * *','*/15 * * * *','0 9 * * 1-5','30 2 1 * *','0 0 13 * 5','0 0 29 2 *','0 0 31 * *',
         '0 0 31 4,6 *','59 23 31 12 *','0 0 * * 7','0 0 1 1 *','15 10 * * MON-FRI','0 0 30 2 *']
exprs = fixed + ['%s %s %s %s %s' % (rand_field(rng,0,59), rand_field(rng,0,23), rand_field(rng,1,28),
                 rand_field(rng,1,12,NAMES_M,1), rand_field(rng,0,6,NAMES_D,0)) for _ in range(int(sys.argv[1]) if len(sys.argv)>1 else 400)]
starts = [dt.datetime(2026,11,6,12,0), dt.datetime(2024,2,28,23,59), dt.datetime(2026,12,31,23,59), dt.datetime(2027,3,14,8,30)]
for e in exprs:
    s = rng.choice(starts)
    cases.append(dict(expr=e, start=s.strftime('%Y-%m-%dT%H:%M:00.000Z'), expect=nexts(e, s, 6)))
json.dump(cases, sys.stdout)
