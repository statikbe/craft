# Sort Table

A component that turns table headers into three-state sort buttons. It does **not** sort the table in
the browser: it keeps the sort state in the query string, pushes it to the history, and refreshes a
part of the page over ajax. The actual sorting is done server-side in Twig, so it works on paginated
and filtered sets and survives a page reload, a bookmark or a shared link.

## Features

- ✅ **Three-state cycle**: no sort → ascending → descending → no sort
- ✅ **URL driven**: the state lives in the query string, so it is shareable and bookmarkable
- ✅ **Server-side sorting**: sorts the full result set, not just the rows currently rendered
- ✅ **Partial refresh**: only the element you point at is replaced, the rest of the page stays put
- ✅ **History support**: `pushState` per sort, with back/forward handled through `popstate`
- ✅ **Single or multi-column**: other columns are reset by default, or kept with one attribute
- ✅ **Request cancelling**: a pending fetch is aborted when the same button is clicked again
- ✅ **Accessible labels**: the button's `aria-label` describes the _next_ action, not the current one
- ✅ **Styling hooks**: `data-active` is toggled on the ascending/descending indicators

## How It Works

### Initialization

1. **Button detection**: the component selects all `[data-sorttable]` elements
2. **Instance per button**: each button becomes a `SortTableButton`, sharing one list of instances so
   they can reset each other
3. **State from URL**: each button reads its own query parameter and sets its state
4. **UI sync**: `aria-label` and the indicator elements are updated
5. **History listener**: one `popstate` listener re-syncs every button and refetches once per unique
   refresh element

### Sorting

1. **Advance the state**: `none` → `asc` → `desc` → `none`
2. **Reset the others**: every other button with `data-sorttable-clear-on-other-sort` enabled (the
   default) is set back to `none` and its parameter is dropped from the URL
3. **Build the URL**: the button's key is set to `asc`/`desc`, or deleted when the state is `none`.
   All other existing query parameters (filters, search, …) are preserved
4. **Update the UI**: `aria-label` and the indicators
5. **Push the history entry**: `history.pushState()` with the new URL
6. **Fetch**: the new URL is requested, the response is parsed with `DOMParser`, and the element with
   the refresh id is taken from it to replace the current element's `innerHTML`

### Back / forward

On `popstate` every button re-reads its state from the URL and the content is refetched — once per
distinct `data-sorttable-refreshelement`, so two buttons pointing at the same element only trigger
one request.

### Sort state in the query string

```
/team                          → no sort (or the default state per column)
/team?sort-name=asc            → name ascending
/team?sort-name=desc           → name descending
/team?category=2&sort-date=asc → other parameters are preserved
```

## Examples

<iframe src="../../examples/sortTable.html" height="420" title="Sort Table Example"></iframe>
<p class="iframe-caption">The rows in this example do not reorder: sorting happens server-side and
the docs are static. What it does show is the three-state cycle — the indicators, the
<code>aria-label</code> and the query string in the iframe URL.</p>

### Basic single-column sorting

The template reads the sort parameters, whitelists them, and applies them to the query. The element
that is refreshed carries the `id` the buttons point at.

```twig
{% set sortName = craft.app.request.getParam('sort-name') %}
{% set sortDate = craft.app.request.getParam('sort-date') %}

{% set entries = craft.entries.section('members') %}

{% if sortName in ['asc', 'desc'] %}
    {% set entries = entries.orderBy('title ' ~ sortName) %}
{% elseif sortDate in ['asc', 'desc'] %}
    {% set entries = entries.orderBy('postDate ' ~ sortDate) %}
{% else %}
    {% set entries = entries.orderBy('postDate DESC') %}
{% endif %}

<div id="memberTable">
    <table class="w-full">
        <thead>
            <tr>
                <th scope="col">
                    <button type="button"
                            class="flex items-center gap-1"
                            data-sorttable="sort-name"
                            data-sorttable-refreshelement="memberTable"
                            data-sorttable-text-ascsort="{{ 'Sort by name, ascending'|t }}"
                            data-sorttable-text-descsort="{{ 'Sort by name, descending'|t }}"
                            data-sorttable-text-nosort="{{ 'Remove sorting on name'|t }}">
                        {{ 'Name'|t }}
                        <span class="sorttable__indicator" data-sorttable-state-asc aria-hidden="true">▲</span>
                        <span class="sorttable__indicator" data-sorttable-state-desc aria-hidden="true">▼</span>
                    </button>
                </th>
                <th scope="col">
                    <button type="button"
                            class="flex items-center gap-1"
                            data-sorttable="sort-date"
                            data-sorttable-refreshelement="memberTable"
                            data-sorttable-text-ascsort="{{ 'Sort by date, ascending'|t }}"
                            data-sorttable-text-descsort="{{ 'Sort by date, descending'|t }}"
                            data-sorttable-text-nosort="{{ 'Remove sorting on date'|t }}">
                        {{ 'Date'|t }}
                        <span class="sorttable__indicator" data-sorttable-state-asc aria-hidden="true">▲</span>
                        <span class="sorttable__indicator" data-sorttable-state-desc aria-hidden="true">▼</span>
                    </button>
                </th>
            </tr>
        </thead>
        <tbody>
            {% for entry in entries.all() %}
                <tr>
                    <td>{{ entry.title }}</td>
                    <td>{{ entry.postDate|date('d/m/Y') }}</td>
                </tr>
            {% endfor %}
        </tbody>
    </table>
</div>
```

