# Autocomplete

The Autocomplete component transforms a `<select>` element into an accessible, searchable dropdown with keyboard navigation. It enhances both single and multiple select elements with filtering, free-type input, and improved UX.

## Features

- ✅ **Progressive Enhancement** - Built on native `<select>` elements
- ✅ **Keyboard Navigation** - Full arrow key, Enter/Escape support
- ✅ **Accessibility** - WCAG 2.1 AA compliant with ARIA attributes
- ✅ **Searchable** - Filter options as you type
- ✅ **Free Type** - Allow custom values not in the list
- ✅ **Multiple Selection** - Enhanced multi-select with tags
- ✅ **AJAX Loading** - Load options dynamically from API endpoint with pagination
- ✅ **Accent Insensitive** - Searches normalize accents (é → e)
- ✅ **Dynamic Content** - Works with AJAX-loaded selects
- ✅ **Mutation Observer** - Syncs with programmatic changes to original select
- ✅ **Intelligent Positioning** - Uses `@floating-ui/dom` with flip middleware

::: danger Select Elements Only
This component **only works on `<select>` elements**. Using it on other elements will be ignored. The component checks `autocomplete.tagName === 'SELECT'`.
:::

## Example of a single select

<iframe src="../../examples/autocomplete_single.html" height="300"></iframe>

### Code example for a multi-select

```TWIG
<select name="singleSelect" data-autocomplete class="border-1">
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>
```

## Example of a single select with free type

Free type means that you allow the user to add an option that is not in the list just by typing it.

<iframe src="../../examples/autocomplete_freetype.html" height="300"></iframe>

### Code example for a single select

```TWIG
<select name="singleSelect" data-autocomplete free-type class="border-1">
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>
```

## Example of a multi-select

<iframe src="../../examples/autocomplete_multi.html" height="300"></iframe>

### Code example for a single select

```TWIG
<select name="multipleSelect" data-autocomplete class="border-1" multiple>
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
    <option value="6">Option 6</option>
    <option value="7">Option 7</option>
</select>
```

## AJAX Loading

The autocomplete component can load options dynamically from an API endpoint using the `data-ajax-url` attribute. This is ideal for large datasets, search-as-you-type functionality, or data that changes frequently.

### Basic AJAX Example

```html
<select name="newsSelect" data-autocomplete data-ajax-url="/api/options">
  <option value="">Search options...</option>
</select>
```

### API Response Format

Your API endpoint must return JSON in this exact format:

```json
{
  "data": [
    { "value": 1, "option": "News Title 1" },
    { "value": 2, "option": "News Title 2" },
    { "value": 3, "option": "News Title 3" }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Required fields:**

- `data` - Array of option objects
  - `value` - The option value (number or string, converted to string internally)
  - `option` - The display text for the option
- `pagination` - Pagination metadata
  - `page` - Current page number
  - `perPage` - Number of items per page
  - `total` - Total number of items available
  - `totalPages` - Total number of pages

### How AJAX Loading Works

1. **Initial Load**: Component fetches first page from `data-ajax-url` on initialization
2. **Search**: As user types, component sends `?q={searchTerm}&page=1` to API
3. **Pagination**: As user scrolls near bottom of list (200px threshold), next page loads automatically
4. **Merging**: New options are appended to existing list for infinite scroll experience
5. **Selected Options**: Selected options are preserved and excluded from duplicate loading

### API Parameters

The component automatically sends these query parameters:

| Parameter | Type   | Description                          | Example       |
| --------- | ------ | ------------------------------------ | ------------- |
| `q`       | string | Search query (optional, when typing) | `?q=breaking` |
| `page`    | number | Page number for pagination           | `?page=2`     |

### Example: Craft CMS API Endpoint

Create a Twig template at `/templates/api/news.twig`:

```twig
{%- header "Content-Type: application/json" -%}
{%- set searchQuery = craft.app.request.getParam('q') -%}
{%- set perPage = craft.app.request.getParam('perPage', 20) -%}
{%- set page = craft.app.request.getParam('page', 1) -%}
{%- set newsQuery = craft.entries()
    .section('news')
    .orderBy('title ASC') -%}
{%- if searchQuery -%}
    {%- set newsQuery = newsQuery.search('title:*' ~ searchQuery ~ '*') -%}
{%- endif -%}
{%- set totalEntries = newsQuery.count() -%}
{%- set newsEntries = newsQuery.offset((page - 1) * perPage).limit(perPage).all() -%}
{
    "data": [
{%- for entry in newsEntries -%}
        {"value": {{ entry.id }}, "option": {{ entry.title|json_encode|raw }}}
        {%- if not loop.last -%},{%- endif -%}
{%- endfor -%}
    ],
    "pagination": {
        "page": {{ page }},
        "perPage": {{ perPage }},
        "total": {{ totalEntries }},
        "totalPages": {{ (totalEntries / perPage)|round(0, 'ceil') }}
    }
}
```

Add route in `config/routes.php`:

```php
return [
    'api/news.json' => ['template' => 'api/news'],
];
```

### AJAX with Pre-selected Options

You can combine AJAX loading with pre-selected options in the select element:

```html
<select name="newsSelect" data-autocomplete data-ajax-url="/api/news.json" class="border-1">
  <option value="">Search news...</option>
  <option value="42" selected>Pre-selected News Article</option>
