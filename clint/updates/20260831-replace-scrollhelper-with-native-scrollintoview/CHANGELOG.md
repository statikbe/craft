# Replace ScrollHelper with native scrollIntoView

**Release date:** 2026-08-31

## Summary

`ScrollHelper.scrollToY()` hand-rolled a scroll animation with `requestAnimationFrame` and
`window.scrollTo()`. Every browser we support now implements `scrollIntoView({ behavior: 'smooth' })`
natively, so the helper is gone and its callers scroll with the native API instead. Native smooth
scrolling also respects the user's `prefers-reduced-motion` setting, which the manual animation
ignored.

Because the browser now owns the scroll duration, the scroll-speed setting no longer does anything
and has been removed as well.

## Changed

- `filter.component.ts`: scrolls to the results/loader element with
  `scrollIntoView({ behavior: 'smooth', block: 'start' })`. The mobile-breakpoint and
  `disableScrollOnMobile` logic around it is unchanged.
- `ajaxSearch.component.ts`: same replacement for the `scrollToResults` behaviour.
- `ajaxSearch.component.ts`: Prettier formatting (trailing commas). No behaviour change.

## Removed

- `js/utils/scroll.ts` — the `ScrollHelper` class. No component references it any more.
- `data-filter-scroll-speed` — the attribute is no longer read by `filter.component.ts`, and the
  `scrollSpeed` field that backed it is gone. **Removed from your Twig automatically** (see below).
- The unused `scrollSpeed` field on the toggle component. Its `animationSpeed` field, which drives
  the open/close animation, is untouched.

## Automated

- `data-filter-scroll-speed="…"` is stripped from `templates/**/*.twig`. The rule only matches the
  attribute when it sits on its own line — the standard formatting — and correctly keeps a trailing
  `>` when it was the last attribute on the tag.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - **`js/utils/scroll.ts` is not removed automatically.** The updater only syncs files, it never
>   deletes them, so the now-unused file stays behind in your project. Delete
>   `frontend/js/utils/scroll.ts` by hand — but only after checking that nothing in your project
>   still imports `ScrollHelper`:
>   `grep -rn "ScrollHelper" frontend/js`
>   If a `js/components-site/` component or other custom code still uses it, either migrate that code
>   to `scrollIntoView({ behavior: 'smooth', block: 'start' })` too, or keep the file.
> - If a `data-filter-scroll-speed` attribute in your project sits on the *same* line as other
>   attributes, the automated rule leaves it alone. It is inert, so this is harmless — remove it by
>   hand if you want it gone: `grep -rn "data-filter-scroll-speed" templates/`
> - Smooth scrolling now stops when `prefers-reduced-motion: reduce` is set. This is intended, but if
>   you have visual regression tests that capture mid-scroll state, expect them to differ.
