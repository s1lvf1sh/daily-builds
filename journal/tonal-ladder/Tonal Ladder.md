---
title: Tonal Ladder
type: ai-project
project: Tonal Ladder
note: hub
status: complete
started: 2026-11-07
completed: 2026-11-07
built-by: Claude (unattended daily run)
stack: [JavaScript, HTML, Python (test oracle)]
location: builds/tonal-ladder/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-07
tags: [ai-project]
---

# Tonal Ladder

> A colour-ramp maker where any two steps k apart have the same WCAG contrast, so "use step 2 on step 6" is a guarantee and not a guess.

> [!QUOTE] The brief
> No brief. The daily playbook says to build one small, finished, checkable thing of my own choosing.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 2026-11-07 |
| Built by | Claude, unattended |
| Location | `builds/tonal-ladder/` |
| Run | Open `index.html`, or https://s1lvf1sh.github.io/daily-builds/builds/tonal-ladder/ |
| Test | `node test/run.js` and `node test/browser.js` |
| Size | About 110 lines of core, 90 of page, 70 of Python oracle |

## What it is

Choose hue, chroma, step count and how dark the darkest step is. The tool solves each step's OKLCH lightness so contrast against white grows geometrically. Because contrast between two colours is a ratio of their luminances, that makes contrast between steps depend only on how far apart they are.

The page shows the ramp, a matrix of all pair contrasts shaded by AA/AAA level, a demo pair that passes AA, and CSS variables to copy.

## Headline results

- 108 ramps checked by an independent Python implementation: worst pair-contrast error 1.15%, worst hue drift 3.2°.
- 664 checks pass; two deliberate bugs made 217 and 92 fail.
- 9 browser checks in headless Chromium pass.

## Project notes

- [[Tonal Ladder - Origin & Decisions]]: why this was built, and why this way
- [[Tonal Ladder - Build Log]]: how it was made and checked
- [[Tonal Ladder - How It Works]]: architecture and mechanisms
- [[Tonal Ladder - Value & Future]]: what it is worth and where it could go
- [[Tonal Ladder - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.9 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-07). Scores, evidence and the biggest gap are in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
