# Quick reference

The Statik module (`modules/statik/src/web/twig/`) adds these functions, filters, tests and globals to Twig. Each links to its
page.

## Functions

| Function | Returns | Description |
| -------- | ------- | ----------- |
| [`icon(source, attributes)`](./icon-extension) | HTML | An SVG icon from `frontend/icons/` (by name) or an asset, with `aria-hidden` and the `icon` class |
| [`render_image(image, options)`](./image-extension#render-image) | HTML | A responsive `<picture>` with AVIF, srcset, sizes and a blurred preview |
| [`preload_image_transforms(image, options)`](./image-extension#preload-image-transforms) | nothing | Loads the transforms of a set of images in one query (`render_image()` calls it) |
| [`render_ctas(ctas, options)`](./cta-extension) | HTML | The links of a CTA field (Matrix of Link entries, or one Link field) with their link style |
| [`render_pagination(pageInfo, options)`](./paginate-extension) | HTML as a string: print with `\|raw` | The pagination of a `{% paginate %}` |
| [`shouldPageBeIndexed(url, entry)`](./statik-extension#shouldpagebeindexed) | `bool` | `false` for system and account pages and for Statik testing domains |
| [`unique_id(id)`](./statik-extension#unique-id) | `string` | The id the first time, with `-2`, `-3` … after that |

## Filters

| Filter | Returns | Description |
| ------ | ------- | ----------- |
| [`text\|hyphenate(attributes)`](./hyphenate-extension) | HTML | Soft hyphens in long words, in the site's language |
| [`html\|obfuscate_emails`](./email-extension) | HTML | Hides email addresses from harvesters (`{% apply obfuscate_emails %}`) |
| [`number\|tel(format, region)`](./phone-extension) | `string` | A phone number for a `tel:` link, or for display |
| [`text\|slugify`](./statik-extension#slugify) | `string` | A URL-friendly slug, with Craft's slug settings |

## Tests

| Test | Description |
| ---- | ----------- |
| [`value is valid_id`](./validate-input-extension#valid-id-test) | A numeric id, or an array of them: for ids from the query string |
| [`value is valid_query`](./validate-input-extension#valid-query-test) | Letters of any language, digits and common punctuation, no markup or code characters: for search input |

## Globals

| Global | Description |
| ------ | ----------- |
| [`isBot`](./statik-extension#isbot) | Whether the visitor is a crawler (CrawlerDetect) |

## craft.statik

The module's Twig variable: `upcomingEventDates()`, `upcomingEvents()`, `isUpcomingEvent()` and `nextEventDate()` for the
calendar, and helpers for the content builder showcase. See [craft.statik variable](./statik-variable).

## Quick examples

```twig
{# An icon with classes #}
{{ icon('search', { class: 'text-primary text-3xl' }) }}

{# A responsive image in a content builder column #}
{{ render_image(image, { sizes: column.sizes, srcsetSizes: column.srcsetSizes }) }}

{# The links of a block, on a dark background #}
{{ render_ctas(block.ctas, { showContrast: true }) }}

{# Pagination #}
{% paginate craft.entries.section('news').limit(9) as pageInfo, entries %}
{{ render_pagination(pageInfo)|raw }}

{# A phone number #}
<a href="tel:{{ siteSettings.phone|tel }}">{{ siteSettings.phone|tel('display') }}</a>

{# Search input from the query string #}
{% set q = craft.app.request.getQueryParam('q') %}
{% set q = q is valid_query ? q : '' %}
```

## Source

`modules/statik/src/web/twig/`, registered in `modules/statik/src/Statik.php`.
