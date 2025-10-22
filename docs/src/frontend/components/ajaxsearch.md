# Ajax Search

The Ajax Search component transforms an input field into an accessible autocomplete dropdown that searches an API endpoint as the user types. It includes keyboard navigation, screen reader support, and flexible templating.

## Features

- ✅ **Debounced AJAX** - 300ms delay prevents excessive API calls
- ✅ **Keyboard Navigation** - Full arrow key and Enter/Escape support
- ✅ **Accessibility** - ARIA attributes, live regions, screen reader announcements
- ✅ **Flexible Templating** - Custom templates for results, groups, and "no results"
- ✅ **Callback Support** - Use JavaScript functions instead of AJAX
- ✅ **Dynamic Content** - Works with AJAX-loaded inputs
- ✅ **Match Highlighting** - Automatically highlights matching text
- ✅ **Grouped Results** - Supports categorized search results

## Example

<iframe src="../../examples/ajaxsearch.html" height="400"></iframe>

### Code example

```TWIG
<div class="relative">
    <input type="text" class="w-full py-2 pl-2 pr-12 rounded border-1"
        placeholder="Search for example 'john'"
        data-ajax-search="https://67f7d1472466325443eadc3f.mockapi.io/api/data"
        data-ajax-search-method="GET"
        data-ajax-search-query="search"
        data-ajax-search-result-template="result__template"
        data-ajax-search-no-result-template="noresult__template"
        data-ajax-search-list-element-class="-mt-1 bg-white border-t shadow-lg border-t-light rounded-b-md"
        data-ajax-search-list-item-class="block px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap hover:text-white aria-selected:text-white hover:bg-primary aria-selected:bg-primary" />
    <span class="absolute top-0 bottom-0 flex items-center block text-xl right-2 text-primary">
        {{ icon('magnify', { class: '' }) }}
    </span>
</div>
<template id="result__template">
    <div class="flex justify-between [&_mark]:font-bold [&_mark]:bg-transparent [&_mark]:text-inherit"><span>%%name%%</span> <span>(%%city%%, %%street%%)</span></div>
</template>
<template id="typed-text__template">
    <span class="block">
        {{"Toon resultaten voor persoon: "|t}} %%query%%
    </span>
</template>
<template id="noresult__template">
    <span class="block p-2 bg-red-100">Niets gevonden</span>
</template>
```

## Required Attributes

The component must be initialized on an `<input>` element with one of these attributes:

| Attribute                   | Required | Description                                                                                |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `data-ajax-search`          | ✅ Yes\* | The API endpoint URL for AJAX search requests. \*Required if no callback is used.          |
| `data-ajax-search-callback` | ✅ Yes\* | JavaScript function name that returns a Promise with search results. \*Required if no URL. |

::: danger Input Element Only
This component **only works on `<input>` elements**. Using it on other elements will be ignored. The component checks `search.tagName === 'INPUT'`.
:::

::: tip Choose One: AJAX or Callback
You must provide **either** `data-ajax-search` (URL) **or** `data-ajax-search-callback` (function name), but not necessarily both. The callback approach is useful for client-side filtering of existing data.
:::

## Configuration Attributes

### AJAX Configuration

| Attribute                 | Default | Description                                                                                 |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `data-ajax-search-method` | `GET`   | HTTP method for AJAX requests (`GET` or `POST`).                                            |
| `data-ajax-search-query`  | `data`  | Query parameter name sent to the API (e.g., `?search=query` when value is `search`).        |
| `data-ajax-search-data`   | -       | Nested property path in API response (e.g., `results.items` extracts `data.results.items`). |

### Template Configuration

Templates are defined in `<template>` elements with IDs referenced by these attributes:

| Attribute                              | Description                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `data-ajax-search-result-template`     | Template ID for rendering each search result. Use `%%propertyName%%` for variable replacement.       |
| `data-ajax-search-group-template`      | Template ID for rendering group headers (when API returns grouped results).                          |
| `data-ajax-search-typed-text-template` | Template ID for "show all results for X" option. Use `%%query%%` for the typed text.                 |
| `data-ajax-search-no-result-template`  | Template ID for no results message. Falls back to `data-ajax-search-no-result-text` if not provided. |
| `data-ajax-search-no-result-text`      | Plain text for no results (used if no template provided). Defaults to language file value.           |

::: tip Template Variables
Use `%%propertyName%%` syntax in templates. Example: `%%name%%` is replaced with the `name` property from your API response.
:::

### Behavior Configuration

| Attribute                            | Default | Description                                                                                                       |
| ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `data-ajax-search-no-typed-option`   | `false` | Set to `true` to hide the "show all results for..." option at the bottom of results.                              |
| `data-ajax-search-destination-input` | -       | Name of another input field to receive the selected item's value (useful for hidden form fields).                 |
| `data-ajax-search-destination-value` | -       | Property name from API response to use as destination input value.                                                |
| `data-ajax-search-clear-on-select`   | `false` | Set to `true` to clear the search input after selecting an item.                                                  |
| `data-ajax-search-match-wrapper`     | `mark`  | HTML element to wrap matching text (e.g., `mark`, `strong`, `span`). Set to empty string to disable highlighting. |

