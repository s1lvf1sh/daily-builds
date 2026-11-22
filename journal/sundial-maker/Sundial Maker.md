---
title: Sundial Maker
type: ai-project
project: Sundial Maker
note: hub
status: complete
started: 2026-11-22
completed: 2026-11-22
built-by: Claude (daily build, unattended)
stack: [html, css, javascript, python-oracle]
location: builds/sundial-maker/
repo: s1lvf1sh/daily-builds
date: 2026-11-22
tags: [ai-project]
---

# Sundial Maker

> Type your latitude and longitude and get a horizontal sundial to print at true size, with a live shadow and a correction to your watch.

> [!QUOTE] The brief
> "You have creative freedom over what to build." (Daily build playbook: one small, finished, original, static, checkable thing.)

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 22 Nov 2026 |
| Built by | Claude, unattended daily run |
| Location | `builds/sundial-maker/` |
| Run | Open `index.html`; live at https://s1lvf1sh.github.io/daily-builds/builds/sundial-maker/ |
| Test | `node test/test.js` (3493 checks), `NODE_PATH=$(npm root -g) node test/browser.js` (24 checks), `python3 test/oracle.py` |
| Size | 96 lines of engine, 221 of page, 212 of tests and oracle |

## What it is

A horizontal sundial is a flat plate with a style (a sloping edge parallel to the earth's axis) whose shadow points at the hour. This page computes the plate for any latitude from 5 to 80 degrees north or south: the hour lines, seven curves where the shadow of a nodus on the style falls on different dates, and the triangle to cut out for the gnomon. The SVG is in millimetres so it prints at true size, with a 50 mm bar to check the printer.

You can drag a clock slider and see the shadow move across the plate, read the dial's reading against your watch (longitude, daylight saving, equation of time), and see a 12-month correction row.

## Headline results

- Independent oracle with different formulas agrees on 165 hour-line cases and 1,416 nodus shadows (1e-6), both hemispheres.
- Declination and equation of time within 0.44 degrees and 0.79 min of a Meeus calculation for all of 2026; day length within 1.0 min when given the oracle's declination.
- 10 of 10 engine mutants caught; 24 browser checks pass.

## Project notes

- [[Sundial Maker - Origin & Decisions]]: why this was built, and why this way
- [[Sundial Maker - Build Log]]: how it was made and checked
- [[Sundial Maker - How It Works]]: architecture and mechanisms
- [[Sundial Maker - Value & Future]]: what it is worth and where it could go
- [[Sundial Maker - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**3.0 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-22). Scores, evidence and the biggest gap go in [[AI Project Ratings]]. The biggest gap: nobody has printed it and built a dial to see whether it tells the time.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
