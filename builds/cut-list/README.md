# Cut List

Give it the pieces you need to cut and the board (or pipe, or trim) lengths the shop sells, optionally with prices, and your saw kerf. It finds the plan that buys the least, proves nothing cheaper exists, and draws every board with its cuts and offcut. Inches (fractions like `3 1/2` work), millimetres or centimetres.

Live: https://s1lvf1sh.github.io/daily-builds/builds/cut-list/

## Run
Open `index.html` (static, no build, no network). The setup lives in the URL hash, so "Copy share link" shares the whole job.

## Test
- `node test/test.js`: 1230 checks (parsing, hand-derived plans, kerf edge cases, priced choices, every saved oracle case, a larger job, the fallback path).
- `node test/test.js --mutants`: 9 deliberately broken engines; each must fail (`ONLY=3` runs one).
- `python3 test/oracle.py`: independent oracle, about 3 s. Shares no code with `src/cut.js`.
- `node test/gen.js`: regenerates `test/oracle_cases.json` (seeded).
- `NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js`: headless Chromium, 24 checks.

## How it is checked
- The oracle lists every piece separately and runs a subset DP over all 2^n subsets, then compares (cost, boards) with the engine for 400 random jobs (1 to 13 pieces, 1 to 3 board lengths, 170 priced, kerf 0 to 4): 0 mismatches. The engine beat first-fit decreasing on 167 of them.
- Every plan the page draws is re-validated (each piece cut once, no board overfull) before it is shown.
- The browser test reads the drawn boards back out of the page and checks they fit, kerf included.

## Known limits
- One dimension only. Unlimited stock of each length. No piece labels.
- Kerf model: `sum + kerf*(k-1) <= length`; no end trimming. This is my model, unchecked against a real saw.
- Big jobs (roughly 70 pieces with several board lengths) can exceed the 3 s budget. The page then says "not proven cheapest" and offers a 30 s search, during which it is unresponsive.
- Only Chromium was driven. Print layout not examined. Nobody has used it.