### Styling Configuration

| Attribute                             | Default                                 | Description                                             |
| ------------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| `data-ajax-search-list-element-class` | `absolute left-0 right-0 z-10 top-full` | Additional CSS classes for the dropdown list container. |
| `data-ajax-search-list-item-class`    | -                                       | CSS classes for each dropdown list item (li elements).  |

::: info Template Classes
Each template (`<template>` element) can have a `class` attribute. These classes are applied to the list items created from that template. The `hidden` class is automatically removed.
:::

## How It Works

1. **Initialization**

   - Finds all inputs with `[data-ajax-search]` or `[data-ajax-search-callback]`
   - Validates element is an `<input>`
   - Adds `data-ajax-search-initialized` to prevent duplicate initialization
   - Creates dropdown list container and ARIA live region
   - Sets up ARIA attributes: `aria-controls`, `aria-autocomplete`, `aria-expanded`

2. **User Types** (debounced 300ms)

   - Minimum 3 characters required (hardcoded: `minimumCharacters = 3`)
   - Makes AJAX request to configured URL, or calls JavaScript callback function
   - Shows loading state

3. **Results Display**

   - Parses response data (follows `data-ajax-search-data` path if provided)
   - Renders results using templates
   - Highlights matching text with configured wrapper element
   - Shows "typed text" option (unless `no-typed-option` is true)
   - Updates screen reader status with result count

4. **Keyboard Navigation**

   - `↓` Arrow Down: Open menu / next result
   - `↑` Arrow Up: Previous result (cycles to last)
   - `Enter`: Select highlighted result
   - `Escape`: Close menu
   - `Tab`: Close menu

5. **Selection**
   - Clicks link/button in selected result
   - Populates destination input (if configured)
   - Clears search input (if configured)
   - Closes dropdown menu

## API Response Format

### Simple Results

```json
[
  { "name": "John Doe", "city": "New York" },
  { "name": "Jane Smith", "city": "London" }
]
```

### Grouped Results

```json
[
  {
    "group": "Customers",
    "data": [
      { "name": "John Doe", "city": "New York" },
      { "name": "Jane Smith", "city": "London" }
    ]
  },
  {
    "group": "Employees",
    "data": [{ "name": "Bob Johnson", "city": "Paris" }]
  }
]
```

### Nested Response

If your API returns `{ "results": { "items": [...] } }`, use:

```html
data-ajax-search-data="results.items"
```

## Callback Function Pattern

Instead of AJAX, you can provide a JavaScript function:

```html
<input type="text" data-ajax-search-callback="mySearchFunction" ... />
```

```javascript
// Function must be globally accessible
window.mySearchFunction = async (query) => {
  // Must return a Promise
  return new Promise((resolve) => {
    const results = myData.filter((item) => item.name.toLowerCase().includes(query));
    resolve(results);
  });
};
```

::: warning Callback Requirements

- Function must exist in `window` scope
- Must return a `Promise`
- Promise must resolve with array of results
- Component logs errors if function is missing or doesn't return Promise
  :::

## Destination Input Pattern

Use destination inputs to separate display value from form submission value:

```html
<!-- User sees friendly names -->
<input
  type="text"
  data-ajax-search="..."
  data-ajax-search-destination-input="user_id"
  data-ajax-search-destination-value="id"
/>

<!-- Form submits user ID -->
<input type="hidden" name="user_id" />
```

When user selects "John Doe" (id: 123):

- Search input shows: "John Doe"
- Hidden input receives: "123"
- Hidden input fires `jschange` event for further processing

## Dynamic Content

The component automatically initializes on dynamically loaded inputs:

```javascript
// After AJAX loading new content with search inputs
// Component automatically detects and initializes them
```

No manual reinitialization needed!

## Accessibility

The component implements comprehensive WCAG 2.1 AA accessibility:

### ARIA Attributes

- `role="listbox"` on dropdown
- `role="option"` on each result
- `aria-controls` links input to dropdown
- `aria-expanded` indicates dropdown state
- `aria-autocomplete="list"` indicates autocomplete behavior
- `aria-activedescendant` tracks keyboard focus
- `aria-selected` marks highlighted option

### Screen Reader Support

- **Live region** announces result count ("5 results available")
- **Status updates** on every search
- **Keyboard navigation** fully accessible
- **Links** have `tabindex="-1"` to prevent double tab stops

### Keyboard Handling

All interactions work with keyboard:

- Input field remains focusable
- Arrow keys navigate without losing focus
- Enter activates links/buttons
- Escape closes menu intuitively

## Custom Events

Listen for these events on the input element:

| Event                | Bubbles | Description                              |
| -------------------- | ------- | ---------------------------------------- |
| `ajaxSearchShowMenu` | ✅ Yes  | Fired when dropdown opens                |
| `ajaxSearchHideMenu` | ✅ Yes  | Fired when dropdown closes               |
| `jschange`           | ❌ No   | Fired on destination input value changes |

