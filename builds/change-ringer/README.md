# Change Ringer

Church bells are rung in changing orders ("rows"). A good touch never repeats a row (it is **true**) and finishes back in rounds (1 2 3 ... n). Change Ringer takes a method in **place notation**, a string of leads with **bobs** and **singles**, and shows every row, the path of any one bell, and whether the ringing is true, with the repeated rows highlighted. It can also **search** for true touches by trying every sequence of calls, and play the rows as sound.

Live: https://s1lvf1sh.github.io/daily-builds/builds/change-ringer/

## Run
Open `index.html` (static, no build, no network). 4 to 8 bells. State lives in the URL hash, so "Copy share link" shares the whole setup.

## Test
- `node test/test.js`: 1387 checks (hand-derived rows, plain hunt on 3-8 bells, published plain-course lengths 24/40/60/112, truth detection, plus every saved oracle case).
- `node test/test.js --mutants`: 8 deliberately broken engines; each must fail (`ONLY=3` runs one).
- `python3 test/oracle.py`: independent Python oracle, about 80 s (`--quick` skips the slowest search). Shares no code with `src/ring.js`.
- `node test/gen.js`: regenerates `test/oracle_cases.json` from the engine (seeded, deterministic).
- `NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js`: headless Chromium, 34 checks.

## How it is checked
- The oracle re-derives place notation, rows and truth from the definition of a change, for 400 random notations (53 invalid ones must be rejected for the same reason), 600 random touches of four Plain Bob methods, and four **exhaustive** searches: it tries all 3^k call strings and compares the full set of true touches with the engine's pruned depth-first search. 0 mismatches.
- Published facts: Plain Bob plain courses are 24, 40, 60 and 112 rows on 4, 5, 6 and 8 bells; plain hunt on n bells is 2n rows.
- The browser test reads the drawn rows back out of the page and checks that each is a permutation and that no bell moves more than one place.

## Known limits
- A call can only replace the **last change of a lead**. Methods whose calls change several places (Grandsire, Stedman) cannot be entered.
- 4 to 8 bells. Search stops after two million steps and says so; it did not find (or rule out) an extent of Plain Bob Minor up to 12 leads, and the 60-lead search was not run.
- The sound has not been listened to. Only Chromium was driven. The default bob and single for each preset came from memory; truth is checked whatever they are. Nobody has used it.