</select>
```

The component will:

1. Load AJAX options from API
2. Detect the pre-selected option from the select element
3. Show it in the input field (single select) or as a tag (multi-select)
4. Exclude it from duplicate loading when paginating

### Infinite Scroll Pagination

When using AJAX, the dropdown list supports infinite scroll:

- **Scroll Trigger**: When user scrolls within 200px of bottom
- **Automatic Loading**: Next page fetches and appends automatically
- **No Duplicates**: Already selected options are excluded
- **Page Tracking**: Component tracks current page and prevents duplicate requests
- **End Detection**: Stops loading when `page >= totalPages`

::: tip Pagination Performance
For best performance:

- Keep `perPage` between 10-50 items
- Use server-side indexing for fast searches
- Consider caching frequently accessed pages
- Return consistent `totalPages` for accurate scroll detection
  :::

### AJAX with Multiple Select

```html
<select name="newsMultiple" data-autocomplete data-ajax-url="/api/news.json" multiple>
  <option value="">Search and select multiple news...</option>
</select>
```

Behavior:

- Selected items appear as tags
- Tags are excluded from API results (no duplicates)
- Search resets to page 1
- Pagination continues to work as user scrolls

### AJAX Error Handling

The component does not currently implement explicit error handling. If the API request fails:

- Console errors will appear
- Options list will remain empty or show previous results
- No user-facing error message displayed

**Best practices:**

- Ensure API endpoint is reliable
- Test API response format carefully
- Monitor console for network errors
- Consider adding server-side logging

::: warning API Format Required
The AJAX feature **requires** the exact JSON format shown above. Incorrect format will cause the component to fail silently or throw JavaScript errors.
:::

::: tip Combining with Static Options
You can combine AJAX options with static `<option>` elements. The component loads both:

1. First, AJAX options from the API
2. Then, static options from the select element

This is useful for having a "Other" or "None" option alongside dynamic data.
:::

## Required Attributes

| Attribute           | Required | Description                                                                              |
| ------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `data-autocomplete` | ✅ Yes   | Marks the `<select>` element for autocomplete enhancement. Removed after initialization. |

## Optional Attributes

| Attribute                     | Description                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `multiple`                    | Native HTML attribute for multiple selection. Component adds tag-style UI for selected items.              |
| `free-type`                   | Allows users to enter custom values not in the option list. Creates a new option dynamically.              |
| `disabled`                    | Native HTML attribute. Component observes changes and updates UI accordingly via MutationObserver.         |
| `data-ajax-url`               | URL to fetch options from via AJAX. Response must match the API format (see AJAX Loading section).         |
| `data-autocomplete-reference` | CSS selector for a different element to append the dropdown to (useful for modals or overflow containers). |

::: tip Free Type Usage
With `free-type`, users can type any value and it will be added to the select as a new option. Great for tag inputs or allowing custom entries.
:::

## How It Works

### Initialization

1. **Finds all** `<select>` elements with `[data-autocomplete]`
2. **Validates** element is a `<select>` (others are skipped)
3. **Removes** `data-autocomplete` attribute
4. **Adds** `data-autocomplete-init` with unique path identifier
5. **Detects** `data-ajax-url` attribute for AJAX mode
6. **Creates** UI structure:
   - Wrapper div (`.autocomplete`)
   - Input field for searching
   - Dropdown list (hidden by default)
   - Status div for screen readers
   - Dropdown icon button
7. **Hides** original `<select>` (sets `aria-hidden="true"`, `tabindex="-1"`, adds `hidden` class)
8. **Copies** classes from `<select>` to new autocomplete element
9. **Sets up** MutationObserver to watch for changes to original select
10. **Loads** options (from AJAX if URL provided, or from static options)
11. **Sets up** scroll listener for infinite pagination (AJAX mode only)
12. **Parses** selected values from both AJAX data and static options
13. **Supports** dynamic content via `DOMHelper.onDynamicContent`

### User Interaction Flow

**Single Select:**

1. User clicks or focuses input
2. Dropdown opens showing all options
3. User types to filter options (accent-insensitive)
4. Arrow keys navigate, Enter selects
5. Selected value populates input field
6. Dropdown closes, original select value updates

**Multiple Select:**

1. User clicks or focuses input
2. Dropdown opens showing all options
3. User types to filter and selects option
4. Selected option appears as tag with remove button
5. Input clears, ready for next selection
6. User can remove tags with backspace or click X button
7. Tags keyboard navigable with arrow keys

**Free Type:**

1. User types value not in list
2. New option dynamically added to top of list
3. Temporary `<option>` created in original select
4. On selection, value saved to select element

## Styling Customization

The component copies classes from the original `<select>` to the autocomplete wrapper, maintaining your existing styling.

### Override Classes via Data Attributes

Customize individual UI elements by adding data attributes to your `<select>`. These override the default Tailwind classes:

| Attribute                                     | Applied To                      | Default Classes                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-autocomplete-list`                      | Dropdown container (`<ul>`)     | `autocomplete__list bg-white shadow-xl`                                                                                                                                                                                                                                                                                                                        |
| `data-autocomplete-option`                    | Each option (`<li>`)            | `autocomplete__option py-1 px-2 flex items-center justify-between focus:shadow-none focus:outline-none cursor-pointer hover:bg-primary hover:text-primary-contrast hover:after:bg-primary-contrast [&.highlight]:bg-primary [&.highlight]:text-primary-contrast [&.highlight]:after:bg-primary-contrast aria-selected:text-gray-500 aria-selected:after:block` |
| `data-autocomplete-option-after`              | Option checkmark pseudo-element | `after:hidden after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/check.svg")]`                                                                                                                                                            |
| `data-autocomplete-select`                    | Autocomplete visible container  | _(No default; inherits from original select)_                                                                                                                                                                                                                                                                                                                  |
| `data-autocomplete-select-placeholder`        | Placeholder text                | `autocomplete__placeholder overflow-hidden text-ellipsis whitespace-nowrap opacity-25`                                                                                                                                                                                                                                                                         |
| `data-autocomplete-select-input`              | Search input field              | `autocomplete__input bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none`                                                                                                                                                                                                                                                             |
| `data-autocomplete-drop-down-icon`            | Dropdown chevron button         | `autocomplete__dropdown-icon flex items-center px-2 text-black`                                                                                                                                                                                                                                                                                                |
| `data-autocomplete-drop-down-icon-after`      | Chevron icon pseudo-element     | `after:block after:shrink-0 after:w-[1.5em] after:h-[1.5em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-down.svg")]`                                                                                                                                                                   |
| `data-autocomplete-selection`                 | Selected tag (multi-select)     | `autocomplete__selection rounded-sm bg-primary text-primary-contrast`                                                                                                                                                                                                                                                                                          |
| `data-autocomplete-selection-text`            | Tag text                        | `autocomplete__selection-text px-2`                                                                                                                                                                                                                                                                                                                            |
| `data-autocomplete-selection-close-btn`       | Tag remove button               | `autocomplete__selection-close px-1 border-l-1 border-white cursor-pointer focus:bg-primary-700 hover:bg-primary-700`                                                                                                                                                                                                                                          |
| `data-autocomplete-selection-close-btn-after` | Remove icon pseudo-element      | `after:block after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`                                                                                                                                                                              |
| `data-autocomplete-input-wrapper`             | Input + tags container          | `autocomplete__input-wrapper flex items-center gap-2 flex-wrap p-2 w-[1px] flex-1 [&.has-placeholder]:flex-nowrap`                                                                                                                                                                                                                                             |