::: warning Whitelist the sort direction
Never interpolate the raw parameter into `orderBy()`. Always check it against `['asc', 'desc']` as
above — the value comes straight from the URL.
:::

### A default sort direction

`data-sorttable-defaultstate` is the state a button falls back to when the URL holds no valid value
for its key — on a first page load, for example. Use it to make the column the table is already
sorted by show its indicator.

```twig
<button type="button"
        data-sorttable="sort-date"
        data-sorttable-defaultstate="desc"
        data-sorttable-refreshelement="memberTable">
    {{ 'Date'|t }}
</button>
```

### Multi-column sorting

By default, sorting one column clears all the others. Set
`data-sorttable-clear-on-other-sort="false"` on the columns that may be combined; their parameter
then stays in the URL when another column is sorted.

```twig
<button type="button"
        data-sorttable="sort-category"
        data-sorttable-clear-on-other-sort="false"
        data-sorttable-refreshelement="memberTable">
    {{ 'Category'|t }}
</button>
<button type="button"
        data-sorttable="sort-name"
        data-sorttable-clear-on-other-sort="false"
        data-sorttable-refreshelement="memberTable">
    {{ 'Name'|t }}
</button>
```

Handle the combination server-side in the order you want them applied:

```twig
{% set orders = [] %}
{% if craft.app.request.getParam('sort-category') in ['asc', 'desc'] %}
    {% set orders = orders|merge(['categoryTitle ' ~ craft.app.request.getParam('sort-category')]) %}
{% endif %}
{% if craft.app.request.getParam('sort-name') in ['asc', 'desc'] %}
    {% set orders = orders|merge(['title ' ~ craft.app.request.getParam('sort-name')]) %}
{% endif %}

{% set entries = craft.entries.section('members') %}
{% if orders|length %}
    {% set entries = entries.orderBy(orders|join(', ')) %}
{% endif %}
```

## Attributes

| Attribute                            | Description                                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-sorttable`                     | This attribute triggers the component. Its value is the **query-string parameter name** for this column, e.g. `sort-name`                           |
| `data-sorttable-refreshelement`      | The `id` of the element whose `innerHTML` is replaced with the same element from the fetched page. Logs a console warning when the id is not found  |
| `data-sorttable-defaultstate`        | The state used when the URL has no `asc`/`desc` value for this key: `none` (default), `asc` or `desc`                                               |
| `data-sorttable-clear-on-other-sort` | Set to `"false"` to keep this column's sort when another column is sorted (multi-column sorting). Any other value keeps the default reset behaviour |
| `data-sorttable-text-nosort`         | `aria-label` set while the column is sorted **descending** — the next click removes the sorting                                                     |
| `data-sorttable-text-ascsort`        | `aria-label` set while the column is **not** sorted — the next click sorts ascending                                                                |
| `data-sorttable-text-descsort`       | `aria-label` set while the column is sorted **ascending** — the next click sorts descending                                                         |

### Indicator elements

Put these on children of the button to show the current direction. The component toggles a
`data-active` attribute on them; it never adds or removes classes, so style them through the
attribute.

| Attribute                   | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `data-sorttable-state-asc`  | Gets `data-active` while the column is sorted ascending  |
| `data-sorttable-state-desc` | Gets `data-active` while the column is sorted descending |

```css
.sorttable__indicator {
  opacity: 0.3;
}

