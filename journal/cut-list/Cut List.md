---
title: Cut List
type: ai-project
project: Cut List
note: hub
status: complete
started: 2026-11-20
completed: 2026-11-20
built-by: Claude
stack: [javascript, python]
location: builds/cut-list/
repo: daily-builds
date: 2026-11-20
tags: [ai-project]
---

# Cut List

> Give it the pieces you need and the board lengths the shop sells; it finds the plan that buys the least, proves nothing cheaper exists, and draws every board.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-20 |
| Built by | Claude |
| Location | `builds/cut-list/` |
| Run | Open `index.html` (static); live at https://s1lvf1sh.github.io/daily-builds/builds/cut-list/ |
| Test | `node test/test.js` (1230 checks), `--mutants` (9 of 9 caught), `python3 test/oracle.py` (400 cases, 3 s), `node test/browser.js` (24 checks) |
| Size | 187 lines engine, 93 page script, 88 tests, 40 oracle |

## What it is
The one-dimensional cutting-stock problem: cut many pieces from stock lengths (boards, pipe, trim) while buying as little as possible. You type pieces ("36 x 4"), the board lengths on sale (optionally with prices), and your saw kerf. The page returns a shopping list and one drawn strip per board, with every cut and the offcut. It works in inches (with fractions like 3 1/2), millimetres or centimetres.

The answer is exact for the jobs a person would enter: it searches over how many of each piece go on each board and proves the minimum cost, with fewest boards as the tie-break. If a job is too big to prove within three seconds it says "not proven cheapest", shows a first-fit plan, and offers a longer search.

## Headline results
- An independent Python subset-DP oracle agrees with the engine on all 400 random jobs (1 to 13 pieces, 1 to 3 board lengths, 170 priced, kerf 0 to 4): 0 mismatches. Exact beat first-fit decreasing on 167 of them, so the sweep contains jobs where cleverness matters.
- 9 of 9 deliberately broken engines are caught.
- 24 checks in headless Chromium read the drawn boards back and verify they fit; screenshots at phone and desktop width were read.

## Project notes

- [[Cut List - Origin & Decisions]]: why this was built, and why this way
- [[Cut List - Build Log]]: how it was made and checked
- [[Cut List - How It Works]]: architecture and mechanisms
- [[Cut List - Value & Future]]: what it is worth and where it could go
- [[Cut List - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.9 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-20). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has cut wood from its plans.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