**Example:**

```html
<select
  data-autocomplete
  data-autocomplete-list="bg-gray-100 shadow-md rounded-lg"
  data-autocomplete-option="p-3 hover:bg-blue-500 hover:text-white"
  class="border-2 border-gray-300"
>
  <option value="">Choose...</option>
  <option value="1">Option 1</option>
</select>
```

::: tip Class Inheritance
The autocomplete wrapper automatically receives all classes from the original `<select>`. The `hidden` class is excluded to keep the autocomplete visible.
:::

## Keyboard Navigation

### In Input Field

| Key            | Action                                                                    |
| -------------- | ------------------------------------------------------------------------- |
| `↓` Arrow Down | Open menu (if closed) / Navigate to next option (cycles to first)         |
| `↑` Arrow Up   | Open menu to last item (if closed) / Navigate to previous option (cycles) |
| `Enter`        | Select highlighted option and close menu                                  |
| `Tab`          | Select highlighted option (if any) and close menu                         |
| `Escape`       | Close menu (if open) / Clear input (if menu already closed)               |
| `Backspace`    | Delete last selected tag (multi-select with empty input)                  |
| `← Arrow Left` | Focus last tag remove button (multi-select)                               |
| Any typing     | Filter options as you type                                                |

### On Tag Remove Buttons (Multi-Select)

