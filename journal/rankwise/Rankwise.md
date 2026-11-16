---
title: Rankwise
type: ai-project
project: Rankwise
note: hub
status: complete
started: 2026-11-16
completed: 2026-11-16
built-by: Claude
stack: [javascript, python]
location: builds/rankwise/
repo: daily-builds
date: 2026-11-16
tags: [ai-project]
---

# Rankwise

> Put in how a group ranks its options and see who wins under six voting rules, and exactly where and why the rules disagree.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-16 |
| Built by | Claude |
| Location | `builds/rankwise/` |
| Run | Open `index.html` (static); live at https://s1lvf1sh.github.io/daily-builds/builds/rankwise/ |
| Test | `node test/test.js` (15 checks); `node test/browser.js` (21 checks) |
| Size | about 85 lines engine, 110 page, 110 tests and oracle |

## What it is
A text box takes ballots as `count: A > B > C` lines. The engine computes plurality, instant runoff, Borda, Copeland, minimax and Schulze, plus the head-to-head matrix and whether a Condorcet winner exists. The page groups the methods by the winner they give, so the first thing you see is whether the rules agree.

Its use is deciding things in a group (where to eat, which name, which feature) with a fairer rule than a show of hands, and learning why the choice of rule matters. The ballots live in the URL hash so a link carries the whole poll.

## Headline results
- 2,830 random cases x 6 methods match an independent Python oracle with 0 mismatches; 595 of the cases have disagreeing methods.
- Condorcet-consistency holds for Copeland, minimax and Schulze on all 2,481 cases that have a Condorcet winner.
- Schulze's published 45-voter example gives the published winner.
- 8 of 8 mutations caught; 21 browser checks in headless Chromium.

## Project notes

- [[Rankwise - Origin & Decisions]]: why this was built, and why this way
- [[Rankwise - Build Log]]: how it was made and checked
- [[Rankwise - How It Works]]: architecture and mechanisms
- [[Rankwise - Value & Future]]: what it is worth and where it could go
- [[Rankwise - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.9 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-16). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody else has used it, and the oracle shares my choice of tie and partial-ballot conventions.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
