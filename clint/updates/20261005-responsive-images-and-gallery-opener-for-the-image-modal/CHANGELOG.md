# Responsive images and gallery opener for the image modal

**Release date:** 2026-10-05

## Summary

The image modal always loaded the original upload, often a multi-megabyte JPEG, even when the browser could show a much smaller AVIF. It can now take a list of `<picture>` sources, so the browser picks the best format and size. On top of that, any button can now open an image gallery, for example a "View all photos" button next to a grid of thumbnails.

## Highlights

- **`data-modal-srcset`** on an image modal trigger: a JSON array of sources, rendered as `<source>` elements in a `<picture>` around the modal image.
- **`data-open-gallery="<group>"`** on any button: opens the first image of the gallery with that `data-group`.
- **The image content block** now passes AVIF and resized versions to its popup.

## Added

- `data-modal-srcset` takes a JSON array like `[{"type": "image/avif", "srcset": "a-800.avif 800w, a-1600.avif 1600w"}, {"type": "image/jpeg", "srcset": "..."}]`. Each entry can have `srcset` (required), `type`, `media` and `sizes`. In a gallery, each trigger can have its own sources; they are swapped when navigating. Invalid JSON is logged to the console and the modal falls back to `data-modal-image`, which is still required.
- `data-open-gallery` works for buttons on the page at load and for buttons added later (e.g. through AJAX). Focus returns to the button when the modal closes.
- `data-picture-style` adds classes to the new `modal__picture` wrapper, like the existing `data-image-style`.
- `.modal__picture { display: contents; }` in `modal.css`, so the wrapper doesn't change the modal layout.

## Changed

- The image modal loader now only appears when an image takes longer than 100ms to load. Cached images load well within that time, so the loader no longer flashes when reopening or navigating to an image that was already seen.

- `frontend/js/plugins/modal/image.plugin.ts`: the modal image is now an `<img>` inside a `<picture>`. The existing `.modal__image` class and styling stay on the `<img>`.
- `templates/_site/_snippet/_content/_blocks/_image.twig` (automated): when "show larger version in popup" is on, the popup button gets `data-modal-srcset` with an AVIF source (when the server supports AVIF) and one in the image's own format. Widths are 800, 1200, 1600 and 2400, limited to the original width so images are never upscaled. SVG and GIF images are left as they were.

## Fixed

- **Images in the modal no longer stay invisible after the first open.** Closing the modal added `hidden` to the image and nothing removed it again, so from the second open on the image loaded but was not shown. The image now becomes visible again once it has loaded.
- **A single image (without `data-group`) no longer opens empty the second time.** Closing cleared its `src`, and reopening only restored it for gallery images.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/modal_image.html), in the new "Responsive Images Example" and "Open Gallery Example" sections.

# Manual intervention

> ⚠️ **ATTENTION**:
> `image.plugin.ts` and `modal.css` are **overwritten** with the base version. If your project
> changed either file, re-apply those changes after updating (check `git diff`).
>
> The `_image.twig` change only applies when the popup button still looks like the base template:
> `{% if block.showLargerVersionInPopup %}` followed directly by
> `<button type="button" ... data-modal-image="{{ image.getUrl() }}"`. If your project changed that
> part, nothing is replaced and the popup keeps working as before, with the original image. To get
> the AVIF and resized versions, copy the `popupSources` block and the `data-modal-srcset` attribute
> from the base `_image.twig` by hand.
>
> If your project renamed or removed `_image.twig`, this update fails on the missing file. Restore
> the file, or record the update without applying it.
>
> Run `yarn build` (or restart `yarn watch`) after updating.
