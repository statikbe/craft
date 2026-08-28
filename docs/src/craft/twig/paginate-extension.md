# Paginate Extension

A Twig function for rendering pagination UI from Craft's paginate variable with customizable styling and options through a shared template.

## Features

- ✅ **Automatic Rendering**: Converts Craft's PageInfo object to HTML
- ✅ **Template-Based**: Uses a shared template for consistent markup
- ✅ **Customizable Options**: Pass custom options to control appearance
- ✅ **Smart Defaults**: Only renders when pagination is needed
- ✅ **Empty State Handling**: Returns empty string if no pagination required
- ✅ **Flexible Styling**: Control appearance through options and CSS

## Function Signature

```twig
render_pagination(pageInfo, options)
```

### Parameters

| Parameter  | Type       | Description                                     |
| ---------- | ---------- | ----------------------------------------------- |
| `pageInfo` | `Paginate` | Craft's pagination object from `{% paginate %}` |
| `options`  | `array`    | Optional configuration for pagination template  |

### Available Options

| Option        | Type     | Default                                                                                                                                               | Description                                  |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `ulClass`     | `string` | `'flex list-reset justify-center mt-8'`                                                                                                               | CSS classes for the `<ul>` pagination list   |
| `liClass`     | `string` | `'pagination__item'`                                                                                                                                  | CSS classes for each `<li>` item             |
| `aClass`      | `string` | `'flex justify-center items-center w-10 h-10 hover:text-secondary hover:bg-primary bg-light mx-1 rounded-full no-underline font-bold text-secondary'` | CSS classes for page number links            |
| `activeClass` | `string` | `'flex justify-center items-center w-10 h-10 mx-1 rounded-full no-underline font-bold text-white bg-primary border-primary'`                          | CSS classes for the active/current page link |
| `prevText`    | `string` | `''` (empty, uses chevron-left icon)                                                                                                                  | Custom text/HTML for the previous link       |
| `nextText`    | `string` | `''` (empty, uses chevron-right icon)                                                                                                                 | Custom text/HTML for the next link           |
| `pageRange`   | `int`    | `3`                                                                                                                                                   | Number of page links to show before/after    |

### Returns

`string` - Rendered HTML markup for pagination, or empty string if not needed

## Basic Usage

### Simple Pagination

```twig
{% paginate craft.entries.section('blog').limit(10) as pageInfo, entries %}

<div class="entries">
  {% for entry in entries %}
    <article>{{ entry.title }}</article>
  {% endfor %}
</div>

{# Render pagination #}
{{ render_pagination(pageInfo) }}
```

### With Custom Options

```twig
{% paginate craft.entries.section('news').limit(20) as pageInfo, entries %}

{# ... render entries ... #}

{{ render_pagination(pageInfo, {
  ulClass: 'flex justify-center gap-2 my-12',
  aClass: 'px-4 py-2 border rounded hover:bg-gray-100',
  activeClass: 'px-4 py-2 bg-blue-600 text-white rounded',
  pageRange: 5
}) }}
```

### Conditional Rendering

```twig
{% paginate craft.entries.section('articles').limit(15) as pageInfo, entries %}

{# ... render entries ... #}

{# Only show if there are multiple pages #}
{% if pageInfo.totalPages > 1 %}
  {{ render_pagination(pageInfo) }}
{% endif %}
```

## Implementation Details

### Shared Template Structure

The function renders the `_site/_snippet/_global/_paginate.twig` template:

```php
return Craft::$app->view->renderTemplate('_site/_snippet/_global/_paginate', [
    'pageInfo' => $pageInfo,
    'options' => $options,
], View::TEMPLATE_MODE_SITE);
```

### Empty State Handling

Returns empty string if no pagination needed:

```php
if (!$pageInfo->total) {
    return '';
}
```

### Actual Shared Template

The template at `templates/_site/_snippet/_global/_paginate.twig` uses these options:

