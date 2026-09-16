# Hierarchical autocomplete options

**Release date:** 2026-08-31

## Summary

An autocomplete built from a hierarchical list — provinces and their cities, categories and their
subcategories — lost the hierarchy as soon as you typed. Filtering kept only the options that matched,
so searching for a city returned that city stripped of the province that gives it meaning, and the
indentation classes on the child options pointed at parents that were no longer on screen.

Options can now declare a `data-parent`, and the component keeps the ancestors of every match in the
list and renders the result in hierarchical order.

## Added

- `data-parent` on an `<option>` — the **value** of another option in the same `<select>`, marking
  this option as its child. Chains to any depth.
- When a child matches the search, its ancestors are added back to the results, and the list is
  reordered so each parent is immediately followed by its own children. Every option is listed once,
  even when several matching children share a parent.

## Changed

- `autocomplete.component.ts`: `fillList()` returns the options it actually rendered, and the live
  region (`updateStatus()`) counts those rather than the pre-hierarchy list.
- `autocomplete.component.ts`: arrow-key opening highlights the first/last *rendered* option, so
  keyboard navigation lands on an option that is really in the list.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/autocomplete.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - **Nothing changes until you opt in.** A `<select>` with no `data-parent` on any option behaves
>   exactly as before — the hierarchy pass is skipped entirely.
> - To adopt it, emit `data-parent="{{ parentId }}"` on the child options. The value must match the
>   `value` of the parent `<option>`, not its label.
> - Indentation is still yours to style. Put a class on the child `<option>` (for example
>   `class="pl-10 text-base"`); the component copies it onto the rendered list item.
> - A parent shown for context is a normal, selectable option. If a parent must never be picked, keep
>   it out of the `<select>` and group the children another way.
> - AJAX autocompletes (`data-ajax-url`) are unaffected: options returned by an endpoint carry no
>   parent, so those lists stay flat.
> - If you copied `autocomplete.component.ts` into `js/components-site/`, apply the same change there
>   by hand — that folder is never synced.
