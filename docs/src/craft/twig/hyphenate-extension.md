# Hyphenate Extension

A Twig filter that adds soft hyphens (`&shy;`) to text for improved typography and text wrapping, especially useful for long words in narrow containers.

## Features

- ✅ **Automatic Hyphenation**: Adds soft hyphens based on language rules
- ✅ **Multi-Language Support**: Works with English, Dutch, French, German, and more
- ✅ **Customizable Word Length**: Set minimum word length threshold
- ✅ **HTML-Aware**: Preserves HTML tags while hyphenating text
- ✅ **Cached Results**: Caches hyphenated text for performance
- ⚠️ **Not escaped**: Returns `Markup`, so Twig doesn't escape the result: only use it on trusted text (entry content), never on user input

## Filter Signature

```twig
text|hyphenate(attributes)
```

### Parameters

| Parameter    | Type            | Description                        |
| ------------ | --------------- | ---------------------------------- |
| `source`     | `string\|Asset` | Text (may contain HTML) or an Asset: an Asset is hyphenated as its title |
| `attributes` | `array`         | Optional configuration             |

### Attributes

| Attribute    | Type  | Default | Description                      |
| ------------ | ----- | ------- | -------------------------------- |
| `wordLength` | `int` | `12`    | Minimum word length to hyphenate |

### Returns

`Markup`: the HTML with soft hyphens inserted, not escaped.

## How It Works

Soft hyphens (`&shy;` or U+00AD) are invisible characters that indicate where a word can break if needed for line wrapping. Browsers only show the hyphen when the word breaks across lines.

```
Without hyphenation:
┌──────────────┐
│ This is an   │
│ extraordinarily │  ← Word extends beyond container
└──────────────┘

With hyphenation:
┌──────────────┐
│ This is an   │
│ extraordi-   │  ← Word breaks with visible hyphen
│ narily       │
└──────────────┘
```

## ⚠️ Warning

Soft hyphens are read by certain screenreaders. This results in poor accessibility. So use this feature wisely. If you do use it, consider adding an `aria-label` attribute with the text without the hyphens to the element. See example below.

```HTML
  <h2 aria-label="toegankelijkheidsonderzoek">
    toegankelijk&shy;heidsonder&shy;zoek
  </h2>
```

## Basic Usage

### Simple Text Hyphenation

```twig
{# Hyphenate long words #}
<p>{{ "This is an extraordinarily long word in a sentence."|hyphenate }}</p>

{# Output: #}
<p>This is an ex&shy;traor&shy;di&shy;nar&shy;ily long word in a sen&shy;tence.</p>
```

### Custom Word Length

```twig
{# Only hyphenate words longer than 8 characters #}
<p>{{ entry.bodyText|hyphenate({ wordLength: 8 }) }}</p>
```

### An asset's title

An Asset is turned into a string first: its title (or its URL when a transform is set on it). The file's content isn't read.

```twig
{% set document = entry.documentAsset.one() %}
<a href="{{ document.url }}">{{ document|hyphenate }}</a>
```

## Common Patterns

### Article Body Text

```twig
<article class="prose">
  <h1>{{ entry.title }}</h1>
  <div class="article-content">
    {{ entry.body|hyphenate }}
  </div>
</article>
```

### Narrow Columns

```twig
<div class="grid grid-cols-3 gap-4">
  {% for item in entries %}
    <div class="narrow-column">
      <h3>{{ item.title|hyphenate({ wordLength: 10 }) }}</h3>
      <p>{{ item.summary|hyphenate }}</p>
    </div>
  {% endfor %}
</div>
```

### Mobile-Optimized Text

```twig
{# More aggressive hyphenation for mobile #}
<div class="md:hidden">
  {{ entry.content|hyphenate({ wordLength: 8 }) }}
</div>

{# Less aggressive for desktop #}
<div class="hidden md:block">
  {{ entry.content|hyphenate({ wordLength: 14 }) }}
</div>
```

### Sidebar Content

```twig
<aside class="sidebar w-64">
  <h2>{{ sidebarTitle|hyphenate }}</h2>
  <div class="sidebar-content">
    {{ sidebarText|hyphenate({ wordLength: 10 }) }}
  </div>
</aside>
```

