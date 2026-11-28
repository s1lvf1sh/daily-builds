# Gerrymander Lab

An n×n grid of voters (orange or teal) is cut into n connected districts of n cells each. Paint districts by dragging, flip voters by clicking, and see who wins each district and the whole map. Then compare your map with **every** possible cut of that grid: a histogram of seats, the best and worst maps for each side, and a challenge ("Orange has 40% of the voters; make it win 3 of 5 seats") that the page already knows is possible or not.

**Live:** https://s1lvf1sh.github.io/daily-builds/builds/gerrymander-lab/

## Rules
- Grids 3×3 to 6×6. A district is exactly n cells, all joined by edges.
- The majority in a district takes its seat; in an even-sized district (4×4, 6×6) a tie gives the seat to nobody.
- There are 10, 117, 4,006 and 451,206 ways to cut the 3×3, 4×4, 5×5 and 6×6 grids. The page counts all of them (6×6 takes about two seconds, so it asks first).

## Run and test
The page loads `src/gerry.js` as an ES module, so serve the folder (`npx serve`, `python3 -m http.server`) or use the live site; opening the file directly from disk will not work in most browsers.

```
node --test test/gerry.test.mjs                          # needs python3 for the oracle; about 40 s
NODE_PATH=$(npm root -g) node test/browser.mjs [shotdir] # Playwright Chromium, serves the folder itself
```

## How it is checked
- The cut counts match the published sequence for dividing an n×n square into n connected regions of n cells (1, 2, 10, 117, 4006, 451206).
- `test/oracle.py` shares no code with the engine: it lists every connected n-cell set, then counts exact covers with a memoised bitmask DP and tracks the (orange seats, teal seats) distribution. The engine's whole histogram equals it on 60 random maps of sizes 3 to 5 and 6 random 6×6 maps (451,206 cuts each). The oracle is itself checked against a brute force over all labelled assignments on 3×3.
- Every enumerated cut is re-validated by a separate `judge()` function; the best and worst maps returned really give the claimed seats.
- 17 hand-made engine mutants were run (see the journal for results).
- Real Chromium (22 checks): drag-painting, erasing, flipping, buttons, share links, all four sizes, a 375 px phone view, no console errors.

Not checked: nobody has used it; only Chromium was tried; keyboard-only use is not supported (cells are pointer targets); the page does not say which cuts are "fair" or "compact", only what is possible.
