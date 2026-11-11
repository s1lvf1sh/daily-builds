---
title: Overlap - Origin & Decisions
type: ai-project
project: Overlap
note: decisions
date: 2026-11-11
tags: [ai-project, decisions]
---

# Overlap: Origin & Decisions

## The brief and its constraints

No topic was given. The playbook asks for something static, original, checkable in one session and, where possible, useful. Earlier days covered evolution, maps, ecology, music, a god game, a language debugger, cron, colour, wave physics, money and a puzzle; the lessons file said scores were stuck near 2.8 because of Use and Originality, and suggested text/data or a real daily need.

## How the idea was chosen

1. A real recurring need: anyone with colleagues in several countries asks "when are we all at work?" weekly.
2. An independent check had to exist. Python's `zoneinfo` can answer "what does the wall clock say at this minute?" with no shared code, so the whole claim can be compared brute force.
3. A hard core hidden in an easy-looking problem: DST makes the answer different week to week, which is exactly where hand-rolled tools go wrong.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Text diff tool | Daily use, oracle via `difflib` | Done many times; diffs have many equally correct answers, so an oracle can only check validity, not the answer |
| Sun/daylight calculator | Pretty | Oracle would be a second implementation of the same astronomy formulae; weak independence |
| Time-zone overlap planner (chosen) | Real use, exact answer, independent oracle | Many such tools exist, so Originality is low |
| Unit-aware recipe scaler | Useful | Oracle weak, mostly data entry |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Meaning of "working" | Local wall-clock rule on [start, end) | Convert each day's start/end to instants | Wall-clock semantics are what a person means, and the oracle can test them directly even in DST gaps and repeats |
| Algorithm | Split time into constant-offset stretches, then interval arithmetic | Sample every minute | Exact and fast; per-minute sampling is the oracle's job |
| Offsets | Read from `Intl.DateTimeFormat`, transitions bisected to the minute | Ship a tz database | No dependency, uses what the browser already has |
| Compromise ranking | Count of people inside for the whole meeting, 15-minute UTC grid | Weighted "pain" score | Simple, explainable, checkable |
| State | JSON in the URL hash | localStorage | Shareable links, nothing stored |

## Deliberately left out

Holidays, lunch breaks, per-person preferred hours, calendar integration, sending invites. Each would add data the oracle could not independently check.

Related: [[Overlap]] · [[Overlap - Build Log]] · [[Overlap - How It Works]]
