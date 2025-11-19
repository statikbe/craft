# Filter

A comprehensive AJAX filtering component that refreshes content without page reload when form elements change. Features mobile collapsible filters, pagination integration, URL history management, clear buttons, accessibility support, and automatic scroll positioning.

## Features

- ✅ **AJAX Content Loading** - Fetches filtered results without page reload using Fetch API
- ✅ **Auto-submit on Change** - Triggers filtering when inputs/selects change
- ✅ **URL History Management** - Updates browser URL with pushState and handles back/forward buttons
- ✅ **Mobile Responsive** - Collapsible filter panel with customizable breakpoint
- ✅ **Pagination Integration** - Automatic pagination link hijacking and AJAX loading
- ✅ **Clear Filter Buttons** - Multiple clear buttons with visibility toggling and styling
- ✅ **Accessibility** - ARIA live regions for screen reader announcements and focus management
- ✅ **Loading States** - Show/hide loader during fetch with smooth transitions
- ✅ **Scroll Control** - Auto-scroll to results with configurable speed and mobile behavior
- ✅ **Extra Element Updates** - Update multiple elements outside results (e.g., counters)
- ✅ **Dynamic Content Support** - Works with dynamically added form elements
- ✅ **Individual Filter Clearing** - Clear specific filters with `data-filter-clear-elements`
- ✅ **Custom Events** - Dispatches events when filters are cleared
- ✅ **Abort Controller** - Cancels previous requests when new filter applied

## Examples

We are unable to make an interactive demo for this, because the idea for this filter is an AJAX reload of the page when the form changes. And this requires a system like Twig to change the data.
Instead we provide you with some code examples.

### Very minimal HTML example

```HTML{4,5,32,36}
<div class="flex -mx-4">
    <div class="w-full px-4 md:w-1/3">
        <form action=""
            data-filter="filterResultsMinimal"
            data-filter-aria-live="filterAriaLiveMinimal">
            <h4>Categories</h4>
            <ul>
                <li class="form__custom-checkbox">
                    <input type="checkbox" id="option1" name="category[]" value="1"/>
                    <label for="option1">Option 1</label>
                </li>
                <li class="form__custom-checkbox">
                    <input type="checkbox" id="option2" name="category[]" value="2"/>
                    <label for="option2">Option 2</label>
                </li>
                <li class="form__custom-checkbox">
                    <input type="checkbox" id="option3" name="category[]" value="3"/>
                    <label for="option3">Option 3</label>
                </li>
                <li class="form__custom-checkbox">
                    <input type="checkbox" id="option4" name="category[]" value="4"/>
                    <label for="option4">Option 4</label>
                </li>
            </ul>
            <button type="submit" class="sr-only">Submit</button>
        </form>
        <div>
            <button type="button" id="filterClear" data-always-show="true" data-inactive-class="opacity-50">Clear filter</button>
        </div>
    </div>
    <div class="w-full px-4 md:w-2/3">
        <div aria-live="polite" class="sr-only" id="filterAriaLiveMinimal" tabindex="-1">
            <span>Er zijn 6 resultaten gevonden</span>
            <span>We tonen 6 items op pagina 1 van 3</span>
        </div>
        <div id="filterResultsMinimal">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
                <div>Item 4</div>
                <div>Item 5</div>
                <div>Item 6</div>
            </div>
        </div>
    </div>
</div>
```

The minimal components you need are on the form the attributes `data-filter` and `data-filter-aria-live`. The value for these attributes need to be the ID's from the elements corresponding to respectively the results block and the aria-live block.

### Full Twig example

