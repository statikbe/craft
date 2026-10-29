# Render tooltips inside dialogs

**Release date:** 2026-08-31

## Summary

Tippy appends every tooltip to `document.body` by default. A modal `<dialog>` opened with
`showModal()` is promoted to the browser's **top layer**, which renders above the whole document
regardless of `z-index` — so a tooltip parked on `body` ended up *behind* the dialog and was
effectively invisible. Any tooltip on a button inside a modal simply never appeared.

Tooltips now resolve their container per reference element: the closest ancestor `<dialog>` when
there is one, `document.body` otherwise. Tooltips outside a dialog are unaffected.

## Added

- `data-tippy-append-to` — optional CSS selector naming the element to render the tooltip into. Use
  it when the automatic choice is wrong, for example a custom overlay that is not a `<dialog>`. If
  the selector matches nothing, the automatic behaviour applies.

## Fixed

- `tooltip.component.ts`: tooltips on a reference inside a modal `<dialog>` are appended to that
  dialog instead of `document.body`, so they are visible. Applies to both `[data-tippy-content]` and
  `[data-tippy-template]` tooltips.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/tooltip.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - **Check any workaround you built for this.** Projects that worked around invisible tooltips in
>   modals — a custom `appendTo`, a `z-index` bump on `.tippy-box`, or moving the trigger out of the
>   dialog — should drop it now, otherwise the two fixes can fight each other.
> - Tooltips inside a dialog are now children of that dialog, so CSS scoped to `body > .tippy-box`
>   (or similar direct-descendant selectors) no longer matches them. Re-check tooltip styling inside
>   modals.
> - If you copied `tooltip.component.ts` into `js/components-site/`, apply the same change there by
>   hand — that folder is never synced.
