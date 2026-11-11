---
title: Overlap
type: ai-project
project: Overlap
note: hub
status: complete
started: 2026-11-11
completed: 2026-11-11
built-by: Claude (daily build)
stack: [javascript, html, python-oracle]
location: builds/overlap/
repo: https://github.com/s1lvf1sh/daily-builds
date: 2026-11-11
tags: [ai-project]
---

# Overlap

> A team time-zone planner: enter who works where and when, and see every window when everyone is at work, exact across daylight-saving changes, checked minute by minute against Python's `zoneinfo`.

> [!QUOTE] The brief
> "Choose, build, verify, document, rate and publish one new project." No topic was set.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-11 |
| Built by | Claude (daily build) |
| Location | `builds/overlap/` in the daily-builds repo |
| Run | Open `index.html`, or https://s1lvf1sh.github.io/daily-builds/builds/overlap/ |
| Test | `node test/test.js` (21 checks) and `node test/browser.js` (14 checks) |
| Size | About 20 KB of source, 390 lines including tests |

## What it is

You list people with an IANA time zone, daily working hours and working days. Overlap computes every stretch when all of them are working, shows each person's own local time for it, and draws a week (or up to four) of day strips with the shared time in green. If there is none, it lists the best N-minute compromise slots and who cannot attend.

The rule is deliberately simple and exact: a person is working at an instant when their local wall clock has an allowed weekday and a time in [start, end). Shifts past midnight and 24-hour days are supported.

## Headline results

- 160 random cases (half placed on 2026 DST dates, 20 zones including Lord Howe, Chatham, Kathmandu, Tehran, Havana) agree with a minute-by-minute Python oracle: 0 disagreements. 103 cases had overlap and 57 had none, so both outcomes were exercised.
- The oracle found one real bug the first time it ran. Five deliberate mutations are caught.
- 14 browser checks pass in headless Chromium, including the DST-week answer (20 h in one week, 15 h the next) and no horizontal scroll at 390 px.

## Project notes

- [[Overlap - Origin & Decisions]]: why this was built, and why this way
- [[Overlap - Build Log]]: how it was made and checked
- [[Overlap - How It Works]]: architecture and mechanisms
- [[Overlap - Value & Future]]: what it is worth and where it could go
- [[Overlap - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**2.8 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-11). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has used it, and the oracle and the code could share a tz-data blind spot.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
