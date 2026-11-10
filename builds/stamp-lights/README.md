# Stamp Lights

A Lights-Out puzzle where every puzzle has its own stamp. Pressing a cell toggles the cells under the stamp (clipped at the board edge). Turn all lights off. The page shows the exact fewest presses possible, and Hint recomputes it from wherever you are.

Live: https://s1lvf1sh.github.io/daily-builds/builds/stamp-lights/

## Run
Open `index.html` (static, no build, no network). `#level/seed` in the address reproduces a puzzle; "Today's puzzle" uses the UTC date as the seed.

## Test
- `node test/test.js`: 13 checks, including 150 seeded puzzles per level and an oracle sweep of 2480 boards (needs `python3`).
- `NODE_PATH=$(npm root -g) node test/browser.js [shot.png]`: 15 checks driving the page in headless Chromium (Playwright).

## How it is checked
- The JS solver uses Gaussian elimination over GF(2) plus a search over the free variables. `test/oracle.py` knows none of that: it breadth-first searches all 2^n board states and compares the minimum press count and the solvable/unsolvable verdict.
- Mutations caught: taking the first solution instead of the minimum (18 oracle disagreements), wrapping the stamp round the edges (2 failures), removing the unsolvable test (128 oracle disagreements).
- The browser test follows Hint to the end and checks that it takes exactly the advertised minimum.

## Known limits
- The oracle only reaches boards of up to 20 cells (4x4, 3x5, 5x3, 4x5, 2x2). The 5x5 and 6x6 puzzles are covered by solution-clears-board checks, not by the oracle.
- Most generated puzzles have a unique solution (nullity 0), so "minimum" is rarely tested against alternatives; the oracle sweep includes stamps with many solutions.
- Chromium only. Not played by anyone else, so difficulty and fun are unjudged.
