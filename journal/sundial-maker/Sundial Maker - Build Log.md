---
title: Sundial Maker - Build Log
type: ai-project
project: Sundial Maker
note: build-log
date: 2026-11-22
tags: [ai-project, build-log]
---

# Sundial Maker: Build Log

## Process

1. Wrote `src/dial.js`: sun vector, shadow projection, hour lines, nodus curves, sunrise, clock conversion, gnomon.
2. Wrote `test/oracle.py` with different formulas, and `test/test.js` with 10 mutants.
3. Wrote the page and `test/browser.js`, looked at desktop, southern-hemisphere and 375 px screenshots.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| Hour lines beyond 6 o'clock returned nothing | 57 failures against the closed form at |H| of 90 and 105 degrees | Used the direction s_z P - P_z s, valid for any sun height | 0 failures |
| Declination off by 0.44 degrees near equinoxes | Compared with Meeus | Kept Spencer, measured it, loosened that one tolerance to 0.5 and added a tight geometry-only check using the oracle's declination | Gap documented |
| Day length off by 5.8 min at latitude 56 | Same cause | Same | 1.0 min given oracle declination |
| "dates" mutant survived | 0 failures | Asserted nearest-day | Caught by 8 checks |
| Labels collided with the scale bar and north note | Screenshot | Added a footer strip below the plate | Clean |
| Gnomon text clipped | Screenshot | Shorter text and wider viewBox | Fixed |
| Corrections table overflowed at 375 px | scrollWidth 540 | Wrapped in a scroll container | 375 |
| Browser test counted hour lines twice | 34 lines | Scoped selectors to `#dial` | Passed |

## Verification

`node test/test.js`: 3493 passed, 0 failed. Mutants: hemi 744 failures, east 1570, eotsign 2, lon 2, refr 205, decsign 1428, nodusz 1419, dst 2, gnom 3, dates 8. Browser: 24 passed; a copy with a wrong sun-vector sign failed 2 of them. Oracle: 3,000 nodus cases (1,416 with the sun up), 165 hour lines, 365 days, 117 day lengths.

## Not verified

- Nothing was printed; the 180 mm width was checked only in emulated print media.
- No real sundial was built or read against a clock.
- Firefox and Safari not driven; no real phone.
- Day length above latitude 57 only checked for kind (day/night).
- Declination and equation of time only compared with one formula, and only for 2026.
- The look and feel (Delight) is judged from screenshots only.

Related: [[Sundial Maker]] · [[Sundial Maker - Origin & Decisions]] · [[Sundial Maker - Lessons & Observations]]
