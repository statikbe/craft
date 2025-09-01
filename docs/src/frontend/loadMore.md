# Load more

This component replaces conventional paging with the ability to load extra data page per page onto the same page.
This component also has an option for an infinite scroll.

## Example

<iframe src="../examples/loadmore_page1.html" height="800"></iframe>

## Code example without infinite load

```HTML
<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3"
    data-load-more="newsCards"
    data-load-more-pagination="pagination"
    data-load-more-loader="paginationLoader"
    data-load-more-trigger="loadMoreTrigger"
    data-load-more-infinite-scroll="false">
    {% for cardEntry in load1Entries %}
        {% include '_site/_snippet/_item/_card' %}
    {% endfor %}
</div>
<div class="flex justify-center mt-8" id="pagination">
    <div class="hidden" id="paginationLoader">
        {% include '_site/_snippet/_item/_loader' %}
        <div class="mt-2 italic opacity-50">{{ "Meer nieuws aan het laden"|t }}</div>
    </div>
    {% if load1PageInfo.nextUrl %}
        <a href="{{ load1PageInfo.nextUrl }}" class="btn btn--ghost" id="loadMoreTrigger">{{ "Bekijk meer nieuws"|t }}</a>
    {% endif %}
</div>
```

## Code example with infinite load

```HTML
<div class=""
    data-load-more="newsCardsInfinite"
    data-load-more-pagination="paginationInfinite"
    data-load-more-loader="paginationLoaderInfinite"
    data-load-more-trigger="loadMoreTriggerInfinite"
    data-load-more-infinite-scroll="true">
    {% for cardEntry in load2Entries %}
        {% include '_site/_snippet/_item/_card' %}
    {% endfor %}
</div>
<div class="flex justify-center mt-8" id="paginationInfinite">
    <div class="hidden" id="paginationLoaderInfinite">
        {% include '_site/_snippet/_item/_loader' %}
        <div class="mt-2 italic opacity-50">{{ "Meer nieuws aan het laden"|t }}</div>
    </div>
    {% if load2PageInfo.nextUrl %}
        <a href="{{ load2PageInfo.nextUrl }}" class="btn btn--ghost" id="loadMoreTriggerInfinite">{{ "Bekijk meer nieuws"|t }}</a>
    {% endif %}
</div>
```

## Attributes

Below is a table describing the attributes you can use with the load more component.

| Attribute                        | Description                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `data-load-more`                 | This is the wrapper element of the items. The value must be unique within the page. |
| `data-load-more-pagination`      | This is the paging element                                                          |
| `data-load-more-loader`          | This is the loader that will be shown while loading new elements.                   |
| `data-load-more-trigger`         | This element is the link to the next page                                           |
| `data-load-more-infinite-scroll` | When set to true the paging will happen automatically                               |