| Key             | Action                                  |
| --------------- | --------------------------------------- |
| `← Arrow Left`  | Focus previous tag remove button        |
| `→ Arrow Right` | Focus next tag remove button (or input) |
| `Enter/Space`   | Remove the tag                          |

## Search Behavior

### Static Options

The component filters options using **accent-insensitive** matching:

```javascript
// Both of these will match "José":
"jose"; // User types without accent
"José"; // Option in list

// Normalizes: é → e, ñ → n, ü → u, etc.
```

**How it works:**

1. Converts input to lowercase
2. Normalizes Unicode characters (removes diacritics)
3. Matches against both original and normalized option text
4. Shows all matching options

### AJAX Options

When `data-ajax-url` is set, search behavior changes:

1. User types in input field
2. Component sends `?q={searchTerm}&page=1` to API endpoint
3. API performs server-side search and returns matching results
4. Component replaces current options with search results
5. Selected options are preserved and merged with results
6. Pagination resets to page 1 on each new search
7. Infinite scroll works with search results

**AJAX search characteristics:**

- Server-side filtering (implement in your API)
- Resets to page 1 on every keystroke
- Tracks search term separately for pagination
- Empty search term loads all results (page 1)

## Accessibility

### ARIA Implementation

- `role="combobox"` on input field
- `role="listbox"` on dropdown (with `aria-multiselectable="true"` for multiple)
- `role="option"` on each list item
- `aria-controls` links input to dropdown list
- `aria-expanded` indicates dropdown state
- `aria-autocomplete="list"` describes behavior
- `aria-activedescendant` tracks keyboard focus
- `aria-selected="true"` marks selected options
- `aria-hidden="true"` on original select
- `aria-live="polite"` status region announces result count
- `aria-label` on remove buttons (e.g., "Remove Option 1")

### Screen Reader Support

- **Live region** announces "X results available" on each search
- **Remove buttons** announce option name when focused
- **Selected state** announced for each option
- **Disabled state** prevents interaction and announces status

### Focus Management

- Input remains focusable at all times
- Original select has `tabindex="-1"` to remove from tab order
- Dropdown icon has `tabindex="-1"` (activated by parent click)
- Tag remove buttons are keyboard focusable
- Arrow keys don't lose input focus

## Dynamic Content & MutationObserver

### AJAX-Loaded Selects

The component automatically initializes on dynamically loaded selects:

```javascript
// After AJAX loads a form with select elements
// Component detects and initializes them automatically
```

### Programmatic Changes

A **MutationObserver** watches the original `<select>` for:

**Attribute Changes:**

- `disabled` - Updates UI disable state
- `class` - Syncs classes to autocomplete wrapper

**Child List Changes:**

- New options added
- Options removed
- Option text/value changed

**Manual Select Updates:**

```javascript
// These changes are automatically detected:
selectElement.value = "5";
selectElement.selectedIndex = 2;
selectElement.options[0].selected = true;

// Trigger jschange event to update autocomplete UI:
selectElement.dispatchEvent(new Event("jschange"));
```

::: tip jschange Event
When you programmatically change the select value, dispatch a `jschange` event to sync the autocomplete UI. The component listens for this custom event.
:::

## Free Type Mode

Enable `free-type` to allow custom values:

