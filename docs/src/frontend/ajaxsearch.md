# Ajax Search

This component enhances an input field to a dropdown that searches an API with the query provided in the input.

## Example

<iframe src="../examples/ajaxsearch.html" height="400"></iframe>

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

## Attributes

Below is a table describing the attributes you can use with the ajax search component.

| Attribute                              | Description                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `data-ajax-search`                     | **Required.** The API endpoint URL for AJAX search requests.                                    |
| `data-ajax-search-method`              | The HTTP method to use for the request (e.g., GET, POST).                                       |
| `data-ajax-search-query`               | The query parameter name sent to the API.                                                       |
| `data-ajax-search-result-template`     | The template ID for rendering each search result.                                               |
| `data-ajax-search-no-result-text`      | Text to display when no results are found.                                                      |
| `data-ajax-search-no-result-template`  | The template ID for rendering when no results are found.                                        |
| `data-ajax-search-group-template`      | The template ID for rendering grouped results, if your API returns grouped data.                |
| `data-ajax-search-typed-text-template` | The template ID for rendering a message based on the user's typed query.                        |
| `data-ajax-search-no-typed-option`     | If set, disables showing a typed option when no results match.                                  |
| `data-ajax-search-destination-input`   | The selector for another input to receive the selected value.                                   |
| `data-ajax-search-clear-on-select`     | If set, clears the input field after a selection is made.                                       |
| `data-ajax-search-results`             | The key in the API response containing the results array.                                       |
| `data-ajax-search-data`                | Additional data to send with the AJAX request (as JSON or query string).                        |
| `data-ajax-search-match-wrapper`       | The HTML element or selector to wrap matched text in results (e.g., `<mark>` for highlighting). |
| `data-ajax-search-list-element-class`  | CSS classes for the dropdown list container.                                                    |
| `data-ajax-search-list-item-class`     | CSS classes for each dropdown list item.                                                        |

## Custom events

You can listen in the original input for some custom events

| Event                | Data    |
| -------------------- | ------- |
| `ajaxSearchShowMenu` | no data |
| `ajaxSearchHideMenu` | no data |