```Twig
<div class="section section--default">
    <div class="container">
        <h2 id="filterExtraInfo">
            {{ totalEntries }} {{ 'resultaten gevonden'|t }}
        </h2>
        <div class="flex flex-wrap -mx-4">
            <div class="w-full px-4 md:w-1/3">
                <div>
                    <div class="md:hidden">
                        <button type="button" class="w-full flex justify-between" id="filterMobileToggle">
                            {# This element will get the class 'open' when the filter is open #}
                            <span>
                                {{ 'Filter results'|t }}
                                <span id="secondExtraInfo">
                                    ({{ totalEntries }} {{ 'resultaten gevonden'|t }})
                                </span>
                            </span>
                            {{ icon('chevron-down') }}
                        </button>
                    </div>
                    <div id="filterMobileCollapse">
                        <form action=""
                            data-filter="filterResults"
                            data-filter-aria-live="filterAriaLive"
                            data-filter-extra="filterExtraInfo,secondExtraInfo"
                            data-filter-mobile-toggle="filterMobileToggle"
                            data-filter-mobile-collapse="filterMobileCollapse"
                            data-filter-scroll-position="filterScrollPosition"
                            data-filter-loader="filterLoader"
                            data-filter-pagination="filterPagination"
                            data-filter-clear="filterClear,filterClearInResults"
                            data-filter-scroll-on-new-results="true"
                            data-filter-disable-scroll-on-mobile="true"
                            data-filter-mobile-breakpoint="819"
                            data-filter-scroll-speed="500">
                            {% set categories = craft.entries.section('newsCategories').level(1) %}
                            {% if categories|length %}
                                <div>
                                    <h4>{{ "Categories"|t }}</h4>
                                    <ul>
                                        {% for category in categories %}
                                            <li class="form__custom-checkbox">
                                                <input type="checkbox" id="{{ category.id }}" name="category[]"
                                                        value="{{ category.id }}" {% if category.id in catQuery %} checked {% endif %}/>
                                                <label for="{{ category.id }}">{{ category.title }}</label>
                                            </li>
                                        {% endfor %}
                                    </ul>
                                </div>
                            {% endif %}
                            <button type="submit" class="sr-only">Submit</button>
                            <div>
                                <button type="button" id="filterClear" data-always-show="true" data-inactive-class="opacity-50">Clear filter</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="w-full px-4 md:w-2/3">
                <div id="filterScrollPosition">
                    <div class="hidden" tabindex="-1" id="filterLoader">
                        <div class="flex justify-center">
                            {% include '_site/_snippet/_item/_loader' %}
                        </div>
                    </div>
                    <div aria-live="polite" class="sr-only" id="filterAriaLive" tabindex="-1">
                        <span>{{ "A total of {total} items found."|t({total: totalEntries}) }}</span>
                        {% if pageInfo.totalPages > 1 %}
                            <span>{{ "Showing {totalItems} items on page {currentPage} of {totalPages}."|t({totalItems: totalEntries, currentPage: pageInfo.currentPage, totalPages: pageInfo.totalPages}) }}</span>
                        {% endif %}
                    </div>
                    <div id="filterResults">
                        {% if searchQuery or catQuery %}
                            <div class="flex flex-wrap">
                                <span class="mr-4">{{ "Resultaten gefilterd op:"|t }}</span>
                                {% if searchQuery %}
                                    <span class="flex items-center px-2 mb-2 mr-2 text-sm font-light text-white capitalize rounded-full bg-primary">{{ searchQuery }}
                                        <button type="button" class="flex items-center justify-center w-4 h-4 ml-2 text-black" data-filter-clear-elements='[{"name": "search"}]'>
                                            {{ icon('clear') }}
                                            <span class="sr-only">{{ "Verwijder filter "|t }} {{ searchQuery }}</span>
                                        </button>
                                    </span>
                                {% endif %}
                                {% if catQuery %}
                                    {% for category in categories.id(catQuery).all() %}
                                        <span class="flex items-center px-2 mb-2 mr-2 text-sm font-light text-white capitalize rounded-full bg-primary">{{ category.title }}
                                            <button type="button" class="flex items-center justify-center w-4 h-4 ml-2 text-black ie-hidden" data-filter-clear-elements='[{"name": "category[]","value": "{{ category.id }}"}]'>
                                                {{ icon('clear') }}
                                                <span class="sr-only">{{ "Verwijder filter "|t }} {{ category.title }}</span>
                                            </button>
                                        </span>
                                    {% endfor %}
                                {% endif %}
                                <button type="button" id="filterClearInResults">Clear filter</button>
                            </div>
                        {% endif %}
                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                            {% for cardEntry in newsEntries %}
                                {% include '_site/_snippet/_item/_card' %}
                            {% else %}
                                <div class="sm:col-span-2 md:col-span-3">
                                    {{ "Geen items gevonden"|t }}
                                </div>
                            {% endfor %}
                        </div>
                        {% if pageInfo.totalPages > 1 %}
                            <div id="filterPagination">
                                {{ render_pagination(pageInfo, {
                                    pageRange: 2,
                                }) | raw }}
                            </div>
                        {% endif %}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

## An example of filter toggle buttons

```TWIG
<form action="" class="flex flex-wrap items-baseline mb-10 md:flex-no-wrap"
    data-filter="filterResults"
    data-filter-scroll-position="filterScrollPosition"
    data-filter-loader="filterLoader"
    data-filter-aria-live="filterAriaLive"
    data-filter-pagination="filterPagination"
    data-filter-clear="filterClear" >
    <div class="flex flex-wrap gap-2">
        <button type="button" class="btn {% if catQuery|length == 0 %}btn--primary{% else %}btn--ghost{% endif %}" id="filterClear" data-active-class="btn--ghost" data-inactive-class="btn--primary" data-always-show>Everything</button>
        {% set categories = craft.entries.section('newsCategories').level(1) %}
        {% if categories|length %}
            {% for cat in categories %}
                <div class="">
                    <input class="sr-only peer"
                        type="checkbox" name="category[]"
                        id="{{ cat }}"
                        value="{{ cat.id }}"
                        {% if cat in catQuery %}checked{% endif %} />
                    <label class="btn btn--ghost inline-flex cursor-pointer m-0 peer-checked:[&>.icon]:block" for="{{ cat }}">{{ cat }} {{ icon('clear', { class: 'ml-2 hidden' }) }} </label>
                </div>
            {% endfor %}
        {% endif %}
        </div>
