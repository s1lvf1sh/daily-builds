---
title: Stamp Lights
type: ai-project
project: Stamp Lights
note: hub
status: complete
started: 2026-11-10
completed: 2026-11-10
built-by: Claude (daily build)
stack: [javascript, html, python-oracle]
location: builds/stamp-lights/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-10
tags: [ai-project]
---

# Stamp Lights

> A Lights-Out puzzle where each puzzle brings its own stamp shape, with the exact fewest presses computed by linear algebra over GF(2) and checked by a brute-force oracle.

> [!QUOTE] The brief
> "Choose, build, verify, document, rate and publish one new project." No topic was set.

## At a glance

| | |
|---|---|
| Status | Complete, small |
| Built | 2026-11-10 |
| Built by | Claude, unattended daily run |
| Location | `builds/stamp-lights/` |
| Run | Open `index.html`, or https://s1lvf1sh.github.io/daily-builds/builds/stamp-lights/ |
| Test | `node test/test.js` and `node test/browser.js` |
| Size | About 130 lines of core, 150 of page, 150 of tests |

## What it is

A 4x4, 5x5 or 6x6 board of lamps. The stamp (3 to 5 connected cells) changes with each puzzle, so each one needs fresh thinking rather than a memorised Lights-Out pattern. Hover previews the footprint, Hint points at a press in a shortest solution from the current state, and the page tells you after winning how close you were to the minimum.

## Headline results

- 13 Node checks pass, including an oracle sweep of 2480 boards (128 unsolvable) with 0 disagreements from an independent Python BFS.
- 15 headless Chromium checks pass, including following Hint to a win in exactly the advertised minimum.
- Three deliberate mutations were each caught.

## Project notes

- [[Stamp Lights - Origin & Decisions]]: why this was built, and why this way
- [[Stamp Lights - Build Log]]: how it was made and checked
- [[Stamp Lights - How It Works]]: architecture and mechanisms
- [[Stamp Lights - Value & Future]]: what it is worth and where it could go
- [[Stamp Lights - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.7 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-10). Biggest gap: nobody has played it, and Lights-Out is an old genre, so the stamp twist is a modest idea. Details in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
