# Rankwise

Enter how a group ranks its options (`3: Pizza > Tacos > Sushi`) and see who wins under six voting rules: plurality, instant runoff, Borda, Copeland, minimax and Schulze. The page says when the rules disagree, shows a head-to-head matrix and the instant-runoff rounds, flags whether a Condorcet winner exists, and keeps the ballots in the address bar so a link shares the poll. Ties are reported as ties, never broken at random.

Live: https://s1lvf1sh.github.io/daily-builds/builds/rankwise/

## Run
Open `index.html` (static, no build, no network).

## Test
- `node test/test.js`: 15 checks, about 2 seconds. Needs `python3`.
- `NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]`: 21 checks in headless Chromium.

## How it is checked
- Independent oracle (`test/oracle.py`): expands every voter individually, uses exact fractions, and finds the Schulze winner by enumerating every simple path rather than by Floyd-Warshall. 2,830 random cases x 6 methods plus the pairwise matrix and the Condorcet winner agree (0 mismatches). The sweep contains 595 cases where the methods disagree, 349 with no Condorcet winner and 410 with ties.
- Laws: whenever a Condorcet winner exists, Copeland, minimax and Schulze must pick it alone (checked on all 2,481 such cases).
- A published example (Schulze's 45-voter, 5-candidate example) gives winner E and the expected pairwise row.
- Eight mutations of the engine were each caught.

## Known limits
- The oracle and engine share my definitions of the rules, in particular the ballot convention (unlisted options tied last), IRV tie handling (eliminate every tied-lowest option together) and Borda with ties. A different but legitimate convention would give different answers; the page states mine.
- Ballots are strict rankings (no "A = B"), at most 12 options. Only Chromium was driven. Nobody else has used it.