</form>
```

## Required Structure

## Attributes

Below is a table describing the attributes you can use with the filter component.

### Required Attributes

| Attribute               | Required | Description                                                                                               |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `data-filter`           | ✅ Yes   | ID of the results container element. This element's innerHTML is replaced with filtered results.          |
| `data-filter-aria-live` | ✅ Yes   | ID of the ARIA live region element for screen reader announcements (typically with `aria-live="polite"`). |

::: danger Missing Required Attributes
If `data-filter` or `data-filter-aria-live` is missing or the elements don't exist, the component logs warnings and won't initialize:

```

You must provide the id of the result block in order for the filter plugin to work.
You must have an element defined in the data-filter-aria-live attribute defined in order for the filter plugin to work.

```

:::

### Optional Attributes

| Attribute                              | Default       | Description                                                                                                       |
| -------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `data-filter-extra`                    | —             | Comma-separated IDs of elements to update alongside results (e.g., counters, summaries). Updates their innerHTML. |
| `data-filter-mobile-toggle`            | —             | ID of button that toggles filter visibility on mobile.                                                            |
| `data-filter-mobile-collapse`          | —             | ID of element that collapses on mobile (contains the form fields).                                                |
| `data-filter-scroll-position`          | results block | ID of element to scroll to after loading results. Defaults to results container.                                  |
| `data-filter-loader`                   | —             | ID of loading indicator element (shown during fetch, hidden when complete).                                       |
| `data-filter-pagination`               | —             | ID of pagination container. Links within are hijacked for AJAX loading.                                           |
| `data-filter-clear`                    | —             | Comma-separated IDs of buttons that clear all filters.                                                            |
| `data-filter-scroll-on-new-results`    | `true`        | Whether to scroll to results after loading. Set to `"false"` or `"0"` to disable.                                 |
| `data-filter-disable-scroll-on-mobile` | `false`       | Set to `"true"` or `"1"` to disable scrolling on mobile devices.                                                  |
| `data-filter-mobile-breakpoint`        | `819`         | Breakpoint (in pixels) for mobile filter collapse behavior.                                                       |
| `data-filter-scroll-speed`             | `500`         | Scroll animation duration in milliseconds.                                                                        |

### Element-specific Attributes

| Attribute                    | Element Type | Description                                                                                                   |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `data-filter-clear-elements` | Button       | JSON array defining specific filters to clear: `[{"name": "category[]", "value": "3"}]`                       |
| `data-always-show`           | Clear button | Keeps clear button visible even when no filters active (typically styled as disabled).                        |
| `data-active-class`          | Clear button | Space-separated classes to add when filters are active.                                                       |
| `data-inactive-class`        | Clear button | Space-separated classes to add when no filters are active.                                                    |
| `.no-hook`                   | Input/Select | Add this class to inputs/selects to prevent them from triggering filtering (e.g., search fields with submit). |

## How It Works

### Initialization Flow

1. **Form Detection** - Finds all `form[data-filter]` elements
2. **Validation** - Checks required elements exist (results, aria-live)
3. **Configuration** - Reads all `data-filter-*` attributes
4. **Event Listeners:**
   - Form submit → Prevent default, trigger filter
   - Input/select change → Trigger filter
   - Custom `jschange` event → Trigger filter (for programmatic changes)
   - Pagination links → Hijack clicks, AJAX load
   - Clear buttons → Reset form, reload
   - Mobile toggle → Show/hide filters
   - Window popstate → Handle back/forward buttons
   - Window resize → Check mobile breakpoint
5. **Dynamic Content** - Monitors for new inputs/clears/pagination via `DOMHelper`
6. **Initial State** - Sets up mobile collapse, clear button visibility

### Filtering Flow

**When a filter changes:**

1. **Trigger** - User changes input/select or clicks pagination
2. **Show Loading** - Hide results, show loader (if configured)
3. **Build URL** - Serialize form data: `?category[]=1&category[]=3&search=test`
4. **Abort Previous** - Cancel any in-flight requests (AbortController)
5. **Fetch Data** - 100ms debounce delay
6. **Parse Response** - Extract results, aria-live, and extra elements by ID
7. **Update DOM** - Replace innerHTML of all configured elements
8. **Update History** - `history.pushState()` with new URL
9. **Hide Loading** - Show results, focus aria-live element
10. **Scroll** - Scroll to configured position
11. **Update Clear Buttons** - Show/hide based on form state

## Auto-submit Behavior

All inputs and selects (without `.no-hook` class) trigger filtering on change:

```html
<!-- These auto-submit on change -->
<input type="checkbox" name="cat[]" value="1" />
<select name="sort">
  <option>Date</option>
