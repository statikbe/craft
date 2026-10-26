# Partials and macros

Reusable templates in `templates/_site/_snippet`. Most have a comment at the top that lists their variables: read it before you
include one. Include them with their full path:

```twig
{% include '_site/_snippet/_content/_partials/_overview' with { option: 'news', type: 'carrousel' } %}
```

## Behind a Twig function

Three partials are rendered by a Twig function of the module. Call the function, not the partial:

| Partial               | Function                                                  |
| --------------------- | --------------------------------------------------------- |
| `_global/_image`      | [`render_image()`](../twig/image-extension)               |
| `_global/_cta`        | [`render_ctas()`](../twig/cta-extension)                  |
| `_global/_paginate`   | [`render_pagination()`](../twig/paginate-extension)       |

## Page headers

`_content/_pageHeader` is the engine behind the page headers; `_defaultHeader` and `_hero` are its presets. See
[Hero, page header and intro](../content/hero).

## Content partials

### `_content/_partials/_overview`

An overview of cards in a grid or a carrousel, with a title above and a link below. Used by the Overview column and on pages
that always show one, e.g. the related news on a news item.

| Variable         | What                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `option`         | The source in `config/overview-sources.php`: `entries`, `news`, `calendar`, `knowledgeBase`                  |
| `type`           | `grid` (default, up to 3 cards) or `carrousel` (up to 6)                                                     |
| `chosen`         | Entries picked by hand, shown first in that order                                                            |
| `dynamicFill`    | Top up with the newest entries of the source's section (the calendar: the soonest upcoming events)           |
| `relatedBy`      | A key of the source's `related` (e.g. `category`): entries related to the page come first                    |
| `page`           | The page the overview is on (left out, and used to find related entries)                                     |
| `title`, `intro`, `link` | The heading, a text below it (HTML), and a Link field value below the cards                         |
| `linkPosition`   | `below` (default) or `topRight`: next to the title once the overview is at least `@lg` wide                  |
| `cardLayout`     | `stacked` (default) or `horizontal`: image left, two cards per row                                           |
| `highlightFirst` | Grid only: the first card large on the left, the next two horizontal on the right                            |
| `narrow`         | In a column of at most half the page: horizontal cards, one under the other, 3 at most                       |
| `sizes`          | The `sizes` of the column it's in, e.g. `craft.trinity.imageSizes('full', 1).sizes`                          |
| `contrast`       | On a coloured background: the cards in their contrast style                                                  |
| `siteSettings`   | The fallback image for cards without one (set in `_layout.twig`)                                             |

The cards per row use container queries: put the overview in an `@container` (a content row column is one).

### `_content/_partials/_carrouselControls`

The previous and next buttons and the bullets under a Swiper carrousel. Put it inside the `.swiper`, after `.swiper-wrapper`.
Swiper hides all three when every slide fits in view.

| Variable | What                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| `class`  | The right padding that matches the slides' gap, e.g. `pr-cards`                    |

### `_content/_partials/_textColumn`

Title, text and CTAs, as used next to an image, table or video.

| Variable     | What                          |
| ------------ | ----------------------------- |
| `title`      | The heading                   |
| `text`       | The text (HTML)               |
| `ctas`       | A Link field value            |
| `headingTag` | Default `h2`                  |
| `class`      | Classes on the wrapper        |

### Overview filters

The overview pages (news, calendar, knowledge base) build their filters from these partials. They only render: the page passes
the data and reads the query parameters itself.

| Partial                              | What                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `_content/_partials/_filterOptions`  | A group of checkboxes or radio buttons: `name`, `label`, `options`, `selected`, `type` (`checkbox` or `radio`), `layout` (`top`: a chip that opens the options; `side`: a list under a heading), `id` |
| `_content/_partials/_filterSearch`   | The search field: `searchQuery`, `layout`                                                 |
| `_content/_partials/_filterClearBtn` | A chip for an active filter, with a button that clears it: `searchQuery` (the label), `clearElements` (JSON with the fields to clear) |

`layout` comes from `filterLayout` in `config/overview-sources.php`.

