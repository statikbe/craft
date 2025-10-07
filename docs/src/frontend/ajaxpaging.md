# Ajax Paging

When you have only one component with paging on the page, you don't need this plugin, you can simply reload the page for pagination. However, when you have more than one component with paging on a single page, you will need the Ajax Paging plugin to handle multiple paginated components without full page reloads.

## Example

<iframe src="../examples/ajaxpaging_page1.html" height="800" title="Ajax Paging Example"></iframe>
<p class="iframe-caption">This example demonstrates how Ajax Paging works with multiple components on a single page.</p>

### Code example

```twig
{% set news1 = craft.entries.section('news').orderBy('postDate DESC') %}
{% paginate news1.limit(3) as pageInfoNews, news1 %}
<div class="section section--default">
    <div class="container" data-ajax-paging id="news1">
        <h2>News 1</h2>
        <div class="hidden" data-ajax-paging-loader tabindex="-1">
            <div class="flex justify-center py-20">
                {% include '_site/_snippet/_item/_loader' %}
            </div>
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3" data-ajax-paging-content>
            {% for cardEntry in news1 %}
                {% include '_site/_snippet/_item/_card' %}
            {% endfor %}
        </div>
        <div class="flex justify-center mt-10" data-ajax-paging-links>
            {{ render_pagination(pageInfoNews) | raw }}
        </div>
    </div>
</div>

{% set news2 = craft.entries.section('news').orderBy('postDate DESC') %}
{% paginate news2.limit(2) as pageInfoNews2, news2 %}
<div class="section section--default">
    <div class="container" data-ajax-paging id="news2">
        <h2>News 2</h2>
        <div class="hidden" data-ajax-paging-loader tabindex="-1">
            <div class="flex justify-center py-20">
                {% include '_site/_snippet/_item/_loader' %}
            </div>
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2" data-ajax-paging-content>
            {% for cardEntry in news2 %}
                {% include '_site/_snippet/_item/_card' %}
            {% endfor %}
        </div>
        <div class="flex justify-center mt-10" data-ajax-paging-links>
            {{ render_pagination(pageInfoNews2) | raw }}
        </div>
    </div>
</div>
```

## Attributes

The following attributes are required for the ajax paging component to function correctly. Below is a table describing each attribute.

| Attribute                  | Description                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `data-ajax-paging`         | This is the wrapper element. The `id` attribute must be unique for each paging instance to avoid conflicts |
| `data-ajax-paging-loader`  | This is an element that will be shown when loading                                                         |
| `data-ajax-paging-content` | This is the content that needs to be changed                                                               |
| `data-ajax-paging-links`   | This element contains the pagination links                                                                 |
