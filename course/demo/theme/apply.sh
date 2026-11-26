#!/usr/bin/env bash
# Switch ON the "De Heidestappers" demo theme in the LOCAL base install (colours, fonts, logo, favicon).
# NEVER commit these changes: the base install ships to every new project.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"  # the base install root
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO"
if git apply --check -R --binary "$HERE/demo-theme.patch" 2>/dev/null; then
  echo "Demo theme is already applied."
else
  # refuse when one of the files has other uncommitted changes
  dirty=$(git status --porcelain -- $(cat "$HERE/files-tracked.txt") | grep -v '^??' || true)
  if [ -n "$dirty" ]; then echo "These files have other uncommitted changes, not applying:"; echo "$dirty"; exit 1; fi
  git apply --binary "$HERE/demo-theme.patch"
  echo "Patch applied."
fi
# Use the built files, not a Vite dev server on :3000 (that may be another project's)
grep -q '^FRONTEND_DEV=false' .env || echo 'Note: set FRONTEND_DEV=false in .env yourself, so the site loads the built files.'
(cd frontend && yarn prod >/dev/null) && echo "Built. Theme ON. Remember: don't commit these files:" && cat "$HERE/files-tracked.txt" "$HERE/files-new.txt" | sed 's/^/  /' | head -12 && echo "  ..."
