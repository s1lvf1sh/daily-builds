#!/usr/bin/env python3
"""Merge new daily-build ratings into an Obsidian vault. Idempotent: adds only what is missing, never edits existing lines.
Usage: merge-ratings.py "/path/to/vault"   (the folder that holds 'AI Projects MOC.md' and 'AI Projects/')"""
import json, re, sys, pathlib

vault = pathlib.Path(sys.argv[1])
here = pathlib.Path(__file__).resolve().parent.parent
moc = vault / "AI Projects MOC.md"
rat = vault / "AI Projects" / "AI Project Ratings.md"
R = (here / "docs" / "RATINGS.md").read_text()
builds = json.loads((here / "builds.json").read_text())["daily"]
moc_s, rat_s = moc.read_text(), rat.read_text()
added = []

def section(title):
    m = re.search(r"### " + re.escape(title) + r": .*?\n(.*?)(?=\n### |\n## |\Z)", R + "\n\n## ", re.S)
    return m.group(0).strip() + "\n\n" if m else None

for b in builds:
    t = b["title"]
    if b.get("status") != "complete" or not (vault / "AI Projects" / t).is_dir():
        continue  # only complete builds whose notes are already in the vault
    # MOC row
    if f"[[{t}]]" not in moc_s:
        row = f"| [[{t}]] | {b['blurb']} (daily build) | {b['status']} | {b['date']} | {b['rating']} |\n"
        lines = moc_s.splitlines(True)
        idx = max(i for i, l in enumerate(lines) if l.startswith("| [["))
        lines.insert(idx + 1, row)
        moc_s = "".join(lines); added.append(f"MOC row: {t}")
    # ratings table row + section
    src = next((l for l in R.splitlines() if re.match(r"\| \d{4}-\d\d-\d\d \| " + re.escape(t) + r" \|", l)), None)
    if src and f"[[{t}]] |" not in rat_s:
        row = src.replace(f"| {t} |", f"| [[{t}]] |", 1) + "\n"
        lines = rat_s.splitlines(True)
        idx = max(i for i, l in enumerate(lines) if re.match(r"\| \d{4}-\d\d-\d\d \| \[\[", l))
        lines.insert(idx + 1, row)
        rat_s = "".join(lines); added.append(f"rating row: {t}")
    if f"### {t}: " not in rat_s:
        sec = section(t)
        if sec:
            m = "## What the first round shows"
            rat_s = rat_s.replace(m, sec + m, 1); added.append(f"rating note: {t}")

# Re-ratings: any dated row or note section the vault does not have yet. Originals are never touched.
canon = {}
for line in R.splitlines():
    m = re.match(r"\| (?:\d{4}-\d\d-\d\d \| )?([^|]+?) \|", line)
    if m and not m.group(1).startswith(("Project", "---", "Date")):
        canon.setdefault(re.sub(r"[^a-z0-9]+", " ", m.group(1).lower().replace("'", "")).strip(), m.group(1).strip())
canon_of = lambda t: canon.get(re.sub(r"[^a-z0-9]+", " ", t.lower().replace("'", "")).strip(), t)
latest = {}
for line in R.splitlines():
    m = re.match(r"\| (\d{4}-\d\d-\d\d) \| ([^|]+?) \|", line)
    if not m or m.group(2).strip() in ("Project",):
        continue
    t = canon_of(m.group(2).strip())
    if not (vault / "AI Projects" / t).is_dir():
        continue
    key = f"| {m.group(1)} | [[{t}]] |"
    row = line.replace(f"| {m.group(2).strip()} |", f"| [[{t}]] |", 1) + "\n"
    if row.rstrip("\n") not in rat_s:  # match the whole row: a same-day re-rating shares its date and title with the original
        lines = rat_s.splitlines(True)
        idx = max(i for i, l in enumerate(lines) if re.match(r"\| \d{4}-\d\d-\d\d \| \[\[", l))
        lines.insert(idx + 1, row); rat_s = "".join(lines); added.append(f"re-rating row: {t} {m.group(1)}")
    cells = [c.strip() for c in line.split("|")[1:-1]]
    latest[t] = cells[8].strip("*") if len(cells) > 8 else None  # cells: date, title, six axes, overall, cap, confidence
for part in re.split(r"\n(?=### )", R):
    h = re.match(r"### (.+?): \d", part)
    if not h or "outside verdict" not in part.split("\n")[0]:
        continue
    head = part.split("\n")[0].strip()
    if head not in rat_s:
        sec = part.strip().split("\n## ")[0].strip() + "\n\n"
        m2 = "## What the first round shows"
        rat_s = rat_s.replace(m2, sec + m2, 1); added.append(f"re-rating note: {head}")
# keep the MOC's rating column at the latest overall
lines = moc_s.splitlines(True)
for i, l in enumerate(lines):
    mm = re.match(r"\| \[\[([^\]]+)\]\]", l)
    if mm and mm.group(1) in latest and latest[mm.group(1)]:
        cells = l.rstrip("\n").split("|")
        if cells[-2].strip() != latest[mm.group(1)]:
            cells[-2] = f" {latest[mm.group(1)]} "; lines[i] = "|".join(cells) + "\n"; added.append(f"MOC rating: {mm.group(1)} -> {latest[mm.group(1)]}")
moc_s = "".join(lines)

moc.write_text(moc_s); rat.write_text(rat_s)
print("\n".join(added) if added else "ratings: nothing to merge")
