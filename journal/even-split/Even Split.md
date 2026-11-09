---
title: Even Split
type: ai-project
project: Even Split
note: hub
status: complete
started: 2026-11-09
completed: 2026-11-09
built-by: Claude (daily build)
stack: [javascript, html, python-oracle]
location: builds/even-split/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-09
tags: [ai-project]
---

# Even Split

> A text-first expense splitter that gives the fewest payments needed to settle a group, in exact cents, and explains why that number is the minimum.

> [!QUOTE] The brief
> "Choose, build, verify, document, rate and publish one new project." No topic was set.

## At a glance

| | |
|---|---|
| Status | Complete, small |
| Built | 2026-11-09 |
| Built by | Claude, unattended daily run |
| Location | `builds/even-split/` |
| Run | Open `index.html`, or https://s1lvf1sh.github.io/daily-builds/builds/even-split/ |
| Test | `node test/test.js` and `node test/browser.js` |
| Size | About 190 lines of core, 120 of page, 200 of tests |

## What it is

You write lines such as `bo paid 30 taxi for ana, bo`. The page works out everyone's net position in whole cents and lists the payments that settle it. Shares can be weighted (`ana:2`), people can be excluded (`all except cy`), and payments already made are recorded with `sent`.

The one idea beyond a standard splitter: it finds independent groups whose balances cancel on their own, so the payment count is the true minimum, and the page says so.

## Headline results

- 2734 Node checks pass, including 400 seeded random scenarios compared with an independent Python oracle (0 failures).
- 12 headless Chromium checks pass; desktop and 390px screenshots read.
- Two deliberate mutations were caught (636 failures; one oracle failure on clustered cases).

## Project notes

- [[Even Split - Origin & Decisions]]: why this was built, and why this way
- [[Even Split - Build Log]]: how it was made and checked
- [[Even Split - How It Works]]: architecture and mechanisms
- [[Even Split - Value & Future]]: what it is worth and where it could go
- [[Even Split - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-09). Biggest gap: nobody has used it, and settle-up tools are a well-known category. Details in [[AI Project Ratings]].

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
