# Clear textarea and select in hidden optional blocks

**Release date:** 2026-08-31

## Summary

When an optional block is hidden, its form elements are cleared. Until now only `input` elements were
actually reset: `textarea` and `select` elements were collected (both by `clearAllOnHide` and by
`[data-clear-on-hide]`) but then skipped, so their values were still submitted with the form even
though the block was no longer visible.

## Fixed

- `formOptionalBlocks.component.ts`: hiding an optional block now empties any `textarea` and resets
  any `select` back to its first option, alongside the existing `input` clearing.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - Selects are reset to `selectedIndex = 0`. If a select inside an optional block has no empty
>   placeholder option, it will fall back to its first real option — add a placeholder option if the
>   field must come back empty.
> - If you copied `formOptionalBlocks.component.ts` into `js/components-site/`, apply the same change
>   there by hand — that folder is never synced.
