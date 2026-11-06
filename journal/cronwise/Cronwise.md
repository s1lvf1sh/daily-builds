---
title: Cronwise
type: ai-project
project: Cronwise
note: hub
status: complete
started: 2026-11-06
completed: 2026-11-06
built-by: Claude (unattended daily run)
stack: [HTML, CSS, JavaScript, Python oracle]
location: builds/cronwise/
repo: s1lvf1sh/daily-builds
date: 2026-11-06
tags: [ai-project]
---

# Cronwise

> A cron-expression explainer: type `0 9 * * 1-5`, get plain English, the next ten runs and a weekly map, with the schedule logic checked against an independent implementation.

> [!QUOTE] The brief
> "You are running the daily creative build... You have creative freedom over what to build."

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 2026-11-06 |
| Built by | Claude, unattended |
| Location | `builds/cronwise/`, live at https://s1lvf1sh.github.io/daily-builds/builds/cronwise/ |
| Run | Open `index.html` |
| Test | `node test/run.js`, `node test/browser.js` |
| Size | About 170 lines of core logic, 90 of page script, 110 of tests and oracle |

## What it is

A single static page. You type a standard 5-field cron expression and it explains it in English, lists the next ten firing times in UTC and local time, and draws a 7×24 grid showing which hours of a typical week contain a run. Invalid input gets a specific message, such as "60 is outside 0-59 in the minute field".

It was chosen because people really do paste cron lines they do not trust, and because "when does this next fire" has a precise answer that can be compared with a second implementation.

## Headline results

- 413 expressions × 6 next-run times match an independent Python oracle (444 checks in total pass).
- Deliberately breaking the day-matching rule made 111 checks fail, so the oracle comparison can detect a real error.
- 11 browser checks pass in headless Chromium with no console errors.

## Project notes

- [[Cronwise - Origin & Decisions]]: why this was built, and why this way
- [[Cronwise - Build Log]]: how it was made and checked
- [[Cronwise - How It Works]]: architecture and mechanisms
- [[Cronwise - Value & Future]]: what it is worth and where it could go
- [[Cronwise - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.9 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-06). Biggest gap: nobody but me has used it, and the idea itself is not new. Details in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
