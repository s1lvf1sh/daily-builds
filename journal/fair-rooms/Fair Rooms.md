---
title: Fair Rooms
type: ai-project
project: Fair Rooms
note: hub
status: complete
started: 2026-11-18
completed: 2026-11-18
built-by: Claude
stack: [javascript, python]
location: builds/fair-rooms/
repo: daily-builds
date: 2026-11-18
tags: [ai-project]
---

# Fair Rooms

> Flatmates say what each room is worth to them; the tool assigns rooms and sets prices so nobody envies anyone else's room and the least-happy person is as happy as possible.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-18 |
| Built by | Claude |
| Location | `builds/fair-rooms/` |
| Run | Open `index.html` (static); live at https://s1lvf1sh.github.io/daily-builds/builds/fair-rooms/ |
| Test | `node test/test.js` (22 checks, one of which compares 420 oracle cases); `node test/browser.js` (21 checks) |
| Size | about 125 lines engine, 70 page script, 80 tests, 65 oracle |

## What it is
Two to six people enter a bid for every room (what it is worth to them, in the rent's currency) and the total rent. The engine picks the assignment with the largest total value, then solves a small exact linear program for prices that sum to the rent, leave nobody wanting another room, and maximise the minimum surplus. The page shows each person's room and price, and a table of every person's surplus in every room so the no-envy claim can be read directly.

## Headline results
- 420 oracle cases (150 with 2 people, 210 with 3, 60 with 4): the optimum surplus matches an independent Python solver that tries every assignment and enumerates polyhedron vertices, 0 mismatches. 250 optima are non-integer fractions, 152 are negative (rent above every bid).
- 600 random cases up to 6 people: exact envy-freeness and exact total in every one; separate timing of 30 instances at 5 and 6 people: 9 ms at most.
- 6 of 6 mutations caught; 21 checks in headless Chromium.

## Project notes

- [[Fair Rooms - Origin & Decisions]]: why this was built, and why this way
- [[Fair Rooms - Build Log]]: how it was made and checked
- [[Fair Rooms - How It Works]]: architecture and mechanisms
- [[Fair Rooms - Value & Future]]: what it is worth and where it could go
- [[Fair Rooms - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**3.1 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-18). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has used it, and bids are only as honest as the people making them, which the tool cannot test.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
