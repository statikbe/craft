---
prev:
  text: 'Ajax Paging'
  link: '/frontend/ajaxpaging'
next:
  text: 'Autocomplete'
  link: '/frontend/autocomplete'
---

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
        data-ajax-search-methode="GET"
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

Below is a table describing the attributes you can use with the ajax paging component.

| Attribute                  | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `data-ajax-paging`         | This is the wrapper element. This element needs a unique id attribute |
| `data-ajax-paging-loader`  | This is an element that will be shown when loading                    |
| `data-ajax-paging-content` | This is the content that needs to be changed                          |
| `data-ajax-paging-links`   | This element contains the pagination links                            |
