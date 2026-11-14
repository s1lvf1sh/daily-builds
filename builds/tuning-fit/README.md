# Tuning Fit

Enter the pure ratios you care about (3/2, 5/4, 7/4...), the interval that repeats (2/1 octave, 3/1 for Bohlen-Pierce) and a size limit. It fits every equal division from 1 to N steps, lists the record-holders (divisions that beat every smaller one by RMS or worst-interval error in cents), and lets you click one for per-interval steps and errors and hear pure against tempered.

Live: https://s1lvf1sh.github.io/daily-builds/builds/tuning-fit/

## Run
Open `index.html` (static, no build, no network). The settings are kept in the address after `#`.

## Test
- `node test/test.js`: 56 checks, a few seconds. Needs `python3`.
- `NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]`: 17 checks in headless Chromium.

## How it is checked
- Nearest step and error in cents are compared with `test/oracle.py` on 6,715 cases (5 equaves, 105 ratios, 17 sizes up to 400): 0 mismatches, max difference 1.4e-12 cents. The oracle decides the nearest step by exact big-integer comparison and shares no floating point with the engine.
- Known values from the tuning literature (12-EDO fifth -1.955 cents, 31-EDO major third +0.783, 53-EDO fifth -0.068) and record-holders 12, 19, 31, 53 for the 5-limit set.
- Record flags brute-forced for 10 ratio set/metric combinations up to N=120.
- Six mutations tried; five caught, one is equivalent. One real test gap (RMS divisor) was found and closed.

## Known limits
- Audio was not listened to: the browser test only records the frequencies the page requests from a stubbed `AudioContext`.
- Only Chromium. Equal weighting of ratios. No export. Nobody else has used it.
