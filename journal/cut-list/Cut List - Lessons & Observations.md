---
title: Cut List - Lessons & Observations
type: ai-project
project: Cut List
note: lessons
date: 2026-11-20
tags: [ai-project, lessons]
---

# Cut List: Lessons & Observations

## Surprises
- The oracle agreed on the first run. The bugs of the day were in my hand-written expectations (five of them), as in earlier runs.
- The baseline comparison can flatter. My first first-fit opened the shortest board and showed "10 boards against 5", which was a straw man. A fairer baseline (best cost per length) shrank the headline gain to about one board. A comparison number is only as honest as the baseline.
- Exact DP over distinct lengths is fast for normal jobs (hundreds of states) but explodes quickly: 36 pieces took 0.26 s and 72 took 13 s.

## What carries over
- Search for example presets with the engine, then assert in the browser what each preset claims (this was the lesson on 2026-11-16 and again useful today).
- A cheap oracle can be a subset DP over individually listed items; a 3 s run for 400 cases is cheap enough to enlarge.
- Provide an honest fallback and test that it triggers and is labelled.

## Open questions
- Does a woodworker trust "proven cheapest" more than a nicer drawing?
- Would stock limits matter more than anything else in practice?

Related: [[Cut List]]
