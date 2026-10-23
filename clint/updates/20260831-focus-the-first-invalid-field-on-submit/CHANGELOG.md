# Focus the first invalid field on submit

**Release date:** 2026-08-31

## Summary

When a form failed validation on submit, `submitForm()` moved focus to whichever field happened to be
first in the form (`index === 0`) — valid or not. On a long form that meant the page scrolled to the
first error while the keyboard focus sat on an unrelated field at the top, so screen reader users
were announced the wrong field and keyboard users had to tab back down to the actual problem.

Focus now lands on the first field that actually fails validation, using the same
first-match-wins guard the scroll-to-error behaviour already used.

## Fixed

- `validation.component.ts`: focus the first *invalid* field on a failed submit instead of the first
  field in the form. A `focused` flag mirrors the existing `scrolled` flag so only the first invalid
  field is focused, not every one of them.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - Focus is applied whenever a submit fails — it is not gated behind `data-scroll-to-error="false"`, which
>   only controls the scrolling. This is unchanged, but worth knowing if you disabled scroll-to-error
>   and expected focus to stay put too.
> - If your project has end-to-end tests that assert focus lands on the first field after a failed
>   submit, update them to expect the first invalid field.
> - If you copied `validation.component.ts` into `js/components-site/`, apply the same change there by
>   hand — that folder is never synced.
