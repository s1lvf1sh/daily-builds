---
title: Rankwise - Origin & Decisions
type: ai-project
project: Rankwise
note: decisions
date: 2026-11-16
tags: [ai-project, decisions]
---

# Rankwise: Origin & Decisions

## The brief and its constraints
Free choice. Must be static, original, checkable in one session, and relatively useful, since earlier builds scored lowest on Use and Originality.

## How the idea was chosen
Criteria: a real use for ordinary people (not another toy), an independent way to check the answers, and a fresh angle. The recent builds were all exact-answer calculators or art toys, so I looked for something a group of non-specialists would actually do. Voting-rule comparison is that: the hook is "the rules disagree, here is why", which is more engaging than a single winner.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Recipe scaler with exact fractions | Wide audience | Many exist; low originality |
| Shift-rota fairness planner | Real need | Hard to define a checkable "fair" |
| Ranked-ballot comparison (chosen) | Real group use; disagreement is the story; strong oracle available | Only a modest novelty |
| Cake-cutting / fair division | Interesting | Weak input story for a web page |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Ties | Report all tied winners | Random or fixed tie-break | Honest, deterministic and oracle-friendly |
| Unlisted options | Tied for last | Reject partial ballots | Lets people list only their favourites |
| IRV ties | Eliminate all tied-lowest together; if that removes everyone, they are co-winners | Try every tie-break order | Simple, documented, deterministic |
| Borda | Pairwise points with half for ties | Positional points | Needs no special case for partial ballots |
| Minimax | Margins version | Winning-votes version | One well-defined choice, stated on the page |
| Share | Ballots in the URL hash | Server | Static hosting |

## Deliberately left out
Approval, score and STAR voting; ballot ties (`A = B`); tie-breaking; more than 12 options; a way to collect votes from several people.

Related: [[Rankwise]] · [[Rankwise - Build Log]] · [[Rankwise - How It Works]]
