# Build the Clint CLI on demand for yarn watch

**Release date:** 2026-09-02

## Summary

`yarn watch` failed on a fresh clone. The frontend scripts called `node ../clint/dist/cli.js` directly, but `clint/dist/` is a build artifact and is gitignored — so on a clone that had never built Clint, the command exited with `MODULE_NOT_FOUND` (exit code 1) and the `&& vite` never ran. The dev server simply refused to start, with a Node stack trace instead of a useful message.

The frontend scripts now go through a small `frontend/ensure-clint.js` wrapper that builds the CLI once if it is missing, then runs the update check.

## Added

- `frontend/ensure-clint.js` — builds `clint/` (install + build) the first time it is needed, then forwards its arguments to the CLI.

## Changed

- `watch`: `node ../clint/dist/cli.js --checkupdates && vite` → `node ensure-clint.js --checkupdates && vite`
- `dev`: `vite build && node  ../clint/dist/cli.js --checkupdates` → `vite build && node ensure-clint.js --checkupdates`

## Fixed

- **`yarn watch` and `yarn dev` work on a fresh clone**, with no manual Clint build step first.
- **A broken or missing Clint no longer blocks the frontend.** The update check is now advisory: if Clint cannot be built or the check fails, you get a warning and Vite starts anyway. Previously any Clint problem stopped the dev server outright.
- **`init-clint` and `update` pointed at a directory that does not exist.** Both ran `cd clint` from inside `frontend/`, resolving to `frontend/clint`. They now use `cd ../clint`, so `yarn init-clint` and `yarn update` work — `init-clint` in particular is what `yarn start` calls to build Clint in the first place.

# Manual intervention

> ⚠️ **ATTENTION**:
> If your project has customised the `watch`, `dev`, `init-clint` or `update` scripts in
> `frontend/package.json`, the automated replacements will not match and those scripts keep their
> current form. Re-apply the change by hand: call `node ensure-clint.js` instead of
> `node ../clint/dist/cli.js`, and make sure any `cd clint` is `cd ../clint`.
>
> The first `yarn watch` after this update builds the Clint CLI, so it takes a few seconds longer
> than usual. Subsequent runs are unaffected.
