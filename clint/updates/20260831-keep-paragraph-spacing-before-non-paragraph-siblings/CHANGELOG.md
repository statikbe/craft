# Keep paragraph spacing before non-paragraph siblings

**Release date:** 2026-08-31

## Summary

The rule that strips the bottom margin off a trailing paragraph used `p:last-of-type`, which matches
the last `<p>` **among its sibling paragraphs** — whether or not anything follows it. In rich text
that mixes paragraphs with other elements, that paragraph is very often not the last thing in the
container, so the gap between it and the list, image, blockquote or embed that came after it
collapsed to zero.

`p:last-child` matches only when the paragraph really is the final child of its parent, which is the
case the reset was meant for.

## Fixed

- `css/site/base/base.css`: a paragraph followed by a non-paragraph sibling keeps its bottom margin.
  A paragraph that genuinely ends its container still has the margin removed, as before.

## Changed

- `css/site/base/base.css`: Prettier formatting of the `dialog` `transition` shorthand (one value per
  line). No behaviour change.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - **This adds vertical space back where it was previously collapsed.** Anywhere a paragraph is
>   followed by a list, image, table, blockquote or embed — CKEditor output and content blocks most of
>   all — now has a `--spacing(4)` gap it did not have before. Check your content templates and
>   long-form pages after applying.
> - If your project added its own rule to compensate for the missing gap (an extra `margin-top` on
>   `ul`/`figure` after a paragraph, or a `p + * { margin-top: … }`), remove it — otherwise the
>   spacing will now be doubled.
> - If your project deliberately relies on the old behaviour somewhere, override it locally rather
>   than reverting this file: `p:last-of-type { margin-bottom: 0; }` in your own CSS.
> - `frontend/css/` is excluded from the normal sync, so this file is force-synced by the update. Any
>   local edits you made to `base.css` will be overwritten — check `git diff` after applying and
>   re-apply your changes if needed.
