# Content Row — Content Builder Block with Columns

The **Content row** block (`gridRow`) is a content builder block with a 1–3 column layout and one column type (a "cell") per column. It sits next to the other blocks in the `contentBuilder` Matrix field. It's built from native Craft fields only. The rules, validation, field conditions and the control panel layer come from the **Trinity** plugin (`statikbe/craft-trinity`); this project owns the entry types, templates and CSS.

**Read the plugin README first:** `vendor/statikbe/craft-trinity/README.md` (content model contract, every setting, `craft.trinity.row()`, conditions, control panel, events). This file covers what is specific to this project.

## How it is built here

| Part | Where |
|---|---|
| Row entry type | `gridRow`: `gridLayout` (button group: `full`, `halves`, `thirds`, `thirdTwoThirds`, `twoThirdsThird`), `gridAlignment` (top/center/bottom), `gridCells`, `backgroundColor` |
| Columns | `gridCells` — Matrix in cards-grid view, max 3 entries, one per column from left to right |
| Column types | `cellText`, `cellImage`, `cellCards`, `cellQuote`, `cellVideo`, `cellTable`, `cellForm`, `cellFaq`, `cellEmbed` (named "Cell – …", shown without the prefix in the field), each with `mobileOrder` |
| Settings | `config/trinity.php` (`pageWidths` with `pageWithSidebar` at 2/3, `narrowFromViewport`, `minWidthPerType`, `maxWidthPerType`, `blockedCombinations`); the handles are Trinity's defaults |
| Rules, validation, conditions, CP layer | The Trinity plugin. Check the setup with `ddev craft trinity/doctor` |
| Front end | `_site/_snippet/_content/_blocks/_gridRow.twig` (row markup from `craft.trinity.row(block)`) → one template per column type in `_site/_snippet/_content/_grid/_<type>.twig` |
| Layout icons | `@statikbe/trinity/icons/layouts/<layout>.svg` on `gridLayout` |
| Showcase | `ddev craft statik/contentbuilder` → its own page tree under `gridbuilder`: a page per column type linking to a page per pair of column types, plus `layouts`, `two-thirds-page` and `three-quarters-page` (see the `updating-contentbuilder-showcase` skill). The 2/3 and 3/4 showcase pages get their width through Trinity's page width events (`Statik.php`). |

**Page widths:** `pageWithSidebar` renders the content builder at 2/3 next to a sidebar from 980px (`_contentWithSidebar.twig`); `narrowFromViewport` must match that breakpoint (`lg:`). On a 2/3 page only `full` and `halves` can be used (1/3 columns would be 2/9 of the page). Types with a `minWidthPerType` of 1/2 (cards, table, FAQ, embed, form) only fit full rows and the 1/2 column of 1/3 + 2/3 on a 3/4 page.

**When columns sit side by side:** from `--container-cols-2: 560px` (`@cols-2:`, halves) and `--container-cols-3: 864px` (`@cols-3:`, rows with a 1/3 column) in `frontend/css/site/main.css`, measured on the row itself. These equal `grid.breakpoint` with Trinity's `columnMinWidth` 256 and `columnGap` 48 (`--spacing-column`); change them together. Keep them plain px: Tailwind silently drops the `@…:` variants of a `calc()` container size. Rows with a background colour have section padding, so they are 64px narrower than the builder (on a 2/3 page at 980–1199px: 552px, so halves stack there while rows without a background don't). Trinity's `containers` setting mirrors the `--container-*` widths in `main.css` for image sizes.

**Styling hooks** (`_gridRow.twig`): `[data-row-layout="halves"]`, `[data-row-cells="text image"]` (exact combination, source order), `[data-row-cells~="video"]` (contains a type), and per column `[data-cell="quote"]`, e.g. `[data-cell="text"]:has(+ [data-cell="image"])`.

**Background colour and FAQ:** the `backgroundColor` field of `gridRow` has the condition "Row cells is not one of FAQ". A hidden field keeps its last value, so `_contentBuilder.twig` uses `craft.trinity.showsField(block, 'backgroundColor')` and falls back to `section--default`; `_gridRow.twig` then uses no contrast colours.

**Errors after a failed save:** Craft 5.10 saves the draft again after a failed save, which clears the errors on nested entries; Trinity's CP layer puts them back on the row's fields from the error summary and marks the row. Other block types don't get this: Craft shows their errors only in the summary.

## Adding a column type

Example: a "Map" column, handle `cellMap`.

1. **Entry type (in the CP; project config is written automatically)**
   - Handle `cell<Name>` — the template name is derived from it: `cellMap` → `_grid/_map.twig` (handle without `cell`, first letter lowercase).
   - Name "Cell – Map", colour like the other cell types; add it to the **Grid cells** (`gridCells`) field and give it the short name "Map" there.
   - **Required:** add the field "Mobile order" (`mobileOrder`, dropdown: Auto / 1 / 2 / 3). Without it the column can't be reordered on mobile and the "Column span" / "Column width" conditions aren't offered in its layout.
   - **Card label (`uiLabelFormat`)** must be safe for empty fields — use `?? ''` before filters like `truncate` (a new entry has empty fields; an error here makes "Add content" fail with a 500) — and end with `{{ object.mobileOrder.value ? ' · #' ~ object.mobileOrder.value ~ ' on mobile' }}`. The column holds 255 characters (the FAQ label had to be shortened for this).
   - Optional: a thumbnail and card attributes in the field layout's card view.

2. **Template `templates/_site/_snippet/_content/_grid/_map.twig`**
   - Variables: `cell`, `column` (`.width` = width on the page as a fraction, `.sizes` / `.srcsetSizes` for `render_image()`), `headingTag` (`h2`, or `h3` under a row title), `contrast` (the row has a coloured background).
   - The column is its own `@container`: use container query variants (`@sm:`, `@md:`), not viewport ones (`md:`).
   - Heading ids via `anchor_id(title)` (Entry Anchors plugin): the stored anchor of the "Title (Anchor)" field, kept when the title changes, with `-2`, `-3` … when two columns have the same anchor.
   - Tailwind picks up new classes automatically (`templates/_site` is an `@source`).

3. **Minimum and maximum width — `config/trinity.php` → `minWidthPerType` / `maxWidthPerType`** (only if the type needs room, or shouldn't get too wide), e.g. `'cellMap' => 1 / 2`. Both are widths on the page. The project's list replaces Trinity's defaults as a whole. Validation, the "Add content" menu, the drop targets, the warnings and the showcase follow automatically.

4. **Showcase content — `config/contentbuilder-showcase/content.json`** → `blocks.cellMap.fields` (demo content per field; otherwise placeholders and a warning). Then `ddev craft statik/contentbuilder --block=gridRow` creates `gridbuilder/map` and its combination pages.

5. **Only if needed:** fixed texts in the template (`'…'|t('website_name')`) → add the key to `setup-translations/{en,nl-BE,fr-BE}/website_name.php`; own CSS → a component in `frontend/css/site/components/`.

6. Run `ddev craft trinity/doctor`.

Other environments get the new type through project config (`ddev craft up` / deploy).

## Working on Trinity itself

The project installs Trinity from Packagist (`statikbe/craft-trinity` `^1.0@beta`). To work on the plugin, clone github.com/statikbe/craft-trinity into `plugins/trinity` (gitignored here) and temporarily add a Composer path repository for it (`{"type": "path", "url": "plugins/trinity", "options": {"symlink": true}}`, require `@dev`); don't commit that. Its unit tests: `ddev exec --dir /var/www/html/plugins/trinity composer test`.