</select>

<!-- This doesn't (has .no-hook class) -->
<input type="text" name="search" class="no-hook" />
<button type="submit">Search</button>
```

**Events that trigger filtering:**

- `change` - Native change event
- `jschange` - Custom event for programmatic changes

::: tip Disable Auto-submit
Add `.no-hook` class to inputs that should only submit via button click (e.g., text search fields).
:::

## Mobile Responsive Filters

### Setup

```html
<button id="toggle" type="button">Toggle Filters</button>

<div id="collapse">
  <form
    data-filter="results"
    data-filter-aria-live="aria"
    data-filter-mobile-toggle="toggle"
    data-filter-mobile-collapse="collapse"
    data-filter-mobile-breakpoint="819"
  >
    <!-- Filters -->
  </form>
</div>
```

### Behavior

| Window Width | Collapse State       | Toggle Button |
| ------------ | -------------------- | ------------- |
| > 819px      | Always visible       | Hidden (CSS)  |
| ≤ 819px      | Collapsed by default | Visible       |

**Toggle button attributes:**

- `role="button"` - ARIA role
- `aria-expanded` - true/false state
- `aria-controls` - Points to collapse ID
- `.open` class when expanded

**Collapse element attributes:**

- `role="region"` - ARIA role
- `.hidden` class when collapsed

## Clear Filter Buttons

### Basic Clear Button

```html
<button id="clear">Clear All Filters</button>

