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
    </div>                                                                                                                                                                                                                                                          {% endif %} #}
    <div class="js-pagination">
        {% if pageInfo.nextUrl %}
            <a href="{{pageInfo.nextUrl}}" class="btn js-load-more">
                Load more
            </a>
        {% endif %}
    </div>
</div>
```
