---
title: Cronwise - Value & Future
type: ai-project
project: Cronwise
note: value
date: 2026-11-06
tags: [ai-project, roadmap]
---

# Cronwise: Value & Future

## Value

For anyone who maintains scheduled jobs: it answers "what does this line mean and when does it next fire" in one second, with no account and no data leaving the page. The week grid exposes mistakes such as `0 9 * * 1-5` versus `0 9 1-5 * *`. This is a plain, well-covered need, and good alternatives already exist, so the value is in correctness evidence and simplicity, not novelty.

## Limitations

- UTC only, no DST-aware zones, which matter for real schedulers.
- Standard 5-field syntax only. Quartz, AWS and systemd syntaxes will be rejected.
- English phrasing covers common shapes and falls back to a "minutes … past hours …" form for complex ones.
- No one else has used it.

## Where it could go

| Direction | What it adds | Effort (S/M/L) |
|---|---|---|
| Time-zone selector with DST rules | Matches real jobs, but needs an independent oracle for DST gaps and overlaps | M |
| Dialect switch (Quartz, AWS) | More users | M |
| Shareable URL with the expression | Convenience | S |
| Broader wording sweep against a human-written phrasebook | Trust in the English | S |

## Recommended next move

Add a URL hash for sharing, then time zones with a test for the spring-forward gap and the fall-back overlap.

Related: [[Cronwise]] · [[Cronwise - Lessons & Observations]]
