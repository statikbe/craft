# Search

The search component provides a reusable search interface commonly used on websites. When the search button in the header is clicked, a search form appears with all necessary controls. This component adds ARIA attributes such as `aria-label` for the input field and `aria-expanded` for the trigger button, improving accessibility by clearly describing the purpose of elements to assistive technologies and indicating the visibility state of the search form.

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

## Attributes

| Attribute              | Description                                                                                                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-search-trigger`  | The value is the ID of the search form                                                                                                                                                                                                                                                      |
| `data-search-hide`     | The ID of the element you want to hide if the search is open.                                                                                                                                                                                                                               |
| `data-search-animated` | When present, toggles the `search-show` class on the form to enable CSS-based animations (e.g., fade-in/out). If omitted, the form uses the `hidden` class for simple visibility toggling. Example CSS: `.search-show { opacity: 1; transition: opacity 0.3s; } .hidden { display: none; }` |
