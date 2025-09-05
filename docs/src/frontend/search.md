# Search

The search component is made to provide a functionality that we have added to a lot of websites. When we provide a search button in the header, when clicked a search form will appear. This will have all the controls necessary and this component will add all the aria elements needed to make this accessible.

## Example

This is a bare bone example of all the minimal elements. In the baseinstall this is more separated into different components.

```HTML
<div id="searchHide">
    <button type="button" class="" data-search-trigger="searchForm" data-search-hide="searchHide" data-search-animated>
        Zoeken
    </button>
</div>
<form action="" class="" id="searchForm">
    <input type="search" name="q" placeholder="Zoeken" aria-label="Zoeken"/>
    <button type="submit">
        Zoeken
    </button>
    <button type="button" tabindex="0" data-search-close>
        Sluiten
    </button>
</form>
```

## Attributes

| Attribute              | Description                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-search-trigger`  | The value is the ID of the search form                                                                                                                        |
| `data-search-hide`     | The ID of the element you want to hide if the search is open.                                                                                                 |
| `data-search-animated` | This will add and removes the class `search-show` to the form in order to animated it with CSS. If this attribute is omitted the class `hidden` will be used. |
