# Statik Extension

A collection of Twig functions, filters, and globals for common tasks including SEO control, bot detection, and text slugification.

## Features

- ✅ **SEO Control**: Determine if pages should be indexed
- ✅ **Bot Detection**: Identify crawler/bot traffic
- ✅ **Slugification**: Convert text to URL-friendly slugs
- ✅ **Unique ids**: Keep ids unique on a page
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
| `url`     | `string` | The site's base URL (the layout passes `craft.app.config.general.aliases.baseUrl`) |
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

URLs on `.local.statik.be`, `.staging.statik.be` and `.live.statik.be` (the regex `\w{6}\.(?:local|staging|live)\.statik.be`,
so with at least six letters or digits before it, as in `inttkk.live.statik.be`) are excluded. Other testing domains (a
client's `test.example.be`) aren't: give those a `robots-staging` file and Knock Knock instead.

#### Basic Usage

`templates/_site/_layout.twig` does this for every entry page:

```twig
{% set baseUrl = craft.app.config.general.aliases.baseUrl %}

{% if entry is defined and not shouldPageBeIndexed(baseUrl, entry) %}
    <meta name="robots" content="noindex">
    <meta name="robots" content="nofollow">
{% endif %}
```

### unique_id()

Returns the id unchanged the first time it's asked for during a request, and with a `-2`, `-3` … suffix after that, so two
headings with the same title don't get the same `id`. The first one keeps the plain slug, the one "Entry (with anchor)" links
point to.

```twig
<h2 id="{{ unique_id(block.blockTitle|slugify) }}">{{ block.blockTitle }}</h2>
{# "Contact" twice on a page: id="contact", then id="contact-2" #}
```

For block titles with an anchor field, prefer `anchor_id()` from the
[Entry Anchors](https://github.com/statikbe/craft-entry-anchors) plugin (see below).

### Common patterns for shouldPageBeIndexed()

#### SEO Meta Tags

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

#### Conditional Structured Data

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

#### Custom Section Rules

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

> For block titles ("Title (Anchor)" fields) use `anchor_id(block.blockTitle)` from the [Entry Anchors](https://github.com/statikbe/craft-entry-anchors) plugin instead: it uses the stored anchor, which is kept when the title changes, and keeps ids unique on the page.

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

`isBot` is the same for the whole request. Don't use it to skip spam protection (a bot would simply skip it), and keep it out
of `{% cache %}` blocks: the first visitor would decide what everyone gets. The layout uses it to leave out the cookie banner
for crawlers.

## Resources

- [CrawlerDetect Library](https://github.com/JayBizzle/Crawler-Detect)
- [Craft's slug settings](https://craftcms.com/docs/5.x/reference/config/general.html#slugwordseparator)
- [URL Slug Best Practices](https://moz.com/learn/seo/url)
