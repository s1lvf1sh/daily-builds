---
title: Strip Folds
type: ai-project
project: Strip Folds
note: hub
status: complete
started: 2026-11-17
completed: 2026-11-17
built-by: Claude
stack: [javascript, python]
location: builds/strip-folds/
repo: daily-builds
date: 2026-11-17
tags: [ai-project]
---

# Strip Folds

> Write mountain and valley folds along a strip of paper and learn whether it folds flat, in how many ways, and what shape it makes when opened to right angles.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-17 |
| Built by | Claude |
| Location | `builds/strip-folds/` |
| Run | Open `index.html` (static); live at https://s1lvf1sh.github.io/daily-builds/builds/strip-folds/ |
| Test | `node test/test.js` (37 checks); `node test/browser.js` (21 checks) |
| Size | about 150 lines engine, 140 page, 100 tests, 80 oracle |

## What it is
You type a crease string such as `VVMVVMM` (and optionally whole-number segment lengths). The engine searches every way the segments can be stacked so that no fold cuts through paper. The page reports the count, lets you step through the stackings in a side view, and draws the strip opened to 90 degrees (V turns left, M turns right). Folding a strip in half repeatedly and opening it gives the dragon curve, which is one of the presets.

Use: origami and paper-folding hobbyists, teachers of the topic, and anyone who wonders why a given pattern will not fold flat. It is a niche tool.

## Headline results
- Summing the engine's counts over every M/V pattern of unit strips gives 1, 2, 6, 16, 50, 144, 462, 1392, 4536, 14060 for 1 to 10 segments, exactly the published stamp-folding numbers (OEIS A000136).
- 387 cases (all unit strips to 7 segments plus 260 random strips with unequal lengths) match an independent Python brute force over permutations: 0 mismatches; 67 cases are unfoldable and 198 have several foldings.
- The oracle found a real rule bug in my first engine (22 mismatches), which is now fixed.
- 6 of 6 mutations caught; 21 checks in headless Chromium.

## Project notes

- [[Strip Folds - Origin & Decisions]]: why this was built, and why this way
- [[Strip Folds - Build Log]]: how it was made and checked
- [[Strip Folds - How It Works]]: architecture and mechanisms
- [[Strip Folds - Value & Future]]: what it is worth and where it could go
- [[Strip Folds - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**3.0 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-17). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody else has used it, and the oracle and engine share my model of what "a fold cuts through paper" means.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
