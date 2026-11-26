#!/usr/bin/env bash
# Switch OFF the demo theme: back to the base install's own theme, logo and favicon.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"  # the base install root
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO"
git checkout -- $(cat "$HERE/files-tracked.txt")
git clean -fdxq -- public/favicon/site   # build leftovers of the demo favicon (only build output lives there)
while read -r f; do rm -f "$f"; done < "$HERE/files-new.txt"
# .env is left alone: with FRONTEND_DEV=false the site keeps loading the built files (rebuilt below)
(cd frontend && yarn prod >/dev/null) && echo "Theme OFF (files restored, rebuilt)."
git status --short -- $(cat "$HERE/files-tracked.txt") frontend/fonts frontend/css/site/base/fonts.css
