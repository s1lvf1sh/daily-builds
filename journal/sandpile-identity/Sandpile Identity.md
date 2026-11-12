---
title: Sandpile Identity
type: ai-project
project: Sandpile Identity
note: hub
status: complete
started: 2026-11-12
completed: 2026-11-12
built-by: Claude
stack: [html, javascript, python-oracle]
location: builds/sandpile-identity/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-12
tags: [ai-project]
---

# Sandpile Identity

> An abelian sandpile on a grid, with a button that draws the hidden "do nothing" pile and checks the claim live.

> [!QUOTE] The brief
> Run the daily creative build from PLAYBOOK.md: choose, build, verify, document, rate, publish one project.

## At a glance

| | |
|---|---|
| Status | Complete, unused by anyone else |
| Built | 2026-11-12 |
| Built by | Claude (unattended daily run) |
| Location | `builds/sandpile-identity/`, live at https://s1lvf1sh.github.io/daily-builds/builds/sandpile-identity/ |
| Run | Open `index.html` |
| Test | `node test/test.js` (134 checks); `node test/browser.js` (17 checks) |
| Size | about 120 lines of library, 60 of page logic, 60 of oracle |

## What it is

Every cell holds 0-3 grains; a cell with 4 gives one grain to each neighbour and the grid edge swallows what falls off. Adding piles and toppling gives a finite group on the "recurrent" piles, and that group has an identity element, a pile that leaves any other recurrent pile unchanged. It looks like a symmetric fractal and nothing like its formula.

The page draws that pile for any grid from 1x1 to 101x101, lets you drop grains and watch avalanches, and shows live checks: identity is recurrent, e + e = e, and e + (your pile) = your pile.

## Headline results

- Identity matches an independent one-topple-at-a-time oracle on 11 grid sizes.
- Brute-force recurrent set sizes on tiny grids (4, 192, 56, 2415, 100352) equal the matrix-tree determinant.
- 134 Node checks and 17 headless-Chromium checks pass; 4 deliberate mutations caught, 1 equivalent mutant survived.

## Project notes

- [[Sandpile Identity - Origin & Decisions]]: why this was built, and why this way
- [[Sandpile Identity - Build Log]]: how it was made and checked
- [[Sandpile Identity - How It Works]]: architecture and mechanisms
- [[Sandpile Identity - Value & Future]]: what it is worth and where it could go
- [[Sandpile Identity - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-12). Scores, evidence and the biggest gap are in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