```twig
{% include '_site/_snippet/_content/_partials/_filterOptions' with {
    name: 'category',
    label: 'news.index.categories'|t('website_name'),
    options: categories,
    selected: catQuery,
    layout: filterLayout,
} %}
```

### `_content/_grid/_partials/_galleryImage`

One image of the Image gallery column: the image, optionally a button that opens it in the popup, and the caption and
copyright behind an info button. Variables: `image`, `sizes`, `srcsetSizes`, `aspectRatio` (`''` keeps the image's own ratio),
`popup`, `group`.

### Small content parts

| Partial                    | What                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| `_content/_socialMedia`    | Links to the site's social media (`socialLinks`)                           |
| `_content/_socialShare`    | Share links for the current entry                                          |

## Cards: `_item/_cards`

| Card              | What                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `_default`        | An entry's card (image, title, description, link), or a card with its own content when `cardEntry` is null |
| `_news`           | The default card with the categories as labels and the publication date                                   |
| `_calendar`       | The default card with the date and location instead of the description; `eventDate`: the date block to show |
| `_knowledgeBase`  | The default card with the categories as labels                                                            |
| `_person`         | A team member: photo, name, job title, email address and phone number. Not a link                         |

The main variables of the default card:

| Variable          | What                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `cardEntry`       | The entry. Null for a card with its own `cardImage`, `cardTitle`, `cardDescription`, `cardUrl` |
| `showImage`       | Default `true`                                                                                |
| `showDescription` | Default `true`                                                                                |
| `showContrast`    | The contrast style, for coloured backgrounds                                                  |
| `horizontal`      | Image left and content right, once the card is at least `@xs` wide                            |
| `ctaText`         | The link text, default `item.card.readMore`                                                   |
| `sizes`, `srcsetSizes` | The image sizes                                                                          |

The news, calendar and knowledge base cards extend the default card through its blocks `onImage`, `beforeTitle` and
`afterTitle`. The card an overview uses is set per source (`card`) in `config/overview-sources.php`.

## Other items: `_item`

| Partial         | What                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `_eventDate`    | An event's date block as a `<time>`: a moment, one day with a start and end time, or several days. Variables: `eventDate`, `class`. Formats: `calendar.dateFormat` and `calendar.timeFormat` translations |
| `_loader`       | The loading indicator of the ajax overviews and search results                                         |

## Global and navigation

| Partial              | What                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `_global/_header`    | Logo, main and service navigation, language switch, search                                 |
| `_global/_footer`    | Doormat and footer                                                                         |
| `_global/_flyout`    | The mobile navigation                                                                      |
| `_global/_search`    | The search form. `showInline` (default `false`), `filledInValue` (the current query)       |
| `_nav/_main`, `_nav/_service`, `_nav/_doormat`, `_nav/_flyout` | The Navigate navigations                        |
| `_nav/_breadcrumb`   | The breadcrumb, with schema.org markup. `breadcrumbClass`                                  |
| `_nav/_language`     | The language switch. `variant`: `dropdown` (default) or `row`                               |

## Macros: `_macros/_imageSizes`

Responsive image sizes, from the `sizes` of a content row column (`column.sizes`, from Trinity). Used by the image gallery,
the Overview column and the person cards.

```twig
{% import '_site/_snippet/_macros/_imageSizes' as imageSizes %}

{% set sizes = imageSizes.itemSizes(column.sizes, { 0: 1, 628: 2, 788: 3 }, 1, 20) %}
{% set srcset = imageSizes.srcsetSizes(sizes) %}
```

| Macro                                            | Returns                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `itemSizes(columnSizes, perRow, span = 1, gap = 12)` | The `sizes` of one item that takes `span` of the `perRow` columns of a grid. `perRow`: container width in px → items per row (a fraction works too, e.g. `2.5`); `gap`: the grid's gap in px |
| `srcsetSizes(sizes)`                             | The srcset widths of a `sizes` string: its px widths, once each, e.g. `263w,316w,390w`         |

## Source

`templates/_site/_snippet/`
