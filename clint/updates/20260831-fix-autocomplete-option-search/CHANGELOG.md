# Fix autocomplete option search

**Release date:** 2026-08-31

## Summary

Searching in a non-ajax autocomplete was destructive. `onTextBoxType()` called `getOptions()` — which
for a non-ajax autocomplete returns a *filtered subset* of the option list — and then assigned that
subset back to `this.options`. The full list was gone from that point on: every further keystroke
filtered an already-filtered list, and clearing the input never brought the missing options back. The
only way out was to reload the page.

The ajax and non-ajax paths are now separated. Only the ajax branch replaces `this.options` (there it
is correct — the server owns the result set); the non-ajax branch filters into a local variable and
leaves the master list intact.

## Fixed

- `autocomplete.component.ts`: typing in a non-ajax autocomplete no longer discards non-matching
  options. Narrowing and then widening the search term now works, and clearing the input restores the
  full list.
- `autocomplete.component.ts`: arrow-down (`onTextBoxDownPressed`) filters by the typed search term.
  This was previously commented out, so opening the list with the keyboard showed every option even
  when the input had text — inconsistent with what typing showed.
- `autocomplete.component.ts`: clicking the closed control repopulates the list before opening it, so
  a control reopened after a previous search shows the full set of options rather than the leftovers
  of that search.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - Run `yarn install && yarn build` in `frontend/` after applying this update so the change lands in
>   the compiled bundle.
> - Ajax autocompletes (`data-ajax-url`) are unchanged — the server still owns filtering and
>   pagination.
> - If your project worked around the old behaviour — for example re-initialising the autocomplete or
>   re-populating the `<select>` after a search — remove that workaround, it is no longer needed and
>   may now fight the component.
> - If you copied `autocomplete.component.ts` into `js/components-site/`, apply the same change there
>   by hand — that folder is never synced.
