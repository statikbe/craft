# FilterComponent documentation

## Options

```js
options = {
  scrollToTopOfResults: false, // Makes the page scroll to the top of the results after loading new data
  disableScrollOnMobile: true // Disables the option 'scrollToTopOfResults' on mobile
};
```

## List of classes used to rig the plugin:

- **.js-filter-form** / _required_
- **.js-filter-loader** / _optional_
- **.js-filter-aria-live** / _required_
- **.js-filter-results** / _required_
- **.js-filter-mobile-toggle** / _optional_
- **.js-filter-mobile-collapse** / _optional_ (required when .js-filter-mobile-toggle is used)
- **.js-filter-clear** / _optional_
- **.js-filter-scroll-position** / _optional_
- **.js-filter-show-more** / _optional_
- **.js-filter-extra-content** / _optional_ (required when .js-filter-show-more is used)
- **.js-filter-pagination** / _optional_

## Example template

This is a bare bone example for the use of the classes and options

```twig
{% set totalEntries = entries|length %}

{# Filter #}
<div>
    <div class="md:hidden">
        <a href="#" class="js-filter-mobile-toggle"> {# This element will get the class 'open' when the filter is open #}
            {{ 'Filter results'|t }} <span class="icon icon--arrow-down" aria-hidden="true"></span>
		</a>
    </div>
    <div class="js-filter-mobile-collapse">
        <form action="" class="js-filter-form">
            {% set categories = craft.categories().group('default') %}
            {% if categories|length %}
                <div>
                    <h4>{{ "Categories"|t }}</h4>
                    <div>
                        {% for category in categories|slice(0,3) %}
                            <div>
                                <input type="checkbox" id="{{ category.id }}" name="category[]" value="{{ category.id }}" {% if category.id in catQuery %} checked {% endif %}/>
                                <label for="{{ category.id }}">{{ category.title }}</label>
                            </div>
                        {% endfor %}
                        {% if categories|length > 3 %}
                            <div class="js-filter-show-more"> {# This needs to be on the same lavel as the .js-filter-extra-content elements #}
                                <a href="#">{{"Toon meer"|t}}</a>
                            </div>
                            {% for category in categories|slice(3,categories|length - 3) %}
                                <div class="js-filter-extra-content">
                                    <input type="checkbox" id="{{ category.id }}" name="category[]" value="{{ category.id }}" {% if category.id in catQuery %} checked {% endif %}/>
                                    <labelfor="{{ category.id }}">{{ category.title }}</label>
                                </div>
                            {% endfor %}
                        {% endif %}
                    </div>
                </div>
            {% endif %}
            <button type="submit" class="btn">Submit</button>
        </form>

        <div>
            <a href="#" class="js-filter-clear">Clear filter</a> {# this one can be put wherever you want #}
        </div>
    </div>
</div>

{# Results #}
<div class="js-scroll-results">
    <div class="hidden js-filter-loader">
        ...Loading
    </div>
    <div aria-live="polite" class="sr-only js-filter-aria-live">
        <span>A total of {{totalEntries}} items found.</span>
        {% if pageInfo.totalPages > 1 %}
        <span>Showing {{items|length}} items on page {{pageInfo.currentPage}} of {{pageInfo.totalPages}}</span>
        {% endif %}
    </div>
    <div class="js-filter-results">
        <div>
            {% for item in items %}
                {% include '_snippet/_item/_entry' %}
            {% else %}
                <div>
                    {{ "Geen items gevonden"|t }}
                </div>
            {% endfor %}
        </div>
        {% if pageInfo.totalPages > 1 %}
            <div js-filter-pagination">
                {{ craft.statik.paginate(pageInfo, {
                pageRange: 2,
                prevText: '«',
                nextText: '»'
                }) }}
            </div>
        {% endif %}
    </div>
</div>
```
