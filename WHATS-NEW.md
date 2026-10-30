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
14. [News filter and page transitions](#14-news-filter-and-page-transitions)
15. [Calendar](#15-calendar)
16. [Knowledge base](#16-knowledge-base)
17. [Team](#17-team)
18. [Partners](#18-partners)
19. [Page header and hero](#19-page-header-and-hero)
20. [Code guidelines](#20-code-guidelines)
21. [Figma kit and theme export](#21-figma-kit-and-theme-export)
22. [Template folder structure](#22-template-folder-structure)
23. [Heading order](#23-heading-order)
24. [Removed and replaced](#24-removed-and-replaced)
25. [Plugins](#25-plugins)

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
   {% include '_site/contentBuilder/contentBuilder.twig' with { field: 'sidebarBuilder', settings: { section: 'section', container: 'container' } } %}
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

`contentBuilder/contentBuilder.twig` decides it and sets `data-row-spacing` on the section; `section.css` applies the tokens from
`theme.css`. In the control panel, Trinity's `rowSpacingField` setting shows the field as a compact *Space above* control at the
top of every row but the first, and the gap between the blocks follows the choice. With `rowBackgroundField`, a row whose
background differs from the row above shows "Not available: the row above has another background" instead of the options.

The handles come from `config/trinity.php`, for the CP and the template alike: `rowBackgroundField` (the background field,
`backgroundColor`), `rowBackgroundDefault` (the background when it's empty or hidden, `section--default`) and `rowSpacingField`
(`rowSpacing`). A project without background colours sets `rowBackgroundField` to `null`: rows then get no background class and
the spacing applies between all rows. Only content rows use the spacing; other blocks keep the normal spacing.

Turning it off: `'autoRowSpacing' => false` in `config/trinity.php` (Trinity 1.2.0) makes Auto always normal (no close spacing for rows without a
title), and `'rowSpacingField' => null` in `config/trinity.php` removes the *Space above* control from the control panel (the
template then treats every row as Auto). Both together: every row gets the normal spacing. Remove the `rowSpacing` field from the
row entry type too, or editors see it as a plain Button Group.

**Front end** (`templates/_site/contentBuilder/gridRow.twig`):

- Each column renders `templates/_site/contentBuilder/columns/<type>.twig` with `cell`, `column` and `contrast`.
- Columns go side by side with **container queries**, not viewport breakpoints: `@cols-2` (560px) for halves, `@cols-3`
  (864px) for layouts with a third. Between the two, layouts with a third show two equal columns (thirds: the third column
  wraps below, as a half on the left). Each column is an `@container` itself, so blocks respond to their own width.
- **Mobile order**: while stacked, each column can take position 1–3 (the "Mobile" tab). Only the visual order changes.
- **Styling hooks**: `data-row-layout="halves"`, `data-row-cells="text image"` (the exact combination) and `data-cell="quote"`.
  `frontend/css/site/components/gridbuilder.css` lists every allowed combination as a commented selector, ready to uncomment.

### 2. Column types

Cell entry types (`cell*`), each with its template in `contentBuilder/columns/`:

| Type | Notes |
| --- | --- |
| Text | title, text, CTAs |
| Image | optional popup with a larger version |
| Image gallery | grid or carrousel (Swiper); in a 1/2 column four grid layouts, in wider columns images per row |
| Quote | author, optional *Author role* under the name, author image, one CTA. *Author image position* (when there is an image): Left (default), Right, or Next to the name: a small round photo beside the name and role instead of the large one |
| Video | with placeholder image |
| Table | switches from stacked cards to a real table at 628px of column width |
| Card | one card: a linked entry, or custom content (image or icon, title, text, link). At most 1/2. *Card layout* Image left: image left (2/5), content right, once the card is 448px wide |
| Form | Formie form. At least 1/2 |
| FAQ | a title, and questions as `<details>`, opened from the URL hash; answers start at h3. At least 1/2 |
| Embed | only embeds with `https:` sources render. At least 1/2 |
| Call to action | full width only |
| Overview | at least 1/2; entries, news, calendar or knowledge base items as a grid or carrousel, optionally filled with the newest items; on a news item, with related news (see below). Optional *Intro* under the title. *Card layout* Image left: horizontal cards, two per row (4 when it fills itself). *Highlight the first card* (grid): a large first card on the left, two horizontal cards on the right. *Link position* Top right: the link next to the title from 948px of the column, below the cards on smaller screens. In a column of 1/2 (e.g. news next to events) the cards are always image left, one under the other, 3 at most: *Card layout* and *Highlight the first card* are hidden there |
| Person | one person from the Team section as a person card. At most 1/2; at half the page photo left, details right (see [Team](#17-team)) |
| Numbers | key figures as cards: an optional title, intro and buttons, then 1–12 numbers (`numbers` Matrix of `numberItem`: the number, e.g. `342.000` or `100%`, large and bold in `--color-number`, a bold label and an optional short explanation, CKEditor: bold, italic, link, bullet list). Three cards per row at full width, two at 2/3 or 1/2, one on mobile; at full width the buttons sit right of the title. At least 1/2 |
| Team | full width only; title, text and person cards in 2, 3 or 4 columns (4 from 1168px, a full row on large screens): the chosen team members, or everyone in the Team section in its order (see [Team](#17-team)) |

The old block templates (`contentBuilder/blocks/textImage.twig`, `faq.twig`, …) are still in the repo, but the content builder no longer
offers those blocks.

**Related news on every news item.** Under the share bar, every news item shows up to three related news items by itself:
the newest in the same category first, then the newest others, never the item itself. It uses the same overview as the Overview
column: that logic and markup moved to `components/partials/overview.twig`, with explicit variables (`option`, `type`, `chosen`,
`dynamicFill`, `relatedBy`, `page`, `title`, `link`, `sizes`, …). The Overview column passes its fields to it, `pages/news/entry.twig`
fixed values; the relation is the first key under `related` for news in `config/overview-sources.php`. Outside a content row the
overview needs an `@container` around it (its cards per row are container queries) and `craft.trinity.imageSizes('full', 1).sizes`
for its images.

```twig
{% include '_site/components/partials/overview.twig' with {
    option: 'news', type: 'grid', dynamicFill: true, relatedBy: 'category', page: entry,
    title: 'news.entry.relatedTitle'|t('website_name'),
    sizes: craft.trinity.imageSizes('full', 1).sizes,
    siteSettings: siteSettings ?? null,
} only %}
```

**Related news in an Overview block.** For a related overview somewhere else (e.g. a carrousel), an Overview set to News with
"Dynamically fill" on gets one more field on a news item,
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
their own Config Values field (`relatedCalendar`, `relatedKnowledgeBase`) when an Overview column needs related items, so each editor only sees
the relations of that kind of item.

### 3. Cards

`_item/_card.twig` is now a folder of card templates, `templates/_site/components/cards/`:

- `default.twig`: an entry's card (overview image, title, description, link), or one with custom content (`cardImage`,
  `cardTitle`, `cardDescription`, `cardUrl`). A card without a URL isn't clickable.
- `news.twig`, `calendar.twig`, `knowledgeBase.twig`: `{% embed %}` the default card and fill its blocks `onImage`,
  `beforeTitle` and `afterTitle`. The news card adds category labels and the publication date; the event card category labels,
  the date and the location (see [Calendar](#15-calendar)); the knowledge base card category labels (see
  [Knowledge base](#16-knowledge-base)).

The Overview column picks the card per type; the home page and news overview use the news card. Pass `sizes` and
`srcsetSizes` (from `column.sizes`) so card images match the column.

### 4. CTAs: native Link fields instead of Hyper

Hyper is removed. The `cta` (one) and `ctas` (up to five) fields are now Matrix fields of **Link** entries. Each Link entry has
a native Craft Link field (`linkField`: entry, URL, asset, email, phone, with label, target and URL suffix) and a link style
(`linkStyle`, classes from `config/cta.php`).

```twig
{{ render_ctas(block.ctas, { class: 'mt-2', showContrast: true }) }}
```

- `render_ctas()` (`modules/statik/src/web/twig/CtaExtension.php`) replaces `render_hyper_links()`. It accepts the Matrix
  query, an array of entries or a single Link field value. The extra-classes option is now `class` (was `linkClass`).
- Each link renders through `components/cta.twig`, using Craft's `link.attributes`.
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
- `components/image.twig` works on a copy of the asset, so rendering an image twice on a page gives the same result.
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
  `components/image.twig`, `modules/statik/src/web/twig/ImageExtension.php`) loads them in one query for the image and the other images
  of its query, so a whole gallery or card grid shares one query.
- The language switcher loads the entry on all sites in one query, and the site settings are cached with their image.
- The footer's site info (address, email, phone, social links) is cached per site; the doormat navigation isn't, so it marks
  the current page. `icon()` reads and sanitizes each SVG file once per request.

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
- **reCAPTCHA from `.env`:** Formie's reCAPTCHA (v3) captcha reads `RECAPTCHA_ENABLED`, `RECAPTCHA_SITE_KEY` and
  `RECAPTCHA_SECRET_KEY`. `craft statik/setup` asks for the keys and turns it on; each form still needs the captcha on in
  its Spam settings.

### 12. Static translations use keys

Templates translate keys instead of Dutch source strings, in the `website_name` category:

```twig
{{ 'components.cards.default.readMore'|t('website_name') }}
```

The source files are `setup-translations/{en,nl-BE,fr-BE}/website_name.php`; `php craft statik/setup/install-translation-files`
copies them to `translations/`. The category was renamed from `website name` to `website_name`. Add new texts as keys to
all three files.

### 13. Content builder showcase

`php craft statik/contentbuilder` builds a page tree under **gridbuilder** that shows every column type in every layout and
combination, with every field variant. It reads the entry types at runtime, so new column types show up without code changes.
Content comes from `config/contentbuilder-showcase/content.json` (add `--dry-run` to preview). An Entries field there takes entry
URIs, `"@showcase"` (other showcase pages) or `"@section:<handle>"` (entries of a section, e.g. people, which have no URI).

Remove it before going live: `php craft statik/contentbuilder-cleanup`, then strip the `contentbuilder-showcase:start/end`
blocks from `contentBuilder/contentBuilder.twig`. The Claude skills in `.claude/skills/*contentbuilder-showcase*` describe both steps.

#### Dummy news items

`php craft statik/dummy-content/news` fills the news section with dummy items for overviews and cards: a title, a publication
date (newest first, a few days apart), a header image, an intro, one or two categories and a few content rows (a text with a
title, a text without one next to an image, a quote, a closing text), enabled on every site.

```bash
php craft statik/dummy-content/news --count=20 --categories --category-count=6
php craft statik/dummy-content/clean news --categories
php craft statik/dummy-content/calendar --count=12 --categories --category-count=6
php craft statik/dummy-content/clean calendar --categories
php craft statik/dummy-content/knowledge-base --count=12 --categories --category-count=6
php craft statik/dummy-content/clean knowledge-base --categories
php craft statik/dummy-content/team --count=8
```

`statik/dummy-content/calendar` makes events with a location, organisation, often a price and one date: the first has ended (it
isn't listed), the second is ongoing (started yesterday, ends in two days), the others follow over the coming weeks as a moment,
a few hours or a few days.

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
`DummyContentController::TYPES` (news, calendar, knowledge-base, team).

### 14. News filter and page transitions

**Filter on top or on the side.** The news overview (`templates/_site/pages/news/index.twig`) has two filter layouts, set per source
with `filterLayout` in `config/overview-sources.php`:

| `filterLayout` | Filter | Cards |
| --- | --- | --- |
| `'top'` (default) | a bar above the results: search, and a **chip** per option group (a button that opens the options, with a count and a clear button) | 3 columns |
| `'side'` | a column on the left: search and the options as a list under a heading | 2 columns |

Start with `'top'` for a search field and one or two option groups; switch to `'side'` when there are more filters or long
lists. On mobile both collapse behind the "Filter results" toggle. The filter fields are two partials that both layouts use:
`components/partials/filter/search.twig` and `components/partials/filter/options.twig`. The latter renders any option group, the page passes the data:

```twig
{% include '_site/components/partials/filter/options.twig' with {
    name: 'category',                               {# query parameter; checkboxes submit category[] #}
    label: 'news.index.categories'|t('website_name'),
    options: categories,                            {# elements (id + title) or { value, label } hashes #}
    selected: catQuery,
    layout: filterLayout,                           {# 'top' = chip, 'side' = list #}
    {# type: 'radio' for a single choice, id: prefix for the input ids #}
} %}
```

The form no longer has its own clear button: "Clear filter" next to the active filters above the results clears everything (and
resets the chips). Checkbox ids are now `category-<id>` (an id starting with a digit breaks the chip's label lookup).

**The results stay visible while the filter loads.** Before, the filter component hid the results and showed the loader; now it
only shows the loader, and on the news overview (`templates/_site/pages/news/index.twig`) that's a white, blurred overlay
(`backdrop-blur-sm`) over the current results, with a sticky spinner that stays mid-screen over a long list. Other filters with
a plain loader now show it above the old results until the new ones arrive: make it an overlay too (see the Loading States
section of the filter docs, `docs/src/frontend/components/filter.md`).

**No more jump after loading.** After new results, the filter focused its aria-live element for screen readers. That element
sits just above the scroll position, so the browser scrolled it to the middle of the screen and the page jumped back up (when
you were scrolled down). It's now focused with `preventScroll`.

**Page transitions.** `base.css` turns on cross-document view transitions (`@view-transition { navigation: auto; }`): the new
page fades in over 120ms; off with `prefers-reduced-motion`. Chrome, Edge and Safari 18.2+; other browsers navigate as before.

### 15. Calendar

A basic calendar, built after news: sections **Calendar** (`calendar`, entry type **Event**), **Calendar categories**
(`calendarCategories`, the Category entry type) and **Agenda** (`calendarOverview`, the overview page: `/nl/agenda`, `/fr/agenda`,
`/en/calendar`). Templates: `templates/_site/pages/calendar/index.twig` and `entry.twig`.

**An event** has the tabs of a news item (header image, intro, content builder, Overview, SEO, Site search) and:

| Field | Handle | |
| --- | --- | --- |
| Dates | `eventDates` | Matrix with exactly 1 **Date** block (`eventDate`): **Start date** (`startDate`, date + time, required) and **End date** (`endDate`, optional: without one the event is one moment). The field can allow more blocks later (several performances); each upcoming block is a card on the overview. |
| Location, Organisation, Price | `location`, `organisation`, `price` | plain text, optional, translatable per site |
| Event category | `eventCategory` | Entries field, calendar categories |
| Related events | `relatedEvents` | tab Related events: up to 3 chosen events |
| Fill up related events | `relatedFill` | lightswitch, on by default |

**Upcoming.** An event is upcoming until it ends: its end date, or its start date when it has no end. The calendar overview lists
the upcoming date blocks, soonest first, 9 per page, with search and a category filter (the filter partials, `filterLayout`
'top'). `modules/statik/src/helpers/Calendar.php` holds the rule (SQL on the date fields' values: Craft's field params can't say
"end, or else start"); templates use it through `craft.statik`:

| `craft.statik.…` | |
| --- | --- |
| `upcomingEventDates(eventsQuery = all)` | the upcoming date blocks of these events, soonest first: an element query (paginate it, `.with(['owner'])`) |
| `upcomingEvents(eventsQuery = all, limit = 3, exclude = [])` | the events that haven't ended, by their next date |
| `isUpcomingEvent(event)` | whether the event has a date that hasn't ended |
| `nextEventDate(event)` | the date block to show: the next upcoming one, else the last one |

**The event card** (`components/cards/calendar.twig`): image, the event category as a label (as on news cards), title, date and location
with icons; no description (`showDescription: false`, a new option of the default card). `components/eventDate.twig` formats a date
block: a moment (`03.11.2026 · 19:30`), one day (`10.11.2026 · 19:00 – 23:00`) or several days. Formats: `components.eventDate.dateFormat`,
`components.eventDate.timeFormat`.

**The event page**: the date(s), location, price and organisation with icons in the header, the content builder, the share bar
and **related events** (the overview partial): the chosen ones that haven't ended, filled up (unless the lightswitch is off) with
upcoming events in the same category, then the soonest upcoming. It's cached for an hour, so ended events drop out on their own.

**Overviews of events**: the calendar source in `config/overview-sources.php` has `fill: 'upcoming'`: the Overview column's
"Calendar" option (its field now picks events) and related events only show events that haven't ended, the fill takes the
soonest upcoming. An Overview column with related events needs a Config Values field `relatedCalendar` (see the comment there).

**URLs follow the overview's slug.** News items and events use the slug of their overview in the same site
(`{{craft.entries.section('newsOverview').siteId(object.siteId)…slug}}/{slug}`; before, every site used the primary site's slug),
the overviews use their own slug (`{slug}`). When an overview's slug changes, the module queues a resave of its items in that
site (`Statik::OVERVIEW_ITEM_SECTIONS`), so their URLs follow.

New icons: `calendar`, `location`, `price`, `organisation` (Material Symbols, like the others). New translations: `calendar.*`.

### 16. Knowledge base

A placeholder for a knowledge base, projects, publications, …: an overview with search and a category filter, built after news.
A project renames the labels and slugs (e.g. "Projects"), the handles stay `knowledgeBase`. Sections: **Knowledge base**
(`knowledgeBase`, entry type **Knowledge base item**), **Knowledge base categories** (`knowledgeBaseCategories`, the Category entry
type) and the overview **Kennisbank** (`knowledgeBaseOverview`: `/nl/kennisbank`, `/fr/base-de-connaissances`,
`/en/knowledge-base`). Templates: `templates/_site/pages/knowledgeBase/index.twig` and `entry.twig`.

**An item** has the tabs of a news item (header image, intro, **Knowledge base category** `knowledgeBaseCategory`, content
builder, Overview, SEO, Site search) and a tab **Related items**: *Related items* (`relatedKnowledgeBaseItems`, up to 3) and
*Fill up related items* (the calendar's `relatedFill` lightswitch, with its own label and instructions in this layout).

- **Overview**: newest first (date added), 9 per page, search and the category chip on top (`filterLayout` 'top').
- **Card** (`components/cards/knowledgeBase.twig`): image, category labels (as on news cards), title and intro; no date.
- **Item page**: like a news item without the date; "Share this page"; related items under the share bar: the chosen ones, filled
  up (unless the lightswitch is off) with the newest items in the same category, then the newest.
- The Overview column's "Knowledge Base" option picks these items (its field pointed at news). URLs follow the overview's slug
  per site, like news and the calendar (`Statik::OVERVIEW_ITEM_SECTIONS`).
- Translations: `knowledgeBase.entry.relatedTitle`, `knowledgeBase.entry.shareThisItem`; the overview reuses the general filter
  texts (`news.index.*`).

### 17. Team

People for team pages, contact persons, …: a **Team** section (`team`, a one-level structure: order by dragging; people have no
URL) with entry type **Person**. The title is generated from first and last name (`{firstName} {lastName}`).

| Field | Handle | |
| --- | --- | --- |
| First name, Last name | `firstName`, `lastName` | required, the same in every language |
| Photo | `photo` | one image, optional (uploads to Public Files) |
| Job title | `jobTitle` | optional, translatable per language |
| Email address | `email` | Email field, optional |
| Phone number | `phoneNumber` | optional, typed as you like: the site formats it with the `tel` filter |

**Two column types** show them (both in the Grid cells Matrix):

- **Person** (`cellPerson`, group General): *Person*, exactly one. At most 1/2 of the page (`maxWidthPerType`). At half the page
  the card is horizontal: photo left (2/5), details right, from 448px of the column (stacked below that, e.g. on mobile).
- **Team** (`cellTeam`, group Dynamic data, under Overview): *Title (Anchor)*, *Text*, *Columns* (`teamColumns`: 2, 3 or 4; 4 per row from `@xl`, 1168px) and
  *Team members* (`teamMembers`, 0 to all). Always full width (`minWidthPerType`). Chosen members show in that order; none chosen =
  everyone in the Team section in the order of its structure. With 2 columns the cards are horizontal (each card is its own
  `@container`), with 3 they're stacked.

**The person card** (`components/cards/person.twig`, not built on the default card: people have no page): photo (square), name, job
title, email (through `obfuscate_emails`: the address is encoded in the HTML) and phone (`tel`: `016 12 34 56` → `+32 16 12 34 56`),
each only when filled in. Without a photo the Person column's card starts with the name; in the team overview a neutral
silhouette takes the photo's place (`photoFallback`, icon `person-silhouette`, colours `--color-person-fallback-bg` / `-icon` in
`theme.css`), so the cards in a row stay alike.

**Image sizes.** The macros for responsive image sizes moved out of the image gallery into `macros/imageSizes.twig`
(`itemSizes()`, was `gallerySizes()`, and `srcsetSizes()`), shared by the image gallery, the Overview column and the person
cards: `{% import '_site/macros/imageSizes.twig' as imageSizes %}`.

Dummy people: `php craft statik/dummy-content/team --count=8` (some without a photo, email or phone). The showcase fills the
Person and Team columns with them: in `config/contentbuilder-showcase/content.json` an Entries field can take
`"@section:<handle>"` (entries of that section, starting one further per use on a page, so the columns show different people).

### 18. Partners

Partner logos: a **Partners** section (`partners`, a one-level structure: order by dragging; partners have no URL) with entry
type **Partner**: *Name* (the title), *Logo* (`logo`, one image; SVG is shown as is, other formats scaled to at most 600px wide)
and *Website* (`website`, a Link field, optional).

**The Partners column type** (`cellPartners`, group Dynamic data): *Title (Anchor)*, *Text*, *Partners* (0 to all) and *Partners
type* (`partnersType`): Grid or Carrousel. Chosen
partners show in that order; none chosen = every partner in the section in the order of its structure. A logo with a website
links to it in a new window (with a hidden "(opens in a new window)", key `contentBuilder.columns.partners.newWindow`).

- At least 1/2 of the page (`minWidthPerType`) and at most once per row (`blockedCombinations`: `['cellPartners', 'cellPartners']`).
- Logos per row follow the column's width: 2 at 1/2, 4 at 2/3, 8 at full width, fewer while the column is narrower (container
  queries). The tiles have a fixed height, so a logo looks the same size whatever the number of columns.
- **Carrousel:** the same number of logos in view, the rest to slide through, with the Overview's controls (previous, bullets,
  next) and the logos next to the view at half opacity.

The three carrousels (Image gallery, Overview, Partners) share their controls, `components/partials/carrouselControls.twig`. A slide is
dimmed when it isn't fully in view: the `is-in-view` class from `swiper.component.ts`, which allows 1px, because Swiper's own
`swiper-slide-fully-visible` dimmed a slide of 181.5px that ended exactly at the edge.

Dummy partners: `php craft statik/dummy-content/partners --count=8` (generated SVG logos in five shapes, from square to wide;
some without a website). In the showcase an Entries field can also take `{"section": "partners", "counts": [10, 6, 3, 1, 0]}`:
the number of entries per use, so the columns show different amounts (0 = the "show all" fallback).

### 19. Page header and hero

One template renders every page header: `components/pageHeader/pageHeader.twig`. It reads no fields itself; the two presets pass
the data and their look:

- **`default`** (content pages, news, calendar, knowledge base, account pages, …): the entry's title, intro and header
  image; breadcrumb; the image in the container on the right, on the light background.
- **`hero`** (home page): the **Hero** content block; no breadcrumb.

Everything one can do, the other can too: pass the variables with the include, or embed to fill a slot.

```twig
{% include '_site/components/pageHeader/default.twig' with { headerTextWidth: 'full', showBreadcrumb: false } %}

{% embed '_site/components/pageHeader/default.twig' %}
    {% block afterTitle %}<p>{{ entry.postDate|date }}</p>{% endblock %}
{% endembed %}
```

| Variable | Values (default first) | |
| --- | --- | --- |
| `headerTitle` | | required: without a title nothing is rendered |
| `headerIntro` | | optional; `false` = none |
| `headerImage` | asset or null | |
| `headerCtas` | list of CTAs | default the entry's `ctas` field (when it has one); rendered under the intro |
| `showBreadcrumb` | `true`, `false` | `hero`: `false` |
| `headerVariant` | `overlay`, `panel`, `split` | the image behind the text (darkened), behind a text box, or next to the text |
| `headerSide` | `left`, `right` | the half with the text |
| `headerHeight` | `auto`, `medium`, `full` | at least 60svh / 100svh |
| `headerAlign` | `center`, `top`, `bottom` | the text's place when the header is higher than the text |
| `headerOverlay` | `flat`, `gradient` | overlay only: dark everywhere, or only on the text's side |
| `headerImageWidth` | `full`, `container` | to the screen's edges, or in the container with rounded corners |
| `headerTextWidth` | `half`, `wide`, `full` | the text's width without an image: 1/2, 3/4 or the container |
| `headerSectionClass` | | extra classes, e.g. `section--light` so a light row below joins it |

`default` sets `split`, `container`, `top`, `wide` and `section--light`; `hero` keeps the names `heroVariant`, `heroSide`,
`heroHeight`, `heroAlign`, `heroOverlay` and `heroImageWidth`.

**Slots** (Twig blocks): `afterBreadcrumb`, `beforeTitle`, `afterTitle`, `afterIntro` (between the intro and the CTAs),
`afterCtas`, and `imageSlot`: your own content in the image's place when there is no image. `headerText` still replaces the
whole text column. Content in the slots gets the header's text colour. The news date, the event details and the search query
are in `afterTitle` now.

**The Hero field is a Content Block** (Craft 5.11) instead of a Matrix field with one "Hero" entry: *Title* (`heading`, a
content block has a `title` of its own), *Image*, *Intro* and *CTAs*, read as `entry.hero.heading`, `entry.hero.image`, …
The hero image is an `<img>` with `object-cover` and the focal point, loaded eagerly with `fetchpriority="high"` (new
`render_image()` options `loading` and `fetchPriority`). Colours, spacing and heights are the Hero tokens in `theme.css`
(`--color-hero-*`, `--spacing-hero-*`, `--radius-hero-*`, `--height-hero-*`).

- **Split image in the container** is at least `--height-hero-split-image` (400px) high from md, so a short text doesn't make
  a thin strip of image.
- **Image sizes:** the srcset only lists widths up to the original's width (no upscaling) and leaves out 1200px versions on
  phones; `sizes` is only set where the layout needs it.
- **News:** a news item's header has its image to the screen's edges; the news overview uses the default header.

> **Upgrading an existing site:** applying the project config replaces the Matrix field by the Content Block, and the hero
> content in the old field is lost. Note the hero's title, image, intro and CTAs per site first and enter them again.

### 20. Code guidelines

`GUIDELINES.MD` (repo root) holds the agreed naming and backend rules, from the Confluence page "Voorstellen code
guidelines" (only its approved parts):

1. **Naming structure:** labels are "content (type)" (`Overview image`, `Hero image`), handles content + type
   (`overviewImage`, not `imageOverview`).
2. **Spacing and casing:** lowerCamelCase handles, templates and folders; sentence case for labels, fields, entry types and
   sections (`News overview`, keeping `SEO`, `CTA`, `CKEditor`, …); no hyphens or dashes between words (`GTM body`), a space
   after a comma.
3. **Language:** everything in English; field names, labels, section names and instructions have a translation for every
   non-English site language, in `translations/<language>/site.php` of the general language (`nl`, `fr`, not `nl-BE`):
   that's where the control panel looks, and an `nl-BE` site falls back to it.
4. **Backend display:** view modes for Entries, Users and Matrix fields (cards only when the card shows more than the title,
   blocks for the content builder), card thumbnails aligned right, and a **Content Block** instead of a single-entry Matrix.
5. **Template folder structure** and 6. **Front-end translations** came with the new template folders: see
   [Template folder structure](#22-template-folder-structure).

The base install follows them now: names and labels in sentence case (`Call to action`, `Intro text`, `Background color`,
`CKEditor standard`, `Link style`, …), about 190 control panel translations per language, and these handles renamed:

| Was | Now |
| --- | --- |
| `writer` (Author field of the quote) | `authorName` |
| `ctaFieldLinkLayouts` (Link style) | `linkStyle` |
| `embed` (Text + embed entry type) | `textEmbed` |

The Overview's "Button position" field is now *Link position* (handle `linkPosition`, unchanged).

`translations/` is gitignored in the base install, so the tracked copies are `setup-translations/nl/site.php` and
`setup-translations/fr/site.php`; `craft statik/setup` copies them into `translations/`. Add new labels to both.

**Check your work** with the `checking-code-guidelines` skill ("check my work against the code guidelines"): it asks which
guideline parts and which part of the project (branch diff or the whole project), reports the findings with a suggested fix
and applies the ones you approve, translation updates included. Renames on a live project come with a warning first.

### 21. Figma kit and theme export

A Figma starter mirrors the base install: every column type and page part as a component with the same options, the theme
tokens as variables (named as in `theme.css`, with Breakpoint and Theme modes), and test pages. Duplicate it to start a
wireframe or a design. Each component has a green **Rectangle** annotation listing its options in the CMS; the categories
*Rectangle Change* (orange) and *Custom component* (red) mark designs that need a change to the base install or a component
of their own.

`tooling/figma-theme/` turns a design's variables back into code:

- **Theme export plugin** (`plugin/manifest.json`, import it in the Figma desktop app): exports the variables that have a CSS
  name (WEB code syntax) as JSON.
- **`apply-theme.mjs`** applies that JSON to `frontend/css/site/theme.css`; a dry run by default, `--write` to save,
  `--add-missing` for tokens theme.css doesn't have yet. Figma's values win; spacing becomes `--spacing(n)`, Breakpoint
  variables are written mobile first with `@variant md` / `lg` overrides, fonts keep their fallback, and values Figma only
  approximates are skipped.

```bash
node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json          # dry run
node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json --write
```

The `exporting-figma-theme` skill lets Claude do the export through the Figma connection, without the plugin.

### 22. Template folder structure

The templates in `templates/_site/` are sorted by role, so every template has one obvious place, and nothing inside `_site/`
has a `_` prefix any more (`_site` itself keeps it, so its templates can't be browsed to directly):

| Folder | What goes in it |
| --- | --- |
| `layout.twig` | The base layout (was `_layout.twig`) |
| `pages/` | The templates sections point to: a file per single, a folder with `index.twig` and `entry.twig` per section with entries |
| `contentBuilder/` | The loop (`contentBuilder.twig`), the content row (`gridRow.twig`), `blocks/` and `columns/` |
| `components/` | Reusable parts: `cta`, `image`, `pagination`, `search`, …, and the groups `frame/` (header, footer, flyout, `nav/`), `pageHeader/`, `cards/` and `partials/` |
| `macros/` | Twig macros |

Good to know:

- **Section templates** point into `pages/` and have no `.twig`: `_site/pages/news/entry`. `_contentPage` is now
  `pages/page`, `index` is `pages/home` and `_searchResults` is `pages/search`.
- **The content row** (`gridRow`) is a block of the content builder field, but its template sits directly in
  `contentBuilder/`, not in `blocks/`: the loop includes `_site/contentBuilder/gridRow.twig` for it and
  `_site/contentBuilder/blocks/<handle>.twig` for every other block. Columns are `contentBuilder/columns/<type>.twig` (the column type
  handle without `cell`), cards `components/cards/<card>.twig`.
- **One name per thing.** The image component, the image column and the image block no longer share `_image.twig`:
  `components/image.twig`, `contentBuilder/columns/image.twig`, `contentBuilder/blocks/image.twig`. The template behind
  `render_pagination()` is `components/pagination.twig` (was `_paginate.twig`); the function keeps its name.
- **Every template reference names the file with `.twig`** (`{% include '_site/components/cta.twig' %}`), so a search for a
  path finds every place it's used. Only a section's template setting has none.
- **The rules** are in `GUIDELINES.MD` §5. The `checking-code-guidelines` skill checks them (rules S1–S6, asked as a separate
  question), and its casing rule C2 now flags a `_` prefix inside `_site/`.

**The translation keys follow the new paths.** A key starts with the template's place (GUIDELINES.MD §6), so 96 of the
134 keys in `website_name.php` were renamed with it:

| Was | Now |
| --- | --- |
| `account.editPassword.*`, `account.passwordRequestReset.*`, `account.passwordSet.*` | `account.password.edit.*`, `account.password.requestReset.*`, `account.password.set.*` |
| `account.register.*` | `account.registration.register.*` |
| `global.header.*`, `global.footer.*`, `global.flyout.*` | `components.frame.header.*`, `components.frame.footer.*`, `components.frame.flyout.*` |
| `nav.breadcrumb.*`, `nav.flyout.*` | `components.frame.nav.breadcrumb.*`, `components.frame.nav.flyout.*` |
| `global.paginate.*`, `global.search.*` | `components.pagination.*`, `components.search.*` |
| `content.socialMedia.*`, `content.socialShare.*` | `components.socialMedia.*`, `components.socialShare.*` |
| `content.carrousel.*` | `components.partials.carrouselControls.*` |
| `item.card.*` | `components.cards.default.*` |
| `item.link.newWindow` | `contentBuilder.columns.partners.newWindow` |
| `contentbuilder.image.*`, `contentbuilder.video.*`, `contentbuilder.textTable.swipe` (shared by a block and its column) | `contentBuilder.columns.image.*`, `contentBuilder.columns.video.*`, `contentBuilder.columns.table.swipe` |
| `contentbuilder.textVideo.*` | `contentBuilder.blocks.textVideo.*` |
| `contentbuilder.rowHeading.*` | `contentBuilder.rowHeading.*` |
| `calendar.dateFormat`, `calendar.timeFormat` | `components.eventDate.dateFormat`, `components.eventDate.timeFormat` |
| `news.index.search`, `searchPlaceholder`, `searchTitle`; `news.index.removeFilter` | `components.partials.filter.search.*`; `components.partials.filter.clearButton.removeFilter` |
| `searchResults.*` | `search.*` |

The other keys (`account.edit`, `login`, `profile`, `news.*`, `calendar.entry.*`, `calendar.index.*`, `knowledgeBase.*`,
`overview.heading.*`, `layout.*`, `contact.*`) stay as they are. The `news.index.*` keys that the news, calendar and knowledge
base overviews share keep their name (GUIDELINES.MD §6: a shared text keeps one key). Run `php craft statik/setup/install-translation-files` (or copy
`setup-translations/`) so your local `translations/` has the new keys.

**Existing projects are not migrated.** Projects started from the base install before this release keep the old
`_site/_snippet/…` structure and the old translation keys. Use the table below to find where a template went when you port a change by hand. A Clint
update that changes a template must still use the old path, and the old keys, for those projects.

<details>
<summary>Every template: old → new path (85)</summary>

| Was | Now |
| --- | --- |
| `_site/_layout.twig` | `_site/layout.twig` |
| `_site/_account/_edit.twig` | `_site/pages/account/edit.twig` |
| `_site/_account/_editPassword.twig` | `_site/pages/account/password/edit.twig` |
| `_site/_account/_login.twig` | `_site/pages/account/login.twig` |
| `_site/_account/_passwordRequestReset.twig` | `_site/pages/account/password/requestReset.twig` |
| `_site/_account/_passwordRequestResetConfirmation.twig` | `_site/pages/account/password/requestResetConfirmation.twig` |
| `_site/_account/_passwordSet.twig` | `_site/pages/account/password/set.twig` |
| `_site/_account/_passwordSetConfirmation.twig` | `_site/pages/account/password/setConfirmation.twig` |
| `_site/_account/_profile.twig` | `_site/pages/account/profile.twig` |
| `_site/_account/_register.twig` | `_site/pages/account/registration/register.twig` |
| `_site/_account/_registrationCompleted.twig` | `_site/pages/account/registration/completed.twig` |
| `_site/_account/_registrationConfirmation.twig` | `_site/pages/account/registration/confirmation.twig` |
| `_site/_calendar/_entry.twig` | `_site/pages/calendar/entry.twig` |
| `_site/_calendar/_index.twig` | `_site/pages/calendar/index.twig` |
| `_site/_contact.twig` | `_site/pages/contact.twig` |
| `_site/index.twig` | `_site/pages/home.twig` |
| `_site/_knowledgeBase/_entry.twig` | `_site/pages/knowledgeBase/entry.twig` |
| `_site/_knowledgeBase/_index.twig` | `_site/pages/knowledgeBase/index.twig` |
| `_site/_news/_entry.twig` | `_site/pages/news/entry.twig` |
| `_site/_news/_index.twig` | `_site/pages/news/index.twig` |
| `_site/_contentPage.twig` | `_site/pages/page.twig` |
| `_site/_searchResults.twig` | `_site/pages/search.twig` |
| `_site/_snippet/_content/_blocks/_callToAction.twig` | `_site/contentBuilder/blocks/callToAction.twig` |
| `_site/_snippet/_content/_blocks/_faq.twig` | `_site/contentBuilder/blocks/faq.twig` |
| `_site/_snippet/_content/_blocks/_form.twig` | `_site/contentBuilder/blocks/form.twig` |
| `_site/_snippet/_content/_blocks/_image.twig` | `_site/contentBuilder/blocks/image.twig` |
| `_site/_snippet/_content/_blocks/_overview.twig` | `_site/contentBuilder/blocks/overview.twig` |
| `_site/_snippet/_content/_blocks/_quote.twig` | `_site/contentBuilder/blocks/quote.twig` |
| `_site/_snippet/_content/_blocks/_textColumns.twig` | `_site/contentBuilder/blocks/textColumns.twig` |
| `_site/_snippet/_content/_blocks/_textEmbed.twig` | `_site/contentBuilder/blocks/textEmbed.twig` |
| `_site/_snippet/_content/_blocks/_textImage.twig` | `_site/contentBuilder/blocks/textImage.twig` |
| `_site/_snippet/_content/_blocks/_textTable.twig` | `_site/contentBuilder/blocks/textTable.twig` |
| `_site/_snippet/_content/_blocks/_textVideo.twig` | `_site/contentBuilder/blocks/textVideo.twig` |
| `_site/_snippet/_content/_blocks/_video.twig` | `_site/contentBuilder/blocks/video.twig` |
| `_site/_snippet/_content/_grid/_callToAction.twig` | `_site/contentBuilder/columns/callToAction.twig` |
| `_site/_snippet/_content/_grid/_card.twig` | `_site/contentBuilder/columns/card.twig` |
| `_site/_snippet/_content/_grid/_embed.twig` | `_site/contentBuilder/columns/embed.twig` |
| `_site/_snippet/_content/_grid/_faq.twig` | `_site/contentBuilder/columns/faq.twig` |
| `_site/_snippet/_content/_grid/_form.twig` | `_site/contentBuilder/columns/form.twig` |
| `_site/_snippet/_content/_grid/_image.twig` | `_site/contentBuilder/columns/image.twig` |
| `_site/_snippet/_content/_grid/_imageGallery.twig` | `_site/contentBuilder/columns/imageGallery.twig` |
| `_site/_snippet/_content/_grid/_numbers.twig` | `_site/contentBuilder/columns/numbers.twig` |
| `_site/_snippet/_content/_grid/_overview.twig` | `_site/contentBuilder/columns/overview.twig` |
| `_site/_snippet/_content/_grid/_partners.twig` | `_site/contentBuilder/columns/partners.twig` |
| `_site/_snippet/_content/_grid/_person.twig` | `_site/contentBuilder/columns/person.twig` |
| `_site/_snippet/_content/_grid/_quote.twig` | `_site/contentBuilder/columns/quote.twig` |
| `_site/_snippet/_content/_grid/_table.twig` | `_site/contentBuilder/columns/table.twig` |
| `_site/_snippet/_content/_grid/_team.twig` | `_site/contentBuilder/columns/team.twig` |
| `_site/_snippet/_content/_grid/_text.twig` | `_site/contentBuilder/columns/text.twig` |
| `_site/_snippet/_content/_grid/_video.twig` | `_site/contentBuilder/columns/video.twig` |
| `_site/_snippet/_content/_contentBuilder.twig` | `_site/contentBuilder/contentBuilder.twig` |
| `_site/_snippet/_content/_blocks/_gridRow.twig` | `_site/contentBuilder/gridRow.twig` |
| `_site/_snippet/_global/_cta.twig` | `_site/components/cta.twig` |
| `_site/_snippet/_item/_eventDate.twig` | `_site/components/eventDate.twig` |
| `_site/_snippet/_global/_image.twig` | `_site/components/image.twig` |
| `_site/_snippet/_item/_loader.twig` | `_site/components/loader.twig` |
| `_site/_snippet/_global/_paginate.twig` | `_site/components/pagination.twig` |
| `_site/_snippet/_global/_search.twig` | `_site/components/search.twig` |
| `_site/_snippet/_content/_socialMedia.twig` | `_site/components/socialMedia.twig` |
| `_site/_snippet/_content/_socialShare.twig` | `_site/components/socialShare.twig` |
| `_site/_snippet/_global/_flyout.twig` | `_site/components/frame/flyout.twig` |
| `_site/_snippet/_global/_footer.twig` | `_site/components/frame/footer.twig` |
| `_site/_snippet/_global/_header.twig` | `_site/components/frame/header.twig` |
| `_site/_snippet/_nav/_breadcrumb.twig` | `_site/components/frame/nav/breadcrumb.twig` |
| `_site/_snippet/_nav/_doormat.twig` | `_site/components/frame/nav/doormat.twig` |
| `_site/_snippet/_nav/_flyout.twig` | `_site/components/frame/nav/flyout.twig` |
| `_site/_snippet/_nav/_language.twig` | `_site/components/frame/nav/language.twig` |
| `_site/_snippet/_nav/_main.twig` | `_site/components/frame/nav/main.twig` |
| `_site/_snippet/_nav/_service.twig` | `_site/components/frame/nav/service.twig` |
| `_site/_snippet/_content/_defaultHeader.twig` | `_site/components/pageHeader/default.twig` |
| `_site/_snippet/_content/_hero.twig` | `_site/components/pageHeader/hero.twig` |
| `_site/_snippet/_content/_pageHeader.twig` | `_site/components/pageHeader/pageHeader.twig` |
| `_site/_snippet/_item/_cards/_calendar.twig` | `_site/components/cards/calendar.twig` |
| `_site/_snippet/_item/_cards/_default.twig` | `_site/components/cards/default.twig` |
| `_site/_snippet/_item/_cards/_knowledgeBase.twig` | `_site/components/cards/knowledgeBase.twig` |
| `_site/_snippet/_item/_cards/_news.twig` | `_site/components/cards/news.twig` |
| `_site/_snippet/_item/_cards/_person.twig` | `_site/components/cards/person.twig` |
| `_site/_snippet/_content/_partials/_carrouselControls.twig` | `_site/components/partials/carrouselControls.twig` |
| `_site/_snippet/_content/_partials/_filterClearBtn.twig` | `_site/components/partials/filter/clearButton.twig` |
| `_site/_snippet/_content/_partials/_filterOptions.twig` | `_site/components/partials/filter/options.twig` |
| `_site/_snippet/_content/_partials/_filterSearch.twig` | `_site/components/partials/filter/search.twig` |
| `_site/_snippet/_content/_grid/_partials/_galleryImage.twig` | `_site/components/partials/galleryImage.twig` |
| `_site/_snippet/_content/_partials/_overview.twig` | `_site/components/partials/overview.twig` |
| `_site/_snippet/_content/_partials/_textColumn.twig` | `_site/components/partials/textColumn.twig` |
| `_site/_snippet/_macros/_imageSizes.twig` | `_site/macros/imageSizes.twig` |

</details>

### 23. Heading order

The page header is the only h1, column titles are h2, cards are h3, and editors pick h3–h5 in their text. Around that:

- **Show title** next to the title of the Text, Numbers, Call to action, FAQ, Overview, Team and Partners columns. Off, the
  title is only read by screen readers (`sr-only`); it doesn't count for *Spacing above* → *Auto*. In templates:
  `craft.statik.showsTitle(cell)` and `hideTitle` on `components/partials/textColumn.twig` and `overview.twig`.
- **A hidden h2 above a row of cards** (Overview, Card, Person, Team) that has no title before its cards, when it's the first
  h2 on the page or starts a new part (another background, more spacing above). Its text is the `heading` of the source in
  `config/overview-sources.php`, or `rowHeadings` in `config/custom.php`: translation keys in `website_name`.
  `craft.statik.rowHeading(entry, row)` returns it.
- **The Text column uses CKEditor extended** (h3–h5), and every heading shows its level as a badge in the editor.
- **The filter** on the news, calendar and knowledge base overview pages starts with a hidden h2; its group titles are h2.
- **A check on publishing** looks at the editor's own headings: one level deeper at most, no h1. `headingCheck` in
  `config/custom.php`: `'block'` (the base install's setting: not saved, the row and the column's card turn red),
  `'warn'` (a warning after saving) or `false`; `headingCheckFields` lists the fields. The message names the row, the column
  and the fix.
- **`craft statik/headings`** (`--section=<handle>`) lists the entries that fail today; on a project with existing content, run it before using `'block'`.
- **Heading issues dashboard widget:** the pages with issues, with a link to edit each one. The list is cached and updated
  when a page is saved or deleted; `craft statik/headings` rebuilds it.

### 24. Removed and replaced

| Removed | Replaced by |
| --- | --- |
| Separate content builder blocks (Text + Image, FAQ, CTA, …) | Content rows with column types |
| `customTable`, `textTwoColumns` blocks | the Table column type; text columns are a content row with 2 or 3 Text columns |
| "Page with sidebar" entry type | `pageWidths` in `config/trinity.php` (commented example) |
| `verbb/hyper`, `render_hyper_links()`, `_hyperCta.twig` | Link entries, `render_ctas()`, `components/cta.twig` |
| `linkClass` option of the CTA function | `class` |
| Module AnchorLink field, `SlugifyController`, `\|slugify` heading ids | Entry Anchors plugin, `anchor_id()` |
| `miranj/craft-obfuscator`, `enkode_emails` | `obfuscate_emails` |
| `_item/_card.twig` | `components/cards/default.twig` (+ per type) |
| WebP sources in `render_image()` | AVIF + original format |
| `data-*-after`, `data-close-position`; replacing `data-*-style` | Component CSS; `data-*-style` adds classes |
| `.fui-form` JS selector, `fui-*` classes | `[data-fui-form]`, global form styles |
| Dutch source strings in `site.php` for the front end | `website_name.php` with keys (`site.php` now holds control panel translations) |
| "Primary" section background | default and light |
| Hero Matrix field with the `heroBlock` entry type | the Hero Content Block field |
| `_defaultHeader` markup, its `extraContent` block; `_pageTitle`, `_intro` in the header | `components/pageHeader/pageHeader` with presets and slots (`afterCtas`, …) |
| Handles `writer`, `ctaFieldLinkLayouts`, `embed` (entry type) | `authorName`, `linkStyle`, `textEmbed` (see [Code guidelines](#20-code-guidelines)) |
| Table Maker plugin (no field used it any more) | the Table column type (a CKEditor table) |
| `ALGOLIA_*` variables in `.env.example` | – |

### 25. Plugins

- **New:** `statikbe/craft-trinity` (content rows), `statikbe/craft-entry-anchors` (anchors),
  `giggsey/libphonenumber-for-php` (phone numbers).
- **Removed:** `verbb/hyper`, `miranj/craft-obfuscator`, `verbb/tablemaker`.
- Craft 5.11, CKEditor 5.9, Trinity 1.3.2; Config Values 5.4 accepts CSS variables as colours.
