# Phone Extension

A Twig filter that turns a phone number as an editor typed it into one consistent form, with
[libphonenumber](https://github.com/giggsey/libphonenumber-for-php). Use it for `tel:` links, which don't allow spaces.

## Usage

```twig
<a href="tel:{{ siteSettings.phone|tel }}">{{ siteSettings.phone|tel('display') }}</a>
```

```twig
{{ phone|tel(format = 'link', region = null) }}
```

| Format               | Result for `016 67 19 01` |
| -------------------- | ------------------------- |
| `'link'` (default)   | `+3216671901` (E.164)     |
| `'display'`          | `+32 16 67 19 01`         |
| `'national'`         | `016 67 19 01`            |

`+32 16 67 19 01`, `+32 (0)16 67 19 01`, `0032 16 67 19 01` and `(016) 67.19.01` give the same results.

`'display'` and `'national'` put non-breaking spaces (U+00A0, `&nbsp;`) between the groups: the number doesn't wrap over two
lines, and HTML and accessibility validators flag phone numbers with regular spaces. Use them for the text of the link.

## Region

A number without a country code is read as a number of the current site's country: the region of the site's language
(`nl-BE` → `BE`), or `BE` when the language has none. Pass another region as the second argument:
`phone|tel('link', 'NL')`.

## Numbers it can't read

Short numbers (`112`) and other text libphonenumber can't read: `'link'` keeps only the digits and a leading `+` (and drops a
`(0)`); `'display'` and `'national'` return the text as typed, with non-breaking spaces.

## Source

`modules/statik/src/web/twig/PhoneExtension.php`
