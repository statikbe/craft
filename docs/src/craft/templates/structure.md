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
    ├── _layout.twig         The page layout every page extends
    ├── index.twig           Home
    ├── _contentPage.twig    Pages, privacy policy, cookie policy, accessibility statement
    ├── _contact.twig        Contact
    ├── _searchResults.twig  Search results
    ├── _account/            Login, register, profile, passwords
    ├── _calendar/           _index (overview) and _entry (event)
    ├── _knowledgeBase/      _index and _entry
    ├── _news/               _index and _entry
    └── _snippet/
        ├── _content/        Page content: headers, the content builder, its blocks and columns
        │   ├── _blocks/     One template per content builder block (entry type)
        │   ├── _grid/       One template per content row column type (cell entry type)
        │   └── _partials/   Parts shared by blocks and columns
        ├── _global/         Header, footer, flyout, search, and the templates behind render_image(), render_ctas()
        │                    and render_pagination()
        ├── _item/           Cards (_cards/) and small items (_eventDate, _loader)
        ├── _macros/         Twig macros
        └── _nav/            Main, service, flyout, doormat, breadcrumb and language navigation
```

## The layout

`_site/_layout.twig` holds the HTML document: the head (Vite, favicon, SEO fields, Google Tag Manager), the header, the
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
{% extends '_site/_layout' %}

{% block content %}
    {% cache unless currentUser or craft.app.request.isPreview() %}
        {% include '_site/_snippet/_content/_defaultHeader' %}
        {% include '_site/_snippet/_content/_contentBuilder' with {
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
| `_site/index`                    | Home                                                                       |
| `_site/_contentPage`             | Pages, Privacy policy, Cookie policy, Accessibility statement              |
| `_site/_contact`                 | Contact                                                                    |
| `_site/_searchResults`           | Search results                                                             |
| `_site/_news/_index`, `_entry`   | News overview, News items                                                  |
| `_site/_calendar/_index`, `_entry` | Calendar overview, Calendar                                              |
| `_site/_knowledgeBase/_index`, `_entry` | Knowledge base overview, Knowledge base                             |
| `_site/_account/…`               | Login, Register, Profile, Edit profile, the password and confirmation pages |
| `404`, `503`                     | Page not found, System offline                                             |

See [Sections](../content/sections) for what each section is for.

## From block to template

The content builder renders each block with the template named after its entry type handle, and a content row renders each
column with the template named after its cell type handle:

```twig
{# _content/_contentBuilder.twig #}
{% include '_site/_snippet/_content/_blocks/_' ~ block.type.handle %}

{# _content/_blocks/_gridRow.twig #}
{% include '_site/_snippet/_content/_grid/_' ~ cellTypes[loop.index0] %}
```

A new block or column type needs a template with the same name: entry type `textImage` → `_blocks/_textImage.twig`. See
[Content builder](../content/content-builder).

## Naming

Templates and folders are lowerCamelCase, with an optional leading `_` for templates that are only included (`_textImage.twig`).
`_site` keeps its `_`. The exceptions are the error pages (`404.twig`, `503.twig`) and files a plugin requires
(`_knock-knock.twig`). See the [code guidelines](../code-quality/guidelines).

## Source

`templates/`
