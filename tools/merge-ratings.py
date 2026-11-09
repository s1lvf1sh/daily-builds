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

moc.write_text(moc_s); rat.write_text(rat_s)
print("\n".join(added) if added else "ratings: nothing to merge")
