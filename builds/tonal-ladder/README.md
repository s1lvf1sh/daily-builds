# Tonal Ladder

Pick a hue and chroma and get an OKLCH colour ramp where **any two steps k apart have the same WCAG contrast ratio**, whatever the hue. The page shows the ramp, a contrast matrix of every pair (AAA / AA / large-text shading), a live "try a pair" demo and copy-ready CSS variables. Static page, no dependencies, no network.

**Run:** open `index.html` (or the live page). **Test:** `node test/run.js` (needs `python3`) and `NODE_PATH=$(npm root -g) node test/browser.js` (needs Playwright with Chromium).

## Why it works
Contrast between two colours is `(Ya+.05)/(Yb+.05)`. Against white that is `cw = 1.05/(Y+.05)`, so `contrast(a,b) = cw(a)/cw(b)`. Space `cw` geometrically along the ramp and the contrast between steps i and j is exactly `r^|i-j|`. Each step is found by bisecting OKLCH lightness (with chroma reduced to stay inside sRGB) until the 8-bit hex hits its target.

## How it is checked
- `test/oracle.py` re-derives contrast, pair ratios and OKLab hue/chroma from the hex strings alone, in another language. `test/run.js` sweeps 108 ramps (12 hues × 4 chromas, plus 60 seeded random ones with random step counts and ranges). Result: worst pair-contrast error 1.15% (limit 4%), worst hue drift 3.2° (limit 4°), chroma never above the request by more than 0.002.
- Reference values: black/white = 21, `#777` on white ≈ 4.48, OKLCH white and sRGB red convert to the expected linear RGB.
- Two deliberate breaks (wrong luminance offset; hue offset) made 217 and 92 checks fail.
- `test/browser.js` drives the page in headless Chromium (9 checks) and a screenshot was inspected.

## Limits
Pair contrast is exact only up to 8-bit rounding (about 1% here), so a pair "at 4.5" can measure 4.46. Gamut clipping reduces chroma at the very light and dark ends, so those steps are less saturated than the request. Contrast is WCAG 2.x (not APCA). Not checked: Firefox/Safari, phones, screen readers, colour-blind simulation, and no designer has used it.
