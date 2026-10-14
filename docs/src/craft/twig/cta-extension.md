# CTA Extension

A Twig function that renders the CTA links of a field with their link style, wrapper and markup from one shared template.

## The CTA field

A CTA field is a Matrix field with "Link" entries: `cta` ("Link") for one link, `ctas` ("Links") for more. Each entry has:

- a **Link** field (`linkField`, Craft's native Link field): the URL, entry, asset … and its label, target, URL suffix
- a **Link Style** field (`ctaFieldLinkLayouts`): the classes of the link, from the "CTA styles" in `config/cta.php`

With the [Entry Anchors](https://github.com/statikbe/craft-entry-anchors) plugin, the Link field can link to an anchor on another
entry or on the same page.

## Function Signature

```twig
render_ctas(ctas, options)
```

### Parameters

| Parameter | Type                                    | Description                      |
| --------- | --------------------------------------- | -------------------------------- |
| `ctas`    | Matrix field (query/collection) or link | The CTA field                    |
| `options` | `array`                                 | Optional rendering configuration |

`ctas` can be:

- a CTA field: a Matrix of Link entries (`entry.ctas`, an entry query or an eager-loaded collection)
- a single Link field value (`entry.someLink`), rendered without a link style

Links without a URL are skipped.

### Options

| Option         | Type     | Default                   | Description                                     |
| -------------- | -------- | ------------------------- | ----------------------------------------------- |
| `linkClass`    | `string` | `''`                      | Extra CSS classes for each link                 |
| `divWrapper`   | `bool`   | `false`                   | Wrap each link in a `<div>`                     |
| `divClass`     | `string` | `'inline-block mt-4 mr-4'` | CSS classes for the wrapper `<div>`             |
| `showContrast` | `bool`   | `false`                   | Add the `inverse` class, for a dark background |

### Returns

The HTML of all links. It is marked as safe, so `|raw` isn't needed.

## Usage

```twig
{{ render_ctas(entry.ctas) }}

{# Output (example): #}
<a class="btn btn--primary" href="https://example.com/about">Learn more</a>
<a class="link link--ext" href="https://example.com/contact#opening-hours">Opening hours</a>
```

### With extra classes and wrappers

```twig
{{ render_ctas(block.ctas, {
  linkClass: 'mt-2',
  divWrapper: true,
  divClass: 'cta-item',
}) }}
```

### On a dark background

```twig
{{ render_ctas(block.ctas, { showContrast: true }) }}
```

## Shared template

Every link is rendered with `templates/_site/_snippet/_global/_cta.twig`, with these variables:

- `link`: the Link field value (`craft\fields\data\LinkData`)
- `classes`: the link style + `linkClass` (+ `inverse` with `showContrast`)
- `options`: the options passed to `render_ctas()`

The template uses the Link field's own attributes (`href` with the URL suffix, `target`, `title`, `aria-label` …) and adds the
classes. The text is the link's label, or its URL when there is none.

## Accessibility

Give links meaningful text, and an ARIA label when the text alone doesn't say where the link goes:

```twig
{# Good #}
<a href="/about">Learn more about our company</a>

{# Avoid #}
<a href="/about">Click here</a>
```

## Resources

- [Craft Link field](https://craftcms.com/docs/5.x/reference/field-types/link.html)
- [Accessible Link Patterns](https://www.w3.org/WAI/WCAG21/Techniques/general/G201)