```html
<select data-autocomplete free-type>
  <option value="">Type anything...</option>
  <option value="red">Red</option>
  <option value="blue">Blue</option>
</select>
```

**Behavior:**

1. User types "green" (not in list)
2. "green" appears at top of dropdown
3. On selection, a new `<option>` is dynamically created
4. New option is inserted at the beginning of the select
5. Select value set to "green"

**Limitations:**

- Only works with single select (not multiple)
- Dynamically created options exist only for the current page load
- Options not persisted across page refreshes (unless saved server-side)

## Positioning

The dropdown uses `@floating-ui/dom` for intelligent positioning:

- **Default placement:** `bottom-start` (below input, left-aligned)
- **Flip middleware:** Automatically flips to top if space below is insufficient
- **Reference element:** By default, positions relative to autocomplete wrapper
- **Custom reference:** Use `data-autocomplete-reference` to position relative to different element

**Custom positioning example:**

```html
<div id="modal-content">
  <select data-autocomplete data-autocomplete-reference="#modal-content">
    <option>...</option>
  </select>
</div>
```

This prevents overflow issues in modals or scrollable containers.

## Custom Events

Listen for these events on the **original `<select>` element**:

| Event                  | Bubbles | Description                                  |
| ---------------------- | ------- | -------------------------------------------- |
| `autocompleteShowMenu` | ✅ Yes  | Fired when dropdown opens                    |
| `autocompleteHideMenu` | ✅ Yes  | Fired when dropdown closes                   |
| `change`               | ✅ Yes  | Native event fired when selection changes    |
| `jschange`             | ❌ No   | Custom event you can dispatch to sync the UI |

```javascript
const selectElement = document.querySelector("[data-autocomplete-init]");

selectElement.addEventListener("autocompleteShowMenu", () => {
  console.log("Dropdown opened");
});

selectElement.addEventListener("change", (e) => {
  console.log("Selected value:", e.target.value);
});

// Programmatic change:
selectElement.value = "5";
selectElement.dispatchEvent(new Event("jschange")); // Syncs autocomplete UI
```

## Language Support

The component supports internationalization via language files:

- File path: `../i18n/s-autocomplete-{lang}.json`
- Detected from `SiteLang.getLang()`
- Used for: `removeOption` (tag remove button label), `resultsAvailable` (status region)

**Example language file:**

```json
{
  "removeOption": "Remove option",
  "resultsAvailable": "results available"
}
```

## Placeholder Handling

The first `<option>` with an empty value is used as the placeholder:

```html
<select data-autocomplete>
  <option value="">Choose an option...</option>
  <!-- This becomes placeholder -->
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

**Placeholder behavior:**

- Shows when input is empty and no selections made
- Hidden when user focuses input (single select)
- Hidden when tags are present (multi-select)
- Reappears when input blur with no selection (single select)
- Has `.opacity-25` class for visual styling

## Input Sizing

The input field dynamically resizes based on content:

```javascript
// Automatically calculated:
inputElement.size = Math.max(inputElement.value.length + 1, 1);
```

- **Minimum size:** 1 character
- **Dynamic:** Grows as you type
- **Max width:** Constrained by wrapper's available space
- Prevents layout shift in multi-select tags

## Error Handling

**Invalid Language File:**

```
Error: Invalid siteLang value: [value]
Error loading language file: [error details]
```

**No Errors on Duplicate Initialization:**

- Component uses `data-autocomplete-init` to prevent duplicates
- Removes `data-autocomplete` after first initialization
- Dynamic content cleanup handled automatically

## Best Practices

::: tip Progressive Enhancement
The original `<select>` remains in the DOM and functional. If JavaScript fails, users still have a working select element.
:::

::: tip Placeholder Text
Always provide a meaningful placeholder as the first option with an empty value. It improves UX and accessibility.
:::

::: tip Option Classes
You can add classes to individual `<option>` elements, and they'll be preserved in the autocomplete list items:

```html
<option value="1" class="font-bold text-red-500">Important Option</option>
```

:::

::: tip Multiple Select UX
For multi-select, the autocomplete UI is significantly better than the native select. Users see their selections as tags and can easily remove them.
:::

::: warning ID Attribute
If your `<select>` has an `id`, it's moved to the input field. Update any `<label>` elements accordingly:

```html
<!-- Before -->
<label for="my-select">Choose:</label>
<select id="my-select" data-autocomplete>
  ...
</select>

