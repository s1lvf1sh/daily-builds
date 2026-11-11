---
title: Overlap - Build Log
type: ai-project
project: Overlap
note: build-log
date: 2026-11-11
tags: [ai-project, build-log]
---

# Overlap: Build Log

## Process

```mermaid
flowchart LR
  A[Plan] --> B[Build core] --> C[Oracle] --> D[Fix bug] --> E[Mutate] --> F[UI + browser] --> G[Document]
```

## Steps

1. Wrote `src/overlap.js`: offsets from `Intl`, `segments()` (constant-offset stretches, bisected to the minute), `workIntervals()`, `intersect()`, `slots()`/`bestSlots()`. A first manual check (NY + London in the US/UK DST mismatch week) matched my calculation.
2. Wrote `test/oracle.py` (per-minute `zoneinfo`) and `test/test.js` (hand facts plus a 160-case sweep piped to the oracle).
3. First run: 3 failures, sorted below.
4. Mutation testing, then `index.html` + `src/app.js`, then `test/browser.js`, screenshots read at desktop and 390 px.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| "24 hours" window (start == end) started at the start time instead of covering the calendar day | Oracle: 539 disagreements, e.g. LA person 17:00-17:00 expected working at Sunday 00:15 local | `start == end` now means 00:00 for 24 h | 0 disagreements. A real code bug found by the oracle |
| My hand-written expectation for the DST mismatch week was 13..16 UTC | Test failure | Re-derived: NY on EDT is 13-21 UTC, London on GMT is 9-17 UTC, overlap 13..17 | My arithmetic was wrong, not the code. Fixed the test |
| Auckland test window included a second Tuesday window | Test failure | Shortened the range in the test | Test bug |
| The slot list repeated the windows whenever everyone overlapped | Read the screenshot | Show compromises only when there is no full overlap | Cleaner answer |
| "No time works" printed in green | Read the screenshot | More specific CSS selector | Fixed |
| A stray `cat >` with no input hung one shell call | Tool timeout | Stopped the task | No effect on the build |

## Verification

- `node test/test.js`: 21 passed, 0 failed (about 6 s). 160 sweep cases: 71 with overlap, 89 empty.
- Mutations, each run once against the tests: frozen UTC offset (6 failures), overnight ignored (3), weekday from the wrong date (4), inclusive end (8), slot test checks only the start (1, the oracle). All caught; the file was restored and the suite is green again.
- `node test/browser.js`: 14 passed in headless Chromium with the browser time zone forced to Paris. Screenshots at 1000 px and 390 px were looked at.

## Not verified

- Only 2026 dates were swept; no other year.
- Both sides read tz data from copies on this machine (ICU 2026e in Node, system tzdata in Python). A rule both get wrong would pass.
- Chromium only; no Firefox or Safari, and no real phone.
- No person has used it. The week strips' readability and the wording of the answer are my judgement from screenshots.
- Zones with seconds-level historical offsets (pre-1900) are out of scope.
- The `from` date input is read as a date in the view zone; I did not test a view zone with a midnight DST change in the browser, only in the library (Havana appears in the sweep).

Related: [[Overlap]] · [[Overlap - Origin & Decisions]] · [[Overlap - Lessons & Observations]]
