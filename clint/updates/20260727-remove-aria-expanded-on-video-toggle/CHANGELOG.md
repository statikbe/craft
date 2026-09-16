# Remove aria-expanded on video toggle

**Release date:** 2026-07-27

## Summary

Following an AnySurfer accessibility audit, the video toggle no longer sets `aria-expanded` on its
trigger. The trigger is hidden or has its label swapped out once the video plays, so it does not
behave as a disclosure control and the expanded/collapsed state was misreported to screen readers.
`aria-controls` on the trigger is unchanged.

## Changed

- `videoToggle.component.ts`: removed the initial `aria-expanded="false"` on the trigger, and the
  `aria-expanded` updates in `openVideo()` and `closeVideo()`.
- `videoToggle.component.ts`: Prettier formatting (trailing comma on the iframe `allow`
  `setAttribute` call). No behaviour change.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/videoToggle.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - If your project has custom CSS or JS that keys off `[aria-expanded]` on a video toggle trigger
>   (for example to swap a play/pause icon), it will no longer match — switch it to a class or to the
>   `videotoggle.open` / `videotoggle.close` custom events.
> - If you copied `videoToggle.component.ts` into `js/components-site/`, apply the same removal there
>   by hand — that folder is never synced.
