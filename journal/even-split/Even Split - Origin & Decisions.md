---
title: Even Split - Origin & Decisions
type: ai-project
project: Even Split
note: decisions
date: 2026-11-09
tags: [ai-project, decisions]
---

# Even Split: Origin & Decisions

## The brief and its constraints

Free choice. Static page, no build, checkable claim, finishable in one session. Past work scored lowest on Use and Originality, and the previous three runs were physics or utilities in already-explored domains (see [[Chladni Sand - Lessons & Observations]]).

## How the idea was chosen

I wanted something people really need repeatedly (Use) with a claim that a second implementation can disprove (Proof). Splitting costs with friends is a recurring chore, and "fewest payments" has a crisp optimum I could verify by brute force.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Time-zone meeting finder | Daily use | Mostly Intl API calls, little to verify independently |
| Text diff weaver | Fresh | Larger scope, weak oracle |
| Expense settle-up | Real need, exact optimum | Known category (Originality stays low) |
| Small puzzle game | Delight | Use stays low again |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Input | One line per expense, plain English | Form fields | Faster to type, shareable as text, state fits in a URL hash |
| Money | Integer cents, largest-remainder rounding | Floats | Shares must sum exactly |
| Minimum transfers | Subset DP over zero-sum groups, greedy inside groups | Plain greedy | Greedy misses independent groups (+5,+7,-5,-7 needs 2, not 3) |
| Large groups | Greedy past 18 people, labelled | Exponential search | 2^18 is instant, 2^25 is not |
| Oracle | Iterative-deepening search over transfers, exact Fractions | Reusing the DP | Different algorithm, same inputs only as text |

## Deliberately left out

Currencies, accounts, receipts, multi-word names, percentages, saving history. Each would add scope without adding anything checkable.

Related: [[Even Split]] · [[Even Split - Build Log]] · [[Even Split - How It Works]]
