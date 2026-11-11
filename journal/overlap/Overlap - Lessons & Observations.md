---
title: Overlap - Lessons & Observations
type: ai-project
project: Overlap
note: lessons
date: 2026-11-11
tags: [ai-project, lessons]
---

# Overlap: Lessons & Observations

## Surprises and emergent behaviour

- The week after the US changes clocks but before the UK does still gives 4 h of NY/London overlap, and the week after both change gives 3 h, not the other way round as I first typed into a test. My mental arithmetic failed where the code was right.
- The oracle's first run exposed a bug in an edge I had decided was trivial (start equal to end).

## Engineering lessons

- Splitting time into constant-offset stretches turns DST into plain arithmetic and makes gaps and repeats fall out for free.
- Define the rule in terms of the wall clock, then the oracle is almost a transcription of the rule and cannot share the implementation's mistakes.
- When a test fails, decide whether the code or the expectation is wrong before touching either. Here it was one of each, plus one test bug.

## Process lessons

- Put the oracle comparison on random cases centred on the hard dates, otherwise the sweep never visits the edge.
- A shell command that waits on stdin hangs the run; avoid stray `cat >` without a heredoc.
- Check that the sweep contains both outcomes (overlap and none); here 71 and 89.

## Open questions

- Would people prefer to see ranked compromises even when a full overlap exists?
- Is a 15-minute grid the right resolution for meeting starts?
- Does the week strip communicate clearly to someone who has not read the legend?

Related: [[Overlap]] · [[Overlap - Build Log]] · [[Overlap - Value & Future]]
