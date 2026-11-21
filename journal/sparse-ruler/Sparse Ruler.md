---
title: Sparse Ruler
type: ai-project
project: Sparse Ruler
note: hub
status: complete
started: 2026-11-21
completed: 2026-11-21
built-by: Claude (daily build, unattended)
stack: [html, css, javascript, python-oracle]
location: builds/sparse-ruler/
repo: s1lvf1sh/daily-builds
date: 2026-11-21
tags: [ai-project]
---

# Sparse Ruler

> Finds the fewest marks a stick needs to measure every length (or only the lengths you list), proves it when it can, and lets you try to beat it.

> [!QUOTE] The brief
> "You have creative freedom over what to build." (Daily build playbook: one small, finished, original, static, checkable thing.)

## At a glance

| | |
|---|---|
| Status | Complete |
| Built | 2026-11-21 |
| Built by | Claude, unattended daily run |
| Location | `builds/sparse-ruler/` |
| Run | Open `index.html`; live at https://s1lvf1sh.github.io/daily-builds/builds/sparse-ruler/ |
| Test | `node test/test.js` (1229 checks), `NODE_PATH=$(npm root -g) node test/browser.js` (38 checks), `python3 test/oracle.py` |
| Size | 144 lines of engine, 244 of page, 175 of tests |

## What it is

A stick of length 6 with marks at 0, 1, 4 and 6 can measure every whole length from 1 to 6, because pairs of marks are 1 to 6 apart. This page generalises that: give it a length (and optionally only the lengths you care about) and it searches for the fewest marks that do the job, then draws the stick and a map of the lengths, each showing the pair of marks that measures it, or "missing" in dashed red.

You can click positions on the stick to add or remove marks and watch the map change, to try to beat the answer. Where the exact search cannot finish in 4 seconds (roughly length 45 and up for complete rulers) it switches to a heuristic and says plainly that the result is not proven fewest.

## Headline results

- An independent Python oracle that tries every set of marks agrees on 282 cases: fewest marks and number of optimal rulers (up to mirror), 0 mismatches; 186 cases have several optimal rulers.
- Minimum counts for lengths 1 to 22 match the OEIS sequence I remember (A046693), from memory only.
- 10 of 10 deliberate bugs caught. 38 checks in headless Chromium.

## Project notes

- [[Sparse Ruler - Origin & Decisions]]: why this was built, and why this way
- [[Sparse Ruler - Build Log]]: how it was made and checked
- [[Sparse Ruler - How It Works]]: architecture and mechanisms
- [[Sparse Ruler - Value & Future]]: what it is worth and where it could go
- [[Sparse Ruler - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-21). Scores, evidence and the biggest gap go in [[AI Project Ratings]]. The biggest gap: nobody has used it, and minimality is independently checked only to length 22.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