.sorttable__indicator[data-active] {
  opacity: 1;
}
```

With Tailwind you can use the attribute directly:

```html
<span class="opacity-30 data-active:opacity-100" data-sorttable-state-asc aria-hidden="true">▲</span>
```

## Server-side requirements

The component refetches **the same URL** and picks one element out of the response, so the page has
to satisfy three things:

1. **It must react to the query parameters.** Nothing is sorted in the browser — if the template
   ignores `sort-name`, the refreshed content is identical to what was there before.
2. **The refresh element must keep its `id` in the response.** The component looks up
   `getElementById(refreshElementId)` in the fetched document; if it is missing you get
   `SortTable: Element with id "…" not found in response.` in the console and nothing is replaced.
3. **The response must be a full HTML page.** The fetch has no special header and the component
   parses whatever comes back with `DOMParser`, so the normal template response is what is expected —
   there is no separate ajax endpoint to build.

Only the **`innerHTML`** of the refresh element is replaced, so attributes and classes on the element
itself survive, and anything outside it (filters, pagination, counters) is _not_ updated.

## Known limitations

::: danger Keep it to one sortable table per page
The component has no "already initialised" guard. After a sort, the replaced content makes the
component loader run the component again, which re-selects **every** `[data-sorttable]` button on the
page — including buttons that were not replaced, which then get a **second** click handler. Those
buttons will skip a state (`none` straight to `desc`) and fire two requests per click. Each re-run
also adds another `popstate` listener.

In practice:

- **One table, buttons inside the refresh element** — the recommended setup. The buttons are replaced
  together with the content, so they are only ever bound once.
- **Buttons outside the refresh element, or a second sortable table on the page** — those buttons are
  double-bound. Avoid until the component gets an init guard.
  :::

::: warning No loading state
Nothing is shown while the request is in flight — no loader, no disabled button, no `aria-busy`. On a
slow query the table just sits there. Add your own feedback if that matters, or place the table in a
container you can style.
:::

Two more things to keep in mind:

- **`defaultstate` is not validated.** The attribute is cast to the state type as-is, so a typo like
  `data-sorttable-defaultstate="ASC"` yields a state that matches nothing: no indicator is activated
  and `?key=ASC` ends up in the URL. Use lowercase `asc`/`desc`.
- **Requests are only cancelled per button.** Each button aborts _its own_ pending request. Clicking
  two different columns quickly fires both, and whichever finishes last writes the content — which
  may not be the one you clicked last.

## Accessibility

### Labels describe the next action

The `aria-label` always tells the user what the _next_ click will do, which is why the text
attributes are named after the target state:

| Current state | `aria-label` taken from        |
| ------------- | ------------------------------ |
| `none`        | `data-sorttable-text-ascsort`  |
| `asc`         | `data-sorttable-text-descsort` |
| `desc`        | `data-sorttable-text-nosort`   |

Set all three, and mention the column name in each one — a screen-reader user hears the label out of
context:

```twig
data-sorttable-text-ascsort="{{ 'Sort by name, ascending'|t }}"
data-sorttable-text-descsort="{{ 'Sort by name, descending'|t }}"
data-sorttable-text-nosort="{{ 'Remove sorting on name'|t }}"
```

::: warning Add `aria-sort` yourself
The component does not set [`aria-sort`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort)
on the `<th>`, which is what assistive technology uses to announce the sorted column. Because the
table is re-rendered server-side on every sort, you can output it from Twig:

```twig
<th scope="col" aria-sort="{{ sortName == 'asc' ? 'ascending' : (sortName == 'desc' ? 'descending' : 'none') }}">
```

:::

### Markup

- Use a real `<button type="button">` inside the `<th>`, never a clickable `<th>` or a `<div>`
- Give the `<th>` a `scope="col"`
- Mark the indicators `aria-hidden="true"` — the `aria-label` already carries the information
- Announce the refreshed content if the update is not obvious, for example with a live region holding
  the result count

### Keyboard Support

- **Enter/Space**: cycle the sort state (native button behaviour)
- **Tab**: move between the column buttons

Focus is **not** restored after the content is replaced. When the buttons live inside the refresh
element they are new elements, so focus falls back to the document — worth handling if a lot of
sorting is expected.

## Related Components

- **[Table](./table)**: responsive `data-label` enhancement for CKEditor tables — unrelated, and can
  be combined with this one
- **[Filter](./filter)**: filtering through query parameters, the same URL-driven approach
- **[Ajax Paging](./ajaxpaging)**: pagination with partial refreshes, useful alongside sorting
- **[Load More](./loadMore)**: appending results instead of replacing them

## Resources

- [History API: pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)
- [Window: popstate event](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [ARIA: aria-sort](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort)
- [Craft: orderBy()](https://craftcms.com/docs/5.x/reference/element-types/entries.html#orderby)
