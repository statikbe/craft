# Search

A toggle-able search form interface with ARIA support and keyboard controls. When triggered, the search form appears with proper focus management and accessibility features. Supports two animation modes: CSS class-based transitions or simple show/hide with the `hidden` attribute.

## Features

- ✅ **Toggle Visibility**: Show/hide search form on button click
- ✅ **ARIA Support**: `aria-expanded`, `aria-label`, `aria-hidden` attributes
- ✅ **Focus Management**: Automatically focuses search input when opened
- ✅ **Keyboard Controls**: ESC key closes the search form
- ✅ **Animation Modes**: CSS transitions or instant visibility toggle
- ✅ **Hide Other Elements**: Optionally hide elements (like header) when search opens
- ✅ **Close Button**: Built-in close button support
- ✅ **Form Submission**: Regular form submission to search results page
- ✅ **Accessible**: Screen reader compatible with proper announcements
- ✅ **Auto-Initialize**: Detects data attributes on page load

## Example

This is a bare bone example of all the minimal elements. In the Craft Base Install project, this functionality is separated into different components for better structure.

```html
<div id="searchHide">
  <button type="button" class="" data-search-trigger="searchForm" data-search-hide="searchHide" data-search-animated>
    Zoeken
  </button>
</div>
<form action="" class="" id="searchForm">
  <input type="search" name="q" placeholder="Zoeken" aria-label="Zoeken" />
  <button type="submit">Zoeken</button>
  <button type="button" tabindex="0" data-search-close>Sluiten</button>
</form>
```

## Data Attributes

| Attribute              | Type      | Required | Description                                                              |
| ---------------------- | --------- | -------- | ------------------------------------------------------------------------ |
| `data-search-trigger`  | ID string | Yes      | ID of the search form to toggle. Click this button to show/hide search   |
| `data-search-hide`     | ID string | No       | ID of element to hide when search opens (e.g., navigation)               |
| `data-search-animated` | Boolean   | No       | Use CSS class `search-show` instead of `hidden` attribute for animations |
| `data-search-close`    | Boolean   | Yes      | Marks the close button inside the search form                            |

## Accessibility

### ARIA Attributes

The component automatically manages:

```html
<!-- Trigger button -->
<button
  data-search-trigger="searchForm"
  aria-expanded="false"  <!-- Changes to "true" when open -->
  aria-controls="searchForm"
  aria-label="Open search">
  Search
</button>

<!-- Search form -->
<form
  id="searchForm"
  aria-hidden="true"  <!-- Changes to "false" when visible -->
  role="search">
  <input
    type="search"
    aria-label="Search"  <!-- Required for screen readers -->
    name="q" />
</form>

<!-- Hidden element -->
<div
  id="mainNav"
  aria-hidden="false">  <!-- Changes to "true" when search opens -->
  <!-- Navigation content -->
</div>
```

### Focus Management

```typescript
// When opening
searchInput.focus(); // Moves focus to search input

// When closing
triggerButton.focus(); // Returns focus to trigger button
```

This ensures keyboard users don't lose their place.

### Keyboard Support

| Key       | Action                         |
| --------- | ------------------------------ |
| **Enter** | Trigger button opens search    |
| **ESC**   | Closes search form             |
| **Tab**   | Navigate through form elements |

### Screen Reader Announcements

Use proper labels:

```html
<!-- Good ✅ -->
<button aria-label="Open site search" data-search-trigger="search">
  <svg><!-- Icon --></svg>
</button>

<!-- Bad ❌ - No text or label -->
<button data-search-trigger="search">
  <svg><!-- Icon --></svg>
</button>
```
