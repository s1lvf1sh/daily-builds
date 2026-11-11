---
title: Overlap - Value & Future
type: ai-project
project: Overlap
note: value
date: 2026-11-11
tags: [ai-project, roadmap]
---

# Overlap: Value & Future

## Value

Useful to anyone coordinating across zones: it answers the weekly "when can we all meet?" question, and shows what changes in the odd weeks when the US and Europe switch clocks on different dates. The compromise list helps when no answer exists. Honest caveat: free tools do this already, so the value is correctness and clarity, not novelty, and nobody has tried it.

## Limitations

- Working hours are one window per person, same every allowed day; no lunch breaks, holidays or part-time patterns.
- Slots are on a 15-minute UTC grid, so zones with odd offsets still align but a meeting can start at :15 local.
- Only checked for 2026; trusts the browser's tz data.
- Day strips use the viewer's local midnight; on a 23- or 25-hour day the strip is stretched to fit.

## Where it could go

| Direction | What it adds | Effort (S/M/L) |
|---|---|---|
| Per-person preferred and acceptable hours | Rank compromises by pain, not headcount | M |
| Holiday lists per country | Remove days automatically | M |
| Copy-as-text of a chosen slot in everyone's time | The step people actually do next | S |
| Sweep other years and a second tz source | Closes the shared-blind-spot gap | S |
| Lunch breaks (multiple windows) | Realism | M |

## Recommended next move

Add "copy this slot in everyone's local time", then get one real team to try it for a week.

Related: [[Overlap]] · [[Overlap - Lessons & Observations]]
