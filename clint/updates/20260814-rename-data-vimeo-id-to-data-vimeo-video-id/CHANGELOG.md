# Rename data-vimeo-id to data-vimeo-video-id

**Release date:** 2026-08-14

## Summary

The videoBackground component now reads the Vimeo ID from `data-vimeo-video-id` instead of
`data-vimeo-id`. `@vimeo/player` auto-initializes any element carrying `data-vimeo-id` as soon as the
module loads, which raced with the component and produced a player built with the SDK's defaults
instead of our background options (`background`, `autoplay`, `loop`, `muted`). Using an attribute the
SDK does not recognize keeps initialization entirely in the component's hands.

## Changed

- `videoBackground.component.ts`: the Vimeo branch and the `aria-hidden` re-init guard now check
  `data-vimeo-video-id`. The YouTube path (`data-youtube-id`) and all other attributes are unchanged.
- `data-vimeo-id` → `data-vimeo-video-id` in `templates/**/*.twig` (automated).
- Docs and the Vimeo background example updated to the new attribute.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/videoBackground.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - The automated rename only covers `templates/**/*.twig`. If `data-vimeo-id` also appears anywhere
>   else in your project — custom JS, CSS/Tailwind selectors, a Craft field default, module or plugin
>   output, or Twig outside `templates/` — rename it there by hand. A missed occurrence means the
>   background video silently stops initializing, since neither the component nor the old attribute
>   drives it anymore.
> - If you copied `videoBackground.component.ts` into `js/components-site/`, apply the same rename
>   there by hand — that folder is never synced.
