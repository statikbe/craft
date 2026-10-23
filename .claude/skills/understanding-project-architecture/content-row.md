# Content Row — Content Builder Block with Columns

The **Content row** block (`gridRow`) is a content builder block with a 1–3 column layout and one column type (a "cell") per column. It sits next to the other blocks in the `contentBuilder` Matrix field. It's built from native Craft fields only. The rules, validation, field conditions and the control panel layer come from the **Trinity** plugin (`statikbe/craft-trinity`); this project owns the entry types, templates and CSS.

**Read the plugin README first:** `vendor/statikbe/craft-trinity/README.md` (content model contract, every setting, `craft.trinity.row()`, conditions, control panel, events). This file covers what is specific to this project.

## How it is built here

| Part | Where |
|---|---|
| Row entry type | `gridRow`: `gridLayout` (button group: `full`, `halves`, `thirds`, `thirdTwoThirds`, `twoThirdsThird`), `gridAlignment` (top/center/bottom), `gridCells`, `backgroundColor` |
| Columns | `gridCells` — Matrix in cards-grid view, max 3 entries, one per column from left to right |
| Column types | `cellText`, `cellImage`, `cellImageGallery`, `cellQuote`, `cellVideo`, `cellTable`, `cellCard`, `cellPerson`, `cellNumbers`, `cellForm`, `cellFaq`, `cellEmbed`, `cellCallToAction`, `cellOverview`, `cellTeam`, `cellPartners` (named "Cell – …", shown without the prefix in the field), each with `mobileOrder` on a separate "Mobile" tab |
| Settings | `config/trinity.php` (`pageWidths` empty, `narrowFromViewport`, `minWidthPerType`, `maxWidthPerType`, `blockedCombinations`); the handles are Trinity's defaults |
| Rules, validation, conditions, CP layer | The Trinity plugin. Check the setup with `ddev craft trinity/doctor` |
| Front end | `_site/_snippet/_content/_blocks/_gridRow.twig` (row markup from `craft.trinity.row(block)`) → one template per column type in `_site/_snippet/_content/_grid/_<type>.twig` |
| Layout icons | `@statikbe/trinity/icons/layouts/<layout>.svg` on `gridLayout` |
| Showcase | `ddev craft statik/contentbuilder` → its own page tree under `gridbuilder`: a page per column type linking to a page per pair of column types, plus `layouts`, `two-thirds-page` and `three-quarters-page` (see the `updating-contentbuilder-showcase` skill). The 2/3 and 3/4 showcase pages get their width through Trinity's page width events (`Statik.php`). |

**Page widths:** no page renders the content builder narrower than the page now (a "Page with sidebar" entry type was removed after testing). To add one, e.g. a sidebar page, list its entry type or section in `pageWidths` (`'pageWithSidebar' => 2 / 3`) and set `narrowFromViewport` to the breakpoint where the sidebar appears (980px = `lg:`); the 2/3 and 3/4 showcase pages already render at those widths from `lg:`. On a 2/3 page only `full` and `halves` can be used (1/3 columns would be 2/9 of the page). Types with a `minWidthPerType` of 1/2 (cards, table, FAQ, embed, form) only fit full rows and the 1/2 column of 1/3 + 2/3 on a 3/4 page. Call to action (`cellCallToAction`, a copy of the content builder's Call To Action block) has a minimum of 1: only full rows, and not on 2/3 or 3/4 pages.

**When columns sit side by side:** from `--container-cols-2: 560px` (`@cols-2:`, halves) and `--container-cols-3: 864px` (`@cols-3:`, rows with a 1/3 column) in `frontend/css/site/main.css`, measured on the row itself. These equal `grid.breakpoint` with Trinity's `columnMinWidth` 256 and `columnGap` 48 (`--spacing-column`); change them together. Keep them plain px: Tailwind silently drops the `@…:` variants of a `calc()` container size. Rows with a background colour have section padding, so they are 64px narrower than the builder (on a 2/3 page at 980–1199px: 552px, so halves stack there while rows without a background don't). Trinity's `containers` setting mirrors the `--container-*` widths in `main.css` for image sizes.

**Styling hooks** (`_gridRow.twig`): `[data-row-layout="halves"]`, `[data-row-cells="text image"]` (exact combination, source order), `[data-row-cells~="video"]` (contains a type), and per column `[data-cell="quote"]`, e.g. `[data-cell="text"]:has(+ [data-cell="image"])`.

