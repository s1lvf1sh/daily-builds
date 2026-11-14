---
title: Tuning Fit - Lessons & Observations
type: ai-project
project: Tuning Fit
note: lessons
date: 2026-11-14
tags: [ai-project, lessons]
---

# Tuning Fit: Lessons & Observations

## Surprises and emergent behaviour
- For the 5-limit set the record-holders were 1, 2, 3, 5, 7, 12, 19, 31, 34, 53: 34 appears between 31 and 53, which I would not have listed from memory.
- Exact half-way ties exist for composite equaves (equave 4/1, ratio 2/1, odd N), so tie rules matter once the equave is not 2.

## Engineering lessons
- Exact integer comparison (r^(2n) against E^(2m+1)) makes a clean oracle for "nearest" without any floating point.
- My three hand-written expected values were wrong (signs and one figure). Derive expectations from arithmetic, and let an exact oracle arbitrate.
- A test that only checks inequalities (rms <= max) leaves values unconstrained; a mutant exposed it.

## Process lessons
- Stubbing `AudioContext` and recording requested frequencies is a cheap way to test audio logic without ears, but it is not a listening test; say so.

## Open questions
- Do record-holders match what a practising microtonalist wants, or would weighted error rank differently?
- Is the pure/tempered beating audible enough at the default volume?

Related: [[Tuning Fit]] · [[Tuning Fit - Build Log]] · [[Tuning Fit - Value & Future]]