### Combined with Other Filters

```twig
{# Markdown with hyphenation #}
{{ entry.markdownContent|markdown|hyphenate }}

{# Truncated and hyphenated #}
{{ entry.longText|striptags|slice(0, 200)|hyphenate }}
```

## Implementation Details

### Language Detection

The filter automatically detects the site language and applies appropriate hyphenation rules:

```php
$language = strtolower(explode('-', Craft::$app->language)[0]);
$language = $language === 'en' ? 'en-us' : $language;
$syllable = new Syllable($language);
```

Supported languages include:

- English (en, en-us, en-gb)
- Dutch (nl)
- French (fr)
- German (de)
- And many more via the Syllable library

### Caching

Results are cached to improve performance. The cache key is the text only: the same text with another `wordLength`, or on a
site with another language, returns the cached result of the first call. Clear the data caches after changing `wordLength` for
a text that was already rendered.

```php
$output = Craft::$app->getCache()->getOrSet(
    "hypen-" . base64_encode($source),
    function() use ($source, $minimumWordLength) {
        // Hyphenation logic
    }
);
```

### HTML Ampersand Handling

The filter preserves HTML entities by converting unescaped ampersands:

```php
$source = preg_replace('/&(?!amp)/', '&amp;', $source);
```

### Syllable Library

Uses the [Vanderlee Syllable library](https://github.com/vanderlee/phpSyllable) which:

- Implements TeX hyphenation algorithms
- Supports 70+ languages
- Caches pattern files for performance
- Respects HTML tags

## CSS Integration

### Enable CSS Hyphens

Combine soft hyphens with CSS `hyphens` property:

```css
.hyphenated-text {
  hyphens: auto;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
}
```

### Control Hyphenation

```css
/* Prevent hyphenation */
.no-hyphens {
  hyphens: none;
}

/* Manual hyphenation only (uses &shy;) */
.manual-hyphens {
  hyphens: manual;
}

/* Automatic hyphenation */
.auto-hyphens {
  hyphens: auto;
}
```

### Hyphenation Limits

```css
.controlled-hyphens {
  /* Minimum characters before hyphen */
  hyphenate-limit-before: 3;

  /* Minimum characters after hyphen */
  hyphenate-limit-after: 3;

  /* Maximum consecutive hyphenated lines */
  hyphenate-limit-lines: 2;
}
```

## Language Configuration

### Multi-Language Sites

The filter uses the patterns of Craft's current language (`craft.app.language`): on the Dutch site (`nl-BE`) the `nl`
patterns, on the French site (`fr-BE`) the `fr` patterns, on an English site `en-us`. The HTML `lang` attribute doesn't change
them.

```twig
{# On the nl-BE site: Dutch hyphenation #}
{{ entry.content|hyphenate }}
```

### Language-Specific Settings

```twig
{# English: longer words #}
{% if currentSite.language starts with 'en' %}
  {{ entry.text|hyphenate({ wordLength: 14 }) }}

{# Dutch/German: shorter words (more compound words) #}
{% elseif currentSite.language starts with 'nl' or currentSite.language starts with 'de' %}
  {{ entry.text|hyphenate({ wordLength: 10 }) }}
{% endif %}
```

## Accessibility

### Screen readers

Some screen readers read soft hyphens, splitting the word (see the warning above). Use the filter for long words in
narrow places (headings in cards, narrow columns), not for whole texts, and give a hyphenated heading an `aria-label` with
the word without hyphens.

### Language attributes

Set the page's `lang` attribute to the site's language (`currentSite.language` on the `<html>` tag), so the browser's own
`hyphens: auto` uses the same language. The filter itself always uses Craft's current language.

## Resources

- [Vanderlee Syllable Library](https://github.com/vanderlee/phpSyllable)
- [CSS hyphens Property](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens)
- [Soft Hyphen Character](https://en.wikipedia.org/wiki/Soft_hyphen)
- [Typography Best Practices](https://practicaltypography.com/hyphenation.html)
- [TeX Hyphenation Algorithm](https://tug.org/docs/liang/)
