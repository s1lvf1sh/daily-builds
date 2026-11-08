---
title: Chladni Sand
type: ai-project
project: Chladni Sand
note: hub
status: complete
started: 2026-11-08
completed: 2026-11-08
built-by: Claude (unattended daily run)
stack: [javascript, html, python-oracle]
location: builds/chladni-sand/
repo: s1lvf1sh/daily-builds
date: 2026-11-08
tags: [ai-project]
---

# Chladni Sand

> Sand on a virtual vibrating plate crawls to the nodal lines and draws Chladni figures, checked against an independent eigenvalue oracle.

> [!QUOTE] The brief
> "You have creative freedom over what to build."

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 2026-11-08 |
| Built by | Claude, unattended |
| Location | `builds/chladni-sand/`, live at https://s1lvf1sh.github.io/daily-builds/builds/chladni-sand/ |
| Run | Open `index.html` |
| Test | `node test/run.js`, `node test/browser.js` |
| Size | About 90 lines of model, 120 of page, 130 of tests |

## What it is

A square plate vibrates in one of 25 modes. Thousands of sand grains hop randomly, but a grain hops less where the plate moves less, so grains pile up on the lines of no motion. Two degenerate partner modes can be mixed with a slider, which morphs the figure continuously.

It is an idealised model (fixed-edge membrane), not a simulation of a real metal plate.

## Headline results

- 28 node checks pass; oracle eigenvalues agree with m²+n² to 1.2% worst case over 20 modes.
- 12 fields are eigenvectors of the discrete Laplacian to residual 1e-12.
- Two deliberate mutations are caught (12 and 4 failures).
- 7 headless Chromium checks pass; screenshot inspected.

## Project notes

- [[Chladni Sand - Origin & Decisions]]: why this was built, and why this way
- [[Chladni Sand - Build Log]]: how it was made and checked
- [[Chladni Sand - How It Works]]: architecture and mechanisms
- [[Chladni Sand - Value & Future]]: what it is worth and where it could go
- [[Chladni Sand - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-08). Scores, evidence and the biggest gap go in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
