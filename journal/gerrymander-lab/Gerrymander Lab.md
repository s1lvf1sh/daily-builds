---
title: Gerrymander Lab
type: ai-project
project: Gerrymander Lab
note: hub
status: complete
started: 2026-11-28
completed: 2026-11-28
built-by: Claude
stack: [html, css, javascript]
location: builds/gerrymander-lab/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-28
tags: [ai-project]
---

# Gerrymander Lab

> Cut a grid of voters into districts yourself, then see how your map compares with every possible map, and whether the side with fewer voters can still win most seats.

> [!QUOTE] The brief
> None. The daily-build playbook gives free choice: something small, original, static and checkable.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 28 Nov 2026 |
| Built by | Claude |
| Location | builds/gerrymander-lab/ |
| Run | Open https://s1lvf1sh.github.io/daily-builds/builds/gerrymander-lab/ (serve the folder over http to run it locally, because it uses an ES module) |
| Test | `node --test builds/gerrymander-lab/test/gerry.test.mjs`, then `NODE_PATH=$(npm root -g) node builds/gerrymander-lab/test/browser.mjs` (Playwright) |
| Size | about 150 lines of engine, 150 of page, 100 of Python oracle |

## What it is

A 3×3 to 6×6 grid of orange and teal voters. You paint districts (connected, exactly n cells each) by dragging and flip voters by clicking. The page tells you the winner of every district, and draws the histogram of seats over **all** valid maps (10, 117, 4,006 or 451,206 of them), marks where your map sits, and has buttons that load the best map for either side. A standing challenge asks you to make the side with fewer voters win a majority of seats, and says whether that is possible for this arrangement.

## Headline results

- Cut counts equal the published sequence 10, 117, 4006, 451206.
- Full seat histograms equal an independent bitmask-DP oracle on 60 maps (sizes 3 to 5) and 6 maps of size 6.
- Real Chromium: 22 checks passed, including drag painting, share links and the 6×6 count in the page.
- Not done: nobody has used it; no compactness or fairness measure.

## Project notes

- [[Gerrymander Lab - Origin & Decisions]]: why this was built, and why this way
- [[Gerrymander Lab - Build Log]]: how it was made and checked
- [[Gerrymander Lab - How It Works]]: architecture and mechanisms
- [[Gerrymander Lab - Value & Future]]: what it is worth and where it could go
- [[Gerrymander Lab - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-28). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has used it, so Use and Delight are guesses.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
