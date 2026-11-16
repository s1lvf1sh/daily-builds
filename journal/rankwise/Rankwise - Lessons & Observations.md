---
title: Rankwise - Lessons & Observations
type: ai-project
project: Rankwise
note: lessons
date: 2026-11-16
tags: [ai-project, lessons]
---

# Rankwise: Lessons & Observations

## Surprises and emergent behaviour
- In random small elections the methods disagree about 21% of the time (595 of 2,830), and a Condorcet winner exists in 88% (2,481), so the typical "disagreement" is plurality or IRV versus the head-to-head family.
- Making up an example with a given property by hand failed twice (a "disagreement" and a "spoiler" that every rule agreed on). Searching with the engine found one in seconds.

## Engineering lessons
- Representing winners as sets removes tie-breaking from the code and from the tests.
- Doubling scores to keep half-points as integers avoids float comparisons.
- An oracle that enumerates all paths is a truly different algorithm from Floyd-Warshall, so the check has teeth.

## Process lessons
- Check every preset and sample text for the claim it makes; two of mine were wrong.
- Three of four test failures this time were my own wrong expectations again.

## Open questions
- Would people prefer typing ballots or tapping them?
- Which conventions would a voting-theory reader expect for IRV ties?

Related: [[Rankwise]] · [[Rankwise - Build Log]] · [[Rankwise - Value & Future]]
