# Partners

Section `partners` (structure, maxLevels 1, no URLs), entry type `partner` (title labelled "Name"). Fields: `logo` (Assets, 1 image), `website` (Link, url only).

## Column type

- `cellPartners` ("Cell – Partners", group Dynamic data): `blockTitle`, `text` (the shared "CK Editor – Extended" field, uid 1ea43556, handle override `text`), `partners` (Entries → partners), `partnersType` (Button Group Grid / Carrousel, options as `overviewType`) + Mobile tab. In `config/trinity.php`: `minWidthPerType` 1/2 and `blockedCombinations` `['cellPartners', 'cellPartners']` (once per row). Added to the `gridCells` Matrix by editing its YAML and `project-config/apply`.
- Template `_grid/_partners.twig`: title/text via `_partials/_textColumn`; chosen partners (`cell.partners.eagerly().all()`), else `craft.entries.section('partners').all()` (structure order). Don't eager-load with `.with(['logo'])`: it turns the logo into an `ElementCollection`, and `.eagerly()` on it fails; `partner.logo.eagerly().one()` in the loop does it in one query.
- The tiles are rendered once into `tiles`, then shown as a grid or as Swiper slides (`partnersType.value == 'carrousel'`, markup as the Overview's carrousel: `-mr-cards` wrapper, `swiper overflow-visible`, slides `pr-cards` faded without `.is-in-view`, controls `_partials/_carrouselControls`).
- Logos per row (grid) or in view (carrousel) by `column.width`: > 0.9 → 8 (`grid-cols-2 @sm:grid-cols-4 @lg:grid-cols-8`, slides `w-1/2 @sm:w-1/4 @lg:w-1/8`), > 0.6 → 4, else 2. Tiles `h-20 @sm:h-24`, the logo `object-contain`. SVG as is, other formats `getUrl({ width: 600, mode: 'fit' })`. A website = `<a target="_blank" rel="noopener">` with an sr-only `item.link.newWindow`.

## Dummy content and showcase

`ddev craft statik/dummy-content/partners --count=8` (`PartnersDummyContent`: SVG logos generated in five shapes, colours/names/websites under `partners` in `config/dummy-content/content.json`). Showcase: `blocks.cellPartners.fields.partners` = `{"section": "partners", "counts": [10, 6, 3, 1, 0]}` (`ContentbuilderController::entriesCounts()`: the number of entries per use, cycling; 0 tests the "show all" fallback).
