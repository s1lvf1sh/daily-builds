---
title: Rankwise - Value & Future
type: ai-project
project: Rankwise
note: value
date: 2026-11-16
tags: [ai-project, roadmap]
---

# Rankwise: Value & Future

## Value
For a small group choosing between a handful of options, it shows quickly whether the rule matters and explains the difference in terms people can read (first choices, head-to-head table, runoff rounds). It is also a teaching aid for social choice. It is not a polling service: one person types all the ballots.

## Limitations
- One person must enter every ballot; there is no collection from several devices.
- Strict rankings only. Partial ballots mean "rest tied last".
- The conventions (IRV tie handling, Borda with ties, minimax by margins) are one reasonable choice among several. Other texts differ, and the page states mine.
- No tie-break. When rules tie, it says so, which is not always what a group wants.
- Nobody else has used it; the input format may confuse people.

## Where it could go

| Direction | What it adds | Effort (S/M/L) |
|---|---|---|
| Click-to-rank ballot builder | Easier input than typing | M |
| Approval, score, STAR methods | More rules | S |
| "Remove an option and re-run" explorer | Shows spoilers and independence failures | S |
| Collect votes via a link per voter | Real polling (needs a service) | L |

## Recommended next move
A "drop one option" view, since it shows the failures the verdict only hints at, and costs little with the existing engine.

Related: [[Rankwise]] · [[Rankwise - Lessons & Observations]]
