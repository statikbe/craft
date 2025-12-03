# Hyper Extension

A Twig function for rendering Verbb Hyper field links (CTAs) with customizable styling, wrapper elements, and consistent markup using a shared template.

## Features

- ✅ **Hyper Field Support**: Renders Verbb Hyper LinkCollection objects
- ✅ **Custom Link Classes**: Add extra classes to individual links
- ✅ **Wrapper Options**: Optionally wrap links in `<div>` elements
- ✅ **Template-Based**: Uses a shared Twig template for consistent markup
- ✅ **Layout Classes**: Respects Hyper field's layout classes
- ✅ **Flexible Options**: Pass custom options to the render template

## Function Signature

```twig
render_hyper_links(cta, options)
```

### Parameters

| Parameter | Type             | Description                       |
| --------- | ---------------- | --------------------------------- |
| `cta`     | `LinkCollection` | Hyper field LinkCollection object |
| `options` | `array`          | Optional rendering configuration  |

### Options

| Option       | Type     | Default | Description                           |
| ------------ | -------- | ------- | ------------------------------------- |
| `linkClass`  | `string` | `''`    | Extra CSS classes to add to each link |
| `divWrapper` | `bool`   | `false` | Wrap each link in a `<div>` element   |
| `divClass`   | `string` | `''`    | CSS classes for the wrapper `<div>`   |

### Returns

`string` - Rendered HTML markup for all links in the collection

## Basic Usage

### Simple CTA Rendering

```twig
{# Render basic CTA links #}
{{ render_hyper_links(entry.ctaField) }}

{# Output (example): #}
<a href="/about" class="btn btn-primary">Learn More</a>
<a href="/contact" class="btn btn-secondary">Contact Us</a>
```

### With Custom Link Classes

```twig
{{ render_hyper_links(entry.ctaField, {
  linkClass: 'btn-large hover:shadow-lg'
}) }}

{# Output: #}
<a href="/about" class="btn btn-primary btn-large hover:shadow-lg">Learn More</a>
```

### With Wrapper Divs

```twig
{{ render_hyper_links(entry.ctaButtons, {
  divWrapper: true,
  divClass: 'cta-item'
}) }}

{# Output: #}
<div class="cta-item">
  <a href="/about" class="btn btn-primary">Learn More</a>
</div>
<div class="cta-item">
  <a href="/contact" class="btn btn-secondary">Contact Us</a>
</div>
```

## Implementation Details

### Template Rendering

The function renders each link using the shared template at `_site/_snippet/_global/_hyperCta`:

```php
foreach ($cta as $link) {
    $defaultLinkClass = $link->ctaFieldLinkLayouts ?? '';

    $html .= Craft::$app->view->renderTemplate(
        '_site/_snippet/_global/_hyperCta',
        [
            'cta' => $link,
            'classes' => trim($defaultLinkClass . ' ' . $extraLinkClass),
            'options' => $options,
        ],
        View::TEMPLATE_MODE_SITE
    );
}
```

### Class Merging

The function merges two types of classes:

1. **Default Link Classes**: From Hyper field's `ctaFieldLinkLayouts` (configured in Hyper field settings)
2. **Extra Link Classes**: From the `linkClass` option

```php
$defaultLinkClass = $link->ctaFieldLinkLayouts ?? '';
$extraLinkClass = $options['linkClass'] ?? '';
$classes = trim($defaultLinkClass . ' ' . $extraLinkClass);
```

### Shared Template Structure

Create the shared template at `templates/_site/_snippet/_global/_hyperCta.twig`:

```twig
{# templates/_site/_snippet/_global/_hyperCta.twig #}

{% if options.divWrapper ?? false %}
  <div class="{{ options.divClass ?? '' }}">
{% endif %}

<a href="{{ cta.url }}" class="{{ classes }}"
   {% if cta.target %}target="{{ cta.target }}"{% endif %}
   {% if cta.newWindow %}rel="noopener noreferrer"{% endif %}
   {% if cta.ariaLabel %}aria-label="{{ cta.ariaLabel }}"{% endif %}>

  {% if cta.icon %}
    {{ icon(cta.icon, { class: 'inline-block mr-2' }) }}
  {% endif %}

  {{ cta.text }}

  {% if cta.customField %}
    <span class="custom-field">{{ cta.customField }}</span>
  {% endif %}
</a>

{% if options.divWrapper ?? false %}
  </div>
{% endif %}
```

## Accessibility

### Link Text

Ensure all links have meaningful text:

```twig
{# Good #}
<a href="/about">Learn more about our company</a>

{# Avoid #}
<a href="/about">Click here</a>
```

## Resources

- [Verbb Hyper Documentation](https://verbb.io/craft-plugins/hyper/docs)
- [Craft Twig Template Mode](https://craftcms.com/docs/4.x/dev/twig-primer.html#template-modes)
- [Accessible Link Patterns](https://www.w3.org/WAI/WCAG21/Techniques/general/G201)
