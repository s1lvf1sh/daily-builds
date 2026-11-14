---
title: Tuning Fit - Build Log
type: ai-project
project: Tuning Fit
note: build-log
date: 2026-11-14
tags: [ai-project, build-log]
---

# Tuning Fit: Build Log

## Process

```mermaid
flowchart LR
  A[Plan] --> B[Engine] --> C[Oracle] --> D[Page] --> E[Browser check] --> F[Mutations] --> G[Document]
```

## Steps
1. Wrote `src/edo.js` (parsing, nearest step, error, fit, record scan, frequency).
2. Wrote `test/oracle.py`: exact integer comparison decides the nearest step; Decimal at 60 digits gives the error.
3. Wrote `test/test.js` with literature values, parser rejects, record brute force, and an oracle sweep.
4. Built `index.html`, then `test/browser.js` driving headless Chromium with a stubbed `AudioContext`.
5. Read a desktop screenshot; fixed two wording errors in the footer and legend.
6. Ran six mutations.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| Three hand-written expectations wrong | 53-EDO fifth, 31-EDO major third, 19-EDO minor third failed | Recomputed from arithmetic (31*1200/53 = 701.887 vs 701.955); the oracle had agreed with the code | Expectations fixed, code unchanged |
| RMS divisor mutant survived | Changing n to n+1 passed all tests | Added a test recomputing RMS and max from the oracle's errors | Mutant now caught |
| Footer said "then tempered alone" | Read against the code, which plays a tempered pair | Reworded | Page text matches behaviour |
| Legend claimed a 5-cent hearing threshold | Not something I measured | Reworded as my own display cut-off | No unverified claim |

## Verification
- `node test/test.js`: 56 passed, 0 failed. 6,715 oracle cases, max difference 1.40e-12 cents, 17 exact half-way tie cases (equave 4/1, ratio 2/1, odd N) included.
- Record flags brute-force checked for 5 ratio sets x 2 metrics, N up to 120.
- `node test/browser.js`: 17 passed. Covers presets, metric switch, "show every N" (120 rows), error messages, permalink and fallback, phone width without horizontal scroll, no console errors, and the frequencies scheduled for Play (pure 330 Hz, tempered 329.628 Hz for 12-EDO from 220) and for the scale (13 notes ending at 440).
- Mutations: tie-down, error sign, record `<=`, RMS divisor, frequency divisor were caught; `Math.round` instead of floor-and-compare survived and is equivalent (round-half-up).

## Not verified
- **Nobody heard it.** Audio was checked only by recording the frequencies the page asks the oscillators for, not by listening. Whether the pure/tempered beating is clear, or the volume sensible, is unknown.
- Only Chromium; no Firefox or Safari, and no real browser audio unlock behaviour.
- The oracle's ratios were fractions up to 16 over 1-15; larger terms and odd equaves beyond five were not swept.
- The 1e-9 tie tolerance in the engine was exercised by exact ties only, not by near-ties.
- No one has used it, so whether the record-holder framing helps is a guess.

Related: [[Tuning Fit]] · [[Tuning Fit - Origin & Decisions]] · [[Tuning Fit - Lessons & Observations]]
