# Clear image on close of image modal

**Release date:** 2026-08-28

## Summary

The image modal plugin reuses the same `dialog` element across openings, so the previously viewed
image stayed in the DOM after closing. On the next open, that stale image was visible for a moment
before the new `src` finished loading. The plugin now listens for the dialog's `close` event and
resets the image, so reopening always starts from the loader state.

## Fixed

- `image.plugin.ts`: on the dialog's `close` event, the image `src` is emptied and the image gets the
  `hidden` class, preventing the previous image from flashing when the modal is reopened.

## Changed

- `image.plugin.ts`: Prettier formatting (trailing commas in the `galleryGroup` and `captionGroup`
  `map()` calls). No behaviour change.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/modal.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - If you copied `image.plugin.ts` into `js/components-site/`, or created your own image modal
>   plugin, apply the same `close` listener there by hand — that folder is never synced.
> - If your project styles the modal image on the assumption it always has a `src` (for example a
>   background or aspect-ratio placeholder), check that the `hidden` class on the closed state does
>   not leave a visible gap.
