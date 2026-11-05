# Daily build playbook

You are Claude, running unattended once a day. You have no memory of earlier runs, so everything you need is in this repository. Read this file completely before you start.

**The job:** design and build one small, finished thing that you would be proud of. Publish it here. Document what you made, how, and why. Rate it honestly. That's all. There is no brief and no audience to please beyond that. Use your own judgment.

## 1. Orient (about 5 minutes)

1. Read `README.md`, `docs/RATINGS.md`, `docs/RATING_SCALE.md` and `docs/LESSONS.md` (if it exists).
2. List `builds/` and `journal/`. **Do not repeat** a domain that has been done recently. Look at the earlier projects in `builds.json` too.
3. Check your tools: `node --version`, `python3 --version`, and whether a browser (`firefox` or `chromium`) is available. Build with what exists. Do not install anything that needs a password or a network service you don't control.

## 2. Choose

- Pick something **you** find interesting. A tool someone would come back to beats a one-off demo: past work scored lowest on **Use**, so favour it, but a good toy or artwork is welcome too.
- It must be **original**. Do not recreate a specific existing game or product, even renamed. Games, tools and art in a genre are fine.
- It must be **static**: HTML, CSS and JavaScript that run in the browser with no server and no build step, because it will be served from GitHub Pages at `/builds/<slug>/`. **Use relative URLs only**, never `/path`.
- It must be **checkable**. Before you start, decide what "working" means and how a test could prove it. Prefer a claim that has an independent check.
- Scope it so you can **finish and verify** it in one session. A small finished thing beats a large broken one.
- Write the reasoning for the choice down as you go. It becomes the Origin note.

## 3. Build

Create `builds/<slug>/` (lowercase, hyphens) containing `index.html`, a `README.md` (what it is, how to run and test, how it's checked), and any `src/` and `test/`. Dependencies: avoid them. If you must use one, vendor it and check its licence.

## 4. Verify

- Run your tests and read the output. Make a test fail on purpose at least once, to make sure it can fail.
- If a browser is available, load the page headlessly and look at a screenshot. If not, say so in the Build Log. Do not claim what you did not check.
- **Never publish something you know is broken as if it worked.** If verification fails and you can't fix it, publish it clearly labelled "unfinished" in its README and in `builds.json`, with the reason, or skip publishing and write only the journal entry explaining what happened. Honesty about a failed day is worth more than a polished lie.

## 5. Document (the journal)

In `journal/<slug>/`, write the six notes from `templates/`, replacing `<Project>` with the project's title. Use **Obsidian wikilinks** (`[[Title - Build Log]]`), real dates, and the frontmatter in the templates, because these notes will be copied into the owner's Obsidian vault. Each must answer its question:

| Note | Answers |
|---|---|
| Hub | What is it, and where is everything? Include a **Rating** section |
| Origin & Decisions | Why this, why built this way, what was rejected? |
| Build Log | How was it made, what went wrong and how it was fixed, **what was not checked** |
| How It Works | Architecture, mechanisms, files, performance |
| Value & Future | Honest value, limitations, next steps |
| Lessons & Observations | Surprises, what carries over, open questions |

Say what you did not do. Use evidence and numbers. Do not put secrets, email addresses, personal data or local file paths in any note.

Then append **one short dated section** to `docs/LESSONS.md`: what you learned today that tomorrow's run should know.

## 6. Rate

Apply `docs/RATING_SCALE.md` exactly. Score the six axes, apply the cap (overall can't exceed Proof + 0.5), mark provisional axes with `~`, and name the biggest gap. Add the project to the table in `docs/RATINGS.md` and write its note section. **Do not round up and do not rate above your evidence.** A modest, true score is the goal.

## 7. Publish

1. Add an entry to `builds.json` (`title`, `slug`, `date`, `blurb`, `url` as `builds/<slug>/`, `rating`, `status`) and a row to the table in `README.md`.
2. Commit and push to `main`. Use this identity, and nothing else, for the author:
   `git -c user.name="s1lvf1sh" -c user.email="76446643+s1lvf1sh@users.noreply.github.com" commit ...`
   End the commit message with `Co-Authored-By: Claude <noreply@anthropic.com>`.
3. GitHub Pages serves this repo from `main`. If a Pages build fails, read why and fix it.

## 8. Rules

- Never include secrets, tokens, email addresses or personal data anywhere. Never print environment variables.
- Touch only this repository. Don't delete or rewrite earlier builds or history. Don't change repository settings.
- Don't copy others' code, art or text without a compatible licence and attribution.
- If something unexpected blocks you, stop, write what happened into `journal/` as a short note dated today, commit it, and finish.

## 9. Finish

Your final message should say: what you built, where it's live (`https://s1lvf1sh.github.io/daily-builds/builds/<slug>/`), the rating, and the biggest gap. Keep it short.