```twig
{% set ulClass = options.ulClass ?? 'flex list-reset justify-center mt-8' %}
{% set liClass = options.liClass ?? 'pagination__item' %}
{% set aClass = options.aClass ?? 'flex justify-center items-center w-10 h-10 hover:text-secondary hover:bg-primary bg-light mx-1 rounded-full no-underline font-bold text-secondary' %}
{% set activeClass = options.activeClass ?? 'flex justify-center items-center w-10 h-10 mx-1 rounded-full no-underline font-bold text-white bg-primary border-primary' %}
{% set prevText = options.prevText ?? '' %}
{% set nextText = options.nextText ?? '' %}
{% set pageRange = options.pageRange ?? '3' %}

{% if pageInfo.totalPages > 1 %}
  <nav aria-label="pagination">
    <ul class="{{ ulClass }}">
      {# Previous page link #}
      {% if pageInfo.prevUrl %}
        <li class="{{ liClass }}">
          <a href="{{ pageInfo.prevUrl }}" class="block px-3 py-2 text-lg pagination__prev text-primary hover:text-black">
            <span class="sr-only">{{ 'Vorige pagina'|t }}</span>
            {% if prevText|length %}
              {{ prevText|raw }}
            {% else %}
              {{ icon('chevron-left') }}
            {% endif %}
          </a>
        </li>
      {% endif %}

      {# First page if far from current #}
      {% if pageInfo.currentPage > pageRange + 1 %}
        <li class="{{ liClass }}">
          <a class="{{ aClass }}" href="{{ pageInfo.firstUrl }}">
            <span class="sr-only">{{ 'pagina'|t }}</span>1
          </a>
        </li>
      {% endif %}

      {# Ellipsis before #}
      {% if pageInfo.currentPage > pageRange + 2 %}
        <li class="{{ liClass }}">
          <span class="block px-3 py-2 pagination__btn non-active">
            <span class="sr-only">{{ 'toon meer pagina\'s voor de huidige'|t }}</span>...
          </span>
        </li>
      {% endif %}

      {# Previous pages #}
      {% for page, url in pageInfo.getPrevUrls(pageRange) %}
        <li class="{{ liClass }}">
          <a class="{{ aClass }}" href="{{ url }}">
            <span class="sr-only">{{ 'pagina'|t }}</span>{{ page }}
          </a>
        </li>
      {% endfor %}

      {# Current page #}
      <li class="{{ liClass }}">
        <a class="{{ activeClass }}" href="javascript:void(0);" aria-current="page">
          <span class="sr-only">{{ 'pagina'|t }}</span>{{ pageInfo.currentPage }}
        </a>
      </li>

      {# Next pages #}
      {% for page, url in pageInfo.getNextUrls(pageRange) %}
        <li class="{{ liClass }}">
          <a class="{{ aClass }}" href="{{ url }}">
            <span class="sr-only">{{ 'pagina'|t }}</span>{{ page }}
          </a>
        </li>
      {% endfor %}

      {# Ellipsis after #}
      {% if pageInfo.currentPage < pageInfo.totalPages-(pageRange + 1) %}
        <li class="{{ liClass }}">
          <span class="block px-3 py-2 pagination__btn non-active">
            <span class="sr-only">{{ 'toon meer pagina\'s na de huidige'|t }}</span>...
          </span>
        </li>
      {% endif %}

      {# Last page if far from current #}
      {% if pageInfo.currentPage < pageInfo.totalPages-pageRange %}
        <li class="{{ liClass }}">
          <a class="{{ aClass }}" href="{{ pageInfo.lastUrl }}">
            <span class="sr-only">{{ 'totaal aantal pagina\'s: '|t }}</span>{{ pageInfo.totalPages }}
          </a>
        </li>
      {% endif %}

      {# Next page link #}
      {% if pageInfo.nextUrl %}
        <li class="{{ liClass }}">
          <a href="{{ pageInfo.nextUrl }}" class="block px-3 py-2 text-lg pagination__next text-primary hover:text-black">
            <span class="sr-only">{{ 'Volgende pagina'|t }}</span>
            {% if nextText|length %}
              {{ nextText|raw }}
            {% else %}
              {{ icon('chevron-right') }}
            {% endif %}
          </a>
        </li>
      {% endif %}
    </ul>
  </nav>
{% endif %}
```

## PageInfo Object Properties

The `pageInfo` object provides useful pagination data:

| Property      | Type           | Description                                  |
| ------------- | -------------- | -------------------------------------------- |
| `currentPage` | `int`          | Current page number (1-indexed)              |
| `totalPages`  | `int`          | Total number of pages                        |
| `total`       | `int`          | Total number of items                        |
| `first`       | `int`          | Index of first item on current page          |
| `last`        | `int`          | Index of last item on current page           |
| `prevUrl`     | `string\|null` | URL to previous page (null if on first page) |
| `nextUrl`     | `string\|null` | URL to next page (null if on last page)      |

### Using PageInfo Data

```twig
<div class="pagination-info">
  Showing {{ pageInfo.first }} - {{ pageInfo.last }} of {{ pageInfo.total }} results
  (Page {{ pageInfo.currentPage }} of {{ pageInfo.totalPages }})
</div>
```

## Resources

- [Craft Pagination Documentation](https://craftcms.com/docs/4.x/dev/tags.html#paginate)
- [Accessible Pagination](https://www.a11ymatters.com/pattern/pagination/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/patterns/pagination/)
