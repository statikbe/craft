# Guard element nearest against detached elements

**Release date:** 2026-08-14

## Summary

`ElementPrototype.activateNearest()` installs `Element.prototype.nearest()`, a helper that walks up
the ancestor chain and, at each step, also looks for the selector inside the current ancestor. Each
iteration reassigned `el` to `el.parentElement || el.parentNode` and then immediately called
`el.querySelector(selector)` without checking that a parent was actually found. On an element that
is not attached to the document both `parentElement` and `parentNode` are `null`, so the very first
iteration threw `TypeError: Cannot read properties of null (reading 'querySelector')` instead of
returning `null`. The `el !== null` check in the `while` condition ran too late to prevent it.

## Fixed

- `element.prototypes.ts`: `nearest()` returns `null` as soon as the walk runs out of parents,
  instead of throwing. Its only in-repo caller is the filter component's chip handling
  (`filter.component.ts`), which now degrades to "no match" for chips whose button has already been
  removed from the DOM.

## Changed

- `element.prototypes.ts`: reformatted to the project's Prettier config (single quotes, joined
  wrapped lines) and dropped the commented-out legacy `nearest` implementation at the bottom of the
  file. No behaviour change.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - If your project has custom JS calling `.nearest()` inside a `try/catch` to swallow this crash, or
>   guarding the call site with an `isConnected`/`document.contains()` check, that workaround can now
>   be removed.
> - Custom code that relied on `.nearest()` throwing on a detached element to break out of a loop
>   will now receive `null` and keep going — check for `null` explicitly.
