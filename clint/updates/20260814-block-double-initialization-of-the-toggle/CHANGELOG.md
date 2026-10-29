# Block double initialization of the toggle

**Release date:** 2026-08-14

## Summary

The toggle component now ignores triggers it has already set up. The component loader re-instantiates
a component whenever matching content is added to the DOM (ajax paging, load more, Formie steps, …),
and the constructor queried every `[data-toggle]` on the page each time. Existing triggers therefore
got a second `click` and `keydown` listener, so one click ran `toggleAction()` twice and the panel
snapped straight back to its previous state.

## Fixed

- `toggle.component.ts`: the trigger query is now `[data-toggle]:not([aria-controls])`. Since
  `initToggleTrigger()` sets `aria-controls` on every trigger it initializes, already-initialized
  triggers are skipped on subsequent instantiations and only genuinely new triggers get bound.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/toggle.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - If your project hard-codes `aria-controls` on a `[data-toggle]` trigger in Twig, that trigger is
>   now skipped entirely and will no longer work. Remove the hand-written `aria-controls` — the
>   component sets it for you.
> - If you copied `toggle.component.ts` into `js/components-site/`, apply the same selector change
>   there by hand — that folder is never synced.
