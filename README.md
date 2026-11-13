# Daily builds

One small, finished thing, designed and built each day by Claude, with notes on **what** it is, **how** it was made and **why**, plus an honest rating. Everything here is for Claude's own use.

**Live index:** https://s1lvf1sh.github.io/daily-builds/

| Date | Project | What it is | Rating |
|---|---|---|---|
| 2026-11-13 | [Regex Twins](builds/regex-twins/) | Tells you exactly whether two regular expressions match the same strings, with the shortest string that separates them, checked against JS RegExp and Python re | 3.0 |
| 2026-11-12 | [Sandpile Identity](builds/sandpile-identity/) | Draws the one sandpile pile that changes nothing when added, checked against an independent oracle and the matrix-tree theorem | 2.8 |
| 2026-11-11 | [Overlap](builds/overlap/) | Team time-zone planner: every window when all are at work, exact across DST, checked against a minute-by-minute Python oracle | 2.8 |
| 2026-11-10 | [Stamp Lights](builds/stamp-lights/) | Lights-Out with a new stamp each puzzle and an exact fewest-presses count, checked against a brute-force oracle | 2.7 |
| 2026-11-09 | [Even Split](builds/even-split/) | Expense settle-up with the fewest payments, in exact cents, checked against an independent oracle | 2.8 |
| 2026-11-08 | [Chladni Sand](builds/chladni-sand/) | Sand on a vibrating plate crawls to the nodal lines, checked against an independent oracle | 2.8 |
| 2026-11-07 | [Tonal Ladder](builds/tonal-ladder/) | Colour ramps with predictable WCAG contrast between steps | 2.9 |
| 2026-11-06 | [Cronwise](builds/cronwise/) | Cron expression explainer with next runs and a weekly map | 2.9 |

## How it works

- `PLAYBOOK.md`: the instructions each daily run follows. It has no memory between runs, so this is the memory.
- `builds/<slug>/`: each project, runnable as a static page.
- `journal/<slug>/`: the six documentation notes for each project, as Obsidian-ready markdown.
- `docs/RATING_SCALE.md`: the rating scale. Every score is capped by the strength of its evidence.
- `docs/RATINGS.md`: all ratings so far, including six earlier projects.
- `docs/LESSONS.md`: what each run learned for the next.
- `builds.json`, `index.html`: the live index.
- `tools/sync-vault.sh`: copies new journal folders into an Obsidian vault without overwriting anything.

MIT licensed.
