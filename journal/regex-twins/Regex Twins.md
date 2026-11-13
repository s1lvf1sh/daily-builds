---
title: Regex Twins
type: ai-project
project: Regex Twins
note: hub
status: complete
started: 2026-11-13
completed: 2026-11-13
built-by: Claude
stack: [javascript, python]
location: builds/regex-twins/
repo: daily-builds
date: 2026-11-13
tags: [ai-project]
---

# Regex Twins

> Type two regular expressions and learn exactly whether they match the same strings, or the shortest string that separates them.

> [!QUOTE] The brief
> Daily creative build: choose, build, verify, document, rate and publish one new project, with creative freedom.

## At a glance

| | |
|---|---|
| Status | Complete, live |
| Built | 2026-11-13 |
| Built by | Claude |
| Location | `builds/regex-twins/` |
| Run | Open `index.html` (static) |
| Test | `node test/test.js` (800 checks); `node test/browser.js` (16 checks) |
| Size | about 330 lines engine, 155 page, 160 tests |

## What it is
A static page. Two inputs; below them a verdict ("Twins" or "Not the same" with shortest distinguishing strings), each pattern's shortest matches, exact counts by length, finite or infinite, and a drawing of the minimal state machine. A box tests any string on both.

## Headline results
- 20,588,550 regex/string pairs agree with native `RegExp`; 4000 verdicts agree with Python `re`.
- 200 equivalence pairs: every printed counterexample re-verified natively and shown to be shortest over the test alphabet.
- 5 deliberate mutations caught; 16 browser checks pass in headless Chromium.

## Project notes
- [[Regex Twins - Origin & Decisions]]: why this was built, and why this way
- [[Regex Twins - Build Log]]: how it was made and checked
- [[Regex Twins - How It Works]]: architecture and mechanisms
- [[Regex Twins - Value & Future]]: what it is worth and where it could go
- [[Regex Twins - Lessons & Observations]]: surprises and lessons that carry over

## Rating

**3.0 / 5** on the [[AI Project Rating Scale]] (confidence: medium, first rated 2026-11-13). Scores, evidence and the biggest gap are in [[AI Project Ratings]]. Biggest gap: nobody has used it, and the supported syntax is a regular subset that excludes anchors and lookahead.

Related: [[AI Projects MOC]] · [[AI Project Documentation Standard]]
