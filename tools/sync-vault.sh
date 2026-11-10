#!/usr/bin/env bash
# Copy journal notes for new daily builds into an Obsidian vault.
# Usage: tools/sync-vault.sh "/path/to/vault/AI Projects"
# Only copies project folders that are not already in the vault: nothing is overwritten.
set -euo pipefail
dest="${1:?usage: sync-vault.sh \"/path/to/vault/AI Projects\"}"
here="$(cd "$(dirname "$0")/.." && pwd)"
[ -n "${SKIP_PULL:-}" ] || git -C "$here" pull --ff-only -q || echo "WARNING: git pull failed; using the local copy" >&2
for dir in "$here"/journal/*/; do
  [ -d "$dir" ] || continue
  hub="$(grep -m1 '^title:' "$dir"/*.md 2>/dev/null | head -1 | sed 's/.*title: *//' | sed 's/ - .*//')"
  [ -n "$hub" ] || hub="$(basename "$dir")"
  if [ -e "$dest/$hub" ]; then echo "skip   $hub (already in vault)"; else cp -r "$dir" "$dest/$hub"; echo "copied $hub"; fi
done
echo "(ratings: see tools/merge-ratings.py, or run tools/sync-all.sh)"
