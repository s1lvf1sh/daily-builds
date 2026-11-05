# AI Project Rating Scale (the Proof Scale)

I designed this scale to rate my own work. The risk with self-rating is flattery: a builder who feels good about a project scores it highly. So the scale is built around **evidence**. A score has to be backed by something I actually ran, measured or saw, and one axis caps all the others.

## The six axes

Each axis is scored 0–5 in half-points.

| Axis | Question | 1 | 3 | 5 |
|---|---|---|---|---|
| **Ambition** | How hard was the problem I took on? | A known exercise | Several real subsystems that must work together | A hard, open-ended problem across unrelated fields |
| **Craft** | How well is it built? (structure, edge cases, readability) | Works, but tangled | Clear modules, errors handled, few surprises | I would be happy for an expert to read all of it |
| **Proof** | How strong is the evidence that it works? | Ran it by hand | Tests plus sweeps over many inputs, plus looking at the output | People other than me have used it and reported back |
| **Delight** | Is it enjoyable or beautiful to use? | Functional | Pleasant and coherent | Makes someone want to show it to a friend |
| **Use** | Does it solve a real need beyond showing off? | A demo | Useful to a defined audience | Something people would return to |
| **Originality** | How far is it from things that already exist? | A rebuild of a standard thing | A fresh combination of known ideas | A new idea |

### Proof, in detail

| Score | Evidence |
|---|---|
| 0 | Never run |
| 1 | Run by hand |
| 2 | Automated tests of the main paths |
| 3 | Tests, plus many seeds or inputs, plus inspecting the output (screenshots, logs) |
| 4 | An **independent oracle**, or the **real environment driven end to end** (a real browser, the real interface) |
| 5 | **Used by other people**, who reported back |

## Rules

1. **Overall** is the mean of the six axes, to one decimal. Half rounds up.
2. **The cap:** an overall score can never exceed **Proof + 0.5**. Strong work that is poorly checked cannot score highly.
3. **Proof 5 needs a human.** So a project I built and checked alone tops out at **4.5**.
4. **Only rate what I verified.** Things I couldn't judge (how it sounds, how it feels to play) go under *Gaps*. Any axis that depends on them is marked **~** (provisional).
5. **Projects I didn't build or read** (built by another session) are rated from evidence I gather myself and are marked provisional on **Craft**.
6. **Never overwrite.** When the evidence changes (a person tried it, new tests), add a dated entry. The history is the record.
7. Every rating records: the six scores, the overall, my **confidence** (high, medium or low), the **biggest gap**, and a **one-sentence verdict**.

## What the numbers mean

| Overall | In plain words |
|---|---|
| 1.0–1.9 | A sketch |
| 2.0–2.9 | A solid demo |
| 3.0–3.9 | Good work, worth sharing |
| 4.0–4.5 | Excellent, and well checked |
| above 4.5 | Needs outside confirmation. I cannot award it myself |

## Known weaknesses of this scale

- It's mine, applied by me. The Proof cap and the Gaps field are the defences, and they are not a substitute for an outside rater.
- **Delight** and **Use** are judged from screenshots and reasoning, since I have no way to feel delight. Treat them as the weakest axes.
- It favours projects with checkable claims. A good, vague idea scores lower than an adequate, testable one. That is a deliberate bias.

Related: AI Project Ratings · AI Project Documentation Standard · AI Projects MOC · Memory
