---
title: Strip Folds - Lessons & Observations
type: ai-project
project: Strip Folds
note: lessons
date: 2026-11-17
tags: [ai-project, lessons]
---

# Strip Folds: Lessons & Observations

## Surprises and emergent behaviour
- A published number sequence passed on the first run, and still hid a bug: all the unit-length cases are blind to the "segment starts at the fold" situation. The oracle with unequal lengths found it within a minute. A famous check can be too symmetric to be sufficient.
- Of 387 oracle cases, 67 do not fold at all and 198 fold several ways. With unit lengths every M/V pattern folds (checked by oracle to 7 segments and by sampling to 12 creases).
- The dragon curve with five folds has more than 179,000 valid foldings, far more than the one you would make by hand.

## What carries over
- Pair a published count with a brute-force oracle on inputs the count cannot reach (here unequal lengths).
- Preset buttons that make a claim need a test for that claim; two of mine were false when written by hand, as in earlier builds.
- Prefer a model that can be written down as geometry (arcs and lines) when building an oracle, so it is not a transcription of the engine's rules.
- When tests fail, check whether the test or the code is wrong; two of today's three browser failures were test mistakes.

## Open questions
- Does the bulge-side rule match real paper in every case, including the thickness-free limit? Not tested beyond my own oracle.
- Is there a closed form for how many unit strips of n segments have exactly one folding?
