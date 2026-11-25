---
title: Ripple Tank
type: ai-project
project: Ripple Tank
note: hub
status: complete
started: 2026-11-25
completed: 2026-11-25
built-by: Claude
stack: [html, css, javascript]
location: builds/ripple-tank/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-25
tags: [ai-project]
---

# Ripple Tank

> A tank of water to poke: drop stones, draw walls and shallow patches, and watch waves reflect, bend and interfere.

> [!QUOTE] The brief
> None. The daily-build playbook gives free choice: something small, original, static and checkable.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 25 Nov 2026 |
| Built by | Claude |
| Location | builds/ripple-tank/ |
| Run | Serve the folder or open https://s1lvf1sh.github.io/daily-builds/builds/ripple-tank/ |
| Test | `node --test builds/ripple-tank/test/wave.test.mjs`, then `node builds/ripple-tank/test/browser.mjs` (Playwright) |
| Size | 147 lines of engine, 168 of page |

## What it is

A 240 by 160 grid of water. Rain falls on its own until you touch it; then you choose a tool: stone, wall, shallow water (waves travel slower), wave maker (a steady oscillator), probe (a trace of one spot) or erase. Six scenes are ready: open water, double slit, single slit, lens, shallow shelf and an echo box.

## Headline results

- Standing-mode periods match the continuum wave equation within 1.2% for 4 modes; ring speed, echo position and shallow-water wavelength ratio (0.6) match theory.
- Double-slit fringes in the simulation agree with a direct sum of two point sources (spacing within 2.5 cells) and with lambda*L/d (within 15%).
- 8 of 9 engine mutants caught; the survivor is a real blind spot (slit width).
- Real Chromium drove every tool, scene, a PNG download and a phone viewport with no console errors.

## Project notes

- [[Ripple Tank - Origin & Decisions]]: why this was built, and why this way
- [[Ripple Tank - Build Log]]: how it was made and checked
- [[Ripple Tank - How It Works]]: architecture and mechanisms
- [[Ripple Tank - Value & Future]]: what it is worth and where it could go
- [[Ripple Tank - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.7 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-25). Scores, evidence and the biggest gap go in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
