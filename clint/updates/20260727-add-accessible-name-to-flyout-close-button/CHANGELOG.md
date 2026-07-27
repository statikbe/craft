# Add accessible name to flyout close button

**Release date:** 2026-07-27

## Summary

The full-screen backdrop behind the flyout is a `<button>` that closes the flyout, but it had no
content, so screen readers announced an unnamed button. This update adds a visually hidden label to
it, matching the label already present on the flyout's icon close button.

## Fixed

- `templates/_site/_snippet/_global/_flyout.twig` — the backdrop close button
  (`data-flyout-close="flyout"`) now contains `<span class="sr-only">{{ 'Sluiten'|t }}</span>`, giving
  it an accessible name (automated).

# Manual intervention

> ⚠️ **ATTENTION**:
> The automated replacement only matches the base markup (a backdrop button ending in
> `data-flyout-close-active-class="opacity-100"></button>`). If your project customised the flyout
> backdrop button — different classes, a different attribute order, or a different template path —
> add the `sr-only` label yourself:
>
> ```twig
> <button type="button" class="..." data-flyout-close="flyout" ...>
> 	<span class="sr-only">{{ 'Sluiten'|t }}</span>
> </button>
> ```
>
> The same applies to any other content-less close buttons in your project (modals, drawers,
> off-canvas navigation): each needs either visible text or an `sr-only` label.
