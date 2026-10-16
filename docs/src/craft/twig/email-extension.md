# Email Extension

A Twig filter that hides email addresses from harvesters that don't run JavaScript. It replaces the `enkode_emails` filter of
the Obfuscator plugin: no inline scripts and no `eval()`, so it works with a strict Content Security Policy.

## Usage

```twig
{% apply obfuscate_emails %}
    <p>Mail <a href="mailto:info@statik.be?subject=Hello">info@statik.be</a> or hello@statik.be.</p>
{% endapply %}
```

Output (before JavaScript runs):

```html
<p>Mail <a data-mailto="…"><span data-email="…">info [at] statik [dot] be</span></a>
or <a data-mailto="…"><span data-email="…">hello [at] statik [dot] be</span></a>.</p>
```

The values are base64 of the reversed text. `frontend/js/components-core/email.component.ts` (selector
`[data-mailto], [data-email]`) puts back the `mailto:` href and the address, also in content that's loaded later.

## What it changes

| In the HTML                     | Becomes                                                                     |
| ------------------------------- | --------------------------------------------------------------------------- |
| `<a href="mailto:…">`           | `<a data-mailto="…">` (query parameters like `?subject=` are kept)          |
| An address in a link's text     | `<span data-email="…">info [at] statik [dot] be</span>`                    |
| An address in text, not in a link | A mailto link with that span                                              |

Left alone: addresses in other attributes (`value`, `placeholder`, `title`, data attributes) and in `script`, `style`,
`textarea`, `title`, `noscript` and `template`. Applying the filter twice changes nothing.

## Without JavaScript

Readers see the address as `info [at] statik [dot] be`, without a link.

## Source

`modules/statik/src/web/twig/EmailExtension.php`
