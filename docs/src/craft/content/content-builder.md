# Content builder

The `contentBuilder` field (Matrix, blocks view) holds the content of home, pages, contact, news items, events, knowledge base
items and the search results page. It has one
entry type: the **Content row** (`gridRow`), a row of 1–3 columns with one column type (a "cell" entry type) per column.

The rows run on the [Trinity](https://github.com/statikbe/craft-trinity) plugin: layouts, widths, the column rules and the
Mobile order. This page describes how the base install configures it; see the Trinity repo for the plugin itself.

## Content row

| Field              | Handle            | Options                                                                 |
| ------------------ | ----------------- | ----------------------------------------------------------------------- |
| Layout             | `gridLayout`      | `full` (1), `halves` (1/2 + 1/2), `thirds` (1/3 × 3), `thirdTwoThirds` (1/3 + 2/3), `twoThirdsThird` (2/3 + 1/3) |
| Vertical alignment | `gridAlignment`   | `start` (top), `center`, `end` (bottom)                                 |
| Spacing above      | `rowSpacing`      | `auto`, `close`, `normal`, `extra`                                      |
| Columns            | `gridCells`       | Matrix, 1–3 cells, cards-grid view                                      |
| Background color   | `backgroundColor` | Config Values field, data set "Background colors" in `config/config-values-field.php` |

**Spacing above** only applies between two rows with the same background (a row with another background keeps its own
padding). *Auto* is *close* for a row without a title in any of its columns (a follow-up of the row above) and *normal* for a
row with one (a hidden title doesn't count). The values end up as `data-row-spacing` and are styled in `frontend/css/site/components/section.css`.

**Background color** is hidden on a row with a FAQ column. An empty or hidden background is `section--default`.

## Column types

Each cell entry type renders `_site/contentBuilder/columns/<type>.twig`: the handle without `cell`, e.g. `cellImageGallery` →
`imageGallery.twig`. Every type except Team has a **Mobile** tab with *Mobile order* (`mobileOrder`: Auto, 1, 2, 3), the
column's position while the columns are stacked.

| Column type       | Handle             | Fields and options                                                                                     |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| Text              | `cellText`         | Title (anchor), Text, Links                                                                            |
| Image             | `cellImage`        | Image, Show larger version in popup                                                                    |
| Image gallery     | `cellImageGallery` | Images; type *Grid* or *Carrousel*; for a grid: Image width and position (full and 2/3 columns), Images layout (1/2 columns), popup |
| Quote             | `cellQuote`        | Quote, Author, Author role, Author image, Author image position (*Left*, *Right*, *Next to the name*; only with an image), Link |
| Video             | `cellVideo`        | Video URL, Placeholder image, Video caption                                                            |
| Table             | `cellTable`        | Table, Table caption, Mobile table (*Cards* or *Scroll*)                                               |
| Card              | `cellCard`         | Card type *Entry* (an entry, Show image) or *Custom* (Card info); Card layout *Stacked* or *Image left* |
| Person            | `cellPerson`       | Person (an entry of the Team section)                                                                  |
| Numbers           | `cellNumbers`      | Title (anchor), Intro, Buttons, Numbers                                                                |
| Form              | `cellForm`         | Form (Formie), see [Forms](./forms)                                                                    |
| FAQ               | `cellFaq`          | Title (anchor), FAQ items                                                                              |
| Embed             | `cellEmbed`        | Embed code                                                                                             |
| Call to action    | `cellCallToAction` | Title (anchor), Text, Links, Image                                                                     |
| Overview          | `cellOverview`     | See below                                                                                              |
| Team              | `cellTeam`         | Title (anchor), Text, Columns (2, 3 or 4), Team members                                                |
| Partners          | `cellPartners`     | Title (anchor), Text, Partners, type *Grid* or *Carrousel*                                             |

### Overview

The Overview column shows cards of entries:

- **Overview options**: *Entries* (any entries), *News*, *Calendar* or *Knowledge Base*; each shows its own Entries field.
- **Dynamically fill**: for News, Calendar and Knowledge Base, fill the overview automatically instead of picking entries.
- **Related news**: only on news items, with *Dynamically fill* on: show news of the same category. The relations come from
  `config/overview-sources.php` (through `config/config-values-field.php`).
- **Overview type**: *Grid* or *Carrousel*.
- **Card layout** (*Stacked* or *Image left*) and **Highlight the first card** (grid only): not in a 1/2 column.
- **Link** and **Link position** (*Below the cards* or *Top right*).

The columns with a title also have **Show title**: off, only screen readers read the title. See
[Heading order](./headings) for the heading levels, the hidden h2 above a row of cards and the heading check.

## Widths and combinations

`config/trinity.php` sets which column types fit where; the control panel only offers what's allowed.

| Setting               | Value in the base install                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `minWidthPerType`     | 1/2 for Card, Table, FAQ, Embed, Form, Image gallery, Overview, Partners, Numbers; full width for Call to action and Team |
| `maxWidthPerType`     | 1/2 for Card and Person                                                                                     |
| `blockedCombinations` | two Partners columns in one row; Quote with FAQ                                                             |
| `columnGaps`          | `thirds` 24px (the other layouts 48px, `--spacing-column`)                                                  |
| `rowSpacingField`, `autoRowSpacing`, `rowBackgroundField`, `rowBackgroundDefault` | the spacing and background fields above |
| `pageWidths`          | empty: for content builders narrower than the page, e.g. next to a sidebar                                 |

The comments in `config/trinity.php` explain every setting.

## Layout conditions

Fields that only apply in some cases are hidden with field layout conditions, so editors only see what works:

- **Field values**: Card type, Image gallery type, Overview options and Overview type show or hide the fields that belong to
  them; the quote's image position only shows with an author image.
- **Column width** (Trinity's *Column width* rule): Image gallery and Overview show other fields in a 1/2 column than in a wider one.
- **Columns in the row** (Trinity's rule on the row): no Background color with a FAQ column.
- **Page section** (our own rule, see [Condition rules](../module/condition-rules)): Related news only on news items.

## Templates

| Template                                         | What                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `_site/contentBuilder/contentBuilder.twig`   | Loops over the rows: background, spacing, container. Variables: `settings` (`section`, `container` classes), `field` (another Matrix field than `contentBuilder`) |
| `_site/contentBuilder/gridRow.twig`  | One row: the grid, column spans, mobile order; includes the column templates          |
| `_site/contentBuilder/columns/*.twig`          | One template per column type                                                          |

`contentBuilder/blocks/` holds the templates of older full-width blocks that the content builder field no longer offers.

```twig
{% include '_site/contentBuilder/contentBuilder.twig' with {
    settings: {
        section: 'section',
        container: 'container',
    }
} %}
```

`gridRow.twig` adds styling hooks: `data-row-layout`, `data-row-cells` (the column types in source order) and `data-cell` per
column, e.g. `[data-row-cells="text image"]` or `[data-cell="quote"]`.

## Showcase

The *Gridbuilder* pages show every column type in every layout and combination. See [Content builder showcase](../showcase/about).

## Source

- `config/project/entryTypes/` (`gridRow`, `cell*`) and `config/project/fields/`
- `config/trinity.php`, `config/config-values-field.php`, `config/overview-sources.php`
- `templates/_site/contentBuilder/contentBuilder.twig`, `gridRow.twig`, `columns/`
