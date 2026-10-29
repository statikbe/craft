# Template structure

All front-end templates live in `templates/_site`. The other folders at the root are for Craft itself, plugins and mail.

```
templates/
├── 404.twig                 Page not found (also the "Page not found" single)
├── 503.twig                 System offline (also the "System offline" single)
├── _knock-knock.twig        Password page of the Knock Knock plugin
├── _mail/                   Mail layout (_layout.twig) and template (_template.twig)
├── api/                     Empty: for JSON or other API templates
└── _site/
    ├── layout.twig          The page layout every page extends
    ├── pages/               The templates sections point to
    │   ├── home.twig        Home
    │   ├── page.twig        Pages, privacy policy, cookie policy, accessibility statement
    │   ├── contact.twig     Contact
    │   ├── search.twig      Search results
    │   ├── account/         Login, profile, password/ and registration/
    │   ├── calendar/        index (overview) and entry (event)
    │   ├── knowledgeBase/   index and entry
    │   └── news/            index and entry
    ├── contentBuilder/      The content builder
    │   ├── contentBuilder.twig  The loop over the blocks
    │   ├── gridRow.twig     The content row: includes one template per column
    │   ├── blocks/          One template per content builder block (entry type)
    │   └── columns/         One template per content row column type (cell entry type)
    ├── components/          Reusable parts you include anywhere
    │   ├── frame/           Header, footer, flyout and navigation (nav/), around every page
    │   ├── pageHeader/      The page header (pageHeader.twig) and its presets default and hero
    │   ├── cards/           The cards of overviews and related entries
    │   ├── partials/        Small parts other templates include: overview, filter/, textColumn, …
    │   └── …                cta, image and pagination (behind render_ctas(), render_image() and
    │                        render_pagination()), search, eventDate, loader, socialMedia, socialShare
    └── macros/              Twig macros
```

## The layout

`_site/layout.twig` holds the HTML document: the head (Vite, favicon, SEO fields, Google Tag Manager), the header, the
flyout, the footer and the cookie banner. It also loads the **Site settings** single into `siteSettings` (cached per site for an
hour; the module clears that cache when Site settings is saved).

Pages extend it and fill its blocks:

| Block            | Where                                     |
| ---------------- | ----------------------------------------- |
| `content`        | The page content, inside `<main id="main">` |
| `head_scripts`   | Scripts in the `<head>`                    |
| `body_classes`   | Extra classes on `<body>`                  |
| `inline_scripts` | Scripts at the end of `<body>`             |

```twig
{% extends '_site/layout.twig' %}

{% block content %}
    {% cache unless currentUser or craft.app.request.isPreview() %}
        {% include '_site/components/pageHeader/default.twig' %}
        {% include '_site/contentBuilder/contentBuilder.twig' with {
            settings: { section: 'section', container: 'container' }
        } %}
    {% endcache %}
{% endblock %}
```

## From section to template

Each section's template is set in its site settings. Sections without a template have no pages of their own: categories,
Team, Partners and Site settings.

| Template                         | Sections                                                                   |
| -------------------------------- | -------------------------------------------------------------------------- |
| `_site/pages/home`                         | Home                                                                        |
| `_site/pages/page`                         | Pages, Privacy policy, Cookie policy, Accessibility statement               |
| `_site/pages/contact`                      | Contact                                                                     |
| `_site/pages/search`                       | Search results                                                              |
| `_site/pages/news/index`, `entry`          | News overview, News items                                                   |
| `_site/pages/calendar/index`, `entry`      | Calendar overview, Calendar                                                 |
| `_site/pages/knowledgeBase/index`, `entry` | Knowledge base overview, Knowledge base                                     |
| `_site/pages/account/…`                    | Login, Register, Profile, Edit profile, the password and confirmation pages |
| `404`, `503`                               | Page not found, System offline                                              |

See [Sections](../content/sections) for what each section is for.

## From block to template

The content builder renders each block with the template named after its entry type handle, and a content row renders each
column with the template named after its cell type handle:

```twig
{# contentBuilder/contentBuilder.twig #}
{% include block.type.handle == 'gridRow' ? '_site/contentBuilder/gridRow.twig' : '_site/contentBuilder/blocks/' ~ block.type.handle ~ '.twig' %}

{# contentBuilder/gridRow.twig #}
{% include '_site/contentBuilder/columns/' ~ cellTypes[loop.index0] ~ '.twig' %}
```

A new block or column type needs a template with the same name: entry type `textImage` → `blocks/textImage.twig`. The content
row (`gridRow`) is the one exception: its template sits directly in `contentBuilder/`, because it isn't a block itself but the
template that includes the columns. See [Content builder](../content/content-builder).

## Naming

Templates and folders are lowerCamelCase. `_site` keeps its `_` prefix, so its templates can't be browsed to directly; the
folders and templates inside it don't get one. The exceptions are the error pages (`404.twig`, `503.twig`) and files a plugin requires
(`_knock-knock.twig`). See the [code guidelines](../code-quality/guidelines).

## Source

`templates/`
