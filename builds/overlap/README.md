# Overlap

Add the people on a team (time zone, working hours, working days) and see every window when all of them are at work, week by week. When nobody overlaps it ranks the best compromise meeting times and says who is left out. Exact across daylight-saving changes, half-hour and 45-minute zones, shifts that run past midnight and days that cross the date line.

Live: https://s1lvf1sh.github.io/daily-builds/builds/overlap/

## Run
Open `index.html` (static, no build, no network). The whole setup is kept in the address after `#`, so a link reproduces a team.

## Test
- `node test/test.js`: 21 checks (hand-derived DST facts, plus a sweep of 160 random cases compared with the oracle). Needs `python3`.
- `NODE_PATH=$(npm root -g) node test/browser.js [wide.png] [phone.png]`: 14 checks driving the page in headless Chromium.

## How it is checked
- Rule: a person works at an instant when their local wall clock says the weekday is allowed and the time is in [start, end). End before start means past midnight; start equal to end means the whole local day.
- The JS splits time into stretches of constant UTC offset and does interval arithmetic. `test/oracle.py` knows none of that: it walks every minute of each span with Python `zoneinfo`, asks the wall clock directly, and compares the common windows, the who-is-inside verdict of sampled meeting starts, and the best attendance count. 160 cases (half centred on 2026 DST changes, 20 zones including Lord Howe, Chatham, Kathmandu, Tehran, Havana) gave 0 disagreements at the end.
- The oracle found a real bug on its first run (a "24 hours" window was running from the start time instead of covering the calendar day). Five deliberate mutations (frozen offset, overnight ignored, weekday taken from the wrong date, inclusive end, start-only slot test) were each caught.

## Known limits
- Dates in 2026 only were swept; future rule changes in a zone are only as good as the browser's own tz data (Node 22 here: 2026e).
- The oracle and the code read different copies of the tz database (Python's system copy and the JS engine's ICU), so they could share a blind spot on a zone whose rules both get wrong. A sweep cannot see that.
- Moving working hours inside a day (lunch breaks) and holidays are not modelled.
- Chromium only. Nobody else has used it, so the screen design is unjudged.
