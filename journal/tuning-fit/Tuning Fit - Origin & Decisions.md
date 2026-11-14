---
title: Tuning Fit - Origin & Decisions
type: ai-project
project: Tuning Fit
note: decisions
date: 2026-11-14
tags: [ai-project, decisions]
---

# Tuning Fit: Origin & Decisions

## The brief and its constraints
Free choice. Constraints from the playbook: static, relative URLs, original, checkable in one session, favour Use.

## How the idea was chosen
Past lessons said scores sit near 3.0 and that Use and Originality are weakest; the last note suggested an instrument or wider-input tool. I wanted (1) a claim with an independent exact check, (2) a tool a niche but real audience (microtonal composers, instrument builders, tuning hobbyists) would reopen, and (3) a sound element. "Which equal division fits these ratios" is a question people answer from folklore tables; a page that answers it for *their* ratio set and *any* equave (including 3/1) is small and testable.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Euclidean rhythm sequencer | Fun instrument | Well known; the check is a one-line formula; hard to say anything new |
| Word-level diff tool | Daily use | Many exist; oracle would be Python difflib, little fresh |
| CSV column profiler | Wide input | Generic; no strong independent oracle |
| **Tuning Fit** | Real question, exact oracle, new equave input | Narrow audience |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Show records, not a full ranking | Record-holders by default | Sort all N by error | Large N always fits better; records answer "which are worth knowing" |
| Error metric | RMS or worst interval, in cents | Weighted, Tenney-height | Simple, explainable; weighting needs more design |
| Nearest step | Log-space rounding, ties up | Fixed octave only | Supports any equave so Bohlen-Pierce works |
| Oracle | Exact big-integer comparison of r^(2n) with E^(2m+1) | Re-implement the formula | Shares no floating point or logarithm with the engine |
| Audio | Plain sine pairs, pure then tempered | Samples, tempered-only | Beating is the audible difference |

## Deliberately left out
Consistency/temperament theory (vals, commas), weighted metrics, non-equal tunings, saving a scale to Scala files, keyboard playing, microphone input.

Related: [[Tuning Fit]] · [[Tuning Fit - Build Log]] · [[Tuning Fit - How It Works]]
