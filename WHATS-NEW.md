# What's new

What changed in the Statik Craft base install, newest release first. Each release starts with an index, then explains how the
new things work and what was removed or replaced. Small fixes and version bumps are left out; see the Git history for those.

- [Rectangle (October 2026)](#rectangle-october-2026)

---

## Rectangle (October 2026)

The content builder is rebuilt around **content rows**: a page is a stack of rows, each row has a layout of 1–3 columns, and
every column holds one block. The row logic lives in a new plugin, [Trinity](https://github.com/statikbe/craft-trinity). Around
that: native Link fields instead of Hyper, an anchor plugin, a token-based theme, and a large cut in database queries per page.

Requires Craft 5.11 and PHP 8.4.

### Index

1. [Content rows replace content blocks](#1-content-rows-replace-content-blocks)
2. [Column types](#2-column-types)
3. [Cards](#3-cards)
4. [CTAs: native Link fields instead of Hyper](#4-ctas-native-link-fields-instead-of-hyper)
5. [Anchors: the Entry Anchors plugin](#5-anchors-the-entry-anchors-plugin)
6. [Theme tokens and contrast colours](#6-theme-tokens-and-contrast-colours)
7. [Component styles moved from TypeScript to CSS](#7-component-styles-moved-from-typescript-to-css)
8. [Images](#8-images)
9. [Fewer queries per page](#9-fewer-queries-per-page)
10. [Email addresses and phone numbers](#10-email-addresses-and-phone-numbers)
11. [Forms](#11-forms)
12. [Static translations use keys](#12-static-translations-use-keys)
13. [Content builder showcase](#13-content-builder-showcase)
    - [Dummy news items](#dummy-news-items)
14. [Removed and replaced](#14-removed-and-replaced)
15. [Plugins](#15-plugins)

---

### 1. Content rows replace content blocks

The `contentBuilder` field now allows one entry type: **Content row** (`gridRow`).

| Row field | What it does |
| --- | --- |
| `gridLayout` | `full`, `halves`, `thirds`, `thirdTwoThirds`, `twoThirdsThird` |
| `gridCells` | the columns: one entry per column, left to right (1–3) |
| `gridAlignment` | vertical alignment of the columns: top, center, bottom |
| `backgroundColor` | the row's background (Config Values) |

**Trinity does the row logic**, configured in `config/trinity.php`:

- **Width rules.** `minWidthPerType` and `maxWidthPerType` set how narrow or wide a column type may be (a form needs at least
  1/2 of the page, a card is at most 1/2). `blockedCombinations` forbids pairs in one row (quote + FAQ). Validation runs on
  save, and the control panel only offers layouts and column types that fit. Its *Add content* menu follows the entry type
  groups of the `gridCells` field, with a heading per group.
- **Field conditions** for the cell entry types: *Row cells* (what's in the row), *Column span* (share of the row) and
  *Column width* (share of the page). Use them to show a field only in wide columns, for example. Fields hidden by a condition
  arrive empty in the templates.
- **Narrower pages.** `pageWidths` makes the content builder narrower per entry type or section (e.g. 2/3 next to a sidebar).
  Column rules and image sizes then use the real width on the page.
- **Image sizes per column.** `craft.trinity.row(block)` returns per column its `width`, `mobileOrder`, and ready-made `sizes`
  and `srcsetSizes` for an image that fills it.
- `php craft trinity/doctor` checks the setup.

**A second content builder on one entry.** Craft allows a Matrix field only once per field layout. For a second builder (e.g. a
sidebar), create another Matrix field that offers the same "Content row" entry type; Trinity recognises rows by their entry
type, so it needs no further setup. Then:

1. Give it its own width, keyed by its handle in the field layout. A field wins over an entry type and section:
   ```php
   // config/trinity.php
   'pageWidths' => ['fields' => ['sidebarBuilder' => 1 / 3]],
   ```
   Its rows get the layouts, width rules and image sizes of a 1/3 builder; the main builder keeps its own width.
2. Render it with the same template, passing the field:
   ```twig
   {% include '_site/_snippet/_content/_contentBuilder' with { field: 'sidebarBuilder', settings: { section: 'section', container: 'container' } } %}
   ```
   `craft.trinity.pageWidth(entry, 'sidebarBuilder')` gives that builder's width, e.g. for the sidebar's own classes.

**Spacing between rows.** Two rows with different backgrounds each keep their own padding. Between rows with the same
background, the **Spacing above** field of the lower row (`rowSpacing`) decides the gap:

| Option | Gap (desktop / mobile) |
| --- | --- |
| Auto (default) | close when the row has no title (a follow-up of the row above), normal when one of its columns has a title |
| Close | 16px / 16px (`--spacing-section-close`) |
| Normal | 48px / 32px (`--spacing-section`), as before |
| Extra | 96px / 48px (`--spacing-section-extra`) |

`_contentBuilder.twig` decides it and sets `data-row-spacing` on the section; `section.css` applies the tokens from
`theme.css`. In the control panel, Trinity's `rowSpacingField` setting shows the field as a compact *Space above* control at the
top of every row but the first, and the gap between the blocks follows the choice. With `rowBackgroundField`, a row whose
background differs from the row above shows "Not available: the row above has another background" instead of the options.

The handles come from `config/trinity.php`, for the CP and the template alike: `rowBackgroundField` (the background field,
`backgroundColor`), `rowBackgroundDefault` (the background when it's empty or hidden, `section--default`) and `rowSpacingField`
(`rowSpacing`). A project without background colours sets `rowBackgroundField` to `null`: rows then get no background class and
the spacing applies between all rows. Only content rows use the spacing; other blocks keep the normal spacing.

**Front end** (`templates/_site/_snippet/_content/_blocks/_gridRow.twig`):

- Each column renders `templates/_site/_snippet/_content/_grid/_<type>.twig` with `cell`, `column` and `contrast`.
- Columns go side by side with **container queries**, not viewport breakpoints: `@cols-2` (560px) for halves, `@cols-3`
  (864px) for layouts with a third. Each column is an `@container` itself, so blocks respond to their own width.
- **Mobile order**: while stacked, each column can take position 1–3 (the "Mobile" tab). Only the visual order changes.
- **Styling hooks**: `data-row-layout="halves"`, `data-row-cells="text image"` (the exact combination) and `data-cell="quote"`.
  `frontend/css/site/components/gridbuilder.css` lists every allowed combination as a commented selector, ready to uncomment.

### 2. Column types

Cell entry types (`cell*`), each with its template in `_grid/`:

| Type | Notes |
| --- | --- |
| Text | title, text, CTAs |
| Image | optional popup with a larger version |
| Image gallery | grid or carrousel (Swiper); in a 1/2 column four grid layouts, in wider columns images per row |
| Quote | author, author image, one CTA |
| Video | with placeholder image |
| Table | switches from stacked cards to a real table at 628px of column width |
| Card | one card: a linked entry, or custom content (image or icon, title, text, link). At most 1/2 |
| Form | Formie form. At least 1/2 |
| FAQ | questions as `<details>`, opened from the URL hash. At least 1/2 |
| Embed | only embeds with `https:` sources render. At least 1/2 |
| Call to action | full width only |
| Overview | full width only; entries, news, calendar or knowledge base items as a grid or carrousel, optionally filled with the newest items; on a news item, with related news (see below) |

The old block templates (`_blocks/_textImage.twig`, `_faq.twig`, …) are still in the repo, but the content builder no longer
offers those blocks.

**Related news on a news item.** On a news item, an Overview set to News with "Dynamically fill" on gets one more field,
**Related news** (`relatedNews`, a Config Values field): *Same category* fills with the newest news items that share a
category with the item, then with the newest others if there are too few. The field only shows there thanks to a new field
condition, **Page section** (`modules/statik/src/conditions/PageSectionConditionRule.php`): the section of the page a nested
entry is on, for field conditions in cell (and other nested) entry types.

**The Overview's sources are configuration**, in `config/overview-sources.php`: per "Overview options" value its Entries
field, the section and order for "Dynamically fill", its card, and its related items. The template reads that file, and
`config/config-values-field.php` builds the "Related …" options from it ("Off" plus the labels). Adding a relation is one line:

```php
'news' => [
    'field' => 'newsEntries', 'section' => 'news', 'orderBy' => 'postDate DESC', 'card' => 'news',
    'relatedField' => 'relatedNews',
    'related' => [
        'category' => ['label' => 'Same category', 'field' => 'newsCategory'], // shares an entry in that field
        // 'author' => ['label' => 'Same author', 'attribute' => 'authorId'],   // same value of that attribute
    ],
],
```

The keys (`category`, `author`) are stored in the content: change a label freely, not a key. Calendar and knowledge base get
their own Config Values field (`relatedCalendar`, `relatedKnowledgeBase`) once their sections exist, so each editor only sees
the relations of that kind of item.

### 3. Cards

`_item/_card.twig` is now a folder of card templates, `templates/_site/_snippet/_item/_cards/`:

- `_default.twig`: an entry's card (overview image, title, description, link), or one with custom content (`cardImage`,
  `cardTitle`, `cardDescription`, `cardUrl`). A card without a URL isn't clickable.
- `_news.twig`, `_calendar.twig`, `_knowledgeBase.twig`: `{% embed %}` the default card and fill its blocks `onImage`,
  `beforeTitle` and `afterTitle`. The news card adds category labels and the publication date.

The Overview column picks the card per type; the home page and news overview use the news card. Pass `sizes` and
`srcsetSizes` (from `column.sizes`) so card images match the column.

### 4. CTAs: native Link fields instead of Hyper

Hyper is removed. The `cta` (one) and `ctas` (up to five) fields are now Matrix fields of **Link** entries. Each Link entry has
a native Craft Link field (`linkField`: entry, URL, asset, email, phone, with label, target and URL suffix) and a link style
(`ctaFieldLinkLayouts`, classes from `config/cta.php`).

```twig
{{ render_ctas(block.ctas, { class: 'mt-2', showContrast: true }) }}
```

- `render_ctas()` (`modules/statik/src/web/twig/CtaExtension.php`) replaces `render_hyper_links()`. It accepts the Matrix
  query, an array of entries or a single Link field value. The extra-classes option is now `class` (was `linkClass`).
- Each link renders through `_global/_cta.twig`, using Craft's `link.attributes`.
- `migrations/m261014_160000_hyper_ctas_to_link_entries.php` converts existing Hyper values. Apply project config first.

### 5. Anchors: the Entry Anchors plugin

Block titles use the **Anchor Text** field of [statikbe/craft-entry-anchors](https://github.com/statikbe/craft-entry-anchors)
(config: `config/entry-anchors.php`). It replaces the module's AnchorLink field.

- The field stores the title **and** an anchor. The anchor follows the title until the block is published, then stays put,
  so links keep working when an editor renames a heading. Editors can edit the anchor and copy the link or `#anchor`.
- Render ids with `anchor_id()` instead of `|slugify`. It keeps ids unique on the page (`-2`, `-3`):
  ```twig
  <h2 id="{{ anchor_id(block.blockTitle) }}">{{ block.blockTitle }}</h2>
  ```
- Link fields get anchor dropdowns: anchors of the linked entry (stored as `#slug` in the URL suffix), or of the current page
  for URL links.

### 6. Theme tokens and contrast colours

All design tokens moved from `main.css` to `frontend/css/site/theme.css`: fonts, the primary/secondary palette (shades via
`color-mix`), spacing, and one group of variables per component (buttons, cards, CTA, quote, form, FAQ, images, video,
table). Restyle a project there; component CSS only reads the variables.

- **Contrast**: on a row with a background, components switch to their `*-contrast-*` tokens, and `.contrast` makes links and
  list markers follow the text colour.
- The "Primary" background option is gone; the editor offers default and light (`config/config-values-field.php`).
- Some tokens were removed: `--color-primary-hover`, `--color-*-hover-contrast`, `--color-secondary-contrast`. Use the
  `--color-button-*` tokens or the palette shades.
- Swiper's CSS is imported in `layer(components)` (`main.css`), so Tailwind utilities on slides win without `!important`.
- `<main>` has `overflow-x: clip`, so carrousels can show their neighbouring slides without a horizontal scrollbar.

### 7. Component styles moved from TypeScript to CSS

Autocomplete, chip, modal (and its confirmation, image and video plugins), password strength, video background and video
toggle no longer build long class strings in TypeScript. Each imports a BEM stylesheet from `frontend/css/site/components/`.

**Breaking:**

- `data-*-style` attributes now **add** classes instead of replacing the defaults.
- The `*-after` attributes (`data-close-after`, `data-autocomplete-option-after`, `data-chip-option-after`) and
  `data-close-position` are gone. Move that styling into the component CSS.

### 8. Images

- **`render_image()` renders AVIF plus the original format.** WebP is dropped, also for PNGs: AVIF supports transparency.
  The `generateWebP` and `webpQuality` options are gone.
- `_global/_image.twig` works on a copy of the asset, so rendering an image twice on a page gives the same result.
- **Image modal**: `data-modal-srcset` (JSON list of sources) shows the popup as a responsive `<picture>`, and
  `data-open-gallery="<group>"` lets any button open a gallery. The image block and gallery use both. See
  `docs/src/frontend/components/modal_image.md`.

### 9. Fewer queries per page

The templates were reworked to load related data in batches. Pages that ran 230–1800 queries now run about 90–150.

- **One lookup per field, with `.eagerly()`.** `block.image|length`, `.collect()` and `.one()` on the same relation field each
  ran a query. Templates now look a field up once into a variable:
  ```twig
  {% set image = block.image.eagerly().one() %}
  ```
  `.eagerly()` loads that field for every element of the same query result at the first call: the images of all cards in a
  grid come in one query.
- **Not for nested Matrix fields** (CTAs, FAQ items, text columns): Craft's lazy eager loading only returned the first
  owner's entries there. Query those with `.all()` once per block.
- **Image transforms in one query.** `render_image()` used to make Craft look up each transform separately: about 17 queries
  per image (every srcset width × 2 formats, plus the preview). The new `preload_image_transforms()` (called by
  `_image.twig`, `modules/statik/src/web/twig/ImageExtension.php`) loads them in one query for the image and the other images
  of its query, so a whole gallery or card grid shares one query.
- The language switcher loads the entry on all sites in one query, and the site settings are cached with their image.

### 10. Email addresses and phone numbers

**`obfuscate_emails`** replaces `enkode_emails` and the Obfuscator plugin:

```twig
{% apply obfuscate_emails %}…{% endapply %}
```

- `mailto:` hrefs move to an encoded `data-mailto`; addresses in text show the part before the `@` until
  `frontend/js/components-core/email.component.ts` puts the address back. Without JavaScript readers see
  `info [at] example [dot] com`.
- No inline scripts and no `eval()`, so it works with a strict Content Security Policy. A few bytes per address instead of
  ~8 KB, and the same HTML on every render.

**`tel`** formats phone numbers with libphonenumber:

```twig
<a href="tel:{{ phone|tel }}">{{ phone|tel('display') }}</a>
```

`016 67 19 01`, `+32 (0)16 67 19 01` and `0032 16 67 19 01` all give `+3216671901` for the link and `+32 16 67 19 01` for
display (with non-breaking spaces, which validators expect). Numbers without a country code use the site's country, from its
language (`nl-BE` → BE). Docs: `docs/src/craft/twig/email-extension.md`, `phone-extension.md`.

### 11. Forms

- `config/formie.php` sets a global Formie theme with `resetClasses: true`: no `fui-*` classes, form elements are styled
  globally in `form.css` with the form tokens.
- Formie multi-selects get `data-autocomplete` server-side (`Statik.php`).
- **Breaking:** the Formie JS component selector is `[data-fui-form]` instead of `.fui-form`.

### 12. Static translations use keys

Templates translate keys instead of Dutch source strings, in the `website_name` category:

```twig
{{ 'item.card.readMore'|t('website_name') }}
```

The source files are `setup-translations/{en,nl-BE,fr-BE}/website_name.php`; `php craft statik/setup/install-translation-files`
copies them to `translations/`. The category was renamed from `website name` to `website_name`. Add new texts as keys to
all three files.

### 13. Content builder showcase

`php craft statik/contentbuilder` builds a page tree under **gridbuilder** that shows every column type in every layout and
combination, with every field variant. It reads the entry types at runtime, so new column types show up without code changes.
Content comes from `config/contentbuilder-showcase/content.json` (add `--dry-run` to preview).

Remove it before going live: `php craft statik/contentbuilder-cleanup`, then strip the `contentbuilder-showcase:start/end`
blocks from `_contentBuilder.twig`. The Claude skills in `.claude/skills/*contentbuilder-showcase*` describe both steps.

#### Dummy news items

`php craft statik/dummy-content/news` fills the news section with dummy items for overviews and cards: a title, a publication
date (newest first, a few days apart), a header image, an intro, one or two categories and a few content rows (a text with a
title, a text without one next to an image, a quote, a closing text), enabled on every site.

```bash
php craft statik/dummy-content/news --count=20 --categories --category-count=6
php craft statik/dummy-content/clean news --categories
```

| Option | Default | |
| --- | --- | --- |
| `--count` | 12 | how many items |
| `--categories` | off | also create dummy news categories (else the items get the categories that exist) |
| `--category-count` | 6 | how many categories, with `--categories` |
| `--keep` | off | add to the dummy items of an earlier run instead of replacing them |
| `--dry-run` | off | only show what would be created or removed |
| `--seed` | 1 | seed for the random images, dates and categories |

Generated items and categories get a `dummy-` slug: a run only replaces or removes those, existing content is never touched.
Texts come from `config/dummy-content/content.json` (one key per content type), images from the assets. The command is set up
for more content types: a `DummyContentType` subclass per type (`modules/statik/src/helpers/dummycontent/`), listed in
`DummyContentController::TYPES`; calendar and knowledge base items follow once their sections exist.

### 14. Removed and replaced

| Removed | Replaced by |
| --- | --- |
| Separate content builder blocks (Text + Image, FAQ, CTA, …) | Content rows with column types |
| `customTable`, `textTwoColumns` blocks | the Table column type; text columns are a content row with 2 or 3 Text columns |
| "Page with sidebar" entry type | `pageWidths` in `config/trinity.php` (commented example) |
| `verbb/hyper`, `render_hyper_links()`, `_hyperCta.twig` | Link entries, `render_ctas()`, `_cta.twig` |
| `linkClass` option of the CTA function | `class` |
| Module AnchorLink field, `SlugifyController`, `\|slugify` heading ids | Entry Anchors plugin, `anchor_id()` |
| `miranj/craft-obfuscator`, `enkode_emails` | `obfuscate_emails` |
| `_item/_card.twig` | `_item/_cards/_default.twig` (+ per type) |
| WebP sources in `render_image()` | AVIF + original format |
| `data-*-after`, `data-close-position`; replacing `data-*-style` | Component CSS; `data-*-style` adds classes |
| `.fui-form` JS selector, `fui-*` classes | `[data-fui-form]`, global form styles |
| `setup-translations/*/site.php`, Dutch source strings | `website_name.php` with keys |
| "Primary" section background | default and light |

### 15. Plugins

- **New:** `statikbe/craft-trinity` (content rows), `statikbe/craft-entry-anchors` (anchors),
  `giggsey/libphonenumber-for-php` (phone numbers).
- **Removed:** `verbb/hyper`, `miranj/craft-obfuscator`.
- Craft 5.11, CKEditor 5.9; Config Values 5.4 accepts CSS variables as colours.
