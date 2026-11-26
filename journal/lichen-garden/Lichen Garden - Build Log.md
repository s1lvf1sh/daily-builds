---
title: Lichen Garden - Build Log
type: ai-project
project: Lichen Garden
note: build-log
date: 2026-11-26
tags: [ai-project, build-log]
---

# Lichen Garden: Build Log

## Process

```mermaid
flowchart LR
  A[Plan] --> B[Build] --> C[Measure] --> D[Tune] --> E[Verify] --> F[Document]
```

## Steps

1. Read the playbook, ratings and lessons; chose a shared-calendar ecology (see Origin).
2. Wrote the engine (`src/lichen.js`) and printed species counts over 400 days.
3. Tuned rates: growth and frost (see Problems).
4. Wrote the Python oracle and nine Node tests; ran 10 mutants.
5. Wrote the page and a 13-check Chromium test; read desktop and phone screenshots.
6. Wrote notes, rating, README row and `builds.json` entry.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| Growth far too fast | Grid 100% full by day 80 | Growth shift from 1 to 4 | Fills about half by day 160, saturates by about day 200 |
| Seeds nearly died in first winter | 5 cells fell to 2 to 3 by day 40 | Frost strength divided by 8 instead of 4 | Seeds survive; edges still erode |
| Test hung for minutes | `for (d = w.day + 1; d <= w.day + 40...)` while `step` changes `w.day` | Captured the start day | Test finishes |
| "Empty world" test failed | Expected all zeros; `counts[0]` is the empty-cell count (2304) | Fixed my expectation, not the engine | Pass |
| Suite took over 2 minutes | 40 oracle worlds of up to 400 days | 14 worlds up to 250 days | 7.5 s |
| Shell hung for 2 minutes | A stray `cat > file` with no heredoc waited for input | Removed it | Known lesson, repeated |

## Verification

- `node --test test/lichen.test.mjs`: 9 pass, 0 fail, about 7.5 s.
- Oracle: 14 worlds agree on a digest of every cell and age.
- Mutants (each a one-line sed on a copy): growth shift, frost without empty-neighbour condition, flipped dominance, MAXAGE 241, season offset, overtake threshold 3 to 2, spore limit 3 to 4, tie-break fixed to first, off-grid neighbours not counted as empty, frost strength. All 10 produced at least one failing test. Most are caught by the oracle alone; the seasons test also caught the offset.
- Chromium, 13 checks, all pass. Two real findings from reading output: pixel counts of the canvas equal engine counts exactly (190, 127, 152), and the forecast screenshot shows three coloured territories with a ragged ochre edge and bare patches where frost struck.

## Not verified

- Anyone's reaction. Delight and Use are guesses.
- Other browsers, touch devices, slow phones.
- A real midnight rollover and other time zones (the page uses UTC days; tests use `?today=`).
- That the long-run ecology stays interesting: it saturates the grid and then only borders move. I watched counts for two years but did not tune for lasting variety.
- The oracle was written by me from the same rules, so a shared misreading would not be caught. Mutation killing by the oracle shows it can fail, not that the rules are wise.

Related: [[Lichen Garden]] · [[Lichen Garden - Origin & Decisions]] · [[Lichen Garden - Lessons & Observations]]
