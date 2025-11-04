# Hyphenate Extension

A Twig filter that adds soft hyphens (`&shy;`) to text for improved typography and text wrapping, especially useful for long words in narrow containers.

## Features

- ✅ **Automatic Hyphenation**: Adds soft hyphens based on language rules
- ✅ **Multi-Language Support**: Works with English, Dutch, French, German, and more
- ✅ **Customizable Word Length**: Set minimum word length threshold
- ✅ **HTML-Aware**: Preserves HTML tags while hyphenating text
- ✅ **Cached Results**: Caches hyphenated text for performance
- ✅ **Safe Output**: Returns properly escaped Markup

## Filter Signature

```twig
text|hyphenate(attributes)
```

### Parameters

| Parameter    | Type            | Description                        |
| ------------ | --------------- | ---------------------------------- |
| `source`     | `string\|Asset` | Text content or Asset to hyphenate |
| `attributes` | `array`         | Optional configuration             |

### Attributes

| Attribute    | Type  | Default | Description                      |
| ------------ | ----- | ------- | -------------------------------- |
| `wordLength` | `int` | `12`    | Minimum word length to hyphenate |

### Returns

`Markup` - Safe HTML with soft hyphens inserted

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

### With Asset Content

```twig
{% set textAsset = entry.documentAsset.one() %}
<div>{{ textAsset|hyphenate }}</div>
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

Results are cached to improve performance:

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

The filter respects Craft's current language:

```twig
{# Will use Dutch hyphenation patterns #}
{% do craft.app.language = 'nl-BE' %}
{{ entry.content|hyphenate }}

{# Will use French hyphenation patterns #}
{% do craft.app.language = 'fr-BE' %}
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

### Screen Reader Considerations

Soft hyphens are generally invisible to screen readers and won't disrupt reading flow. The text "ex&shy;traor&shy;di&shy;nar&shy;ily" will be read as "extraordinarily".

### Language Attributes

Ensure proper `lang` attribute for correct hyphenation:

```twig
<html lang="{{ currentSite.language }}">
  <body>
    {{ entry.content|hyphenate }}
  </body>
</html>
```

### Override for Specific Content

```twig
<div lang="en-US">
  {{ englishContent|hyphenate }}
</div>

<div lang="nl-BE">
  {{ dutchContent|hyphenate }}
</div>
```

## Resources

- [Vanderlee Syllable Library](https://github.com/vanderlee/phpSyllable)
- [CSS hyphens Property](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens)
- [Soft Hyphen Character](https://en.wikipedia.org/wiki/Soft_hyphen)
- [Typography Best Practices](https://practicaltypography.com/hyphenation.html)
- [TeX Hyphenation Algorithm](https://tug.org/docs/liang/)