**A second content builder on one entry:** Craft allows a Matrix field only once per field layout, so a second builder (e.g. a sidebar) is a second Matrix field that offers the same `gridRow` entry type. Trinity recognises rows by entry type, so it needs no extra setup; give the builder its own width with `pageWidths.fields` (`'sidebarBuilder' => 1 / 3`, keyed by the handle in the field layout; a field wins over an entry type and section) and render it with `{% include '_site/_snippet/_content/_contentBuilder' with { field: 'sidebarBuilder', settings: … } %}` (`field` defaults to `contentBuilder`). In templates, `craft.trinity.row(row)` uses the row's own field; `craft.trinity.pageWidth(entry, 'sidebarBuilder')` gives the builder's width. `craft trinity/doctor` warns about a `pageWidths.fields` handle that isn't such a field. Needs Trinity 1.1.0 or later.

**Spacing between rows:** `gridRow` has a Button Group `rowSpacing` ("Spacing above": auto / close / normal / extra). `_contentBuilder.twig` only uses it between two rows with the same background (different backgrounds keep both paddings): auto is `close` when none of the row's cells has a `blockTitle`, else `normal`; the section gets `data-row-spacing="close|extra"` (normal adds nothing). `section.css` turns that into a negative top margin (close) or extra top padding (extra) from the tokens `--spacing-section-close(-mobile)` (16/16px) and `--spacing-section-extra(-mobile)` (96/48px) in `theme.css`. In the CP, Trinity's `rowSpacingField` setting (`config/trinity.php`) hides the field and shows a "Space above" control at the top of every row but the first; `rowBackgroundField` (`backgroundColor`, default `section--default`) disables it on a row whose background differs from the row above. `_contentBuilder.twig` reads the same handles from `craft.trinity.settings` (`rowBackgroundField`, `rowBackgroundDefault`, `rowSpacingField`, `cellsField`), so a project changes or removes background colours in `config/trinity.php` only (`rowBackgroundField` null: no background classes, spacing between all rows). Only content rows use the spacing; older blocks keep the normal spacing. Off switches: Trinity's `autoRowSpacing` false in `config/trinity.php` (read as `craft.trinity.settings.autoRowSpacing`, Trinity 1.2.0) makes auto always `normal`; `rowSpacingField` null removes the CP control (every row is auto); both: normal spacing everywhere (then also remove `rowSpacing` from `gridRow`, or it shows as a plain Button Group).

