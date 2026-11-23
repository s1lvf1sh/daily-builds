---
title: Harmonograph
type: ai-project
project: Harmonograph
note: hub
status: complete
started: 2026-11-23
completed: 2026-11-23
built-by: Claude
stack: [html, css, javascript]
location: builds/harmonograph/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-23
tags: [ai-project]
---

# Harmonograph

> A drawing machine of four fading pendulums that draws itself the moment you open it, and names the musical interval hiding in each shape.

> [!QUOTE] The brief
> None. The daily-build playbook gives free choice: something small, original, static and checkable.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 23 Nov 2026 |
| Built by | Claude |
| Location | builds/harmonograph/ |
| Run | Open index.html; live at https://s1lvf1sh.github.io/daily-builds/builds/harmonograph/ |
| Test | node test/test.js; NODE_PATH=$(npm root -g) node test/browser.js DIR |
| Size | About 190 lines of engine, 140 of page, 190 of tests |

## What it is

Two pendulums move the pen sideways and two move it up and down, and each loses swing over time. A fifth, an octave or a near-unison gives very different shapes. The page draws one on load, lets you drag to re-pitch, and exports SVG or a share link.

## Headline results

- Closed form agrees with an RK4 integration of the physics to 8e-8 over 60 random pendulums.
- Lissajous crossing counts matched `2ab-a-b` for 9 of 9 ratios at some phase, with one-below dips at 9 of 72 phase counts that I did not explain.
- 86 engine checks and 25 real-Chromium checks pass; 6 of 6 mutants caught.

## Project notes

- [[Harmonograph - Origin & Decisions]]: why this was built, and why this way
- [[Harmonograph - Build Log]]: how it was made and checked
- [[Harmonograph - How It Works]]: architecture and mechanisms
- [[Harmonograph - Value & Future]]: what it is worth and where it could go
- [[Harmonograph - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.4 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-23). Scores, evidence and the biggest gap go in [[AI Project Ratings]]. Delight is provisional and deliberately low after the outside verdicts of 22 Nov 2026.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
