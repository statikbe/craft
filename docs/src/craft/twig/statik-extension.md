# Statik Extension

A collection of Twig functions, filters, and globals for common tasks including SEO control, bot detection, and text slugification.

## Features

- ✅ **SEO Control**: Determine if pages should be indexed
- ✅ **Bot Detection**: Identify crawler/bot traffic
- ✅ **Slugification**: Convert text to URL-friendly slugs
- ✅ **Global Variables**: Access bot detection across all templates
- ✅ **Section-Based Rules**: Automatic noindex for specific sections

## Available Functions

### shouldPageBeIndexed()

Determines if a page should be indexed by search engines based on section, URL, and environment.

#### Function Signature

```twig
shouldPageBeIndexed(url, entry)
```

#### Parameters

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `url`     | `string` | Current page URL     |
| `entry`   | `Entry`  | Current entry object |

#### Returns

`bool` - `true` if page should be indexed, `false` otherwise

#### Noindex Sections

The following sections are automatically excluded from indexing:

- `searchResults`
- `systemOffline`
- `confirmAccount`
- `editPassword`
- `editProfile`
- `forgotPassword`
- `forgotPasswordConfirmation`
- `pageNotFound`
- `registrationCompleted`
- `setPassword`
- `setPasswordConfirmation`

#### Staging/Development URLs

URLs matching `*.staging.statik.be` or `*.local.statik.be` patterns are automatically excluded.

#### Basic Usage

```twig
{# In layout template #}
{% set shouldIndex = shouldPageBeIndexed(url, entry) %}

{% if not shouldIndex %}
  <meta name="robots" content="noindex, nofollow">
{% endif %}
```

## Common Patterns

### SEO Meta Tags

```twig
<head>
  {% if shouldPageBeIndexed(url, entry) %}
    {# Add SEO meta tags #}
    <meta name="description" content="{{ entry.seoDescription }}">
    <meta property="og:title" content="{{ entry.title }}">
    <meta property="og:description" content="{{ entry.seoDescription }}">
  {% else %}
    {# Prevent indexing #}
    <meta name="robots" content="noindex, nofollow">
  {% endif %}
</head>
```

### Conditional Structured Data

```twig
{% if shouldPageBeIndexed(url, entry) %}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{{ entry.title }}",
    "description": "{{ entry.summary }}"
  }
  </script>
{% endif %}
```

### Custom Section Rules

```twig
{% set shouldIndex = shouldPageBeIndexed(url, entry) %}

{# Additional custom rules #}
{% if entry.section.handle == 'drafts' or entry.status != 'live' %}
  {% set shouldIndex = false %}
{% endif %}

{% if not shouldIndex %}
  <meta name="robots" content="noindex, nofollow">
{% endif %}
```

## Available Filters

### slugify

Converts text to URL-friendly slugs by removing non-alphanumeric characters and replacing spaces with dashes.

#### Filter Signature

```twig
text|slugify
```

#### Parameters

| Parameter | Type     | Description             |
| --------- | -------- | ----------------------- |
| `string`  | `string` | Text to convert to slug |

#### Returns

`string` - URL-friendly slug

#### Basic Usage

```twig
{# Convert title to slug #}
{% set slug = "Hello World!"|slugify %}
{# Output: "hello-world" #}

{# Use in URLs #}
{% set customUrl = "/blog/" ~ entry.title|slugify %}
{# Output: "/blog/my-blog-post" #}
```

#### Common Patterns

##### Generate Anchor Links

```twig
{% for heading in entry.headings %}
  <h2 id="{{ heading|slugify }}">{{ heading }}</h2>
{% endfor %}

{# Table of contents #}
<nav>
  <ul>
    {% for heading in entry.headings %}
      <li><a href="#{{ heading|slugify }}">{{ heading }}</a></li>
    {% endfor %}
  </ul>
</nav>
```

##### Custom File Names

```twig
{% set fileName = (entry.title ~ '-' ~ now|date('Y-m-d'))|slugify ~ '.pdf' %}
{# Output: "my-document-2024-01-15.pdf" #}

<a href="/downloads/{{ fileName }}" download>
  Download {{ entry.title }}
</a>
```

##### Tag URLs

```twig
{% for tag in entry.tags.all() %}
  <a href="/tags/{{ tag.title|slugify }}">{{ tag.title }}</a>
{% endfor %}
```

## Available Globals

### isBot

A global variable that indicates whether the current visitor is a bot/crawler.

#### Global Signature

```twig
{{ isBot }}
```

#### Returns

`bool` - `true` if visitor is a bot, `false` otherwise

#### Bot Detection

Uses the [CrawlerDetect](https://github.com/JayBizzle/Crawler-Detect) library to identify:

- Search engine bots (Google, Bing, Yahoo, etc.)
- Social media crawlers (Facebook, Twitter, LinkedIn, etc.)
- Monitoring services
- AI scrapers
- Other known bots

#### Basic Usage

```twig
{# Simple bot check #}
{% if isBot %}
  <p>Hello, bot! 🤖</p>
{% else %}
  <p>Hello, human! 👋</p>
{% endif %}
```

#### Common Patterns

##### Disable Tracking for Bots

```twig
{% if not isBot %}
  {# Only load analytics for real users #}
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_TRACKING_ID');
  </script>
{% endif %}
```

##### Skip Heavy JavaScript

```twig
{% if not isBot %}
  {# Interactive map only for users #}
  <div id="interactive-map"></div>
  <script src="/js/map-bundle.js"></script>
{% else %}
  {# Static image for bots #}
  <img src="/images/map-static.jpg" alt="Location map">
  <p>Address: {{ entry.address }}</p>
{% endif %}
```

##### Chatbot/Live Chat

```twig
{% if not isBot %}
  {# Live chat widget #}
  <script>
    window.Intercom('boot', { app_id: 'xxx' });
  </script>
{% endif %}
```

##### A/B Testing

```twig
{% if not isBot %}
  {# Run A/B tests only for real users #}
  <script src="/js/ab-testing.js"></script>
{% endif %}
```

##### CAPTCHA

```twig
<form method="post">
  <input type="email" name="email" required>

  {% if not isBot %}
    {# Show CAPTCHA only for non-bots #}
    <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
  {% endif %}

  <button type="submit">Subscribe</button>
</form>
```

## Resources

- [CrawlerDetect Library](https://github.com/JayBizzle/Crawler-Detect)
- [Craft Element Helper](https://craftcms.com/docs/4.x/extend/element-types.html#slugs)
- [URL Slug Best Practices](https://moz.com/learn/seo/url)