```javascript
const searchInput = document.querySelector('[data-ajax-search]');

searchInput.addEventListener('ajaxSearchShowMenu', () => {
  console.log('Search dropdown opened');
});

searchInput.addEventListener('ajaxSearchHideMenu', () => {
  console.log('Search dropdown closed');
});
```

## Error Handling

The component includes comprehensive error handling with console logging:

**Missing URL or Callback:**

```
Error: No URL defined to make the ajax call for the search.
Make sure you give the attribute data-ajax-search a value!
```

**Invalid URL:**

```
Error: Invalid or missing data-ajax-search attribute. Please provide a valid URL.
Error: Invalid or missing ajaxURL. Please provide a valid URL.
```

**Invalid Language File:**

```
Error: Invalid siteLang value: [value]
```

**Callback Not a Function:**

```
Error: The search callback "[name]" is not defined or is not a function.
```

**Callback Doesn't Return Promise:**

```
Error: The search callback did not return a promise.
```

**AJAX Request Failed:**

- Logs error to console
- Shows "no results" message
- Menu remains functional

## Positioning

The component uses `@floating-ui/dom` for intelligent dropdown positioning:

- **Default placement:** `bottom-start` (below input, left-aligned)
- **Adaptive sizing:** Respects available viewport space
- **Max dimensions:** Automatically calculated based on `availableWidth` and `availableHeight`
- **Repositioned on show:** Calls `positionMenu()` every time dropdown opens

This ensures the dropdown never overflows the viewport, even in modals or scrolled containers.

## Best Practices

::: tip Minimum Characters
The component requires **3 characters minimum** before searching. This is hardcoded (`minimumCharacters = 3`) and prevents excessive API calls for short queries.
:::

::: tip Debouncing
AJAX calls are debounced by **300ms**. Don't trigger searches manually - let the component handle timing to prevent server overload.
:::

::: tip Template Design
Keep result templates concise. The dropdown has max height/width constraints based on viewport.
:::

::: tip Link vs Button
Results can contain either `<a>` or `<button>` elements. The component checks for both when Enter is pressed. For navigation, use links. For actions, use buttons.
:::

::: warning Global Callback Functions
Callback functions must be in `window` scope. Arrow functions assigned to variables won't work:

```javascript
// ❌ Won't work
const mySearch = async (query) => { ... };

// ✅ Works
window.mySearch = async (query) => { ... };
```

:::

::: warning Single Initialization
Don't manually call the component on the same input twice. The component adds `data-ajax-search-initialized` to prevent this, but removing it and reinitializing will cause memory leaks.
:::

## Language Support

The component supports internationalization via language files:

- File path: `../i18n/s-ajax-search-{lang}.json`
- Detected from `SiteLang.getLang()`
- Contains: `nothingFound`, `showResultsForQuery`, `resultsAvailable`

**Example language file:**

```json
{
  "nothingFound": "No results found",
  "showResultsForQuery": "Show all results for",
  "resultsAvailable": "results available"
}
```

## Match Highlighting

The component automatically highlights matching text in results:

1. Takes the current input value
2. Encodes it for safety
3. Searches for matches in result HTML (case-insensitive)
4. Wraps matches in configured element (default: `<mark>`)

**Control highlighting:**

```html
<!-- Use <strong> instead of <mark> -->
data-ajax-search-match-wrapper="strong"

<!-- Disable highlighting -->
data-ajax-search-match-wrapper=""
```

**Style highlights in your template:**

```html
<template id="result__template">
  <div class="[&_mark]:font-bold [&_mark]:bg-yellow-200">%%name%%</div>
</template>
```

## Troubleshooting

**Dropdown not showing?**

- Check console for errors
- Verify URL is valid and accessible
- Ensure minimum 3 characters are typed
- Check that AJAX request returns 200 status

**Results not formatted correctly?**

- Verify template IDs match attribute values
- Check template uses `%%propertyName%%` syntax matching API response
- Ensure API response is an array (or use `data-ajax-search-data` to extract array)

**Keyboard navigation not working?**

- Check that links have `tabindex="-1"` (added automatically)
- Verify no JavaScript errors in console
- Ensure dropdown is visible (not `display: none`)

**Destination input not updating?**

- Verify `data-ajax-search-destination-input` matches input `name` attribute
- Check `data-ajax-search-destination-value` matches API response property
- Listen for `jschange` event on destination input

**Callback function not working?**

- Ensure function is in `window` scope
- Verify function returns a Promise
- Check Promise resolves with array
- Look for error messages in console

**Dropdown positioning wrong?**

- Check parent containers don't have `overflow: hidden`
- Verify no conflicting absolute/fixed positioning
- Ensure `@floating-ui/dom` is loaded

**Multiple initializations?**

- Component automatically prevents this with `data-ajax-search-initialized`
- If you see duplicate dropdowns, check for manual initialization code
