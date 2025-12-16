# Datalayer

A component for automatically tracking form filter interactions to Google Tag Manager's dataLayer. Pushes structured data when filters change, enabling analytics tracking of user search and filter behavior.

## Features

- ✅ **Automatic Tracking** - Listens to `filterFetchData` event from Filter component
- ✅ **Smart Data Collection** - Extracts form data with human-readable labels
- ✅ **Array Support** - Handles checkbox groups and multi-selects
- ✅ **Custom Labels** - Override default labels with `data-datalayer-value`
- ✅ **Custom Keys** - Rename fields in dataLayer with `data-datalayer-name`
- ✅ **Field Exclusion** - Ignore specific fields from tracking
- ✅ **Duplicate Prevention** - Only pushes when data actually changes
- ✅ **Dynamic Content Support** - Works with dynamically added forms
- ✅ **Empty Value Filtering** - Removes empty arrays and fields automatically

## How It Works

The component:

1. Finds all `form[data-datalayer-event]` elements
2. Listens for the `filterFetchData` event (from Filter component)
3. Collects all form data
4. Converts values to human-readable labels
5. Formats data for GTM dataLayer
6. Pushes to `window.dataLayer` only if data changed

## Basic Usage

### Minimal Setup

```html
<form data-filter="filterResults" data-filter-aria-live="filterAriaLive" data-datalayer-event="filter">
  <input type="checkbox" id="cat1" name="category[]" value="1" />
  <label for="cat1">News</label>

  <input type="checkbox" id="cat2" name="category[]" value="2" />
  <label for="cat2">Events</label>

  <button type="submit">Submit</button>
</form>
```

**DataLayer output when "News" is selected:**

```javascript
{
  event: 'filter',
  category: ['News']
}
```

### With Search Field

```html
<form data-filter="filterResults" data-filter-aria-live="filterAriaLive" data-datalayer-event="filter">
  <input type="text" name="search" placeholder="Search..." />

  <input type="checkbox" id="cat1" name="category[]" value="1" />
  <label for="cat1">News</label>

  <button type="submit">Submit</button>
</form>
```

**DataLayer output:**

```javascript
{
  event: 'filter',
  search: 'sustainability',
  category: ['News']
}
```

## Attributes

### Required Attributes

| Attribute              | Required | Description                                                                           |
| ---------------------- | -------- | ------------------------------------------------------------------------------------- |
| `data-datalayer-event` | ✅ Yes   | Name of the event to push to dataLayer (e.g., `"filter"`, `"search"`, `"newsletter"`) |

::: tip Works with Filter Component
This component requires the Filter component and listens to its `filterFetchData` event. Make sure both `data-filter` and `data-datalayer-event` are on the same form.
:::

### Optional Attributes

#### Form-level Attributes

| Attribute               | Default | Description                                                                            |
| ----------------------- | ------- | -------------------------------------------------------------------------------------- |
| `data-datalayer-ignore` | —       | Comma-separated list of field names to exclude from tracking (e.g., `"csrf,honeypot"`) |

#### Field-level Attributes

| Attribute              | Element Type           | Description                                                  |
| ---------------------- | ---------------------- | ------------------------------------------------------------ |
| `data-datalayer-value` | Input, Select          | Override the label sent to dataLayer for this field's value  |
| `data-datalayer-name`  | Input (checkbox/radio) | Override the key name in dataLayer for checkbox/radio groups |

## Label Detection

The component automatically finds human-readable labels for form values:

### Checkboxes and Radio Buttons

**Priority order:**

1. `data-datalayer-value` attribute on input
2. `<label for="inputId">` element text
3. Closest parent `<label>` element text
4. Falls back to field name

```html
<!-- Uses label text: "Latest News" -->
<input type="checkbox" id="cat1" name="category[]" value="1" />
<label for="cat1">Latest News</label>

<!-- Uses custom value: "News Category" -->
<input type="checkbox" id="cat2" name="category[]" value="2" data-datalayer-value="News Category" />
<label for="cat2">News</label>
```

### Text Inputs

```html
<!-- Uses actual input value -->
<input type="text" name="search" value="sustainability" />
<!-- DataLayer: { search: 'sustainability' } -->
```

## Custom Field Names

By default, the field's `name` attribute is used as the key in dataLayer. Override this with `data-datalayer-name`:

```html
<form data-datalayer-event="filter">
  <!-- Default: key is "category" -->
  <input type="checkbox" name="category[]" value="1" />
  <label>News</label>

  <!-- Custom: key is "contentType" -->
  <input type="checkbox" name="type[]" value="1" data-datalayer-name="contentType" />
  <label>Article</label>
</form>
```

**DataLayer output:**

```javascript
{
  event: 'filter',
  category: ['News'],
  contentType: ['Article']
}
```

## Ignoring Fields

Exclude sensitive or irrelevant fields from tracking:

```html
<form data-datalayer-event="newsletter" data-datalayer-ignore="csrf,honeypot,email">
  <input type="hidden" name="csrf" value="abc123" />
  <input type="text" name="honeypot" value="" />
  <input type="email" name="email" value="user@example.com" />
  <input type="checkbox" name="interests[]" value="tech" />
  <label>Technology</label>
</form>
```

**DataLayer output (email excluded):**

```javascript
{
  event: 'newsletter',
  interests: ['Technology']
}
```

## Common Patterns

### News Filter with Multiple Fields

```html
<form
  data-filter="filterResults"
  data-filter-aria-live="filterAriaLive"
  data-datalayer-event="filter"
  data-datalayer-ignore="page"
>
  <!-- Search -->
  <input type="text" name="search" placeholder="Search articles..." />

  <!-- Categories -->
  <h3>Categories</h3>
  <input type="checkbox" id="news" name="category[]" value="1" />
  <label for="news">News</label>

  <input type="checkbox" id="events" name="category[]" value="2" />
  <label for="events">Events</label>

  <!-- Ignored field -->
  <input type="hidden" name="page" value="2" />

  <button type="submit">Filter</button>
</form>
```

**DataLayer output:**

```javascript
{
  event: 'filter',
  search: 'sustainability',
  category: ['News', 'Events'],
}
```

### Product Filter

```html
<form
  data-filter="products"
  data-filter-aria-live="aria"
  data-datalayer-event="product_filter"
  data-datalayer-ignore="csrf"
>
  <!-- Price Range -->
  <h3>Price</h3>
  <input type="checkbox" id="price1" name="price[]" value="0-50" data-datalayer-name="priceRange" />
  <label for="price1">Under €50</label>

  <input type="checkbox" id="price2" name="price[]" value="50-100" data-datalayer-name="priceRange" />
  <label for="price2">€50 - €100</label>

  <!-- Brands -->
  <h3>Brands</h3>
  <input type="checkbox" id="brand1" name="brand[]" value="1" data-datalayer-value="Nike" />
  <label for="brand1">Nike</label>

  <input type="checkbox" id="brand2" name="brand[]" value="2" data-datalayer-value="Adidas" />
  <label for="brand2">Adidas</label>

  <!-- Color -->
  <select name="color">
    <option value="">All Colors</option>
    <option value="red">Red</option>
    <option value="blue">Blue</option>
  </select>

  <button type="submit">Apply Filters</button>
</form>
```

**DataLayer output:**

```javascript
{
  event: 'product_filter',
  priceRange: ['Under €50', '€50 - €100'],
  brand: ['Nike', 'Adidas'],
  color: 'Blue'
}
```

### Event Tracking with Custom Event Names

```html
<!-- Blog search -->
<form data-filter="blog" data-filter-aria-live="aria" data-datalayer-event="blog_search">
  <input type="text" name="q" />
</form>

<!-- Job filters -->
<form data-filter="jobs" data-filter-aria-live="aria" data-datalayer-event="job_filter">
  <select name="location">
    <option>Brussels</option>
  </select>
</form>

<!-- Store locator -->
<form data-filter="stores" data-filter-aria-live="aria" data-datalayer-event="store_search">
  <input type="text" name="city" />
</form>
```

## Duplicate Prevention

The component only pushes to dataLayer when values actually change:

```javascript
// First filter: Pushes
{
  event: 'filter',
  category: ['News']
}

// User selects same filter again: Does NOT push (duplicate)

// User selects different filter: Pushes
{
  event: 'filter',
  category: ['News', 'Events']
}
```

## Empty Value Handling

Empty values and empty arrays are automatically removed:

```html
<form data-datalayer-event="filter">
  <input type="text" name="search" value="" />
  <!-- No checkboxes selected -->
  <input type="checkbox" name="category[]" value="1" />
</form>
```

**DataLayer output (only event, no empty fields):**

```javascript
{
  event: 'filter';
}
```

::: tip Minimum Fields
If the form has no active filters, the component still pushes the event name:

```javascript
{
  event: 'filter';
}
```

This helps track when users clear all filters.
:::

## Best Practices

::: tip Use Descriptive Event Names
Choose event names that clearly indicate the action:

```html
<!-- Good -->
data-datalayer-event="product_filter" data-datalayer-event="blog_search" data-datalayer-event="newsletter_signup"

<!-- Avoid -->
data-datalayer-event="form" data-datalayer-event="submit"
```

:::

::: tip Ignore Sensitive Data
Always exclude PII and security tokens:

```html
data-datalayer-ignore="email,phone,csrf,password"
```

:::

::: tip Use Custom Labels for Better Analytics
Provide human-readable labels instead of IDs:

```html
<!-- Instead of value="123" -->
<input type="checkbox" name="category[]" value="123" data-datalayer-value="Technology News" />
```

:::

::: warning Requires Filter Component
This component only works with forms that use the Filter component. It listens for the `filterFetchData` event which is dispatched by the Filter component.
:::

## Related Components

- [Filter](./filter) - Required companion component that triggers datalayer pushes
