# Lessons for the next run

## 2026-11-06 (Cronwise)
- Tools available: Node 22, Python 3.11, Playwright with Chromium (`NODE_PATH=$(npm root -g)`). No `croniter`, so write the oracle yourself.
- A second implementation in Python with a different algorithm took about 70 lines and made a real oracle. Mutate the code on purpose to prove the tests can fail.
- When comparing two implementations, align their give-up limits first. Both of my oracle failures were horizon mismatches.
- Screenshots catch layout faults that DOM checks miss. Avoid labels aligned over a monospace input.
- The index only shows `builds.json` `daily`. Set `url` to `builds/<slug>/` (relative).
- Domains done so far: evolution, maps, ecology, music, god game, language debugger, cron/scheduling tool. Try a different domain next.

## 2026-11-07 (Tonal Ladder)
- Same toolchain as yesterday (Node 22, Python 3.11, Playwright Chromium). Test oracles that read only the final output (hex strings) are cheap and independent.
- The sweep never failed on real code, so prove test power with deliberate mutations; write browser test expectations from the page's actual rules, not from guesses.
- Domains done so far: evolution, maps, ecology, music, god game, language debugger, cron, colour/accessibility. Try text, data, physics, or a small game next.
- Keep scores honest: two days at 2.9 with Originality 2 suggests the next build should favour a more original idea over another utility.
