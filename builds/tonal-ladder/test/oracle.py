"""Independent checker. Reads JSON [{hue, chroma, steps:[hex...], ratio, minContrast}] on stdin and
re-derives everything from the hex strings alone: WCAG contrast (via the sRGB spec formula, using the
integer 0-255 values), pair contrast vs r^k, and OKLab hue/chroma. Prints JSON of findings."""
import sys, json, math

def lin(v):
    c = v / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def rgb(h):
    return int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)

def Y(h):
    r, g, b = map(lin, rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def cr(a, b):
    ya, yb = Y(a), Y(b)
    if ya < yb: ya, yb = yb, ya
    return (ya + 0.05) / (yb + 0.05)

def oklab(h):
    r, g, b = map(lin, rgb(h))
    l = (0.4122214708*r + 0.5363325363*g + 0.0514459929*b) ** (1/3)
    m = (0.2119034982*r + 0.6806995451*g + 0.1073969566*b) ** (1/3)
    s = (0.0883024619*r + 0.2817188376*g + 0.6299787005*b) ** (1/3)
    return (0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
            1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
            0.0259040371*l + 0.7827717662*m - 0.8086757660*s)

out = []
for ramp in json.load(sys.stdin):
    st = ramp["steps"]
    worst_pair = 0.0
    for i in range(len(st)):
        for j in range(i + 1, len(st)):
            want = ramp["ratio"] ** (j - i)
            worst_pair = max(worst_pair, abs(cr(st[i], st[j]) / want - 1))
    worst_hue = 0.0
    over_chroma = 0.0
    for i, h in enumerate(st):
        L, a, b = oklab(h)
        C = math.hypot(a, b)
        over_chroma = max(over_chroma, C - ramp["chroma"])
        if C > 0.03 and 0.2 < L < 0.9:   # hue is unreliable near grey/black/white after 8-bit rounding
            d = abs((math.degrees(math.atan2(b, a)) - ramp["hue"] + 180) % 360 - 180)
            worst_hue = max(worst_hue, d)
    out.append({"worst_pair_rel_err": worst_pair, "worst_hue_deg": worst_hue,
                "over_chroma": over_chroma,
                "first_vs_white": cr(st[0], "#ffffff"), "last_vs_white": cr(st[-1], "#ffffff")})
json.dump(out, sys.stdout)
