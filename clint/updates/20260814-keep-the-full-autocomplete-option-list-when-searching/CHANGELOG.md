# Keep the full autocomplete option list when searching

**Release date:** 2026-08-14

## Summary

The autocomplete component kept its complete set of options in an internal `options` list, but every
keystroke overwrote that list with the results of the current search. The full list was therefore
lost as soon as the user typed, and any later action that falls back to it — clearing the field,
reopening the menu, pressing arrow down, or a `jschange` on the underlying `<select>` — rendered the
previous search's leftovers instead of all options. For non-AJAX autocompletes the filter also runs
against that same list, so searches narrowed progressively: after typing `br` and clearing back to
`b`, options that no longer matched `br` never came back.

## Fixed

- `autocomplete.component.ts`: `onTextBoxType()` no longer assigns the search results to
  `this.options`. The search results are still what gets rendered in the dropdown for the typed term;
  only the destructive overwrite of the master option list is gone.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/autocomplete.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - If you copied `autocomplete.component.ts` into `js/components-site/`, apply the same removal there
>   by hand — that folder is never synced.
> - If your project has custom JS that reads the component's option list after a search and relied on
>   it holding only the matching options, it now sees the full list again.
> - Re-test AJAX-backed autocompletes (`data-ajax-url`), especially single and multiple select without
>   `free-type`: selecting a result that was fetched by typing now looks that option up in the master
>   list, which no longer receives fetched options.
