---
title: Knotwork
type: ai-project
project: Knotwork
note: hub
status: complete
started: 2026-11-15
completed: 2026-11-15
built-by: Claude
stack: [javascript, python]
location: builds/knotwork/
repo: daily-builds
date: 2026-11-15
tags: [ai-project]
---

# Knotwork

> A Celtic-knot maker where you place walls on a grid, strands bounce and weave, and the page counts the threads and can search for a layout that is one endless strand.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-15 |
| Built by | Claude |
| Location | `builds/knotwork/` |
| Run | Open `index.html` (static) |
| Test | `node test/test.js` (19 checks); `node test/browser.js` (16 checks) |
| Size | 149 lines engine, 70 page, 163 tests and oracle |

## What it is
A static page with a grid of squares. The lines between squares are clickable: each one you click becomes a wall. Inside every square four short diagonal pieces join the midpoints of its sides; where two squares meet they continue straight, and at a wall they turn back. That is all a Celtic knot is, and the whole picture falls out of it: the strands, the crossings, and an over-under weave that alternates all the way round.

The page colours every strand, lists their lengths, and has a "Make one strand" button that searches for walls giving a single endless thread. You can lock in mirror or four-fold symmetry, download the knot as SVG, or copy a link that stores the grid in the address.

## Headline results
- An empty a x b grid gives exactly gcd(a,b) strands: all 576 sizes up to 24 x 24 agree with the engine.
- On 1,500 random wall layouts an independent Python billiard oracle agrees on strand count and every strand length (0 mismatches); over/under alternates round every strand in both implementations.
- The one-strand search succeeded on 10 of 10 test sizes without symmetry, each confirmed by the oracle.
- Real Chromium drive: 16 checks pass; desktop and phone screenshots read.

## Project notes

- [[Knotwork - Origin & Decisions]]: why this was built, and why this way
- [[Knotwork - Build Log]]: how it was made and checked
- [[Knotwork - How It Works]]: architecture and mechanisms
- [[Knotwork - Value & Future]]: what it is worth and where it could go
- [[Knotwork - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**3.0 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-15). Scores, evidence and the biggest gap go in [[AI Project Ratings]]. Rate only what was verified.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
