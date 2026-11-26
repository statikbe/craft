#!/bin/bash
# Copies the demo content script + images into the base install (storage/runtime/, gitignored) and runs it.
# Usage: bash course/demo/run.sh [--cleanup] [--refresh] [--state=3.1]
#   --cleanup   first remove everything that isn't part of the demo (cleanup.php + the content builder showcase)
set -e
D="$(cd "$(dirname "$0")" && pwd)"
P="$(cd "$D/../.." && pwd)"  # the base install root (course/demo/../..)
CLEANUP=0; ARGS=()
for a in "$@"; do if [ "$a" = "--cleanup" ]; then CLEANUP=1; else ARGS+=("$a"); fi; done
[ -s "$D/images/team-femke.jpg" ] || bash "$D/download-images.sh"
mkdir -p "$P/storage/runtime/demo-images"
cp "$D/demo-content.php" "$D/cleanup.php" "$P/storage/runtime/"
rsync -a "$D/images/" "$P/storage/runtime/demo-images/"
cd "$P"
if [ "$CLEANUP" = 1 ]; then
  # The content row showcase (slug gridbuilder) and its images; `ddev craft statik/contentbuilder` brings it back
  ddev craft statik/contentbuilder-cleanup --with-images --hard-delete --interactive=0 || true
  ddev exec php storage/runtime/cleanup.php
fi
ddev exec php storage/runtime/demo-content.php "${ARGS[@]}"
ddev craft queue/run >/dev/null 2>&1 || true
# Index the demo pages in Link Checker (console saves aren't indexed) and check the external links
ddev craft link-checker/rebuild >/dev/null 2>&1 || true
ddev craft queue/run >/dev/null 2>&1 || true
ddev craft link-checker/check-urls >/dev/null 2>&1 || true
ddev craft queue/run >/dev/null 2>&1 || true
