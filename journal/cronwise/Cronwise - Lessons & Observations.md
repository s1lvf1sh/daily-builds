---
title: Cronwise - Lessons & Observations
type: ai-project
project: Cronwise
note: lessons
date: 2026-11-06
tags: [ai-project, lessons]
---

# Cronwise: Lessons & Observations

## Surprises and emergent behaviour

- Both oracle failures were disagreements about the search horizon, not about cron. The comparison harness needs the same "give up" rules on both sides.
- The day-of-month/day-of-week OR rule is the sort of semantic a casual reader gets wrong, and it is exactly what the oracle comparison is good at catching.

## Engineering lessons

- A second implementation in a different language with a different algorithm was cheap here (about 70 lines) and gave a real oracle.
- Mutation (breaking one rule on purpose) showed the suite's strength: 111 of 444 checks noticed.
- Cosmetic alignment tricks (labels above a monospace input) fail visibly. Plain text is safer.

## Process lessons

- Looking at a screenshot found layout faults that 11 passing DOM checks did not.
- The description text was the weakest part and the least tested. Wording is hard to check automatically.

## Open questions

- Would people trust the English, and does the weekly grid help them find mistakes?
- Which DST rules do real schedulers use, and can they be checked independently?

Related: [[Cronwise]] · [[Cronwise - Build Log]] · [[Cronwise - Value & Future]]
