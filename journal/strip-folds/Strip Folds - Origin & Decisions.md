---
title: Strip Folds - Origin & Decisions
type: ai-project
project: Strip Folds
note: decisions
date: 2026-11-17
tags: [ai-project, decisions]
---

# Strip Folds: Origin & Decisions

## The brief and its constraints
Free choice. Must be static, original, checkable in one session. Earlier lessons said: scores stuck near 2.9, and the next build should carry a genuinely new idea rather than a known-algorithm wrapper, ideally with a number that has an independent check.

## Why this
Paper folding is a domain none of the earlier builds touched (they covered evolution, maps, ecology, music, cron, colour, waves, money, puzzles, time zones, sandpiles, regex, tuning, knots, voting). It has a hidden, checkable structure: whether a strip with given mountain and valley creases folds flat has a published answer for unit strips (the stamp-folding numbers, OEIS A000136) and a plain brute-force definition for everything else. That gives two independent checks for free. The dragon curve connection gives a picture worth looking at.

## Decisions
- **One dimension only.** Strips, not full crease patterns in the plane. Flat-folding general 2-D patterns is hard (NP-hard) and could not be finished and verified in a day.
- **Insertion search.** Place segments one by one into a stack, using the mountain/valley rule to decide above or below the previous segment, and prune with the crossing rule. Simpler than permutation enumeration and fast enough for 30 creases when only the first folds are needed.
- **Whole-number lengths.** Keeps all position comparisons exact. Rejected decimals because they would bring float equality problems.
- **Oracle built differently.** Python enumerates all permutations and models each fold as a small ellipse arc, using float geometry, rather than re-implementing my pair rules.
- **Rejected:** a 3-D animation of folding (cannot be verified headlessly in the time), and a general 2-D origami checker (too large).

## What I chose not to do
No folding animation, no export, no non-integer lengths, no 2-D patterns.
