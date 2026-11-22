"""Independent oracle for the sundial engine. Shares no code and uses different formulas:
 - hour lines: the textbook closed form tan(theta) = sin(lat) * tan(H)
 - nodus shadows: the sun's altitude and azimuth (spherical trig), then shadow = height / tan(altitude), away from the sun
 - declination, equation of time, day length: a Meeus-style solar position from the Julian date (the engine uses Spencer's series)
Writes oracle_cases.json. Usage: python3 oracle.py [out.json]"""
import json, math, random, sys, datetime
R = math.radians; Dg = math.degrees
random.seed(20261122)

def hour_dir(lat, H):
    th = math.atan2(abs(math.sin(R(lat))) * math.sin(R(H)), math.cos(R(H)))
    s = 1 if lat > 0 else -1
    return [math.sin(th), s * math.cos(th)]

def altaz(lat, dec, H):
    sa = math.sin(R(lat)) * math.sin(R(dec)) + math.cos(R(lat)) * math.cos(R(dec)) * math.cos(R(H))
    alt = math.asin(sa)
    A = math.atan2(math.sin(R(H)), math.cos(R(H)) * math.sin(R(lat)) - math.tan(R(dec)) * math.cos(R(lat)))  # from south, west positive
    return alt, A

def nodus_shadow(lat, dec, H, g):
    alt, A = altaz(lat, dec, H)
    if Dg(alt) <= 2: return None
    y0 = g / math.tan(R(lat))              # nodus foot, signed
    r = g / math.tan(alt)
    return [r * math.sin(A), y0 + r * math.cos(A)]

def sun(jd):  # Meeus low-precision: declination (deg), equation of time (minutes)
    n = jd - 2451545.0
    L = (280.460 + 0.9856474 * n) % 360
    g = R((357.528 + 0.9856003 * n) % 360)
    lam = R(L + 1.915 * math.sin(g) + 0.020 * math.sin(2 * g))
    eps = R(23.439 - 0.0000004 * n)
    dec = Dg(math.asin(math.sin(eps) * math.sin(lam)))
    ra = Dg(math.atan2(math.cos(eps) * math.sin(lam), math.cos(lam)))
    e = (L - ra + 180) % 360 - 180
    return dec, 4 * e

def jd_of(date, hours_ut):
    return (date - datetime.date(2000, 1, 1)).days + 2451544.5 + hours_ut / 24

def day_length(lat, date):
    # Greenwich longitude 0: minutes of the 24 h around solar noon when the sun's top edge is above the horizon (alt > -0.833)
    noon = 12.0 - sun(jd_of(date, 12))[1] / 60
    cnt = 0
    for m in range(24 * 60):
        t = noon - 12 + m / 60
        dec, eq = sun(jd_of(date, t))
        H = (t - 12) * 15 + eq / 4
        alt, _ = altaz(lat, dec, H)
        if Dg(alt) > -0.833: cnt += 1
    return cnt / 60

out = {}
out['hour'] = [{'lat': lat, 'H': H, 'dir': hour_dir(lat, H)} for lat in (10, 23.5, 35.7, 40.7, 51.5, 64.1, 75, -12, -33.9, -45, -64) for H in range(-105, 106, 15)]
cases = []
while len(cases) < 3000:
    lat = random.choice([-1, 1]) * random.uniform(8, 78); dec = random.uniform(-23.44, 23.44); H = random.uniform(-180, 180); g = random.uniform(5, 60)
    q = nodus_shadow(lat, dec, H, g)
    cases.append({'lat': lat, 'dec': dec, 'H': H, 'g': g, 'q': q})
out['nodus'] = cases
out['astro'] = []
for N in range(1, 366):
    d = datetime.date(2026, 1, 1) + datetime.timedelta(N - 1)
    dec, eq = sun(jd_of(d, 12))
    out['astro'].append({'N': N, 'dec': dec, 'eot': eq})
out['daylen'] = []
for lat in (0.5, 10, 23.4, 35, 45, 51.5, 56, -34, -45):
    for N in range(10, 365, 29):
        d = datetime.date(2026, 1, 1) + datetime.timedelta(N - 1)
        out['daylen'].append({'lat': lat, 'N': N, 'hours': day_length(lat, d)})
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else __file__.replace('oracle.py', 'oracle_cases.json'), 'w'))
print('hour', len(out['hour']), 'nodus', len(cases), 'astro', len(out['astro']), 'daylen', len(out['daylen']), 'nodus shadows None:', sum(c['q'] is None for c in cases))
