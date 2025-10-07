# Filter

This component has all the options to refresh a selection of results through AJAX when an element in the form is changed.

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

## Attributes

Below is a table describing the attributes you can use with the filter component.

| Attribute                              | default           | Description                                                                             |
| -------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `data-filter`                          | none              | The id of the results block                                                             |
| `data-filter-aria-live`                | none              | The id of the aria-live element                                                         |
| `data-filter-extra`                    | none              | An array of id's separated by a comma of dom elements that need to be updated on change |
| `data-filter-mobile-toggle`            | none              | The id of the button used to toggle the filter on mobile                                |
| `data-filter-mobile-collapse`          | none              | The id of the element that get's toggled on mobile                                      |
| `data-filter-scroll-position`          | the results block | The id of the element that is used to scroll to after the new data is loaded            |
| `data-filter-loader`                   | none              | The id of the element that will be shown when the data is loading                       |
| `data-filter-pagination`               | none              | The id of the element that contains the paging                                          |
| `data-filter-clear`                    | none              | An array of id's separated by a comma of buttons that clear all filters                 |
| `data-filter-scroll-on-new-results`    | true              | When true the page will scroll to the top of the position element                       |
| `data-filter-disable-scroll-on-mobile` | true              | When true the page will scroll also to the top of the position element on mobile        |
| `data-filter-mobile-breakpoint`        | 819               | This is the breakpoint to sho or hide the mobile collapse element                       |
| `data-filter-scroll-speed`             | 500               | The speed in ms for the scroll animation                                                |
