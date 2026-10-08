# Content Row — Content Builder Block with Columns

The **Content row** block (`gridRow`) is a content builder block with a 1–3 column layout and one column type (a "cell") per column. It sits next to the other blocks in the `contentBuilder` Matrix field. It's built from native Craft fields only; a control panel JS layer adds the "rectangle" editing on top, and the native fields keep working when that layer is unavailable.

## How it is built

| Part | Where |
|---|---|
| Row entry type | `gridRow`: `gridLayout` (button group: `full`, `halves`, `thirds`, `thirdTwoThirds`, `twoThirdsThird`), `gridAlignment` (top/center/bottom), `gridCells`, `backgroundColor` |
| Columns | `gridCells` — Matrix in cards-grid view, max 3 entries, one per column from left to right |
| Column types | `cellText`, `cellImage`, `cellCards`, `cellQuote`, `cellVideo`, `cellTable`, `cellForm`, `cellFaq`, `cellEmbed` (named "Cell – …", shown without the prefix in the field) |
| Rules, widths, image sizes | `modules/statik/src/helpers/GridBuilder.php` |
| Per-project settings | `config/custom.php` → `contentBuilderGrid` (2/3 pages, `narrowFromViewport`, `minWidthPerType`) |
| Validation | `GridBuilder::validateRow()` on `Entry::EVENT_AFTER_VALIDATE` (live saves only): allowed layout, number of cells = number of columns, each column type wide enough |
| Front end | `_site/_snippet/_content/_blocks/_gridRow.twig` → one template per column type in `_site/_snippet/_content/_grid/_<type>.twig` |
| Control panel layer | `modules/statik/src/assetbundles/gridbuilder/` (`GridBuilder.js` + `.css`), settings via `GridBuilder::cpConfig()` in a `[data-grid-builder]` element on the Columns field |
| Layout icons | `modules/statik/src/icons/grid/<layout>.svg` (set as `@modules/statik/icons/grid/…` on `gridLayout`) |
| Showcase | `ddev craft statik/contentbuilder` → its own page tree under `gridbuilder`: a page per column type linking to a page per pair of column types, plus `layouts` and `two-thirds-page` (see the `updating-contentbuilder-showcase` skill) |

**Widths are fractions of the page.** On pages where the content builder is 2/3 wide (`contentBuilderGrid.narrowSections` / `narrowEntryTypes`, e.g. the `pageWithSidebar` entry type), every column is 2/3 as wide: layouts with 1/3 columns aren't allowed there, and column types are checked against that effective width (½ + ½ on a 2/3 page = 1/3 each). `GridBuilder::isNarrow()` finds the page through `$row->getOwner()`, so a content row must sit directly in the page's content builder.

**Empty columns only exist in the control panel JS.** Saving a row with fewer cells than columns fails validation.

## Adding a column type

Example: a "Map" column, handle `cellMap`.

1. **Entry type (in the CP; project config is written automatically)**
   - Handle `cell<Name>` — the template name is derived from it: `cellMap` → `_grid/_map.twig` (handle without `cell`, first letter lowercase).
   - Name "Cell – Map", colour like the other cell types; add it to the **Grid cells** (`gridCells`) field and give it the short name "Map" there.
   - **Required:** add the field "Lightswitch (Default Off)" with handle override `firstOnMobile` and label "First on mobile". `_gridRow.twig` reads `column.cell.firstOnMobile` on every column; in dev mode Twig errors on a missing field.
   - **Card label (`uiLabelFormat`)** must be safe for empty fields — use `?? ''` before filters like `truncate` (a new entry has empty fields; an error here makes "Add content" fail with a 500) — and end with `{{ object.firstOnMobile ? ' · first on mobile' }}`.
   - Optional: a thumbnail and card attributes in the field layout's card view.

2. **Template `templates/_site/_snippet/_content/_grid/_map.twig`**
   - Variables: `cell`, `column` (`.width` = width on the page as a fraction, `.sizes` / `.srcsetSizes` for `render_image()`), `headingTag` (`h2`, or `h3` under a row title), `contrast` (the row has a coloured background).
   - The column is its own `@container`: use container query variants (`@sm:`, `@md:`), not viewport ones (`md:`).
   - Heading ids via `unique_id(title|slugify)`, so two columns with the same title don't get the same id.
   - Tailwind picks up new classes automatically (`templates/_site` is an `@source`).

3. **Minimum width — `config/custom.php` → `contentBuilderGrid.minWidthPerType`** (only if the type needs room), e.g. `'cellMap' => 1 / 2`. Validation, the CP "Add content" menu, the "too narrow" warning and the showcase follow automatically. Edit `custom.php`, not the defaults in `GridBuilder.php`: the project's list replaces the defaults as a whole.

4. **Showcase content — `config/contentbuilder-showcase/content.json`** → `blocks.cellMap.fields` (demo content per field; otherwise placeholders and a warning). Then `ddev craft statik/contentbuilder --block=gridRow` creates `gridbuilder/map` and its combination pages.

5. **Only if needed:** fixed texts in the template (`'…'|t('website_name')`) → add the key to `setup-translations/{en,nl-BE,fr-BE}/website_name.php`; own CSS → a component in `frontend/css/site/components/`.

**No changes needed in** `GridBuilder.php`, `_gridRow.twig`, `GridBuilder.js` or the showcase generator: they read the column types from the `gridCells` field and the rules from config.

Other environments get the new type through project config (`ddev craft up` / deploy).
