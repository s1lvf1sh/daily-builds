---
title: Tile Shifter
type: ai-project
project: Tile Shifter
note: hub
status: complete
started: 2026-11-24
completed: 2026-11-24
built-by: Claude
stack: [html, css, javascript]
location: builds/tile-shifter/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-24
tags: [ai-project]
---

# Tile Shifter

> Drag one dot on a tile and its twin edge moves too, so the whole plane stays tiled: an Escher-style tessellation toy.

> [!QUOTE] The brief
> None. The daily-build playbook gives free choice: something small, original, static and checkable.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 24 Nov 2026 |
| Built by | Claude |
| Location | builds/tile-shifter/ |
| Run | Serve the folder or open the live page: https://s1lvf1sh.github.io/daily-builds/builds/tile-shifter/ |
| Test | `node --test builds/tile-shifter/test/tile.test.mjs`, then `node builds/tile-shifter/test/browser.mjs` (Playwright) |
| Size | about 330 lines of engine, 180 of page |

## What it is

A tile is a hexagon or parallelogram whose opposite sides are the same wavy curve, shifted along. Because the curves match, copies fit together with no gaps. You drag the dots on the tile; the twin edge follows; the right-hand canvas shows the whole plane in three colours. A Shuffle button makes a random tile, "Breathe" moves every dot gently while the tiling stays exact, and you can download the tile (for cutting) or a tiled sheet as SVG, or copy a link that holds the exact tile.

## Headline results

- 64 random tiles, 9,600 random points, each covered by exactly one lattice copy, checked with a winding-number test that shares no code with the engine's crossing test. 0 failures.
- 10 of 11 engine mutants caught; the survivor is an equivalent mutant (a redundant area check).
- Real Chromium: 12 shuffled tilings had no unpainted pixel, a real mouse drag kept the tiling, the share link reopened the same tile.

## Project notes

- [[Tile Shifter - Origin & Decisions]]: why this was built, and why this way
- [[Tile Shifter - Build Log]]: how it was made and checked
- [[Tile Shifter - How It Works]]: architecture and mechanisms
- [[Tile Shifter - Value & Future]]: what it is worth and where it could go
- [[Tile Shifter - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-24). Scores, evidence and the biggest gap go in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
