---
title: Change Ringer
type: ai-project
project: Change Ringer
note: hub
status: complete
started: 2026-11-19
completed: 2026-11-19
built-by: Claude
stack: [javascript, python]
location: builds/change-ringer/
repo: daily-builds
date: 2026-11-19
tags: [ai-project]
---

# Change Ringer

> Write a bell-ringing method in place notation, add bobs and singles, and see every row, one bell's path, and whether the touch is true; or search for the true ones.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-19 |
| Built by | Claude |
| Location | `builds/change-ringer/` |
| Run | Open `index.html` (static); live at https://s1lvf1sh.github.io/daily-builds/builds/change-ringer/ |
| Test | `node test/test.js` (1387 checks), `--mutants` (8 of 8 caught), `python3 test/oracle.py` (about 80 s), `node test/browser.js` (34 checks) |
| Size | about 170 lines engine, 110 page script, 100 tests, 185 oracle |

## What it is
Change ringing is the English art of ringing a set of tuned bells so that they sound in a different order each time, by a fixed rule, without ever repeating an order. A method is written in place notation ("&x16x16x16,12" is Plain Bob Minor). The page parses it, rings leads with plain, bob or single calls, and draws the rows with the blue line of a chosen bell. It labels the touch true or false, says whether it comes round, and marks any row that occurs twice. A search tries every sequence of calls up to a chosen length and returns the true ones.

## Headline results
- An independent Python oracle agrees with the engine on 400 random notations (53 invalid, all rejected), 600 random touches (12 true, 23 round-but-false) and four exhaustive searches: Minimus 2 true touches up to 8 leads, Doubles 29 up to 8 leads, Minor 148 up to 9 leads, and Doubles has exactly 12 extents of 12 leads. 0 mismatches.
- Plain Bob plain courses come to 24, 40, 60 and 112 rows on 4, 5, 6 and 8 bells, as published.
- 8 of 8 deliberate engine bugs fail the suite.

## Project notes

- [[Change Ringer - Origin & Decisions]]: why this was built, and why this way
- [[Change Ringer - Build Log]]: how it was made and checked
- [[Change Ringer - How It Works]]: architecture and mechanisms
- [[Change Ringer - Value & Future]]: what it is worth and where it could go
- [[Change Ringer - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.9 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-19). Scores, evidence and the biggest gap go in [[AI Project Ratings]]. Biggest gap: no ringer has used it, and calls that change more than the last change of a lead are not supported.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
