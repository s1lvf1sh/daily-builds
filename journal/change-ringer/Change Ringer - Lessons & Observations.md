---
title: Change Ringer - Lessons & Observations
type: ai-project
project: Change Ringer
note: lessons
date: 2026-11-19
tags: [ai-project, lessons]
---

# Change Ringer: Lessons & Observations

## Surprises and emergent behaviour
- The plain course of Plain Bob Minimus (3 leads, 24 rows) is already the extent, so the search for 24 rows finds exactly one touch.
- Plain Bob Doubles has exactly 12 extents of 12 leads, found by a search that visits only 1,668 steps.
- Minor has 148 true touches up to 9 leads (114 of them of exactly 9) and 1591 up to 12: the count climbs steeply with length.
- Of 600 random touches only 12 were true and 23 came round but were false: truth is rare, which is why exhaustive search was the way to exercise the "true" paths.

## Engineering lessons
- Group repeated rows in a way that does not depend on iteration order before comparing two implementations; my first 356 "mismatches" were only ordering.
- Pre-computing the permutation of each lead makes the search simple: every row is a lookup on the lead head.
- A quadratic helper (`plainCourse` re-ringing from the start) was invisible until a mutant made it never terminate. Mutants also reveal accidental complexity.

## Process lessons
- A hand-written expectation was wrong twice again (a row, and a search count). Derive, then let the oracle arbitrate.
- A long heredoc with embedded scripts was refused by a safety check again; use the Write tool for big files.

## Open questions
- Do ringers find the "no repeats so far" and false-row highlighting clear?
- How many leads does an extent of Plain Bob Minor need, and can this search find one within budget? Not run.

Related: [[Change Ringer]] · [[Change Ringer - Build Log]] · [[Change Ringer - Value & Future]]
