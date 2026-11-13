# Regex Twins

Type two regular expressions and find out, exactly, whether they match the same strings. If not, it shows the shortest string that tells them apart. It also lists each pattern's shortest matches, how many strings of each length it matches, whether it matches finitely or infinitely many strings, and draws the smallest state machine for each.

Live: https://s1lvf1sh.github.io/daily-builds/builds/regex-twins/

## Run
Open `index.html` (static, no build, no network). The pair is kept in the address after `#`.

## Test
- `node test/test.js`: 800 checks, about 4 s. Needs `python3`.
- `NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]`: 16 checks driving the page in headless Chromium.

## How it is checked
- The claim "this DFA matches exactly what the regex matches" is checked against two engines that share no code with it: JavaScript's own `RegExp` (about 20.6 million regex/string pairs: 150 random regexes x every string up to length 6 over 7 characters) and Python's `re` (4000 recorded verdicts).
- Every counterexample the tool prints is re-run through native `RegExp` (must match on one side only) and checked to be shortest (no shorter string over the test alphabet distinguishes the pair). "Twins" verdicts on 150 pairs are checked by brute force on all short strings. Match counts for lengths 1 and 2 are compared with brute force over all 95 characters.
- Five deliberate mutations (bounded repeat off by one, `\w` without underscore, comparison ignoring one side, minimisation stopping early, examples exploring dead states) were each caught.

## Known limits
- Regular subset only: no backreferences, lookaround, anchors, word boundaries, flags or Unicode. The universe is printable ASCII, so `.` means those 95 characters.
- "Twins" proofs over all strings rest on the DFA algorithm, which the brute-force check can only confirm up to length 6 over 7 characters. Both pattern parsers are mine, so a shared misreading of syntax is possible; the native-RegExp comparison covers that only for the syntax the random generator produces.
- Only Chromium was driven. Nobody else has used it.