**Overview partial:** `_partials/_overview.twig` renders every overview (cards in a grid of up to 3 or a carrousel of up to 6; chosen entries, dynamic fill, related first) from explicit variables; `_grid/_overview.twig` (the Overview column) only maps the cell's fields onto it, and `_news/_entry.twig` includes it under the share bar for related news on every news item (`relatedBy` = first key of the news source's `related`). Outside a content row: wrap it in an `@container` and pass `sizes: craft.trinity.imageSizes('full', 1).sizes`. **Overview sources and related items:** `config/overview-sources.php` describes each "Overview options" value (Entries field, section + orderBy for "Dynamically fill", card, `filterLayout` for the section's overview page: `top` = search + a chip per option group above 3 columns of cards, `side` = filters left of 2 columns, partials `_partials/_filterSearch.twig` and `_partials/_filterOptions.twig`; `relatedField`, `related`); `_grid/_overview.twig` reads it with `craft.app.config.getConfigFromFile('overview-sources')`, and `config/config-values-field.php` builds a dataset "Related <label>" (`off` + the labels) per source with `related`. News: Config Values field `relatedNews` on `cellOverview`, shown only when Overview options is News, Dynamically fill is on and the page is a news item; the last condition is the module's **Page section** rule (`modules\statik\conditions\PageSectionConditionRule`, registered in `Statik::init()` only for field conditions of nested entry types; it walks the owners up to the page). A relation is `field` (shares an entry in that field, e.g. `newsCategory`) or `attribute` (same value, e.g. `authorId`); the fill takes the newest related items first, then the newest others. New relation: one line under `related` (keys are stored in content: don't rename them). Calendar / knowledge base: add `relatedField` + `related` to their source and a Config Values field with the same conditions.

**Background colour and FAQ:** the `backgroundColor` field of `gridRow` has the condition "Row cells is not one of FAQ". A hidden field keeps its last value, so `_contentBuilder.twig` uses `craft.trinity.showsField(block, 'backgroundColor')` and falls back to `section--default`; `_gridRow.twig` then uses no contrast colours.

**Errors after a failed save:** Craft 5.10 saves the draft again after a failed save, which clears the errors on nested entries; Trinity's CP layer puts them back on the row's fields from the error summary and marks the row. Other block types don't get this: Craft shows their errors only in the summary.

## Adding a column type

Example: a "Map" column, handle `cellMap`.

1. **Entry type (in the CP; project config is written automatically)**
   - Handle `cell<Name>` — the template name is derived from it: `cellMap` → `_grid/_map.twig` (handle without `cell`, first letter lowercase).
   - Name "Cell – Map", colour like the other cell types; add it to the **Grid cells** (`gridCells`) field and give it the short name "Map" there.
   - **Required:** add the field "Mobile order" (`mobileOrder`, dropdown: Auto / 1 / 2 / 3) on a tab of its own called "Mobile", like the other cell types. Without it the column can't be reordered on mobile and the "Column span" / "Column width" conditions aren't offered in its layout.
   - **Card label (`uiLabelFormat`)** must be safe for empty fields — use `?? ''` before filters like `truncate` (a new entry has empty fields; an error here makes "Add content" fail with a 500) — and end with `{{ object.mobileOrder.value ? ' · #' ~ object.mobileOrder.value ~ ' on mobile' }}`. The column holds 255 characters (the FAQ label had to be shortened for this).
   - Optional: a thumbnail and card attributes in the field layout's card view.

2. **Template `templates/_site/_snippet/_content/_grid/_map.twig`**
   - Variables: `cell`, `column` (`.width` = width on the page as a fraction, `.sizes` / `.srcsetSizes` for `render_image()`), `headingTag` (`h2`, or `h3` under a row title), `contrast` (the row has a coloured background).
   - The column is its own `@container`: use container query variants (`@sm:`, `@md:`), not viewport ones (`md:`).
   - Image sizes for items in a grid inside the column: `{% import '_site/_snippet/_macros/_imageSizes' as imageSizes %}` → `imageSizes.itemSizes(column.sizes, perRow, span, gap)` and `imageSizes.srcsetSizes(sizes)`.
   - New Tailwind classes in a new file sometimes only appear in the Vite dev server after touching `frontend/css/site/main.css`.
   - Heading ids via `anchor_id(title)` (Entry Anchors plugin): the stored anchor of the "Title (Anchor)" field, kept when the title changes, with `-2`, `-3` … when two columns have the same anchor.
   - Tailwind picks up new classes automatically (`templates/_site` is an `@source`).

3. **Minimum and maximum width — `config/trinity.php` → `minWidthPerType` / `maxWidthPerType`** (only if the type needs room, or shouldn't get too wide), e.g. `'cellMap' => 1 / 2`. Both are widths on the page. The project's list replaces Trinity's defaults as a whole. Validation, the "Add content" menu, the drop targets, the warnings and the showcase follow automatically.

4. **Showcase content — `config/contentbuilder-showcase/content.json`** → `blocks.cellMap.fields` (demo content per field; otherwise placeholders and a warning). An Entries field takes entry URIs, `"@showcase"` or `"@section:<handle>"` (entries of a section, rotated per use on a page; e.g. people without URIs). Then `ddev craft statik/contentbuilder` (add `--dry-run` to preview; it can take minutes) creates `gridbuilder/map` and its combination pages.

5. **The combination list in `frontend/css/site/components/gridbuilder.css`**: every allowed combination as a commented selector. Regenerate it from Trinity's rules (`Layout::isTypeAllowed()` per column fraction and `areCombinationsAllowed()`, over the `gridCells` entry types in field order, `cellMap` → `map`) and update the column types and the total in its header.

6. **Only if needed:** fixed texts in the template (`'…'|t('website_name')`) → add the key to `setup-translations/{en,nl-BE,fr-BE}/website_name.php`; own CSS → a component in `frontend/css/site/components/`.

7. Run `ddev craft trinity/doctor`.

Other environments get the new type through project config (`ddev craft up` / deploy).

## Working on Trinity itself

The project requires Trinity from Packagist (`statikbe/craft-trinity`, 1.0 since 2026-10-16). To work on the plugin, clone github.com/statikbe/craft-trinity into `plugins/trinity` (gitignored here) and add a Composer path repository for it (`{"type": "path", "url": "plugins/trinity", "options": {"symlink": true, "versions": {"statikbe/craft-trinity": "<version in development>"}}}`). The local checkout keeps that path repository, also after a release; don't commit it (composer.json and composer.lock stay out of commits while it's there). Its unit tests: `ddev exec --dir /var/www/html/plugins/trinity composer test`.
