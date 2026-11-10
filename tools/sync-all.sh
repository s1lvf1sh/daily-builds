#!/usr/bin/env bash
# Pull the latest daily builds, copy new notes into the vault and merge new ratings.
# Usage: tools/sync-all.sh "/path/to/vault"   Safe to run repeatedly: nothing is overwritten.
# If the pull still fails after 6 tries (about 5 minutes) it exits non-zero, so a stale
# result is never reported as "nothing to merge".
set -euo pipefail
vault="${1:?usage: sync-all.sh \"/path/to/vault\"}"
here="$(cd "$(dirname "$0")" && pwd)"
echo "== $(date -Is)"
ok=
for i in 1 2 3 4 5 6; do
  if git -C "$here" pull --ff-only -q; then ok=1; break; fi
  echo "pull failed (try $i of 6)" >&2; [ "$i" = 6 ] || sleep 60
done
[ -n "$ok" ] || { echo "ERROR: could not pull; vault NOT synced" >&2; exit 1; }
SKIP_PULL=1 "$here/sync-vault.sh" "$vault/AI Projects"
python3 -I "$here/merge-ratings.py" "$vault"
