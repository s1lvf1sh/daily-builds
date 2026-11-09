# Even Split

Type who paid what, one line each, and get the fewest payments that settle the group, in exact cents.

```
ana paid 142.80 cabin for all
cy paid 61 boat hire for ana:2, bo, cy
dee paid 24.90 pizza for all except cy
bo sent ana 20
```

Live: https://s1lvf1sh.github.io/daily-builds/builds/even-split/

## Run
Open `index.html` (static, no build, no network). The text is kept in the URL hash, so "Copy link" shares a whole session.

## Test
- `node test/test.js`: unit checks, a 400-case seeded sweep, and an independent Python oracle (`test/oracle.py`, needs only `python3`).
- `NODE_PATH=$(npm root -g) node test/browser.js [screenshot.png]`: 12 checks driving the page in headless Chromium (Playwright).

## How it is checked
- Shares are whole cents and always sum to the expense exactly (largest-remainder rounding).
- The oracle recomputes every balance with exact fractions from the text alone (JS must be within one cent per expense) and finds the true minimum number of transfers with a different search (iterative deepening over transfers), compared with the JS subset-partition answer.
- Mutations: dropping a remainder cent gave 636 failures; disabling the exact search failed the oracle on cases with independent groups.

## Known limits
- Past 18 people with a balance, it falls back to a greedy answer (at most n-1 payments), labelled as not a proven minimum.
- The oracle's search shares one assumption with the code: some optimal plan clears one person per payment. Weights beyond 1-3 and `all except` are covered only by unit tests, not the oracle. Only Chromium was tried. No one else has used it.
- One currency, two decimals. Names are single words.