<form data-filter-clear="clear">
  <!-- Filters -->
</form>
```

**Behavior:**

- Click → Reset entire form
- Reloads with no query params
- Hides when no filters active (unless `data-always-show`)

### Multiple Clear Buttons

```html
<form data-filter-clear="clear1,clear2,clear3">
  <!-- ... -->
</form>
```

All clear buttons have synchronized visibility.

### Always-visible Clear Button

```html
<button id="clear" data-always-show="true" data-inactive-class="opacity-50">Clear All</button>
```

### Styled Clear Buttons

```html
<button
  id="clear"
  data-always-show="true"
  data-active-class="btn--primary font-bold"
  data-inactive-class="btn--ghost opacity-50"
>
  Everything
</button>
```

**Classes applied dynamically:**

- **Active** (filters applied) → Adds `data-active-class`, removes `data-inactive-class`
- **Inactive** (no filters) → Adds `data-inactive-class`, removes `data-active-class`

### Clear Specific Filters

```html
<!-- Clear single checkbox -->
<button data-filter-clear-elements='[{"name": "category[]", "value": "3"}]'>Remove Category 3</button>

<!-- Clear entire field -->
<button data-filter-clear-elements='[{"name": "search"}]'>Clear Search</button>

<!-- Clear multiple filters -->
<button
  data-filter-clear-elements='[
    {"name": "category[]", "value": "3"},
    {"name": "category[]", "value": "5"}
  ]'
>
  Clear Selected
</button>
```

**JSON format:**

```json
[
  {
    "name": "fieldName", // Required
    "value": "specificValue" // Optional: for checkboxes/radios
  }
]
```

## Pagination Integration

### Setup

```html
<form data-filter-pagination="pagination">
  <!-- Filters -->
</form>

<div id="results">
  <div id="pagination">
    <a href="/products/p2?category[]=1">Page 2</a>
    <a href="/products/p3?category[]=1">Page 3</a>
  </div>
</div>
```

**Automatic behavior:**

- Finds all links inside pagination element
- Intercepts clicks
- Loads via AJAX
- Updates results and URL
- Re-initializes pagination in new content

## Extra Element Updates

Update elements outside results container:

```html
<h2 id="count">24 Results Found</h2>
<span id="mobile-count">(24 results)</span>

<form data-filter-extra="count,mobile-count">
  <!-- Filters -->
</form>
```

**Use cases:**

- Result counts
- Filter summaries
- Meta information

## Loading States

```html
<div id="loader" class="hidden">
  <div class="spinner"></div>
  <span>Loading...</span>
</div>

<form data-filter-loader="loader">
  <!-- Filters -->
</form>

<div id="results">
  <!-- Results -->
</div>
```

**Loading sequence:**

| State    | Loader         | Results        |
| -------- | -------------- | -------------- |
| Initial  | `hidden` class | Visible        |
| Loading  | Visible        | `hidden` class |
| Complete | `hidden` class | Visible        |

## Scroll Behavior

```html
<form
  data-filter-scroll-position="scroll-target"
  data-filter-scroll-speed="500"
  data-filter-scroll-on-new-results="true"
  data-filter-disable-scroll-on-mobile="true"
  data-filter-mobile-breakpoint="819"
>
  <!-- Filters -->
</form>

<div id="scroll-target">
  <div id="results">
    <!-- Results -->
  </div>
</div>
```

**Scroll priority:**

1. `data-filter-scroll-position` element
2. `data-filter-loader` element
3. Results element

**Mobile control:**

- `data-filter-disable-scroll-on-mobile="true"` → No scroll on mobile
- Width checked against `data-filter-mobile-breakpoint`

## Accessibility

### ARIA Live Region

Required structure:

```html
<div id="aria-live" aria-live="polite" class="sr-only" tabindex="-1">
  <span>24 results found</span>
  <span>Showing 10 items on page 1 of 3</span>
