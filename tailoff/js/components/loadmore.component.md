# LoadMoreComponent documentation

## List of classes used to rig the plugin:

- **.js-pagination-container** / _required_
- **.js-pagination** / _required_
- **.js-load-more** / _required_

## Example template

```twig
<div>
    <div class="js-pagination-container">
        {% for item in items %}
            {% include '_snippet/_item/_entry' %}
        {% endfor %}
    </div>                                                                                                                                                                                                                                                          {%
    <div class="js-pagination">
        {% if pageInfo.nextUrl %}
            <a href="{{pageInfo.nextUrl}}" class="btn js-load-more">
                Load more
            </a>
        {% endif %}
    </div>
</div>
```

## Example wen you have more than one 'load more' on a page

If you have more than one load more on a page you can add the "data-load-wrapper" attribute to the trigger.

```twig
<div id="aWrapperID">
    <div class="js-pagination-container">
        {% for item in items %}
            {% include '_snippet/_item/_entry' %}
        {% endfor %}
    </div>                                                                                                                                                                                                                                                          {%
    <div class="js-pagination">
        {% if pageInfo.nextUrl %}
            <a href="{{pageInfo.nextUrl}}" class="btn js-load-more" data-load-wrapper="aWrapperID">
                Load more
            </a>
        {% endif %}
    </div>
</div>
```
