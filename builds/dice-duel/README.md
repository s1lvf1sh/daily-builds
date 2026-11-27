# Dice Duel

Type two dice expressions (for example `2d20kh1+5` and `d20+10`) and see, exactly, which one wins, how often it ties, each one's distribution, and the chance of reaching a target total. You can also roll them for real and compare the tally with the exact answer.

**Live:** https://s1lvf1sh.github.io/daily-builds/builds/dice-duel/

## Syntax
`NdM`, `dM`, `d%`, keep/drop `kh kl dh dl` with an optional count (`4d6dl1`, `2d20kh1`, `8d6kh3`), integers, `+ - *`, parentheses, unary minus. Limits: 100 dice, 1000 sides.

## Run and test
Open `index.html` (no server or build). Tests:

```
node --test test/dice.test.mjs                       # needs python3 for the oracle
NODE_PATH=$(npm root -g) node test/browser.mjs [dir] # Playwright Chromium; optional screenshot dir
```

## How it is checked
- `test/oracle.py` enumerates every die outcome by brute force (itertools) for 120 random expressions per seed, 3 seeds (360 cases, up to about 3 million outcomes each), and the engine's exact counts must match.
- Published values: 4d6 drop-lowest mean 12.2446, d20 advantage mean 13.825, P(20 with advantage) 0.0975.
- 15 hand-made engine mutants were all caught by the tests.
- Real Chromium: page counts equal the engine's, typing, links, presets, 1000 real rolls near the exact odds, 375 px width.

Not checked: nobody has used it, and the page was not tried in Firefox or Safari.
