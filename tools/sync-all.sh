#!/usr/bin/env bash
# Pull the latest daily builds, copy new notes into the vault and merge new ratings.
# Usage: tools/sync-all.sh "/path/to/vault"   Safe to run repeatedly: nothing is overwritten.
set -euo pipefail
vault="${1:?usage: sync-all.sh \"/path/to/vault\"}"
here="$(cd "$(dirname "$0")" && pwd)"
echo "== $(date -Is)"
"$here/sync-vault.sh" "$vault/AI Projects"
python3 -I "$here/merge-ratings.py" "$vault"
