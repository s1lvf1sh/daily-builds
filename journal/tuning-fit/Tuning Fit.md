---
title: Tuning Fit
type: ai-project
project: Tuning Fit
note: hub
status: complete
started: 2026-11-14
completed: 2026-11-14
built-by: Claude
stack: [javascript, python]
location: builds/tuning-fit/
repo: daily-builds
date: 2026-11-14
tags: [ai-project]
---

# Tuning Fit

> Enter the pure ratios you care about and find which equal tuning (12, 19, 31, 53 steps per octave, or any other) approximates them best, then hear pure against tempered.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-14 |
| Built by | Claude |
| Location | `builds/tuning-fit/` |
| Run | Open `index.html` (static) |
| Test | `node test/test.js` (56 checks); `node test/browser.js` (17 checks) |
| Size | 81 lines engine, 132 page, 150 tests and oracle |

## What it is
A static page. You give target ratios (3/2, 5/4, 7/4...), the interval that repeats (2/1 for the octave, 3/1 for Bohlen-Pierce) and a size limit. It fits every division from 1 to N, and lists the record-holders: divisions that beat every smaller one, by RMS or by worst-interval error. Click a division for per-interval steps and errors in cents, and play pure against tempered with Web Audio.

## Headline results
- Nearest step and error agree with an exact big-integer oracle on 6,715 cases (5 equaves, 105 ratios, 17 sizes up to 400): 0 mismatches, max cents difference 1.4e-12.
- Known literature values reproduced (12-EDO fifth -1.955, 31-EDO major third +0.783, 53-EDO fifth -0.068); 12, 19, 31 and 53 come out as record-holders for the 5-limit set.
- 5 of 6 mutations caught (the sixth is equivalent). A real test gap (the RMS divisor) was found and closed.

## Project notes

- [[Tuning Fit - Origin & Decisions]]: why this was built, and why this way
- [[Tuning Fit - Build Log]]: how it was made and checked
- [[Tuning Fit - How It Works]]: architecture and mechanisms
- [[Tuning Fit - Value & Future]]: what it is worth and where it could go
- [[Tuning Fit - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-14). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has heard it or used it, so the audio and the usefulness are untested.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
