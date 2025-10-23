# Custom Twig Extensions

This project includes six custom Twig extensions that add functionality for common tasks like rendering icons, handling pagination, hyphenating text, and validating user input.

## Available Extensions

### Functions

- **[icon](./icon-extension)**: Render SVG icons from files or Asset elements
- **[render_hyper_links](./hyper-extension)**: Render Hyper field links with customizable styling
- **[render_pagination](./paginate-extension)**: Generate pagination UI from Craft's paginate variable
- **[shouldPageBeIndexed](./statik-extension#shouldpagebeindexed)**: Determine if a page should be indexed by search engines

### Filters

- **[hyphenate](./hyphenate-extension)**: Add soft hyphens to text for better text wrapping
- **[slugify](./statik-extension#slugify)**: Convert text to URL-friendly slugs

### Tests

- **[valid_id](./validate-input-extension#valid-id-test)**: Validate numeric IDs or arrays of IDs
- **[valid_query](./validate-input-extension#valid-query-test)**: Validate query strings contain only safe characters

### Globals

- **[isBot](./statik-extension#isbot-global)**: Detect if current visitor is a crawler/bot

## Quick Examples

### Rendering an Icon

```twig
{# Simple icon from filename #}
{{ icon('play-arrow') }}

{# Icon with custom classes #}
{{ icon('search', { class: 'w-6 h-6 text-primary' }) }}

{# Icon from Asset #}
{{ icon(entry.iconAsset, { class: 'icon-large' }) }}
```

### Rendering Hyper Links (CTAs)

```twig
{# Basic CTA rendering #}
{{ render_hyper_links(entry.ctaField) }}

{# With custom classes #}
{{ render_hyper_links(entry.ctaField, {
  linkClass: 'btn btn-primary',
  divWrapper: true,
  divClass: 'cta-wrapper'
}) }}
```

### Pagination

```twig
{% paginate craft.entries.section('blog').limit(10) as pageInfo, entries %}

{# Render pagination #}
{{ render_pagination(pageInfo) }}

{# With custom options #}
{{ render_pagination(pageInfo, { pageRange: 2 }) }}
```

### Text Hyphenation

```twig
{# Add soft hyphens for better text wrapping #}
<p>{{ entry.longWord|hyphenate }}</p>

{# Custom minimum word length #}
<p>{{ entry.text|hyphenate({ wordLength: 8 }) }}</p>
```

### Input Validation

```twig
{# Validate ID parameter #}
{% if craft.app.request.getQueryParam('id') is valid_id %}
  {% set entry = craft.entries.id(craft.app.request.getQueryParam('id')).one() %}
{% endif %}

{# Validate search query #}
{% set searchQuery = craft.app.request.getQueryParam('q') %}
{% if searchQuery is valid_query %}
  {% set results = craft.entries.search(searchQuery).all() %}
{% endif %}
```

### SEO Control

```twig
{# Check if page should be indexed #}
{% set shouldIndex = shouldPageBeIndexed(url, entry) %}
{% if not shouldIndex %}
  <meta name="robots" content="noindex, nofollow">
{% endif %}
```

### Bot Detection

```twig
{# Conditional content for bots #}
{% if isBot %}
  {# Simplified content for crawlers #}
  <div>{{ entry.summary }}</div>
{% else %}
  {# Full interactive content for users #}
  {{ entry.richContent }}
{% endif %}
```

## Extension Details

For detailed documentation on each extension, see the individual pages:

- [Icon Extension](./icon-extension) - SVG icon rendering
- [Hyper Extension](./hyper-extension) - Hyper field CTA rendering
- [Hyphenate Extension](./hyphenate-extension) - Text hyphenation
- [Paginate Extension](./paginate-extension) - Pagination UI
- [Statik Extension](./statik-extension) - SEO, bot detection, and slugification
- [Validate Input Extension](./validate-input-extension) - User input validation
