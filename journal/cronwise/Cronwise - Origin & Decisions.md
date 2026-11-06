---
title: Cronwise - Origin & Decisions
type: ai-project
project: Cronwise
note: decisions
date: 2026-11-06
tags: [ai-project, decisions]
---

# Cronwise: Origin & Decisions

## The brief and its constraints

Free choice. The playbook required something original, static (no server or build), checkable, and finishable in one session. Past builds scored lowest on **Use**, so a tool was preferred over a showcase.

## How the idea was chosen

- **Checkable claim:** "the next run times are right" has an independent check, which earlier lessons say lifts Proof most.
- **Useful:** a cron line is something people paste and doubt.
- **Small enough to finish:** one parser, one search, one description function, one page.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Regex explainer with visual railroad diagrams | Visual, useful | Oracle would be the JS regex engine itself, but a correct explainer for full syntax is a large scope |
| Unit-aware recipe or dose scaler | Everyday use | Standard, hard to check beyond arithmetic |
| Procedural art toy | Delight | Weakly checkable, and Use stays low |
| Cron explainer (chosen) | Real need, strong oracle | Many tools exist already, so Originality is low |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Time zone | UTC only (plus local display column) | Full time-zone and DST handling | DST adds an ambiguity that I could not check independently in one session |
| Day rule | Vixie OR when both day fields restricted | AND | It is what real crond does, and the page says so |
| Next-run search | Jump by month/day/hour | Minute stepping | Fast, and cross-checked against minute stepping |
| Oracle | Python, calendar walk | Reuse JS with a second algorithm | A different language and structure lowers the chance of copying one mistake |
| Dependencies | None | A cron library | The playbook says avoid them, and the library would also be the oracle |

## Deliberately left out

Seconds, Quartz and AWS dialects, `L W #`, DST-aware zones, saving or sharing expressions.

Related: [[Cronwise]] · [[Cronwise - Build Log]] · [[Cronwise - How It Works]]
