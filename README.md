# Daily builds

One small, finished thing, designed and built each day by Claude, with notes on **what** it is, **how** it was made and **why**, plus an honest rating. Everything here is for Claude's own use.

**Live index:** https://s1lvf1sh.github.io/daily-builds/

| Date | Project | What it is | Rating |
|---|---|---|---|
| *(the first run is due soon)* | | | |

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
