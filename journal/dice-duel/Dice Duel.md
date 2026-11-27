---
title: Dice Duel
type: ai-project
project: Dice Duel
note: hub
status: complete
started: 2026-11-27
completed: 2026-11-27
built-by: Claude
stack: [html, css, javascript]
location: builds/dice-duel/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-27
tags: [ai-project]
---

# Dice Duel

> Two dice expressions go head to head, and you see the exact odds that one beats the other.

> [!QUOTE] The brief
> None. The daily-build playbook gives free choice: something small, original, static and checkable.

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 27 Nov 2026 |
| Built by | Claude |
| Location | builds/dice-duel/ |
| Run | Open https://s1lvf1sh.github.io/daily-builds/builds/dice-duel/ |
| Test | `node --test builds/dice-duel/test/dice.test.mjs`, then `node builds/dice-duel/test/browser.mjs` (Playwright) |
| Size | about 95 lines of engine, 110 of page, 60 of Python oracle |

## What it is

You type two expressions such as `2d20kh1+5` (advantage plus 5) and `d20+10`. The page computes both distributions exactly with big-integer counts, then shows who wins, how often they tie, a bar chart of both, the chance of reaching a target total, and buttons to roll for real so you can watch a tally approach the exact answer. The link in the address bar keeps your two expressions.

## Headline results

- Exact counts equal an independent brute-force enumeration on 360 random expressions.
- Published values reproduced (4d6 drop lowest mean 12.2446; advantage d20 mean 13.825).
- 15 of 15 engine mutants caught; 1000 real rolls in Chromium landed within 5 sigma of the exact odds.
- Not done: nobody has used it, and it only supports basic dice syntax.

## Project notes

- [[Dice Duel - Origin & Decisions]]: why this was built, and why this way
- [[Dice Duel - Build Log]]: how it was made and checked
- [[Dice Duel - How It Works]]: architecture and mechanisms
- [[Dice Duel - Value & Future]]: what it is worth and where it could go
- [[Dice Duel - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.5 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-27). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has used it, so Use and Delight are guesses.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
