---
title: Lichen Garden
type: ai-project
project: Lichen Garden
note: hub
status: complete
started: 2026-11-26
completed: 2026-11-26
built-by: Claude
stack: [html, css, javascript]
location: builds/lichen-garden/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-26
tags: [ai-project]
---

# Lichen Garden

> Three lichens grow on one shared calendar; plant spores today and see what became of them, now or in a forecast.

> [!QUOTE] The brief
> None. The daily-build playbook gives free choice: something small, original, static and checkable.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 26 Nov 2026 |
| Built by | Claude |
| Location | builds/lichen-garden/ |
| Run | Serve the folder or open https://s1lvf1sh.github.io/daily-builds/builds/lichen-garden/ |
| Test | `node --test builds/lichen-garden/test/lichen.test.mjs`, then `node builds/lichen-garden/test/browser.mjs` (Playwright) |
| Size | 83 lines of engine, 104 of page, 70 of Python oracle |

## What it is

A 48 by 48 patch of stone. Sage, ochre and slate lichens spread, fight in a rock-paper-scissors cycle, and suffer winter frost on their exposed edges. The calendar is real and shared: day 0 is 26 Nov 2026 and every random choice is a hash of the day and the cell, so everyone sees the same garden on the same date. You add three spores a day of your own (kept in your browser, shareable as a link) and can scrub backwards or forwards in time.

## Headline results

- The JS engine and an independent Python re-implementation agree cell for cell on 14 random worlds with random spore logs.
- 10 of 10 hand-made engine mutants were caught.
- Real Chromium: canvas pixel counts equal the engine's species counts, real clicks plant and refuse spores, share link and reload restore the garden, no overflow at 375 px.
- Not done: no person has tried it, so whether it is worth returning to is a guess.

## Project notes

- [[Lichen Garden - Origin & Decisions]]: why this was built, and why this way
- [[Lichen Garden - Build Log]]: how it was made and checked
- [[Lichen Garden - How It Works]]: architecture and mechanisms
- [[Lichen Garden - Value & Future]]: what it is worth and where it could go
- [[Lichen Garden - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.5 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-26). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has tried it, so Delight and "would you come back tomorrow" are guesses.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