</div>
```

**Attributes:**

- ✅ `aria-live="polite"` - Announces when user pauses
- ✅ `tabindex="-1"` - Allows programmatic focus
- ✅ `.sr-only` - Visually hidden

**After loading:**

```typescript
this.ariaLiveElement.focus();
// Screen reader announces content immediately
```

## Custom Events

### filterFetchData

Fired on the form element just before fetching filter data:

```javascript
const form = document.querySelector('form[data-filter]');
form.addEventListener('filterFetchData', (event) => {
  console.log('About to fetch filter data');
});
```

### filterDataLoaded

Fired on the form element after filter data is successfully loaded and DOM is updated:

```javascript
const form = document.querySelector('form[data-filter]');
form.addEventListener('filterDataLoaded', (event) => {
  console.log('Filter data loaded and DOM updated');
});
```

### filterElementsCleared

Fired on the document when specific filters are cleared via `data-filter-clear-elements`:

```javascript
document.addEventListener('filterElementsCleared', (event) => {
  console.log('Specific filters cleared');
});
```

### filterFormCleared

Fired on the document when entire form is cleared via clear button:

```javascript
document.addEventListener('filterFormCleared', (event) => {
  console.log('All filters cleared');
});
```

### jschange Event

Component listens for custom `jschange` events:

```javascript
const input = document.querySelector('input[name="category[]"]');
input.checked = true;
input.dispatchEvent(new Event('jschange'));
// Triggers filtering
```

## Browser History

**URL updates:**

- Filter change → `history.pushState()`
- Pagination → `history.pushState()`
- Back/forward → Fetch without `pushState()`

## Debouncing

All filter requests are debounced with 100ms delay:

## Best Practices

::: tip ARIA Live Region is Critical
Always include a proper ARIA live region. Screen reader users rely on it.

```html
<div id="aria" aria-live="polite" class="sr-only" tabindex="-1">
  <span>{{ totalResults }} results found</span>
</div>
```

:::

::: tip Use .no-hook for Text Search
Prevent text inputs from auto-submitting on every keystroke:

```html
<input type="text" name="search" class="no-hook" /> <button type="submit">Search</button>
```

:::

::: warning Ensure IDs Match
The most common error is mismatched IDs. Double-check:

- `data-filter="results"` matches `<div id="results">`
- `data-filter-aria-live="aria"` matches `<div id="aria">`
- Elements exist in both initial page AND AJAX response
  :::

## Troubleshooting

**Filter not initializing?**

- Check console for warnings about missing elements
- Verify `data-filter` and `data-filter-aria-live` attributes
- Ensure elements with matching IDs exist

**Form not auto-submitting?**

- Check inputs don't have `.no-hook` class
- Verify inputs have `name` attribute
- Check for JavaScript errors

**Results not updating?**

- Check server response includes element with matching ID
- Verify response is valid HTML
- Check network tab for 200 status

**ARIA live not announcing?**

- Verify `aria-live="polite"` attribute
- Check `tabindex="-1"` present
- Ensure content changes in response
- Test with actual screen reader

**Pagination not working?**

- Verify `data-filter-pagination` matches container ID
- Check links are `<a>` tags with `href`
- Ensure pagination in AJAX response

**Clear button not showing/hiding?**

- Verify button ID in `data-filter-clear`
- Check `data-always-show` if needed
- Verify form has values to clear

## Server-Side Requirements

Your server endpoint should:

1. **Accept GET Requests** - With query parameters from form
2. **Return Full HTML** - Not just JSON
3. **Include Required Elements:**
   - Results container with matching ID
   - ARIA live region with matching ID
   - Any extra elements with matching IDs
   - Pagination container (if used)
4. **Handle Empty Results** - Show "No results" message
5. **Return 200 Status** - Errors logged to console
