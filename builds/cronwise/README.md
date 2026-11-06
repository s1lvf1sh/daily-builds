# Cronwise

Type a cron expression and get plain English, the next ten run times (UTC and your local time) and a 7×24 map of a typical week. Static page, no dependencies, no network.

**Run:** open `index.html` (or visit the live page). **Test:** `node test/run.js` (needs `python3`) and `node test/browser.js` (needs Playwright with Chromium).

## Scope
Standard 5-field cron in UTC: `*`, lists, ranges, steps, `JAN`–`DEC`, `SUN`–`SAT`, `7` as Sunday, and `@hourly @daily @midnight @weekly @monthly @yearly`. When both day-of-month and day-of-week are restricted, either triggers (Vixie cron). Not supported: Quartz/AWS dialects, `L W # ?`-style extras (a lone `?` is accepted as `*`), seconds, time zones other than UTC and the browser's display zone, daylight-saving behaviour (UTC has none).

## How it is checked
- `test/oracle.py` is an independent implementation in another language with a different algorithm (calendar-day walk, per-hour/minute enumeration). `test/run.js` compares 413 expressions (13 hand-picked edge cases and 400 seeded random ones) × 6 next-run times against it. The test was shown to fail when the day-matching rule was deliberately broken (111 failures).
- A minute-by-minute brute-force scan checks the fast jump-ahead search over 40 days for 5 expressions.
- 14 invalid expressions must be rejected; 5 English descriptions are pinned.
- `test/browser.js` drives the page in headless Chromium (11 checks).

Not checked: the English wording is only tested on a handful of expressions; the oracle was written by the same author as the code, so a shared misreading of the cron spec would pass both; no comparison against a real crond; no Firefox/Safari; no screen-reader testing.