<!-- After (automatic) -->
<label for="my-select">Choose:</label>
<input id="my-select" ... />
<!-- ID moved here -->
<select aria-hidden="true" class="hidden">
  ...
</select>
```

:::

::: warning Validation
The input field has `data-dont-validate="true"` to exclude it from form validation. Validation should target the original `<select>` element.
:::

::: warning Free Type Persistence
Dynamically created options from `free-type` mode are not persisted. If you need persistence, capture the `change` event and save the value server-side.
:::

## Troubleshooting

**Autocomplete not initializing?**

- Check console for errors
- Verify element is a `<select>` (not input or div)
- Ensure `data-autocomplete` attribute is present
- Check for JavaScript errors preventing component load

**Dropdown not visible?**

- Verify dropdown isn't positioned off-screen
- Check for `overflow: hidden` on parent containers
- Use `data-autocomplete-reference` for modals
- Inspect z-index conflicts (default is `z-999`)

**Dropdown positioning wrong?**

- Ensure `@floating-ui/dom` is loaded
- Check parent containers don't have `position: relative` conflicts
- Use `data-autocomplete-reference` to change positioning reference
- Verify sufficient viewport space (flip middleware activates automatically)

**Search not filtering?**

- Check that options have non-empty values
- Verify typing is triggering `keyup` events
- Check console for errors
- Ensure options array is populated

**Programmatic changes not reflecting?**

- Dispatch `jschange` event after changing select value
- Check MutationObserver is active (not disconnected)
- Verify the original select value actually changed

**Multiple select tags not showing?**

- Verify `multiple` attribute is present on select
- Check selected options in original select
- Ensure `.autocomplete__input-wrapper` is visible
- Check for CSS conflicts hiding tags

**Free type not working?**

- Verify `free-type` attribute (not `data-free-type`)
- Check that it's a single select (not multiple)
- Ensure input value is not empty
- Check console for errors

**Classes not applying?**

- Verify attribute names match exactly (kebab-case)
- Check that classes are valid Tailwind classes
- Ensure Tailwind arbitrary values are properly formatted
- Check for CSS specificity conflicts

**Remove buttons not working (multi-select)?**

- Check that event listeners are attached
- Verify buttons have `data-value` attribute
- Look for JavaScript errors in console
- Ensure focus is possible (not `pointer-events: none`)

## Performance Notes

- **MutationObserver:** Efficiently watches for changes to original select
- **Event Delegation:** Click listeners on list container, not each option
- **Debouncing:** Not implemented; filters immediately (fast enough with few options)
- **Dynamic Sizing:** Input size recalculates on every keystroke
- **Position Calculation:** Only when dropdown opens
- **Minimal DOM:** Creates only necessary wrapper elements
- **Class Copying:** Happens once during initialization

## Advanced: Custom Reference Element

For dropdowns in modals, scrollable containers, or complex layouts:

```html
<div id="custom-container" style="position: relative;">
  <select data-autocomplete data-autocomplete-reference="#custom-container" class="border-1">
    <option value="">Choose...</option>
    <option value="1">Option 1</option>
  </select>
</div>
```

This appends the dropdown list to `#custom-container` instead of the autocomplete wrapper, preventing overflow issues.

## Based On

This component is based on the excellent article: [Building an Accessible Autocomplete Control](https://adamsilver.io/articles/building-an-accessible-autocomplete-control/) by Adam Silver.

## Technical Details

### Unique Identification

Each autocomplete gets a unique identifier using `DOMHelper.getPathTo()`:

- Creates a DOM path like `"0/2/1"` (element positions)
- Used for `id` attributes: `autocompleteList{path}`
- Ensures multiple autocompletes on same page have unique IDs
- Prevents ARIA reference conflicts

### Class Management

The component uses a sophisticated class system:

- Default classes defined in `cssClasses` object
- Data attributes override specific class sets
- Original select classes copied to autocomplete wrapper
- `hidden` class excluded when copying
- Pseudo-element classes applied separately (::after content)

### Input Field Specifications

The created input has these attributes:

- `type="text"`
- `autocomplete="off"` - Prevents browser autocomplete
- `autocapitalize="none"` - No auto-capitalization on mobile
- `data-dont-validate="true"` - Excludes from validation scripts
- `class="no-hook"` - Prevents other scripts from hooking into it
- `role="combobox"` - Accessibility role
- Dynamic `size` attribute based on content length
