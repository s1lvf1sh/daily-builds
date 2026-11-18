# Fair Rooms

Flatmates each say what every room is worth to them. Fair Rooms hands out one room per person and sets a price for each room so that **nobody would rather have someone else's room at its price** (envy-free), and the least-happy person is as happy as possible. Prices add up to the rent exactly. A table shows every person's surplus in every room, so the "nobody envies" claim can be read off the page.

Live: https://s1lvf1sh.github.io/daily-builds/builds/fair-rooms/

## Run
Open `index.html` (static, no build, no network). From 2 to 6 people. State is kept in the URL hash, so "Copy share link" shares the whole setup.

## Test
- `node test/test.js`: unit cases, a 600-case random sweep and the oracle comparison.
- `MUTANT=1..6 node test/test.js`: runs a deliberately broken engine; each should fail.
- `NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js`: headless Chromium, 21 checks.
- `cd test && python3 oracle.py gen`: regenerates `oracle_cases.json` (several minutes; pure Python).

## How it is checked
- Every answer is re-verified from the definition with exact fractions: prices sum to the rent, rooms are one-to-one, and no person values another room more than their own at its price.
- An independent Python oracle tries every assignment of people to rooms and enumerates the vertices of the price polyhedron with Fractions, then compares the best minimum surplus with the engine's. The engine only uses one welfare-maximising assignment and a simplex solver, so this also tests the theory that such an assignment is enough.
- Hand-derived cases (for example 1200/800 versus 1000/1000 over rent 2000 gives 1100 and 900), a checker that is shown to reject bad splits, and 6 mutations.

## Known limits
- The maths is exact; the cent-rounded prices on the page are not always exactly envy-free and the page says so when that happens (by at most about a cent per person).
- Bids are only as honest as the people making them. This is the weakest point of every bidding scheme, and it is not addressed here.
- Among several equally good price sets the simplex returns one vertex; there is no further tie-break.
- Up to 6 people (the assignment search is a brute-force over permutations). Only Chromium was driven, and nobody else has used it.
