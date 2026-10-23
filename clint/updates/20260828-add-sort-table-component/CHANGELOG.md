# Add sort table component

**Release date:** 2026-08-28

## Summary

Adds a new core component that turns table headers into three-state sort buttons
(`none` → `asc` → `desc` → `none`). It does **not** sort the table in the browser: it keeps the state
in the query string, pushes it to the history and refetches the current URL, replacing the
`innerHTML` of the element you point at. The actual sorting is done server-side in Twig, so it sorts
the full result set instead of only the rendered rows, and it survives a reload, a bookmark or a
shared link.

## Highlights

- ✅ **Three-state cycle** - no sort → ascending → descending → no sort
- ✅ **URL driven** - the sort state lives in the query string, so it is shareable and bookmarkable
- ✅ **Server-side sorting** - sorts the full set, not just the rows currently in the DOM
- ✅ **Partial refresh** - only the element you point at is replaced, the rest of the page stays put
- ✅ **History support** - `pushState` per sort, back/forward handled through `popstate`
- ✅ **Single or multi-column** - other columns reset by default, or are kept with one attribute
- ✅ **Request cancelling** - a pending fetch is aborted when the same button is clicked again
- ✅ **Accessible labels** - the button's `aria-label` describes the next action, not the current one
- ✅ **Styling hooks** - `data-active` is toggled on the ascending/descending indicator elements

## Added

- `js/components-core/sortTable.component.ts`: the new component, triggered by `[data-sorttable]`
  (automated)

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/sortTable.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> The component file is synced automatically, but it is **not active** until you register it, and it
> needs template work to do anything at all. `site.ts` is project-specific and is never overwritten
> by an update, so these steps have to be done by hand:
>
> 1. **Register the component** in `frontend/js/site.ts` (and in `frontend/js/site2.ts` if your
>    project has a second site), in the `components` array, after the `search` entry:
>
>    ```ts
>    {
>      name: 'sortTable',
>      selector: '[data-sorttable]',
>    },
>    ```
>
> 2. **Sort server-side in your template.** Nothing is sorted in the browser. Read the sort
>    parameters, **whitelist them**, and apply them to the query - never interpolate the raw
>    parameter into `orderBy()`, the value comes straight from the URL:
>
>    ```twig
>    {% set sortName = craft.app.request.getParam('sort-name') %}
>    {% set entries = craft.entries.section('members') %}
>    {% if sortName in ['asc', 'desc'] %}
>        {% set entries = entries.orderBy('title ' ~ sortName) %}
>    {% endif %}
>    ```
>
> 3. **Give the refreshed element an `id`** and point the buttons at it with
>    `data-sorttable-refreshelement`. The component looks that `id` up in the fetched response, so it
>    has to be present in the rendered page as well - the normal template response is what is
>    expected, there is no separate ajax endpoint to build.
>
> 4. **Style the indicators.** The component toggles a `data-active` attribute on child elements
>    marked `data-sorttable-state-asc` / `data-sorttable-state-desc`. It never adds or removes
>    classes, so style them through the attribute (`[data-active]`, or `data-active:` in Tailwind).
>    Nothing is shipped for this.
>
> 5. **Add `aria-sort` on the `<th>` yourself.** The component only manages the button's
>    `aria-label`; `aria-sort` is what assistive technology uses to announce the sorted column. Since
>    the table re-renders server-side on every sort, output it from Twig.
>
> 6. **Run `yarn install && yarn build`** in `frontend/` so the new component lands in the compiled
>    bundle.

> 🚧 **KNOWN LIMITATION - one sortable table per page**:
>
> The component has no "already initialised" guard. After a sort, the replaced content makes the
> component loader run the component again, which re-selects **every** `[data-sorttable]` button on
> the page - including buttons that were not replaced, which then get a **second** click handler.
> Those buttons skip a state (`none` straight to `desc`) and fire two requests per click. Each re-run
> also adds another `popstate` listener.
>
> - **One table, buttons inside the refresh element**: the supported setup, buttons are only bound once.
> - **Buttons outside the refresh element, or a second sortable table on the page**: double-bound,
>   avoid for now.
>
> There is also no loading state - no loader, no disabled button, no `aria-busy` - so add your own
> feedback if the query is slow.
