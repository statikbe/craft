# Page header and hero

`components/pageHeader/pageHeader.twig` is the engine for every page header; `default.twig` and `hero.twig` are presets that `{% extends %}` it and only set variables at the top level (a child template's top-level `set`s run before the parent renders). Include or embed a preset with extra variables; embedding fills the blocks.

## Variables

- Data: `headerTitle` (required; nothing renders without it), `headerIntro` (`false` = none), `headerIntroClass` (default `mt-4 text-lg`, default header `text-xl`), `headerImage` (asset), `headerCtas` (default `entry.ctas.all()` when the entry has the field), `showBreadcrumb` (default true; hero false).
- Layout, validated against a list (first = default): `headerVariant` overlay|panel|split, `headerSide` left|right, `headerHeight` auto|medium|full, `headerAlign` center|top|bottom, `headerOverlay` flat|gradient, `headerImageWidth` full|container, `headerTextWidth` half|wide|full (only without an image or slot), `headerSectionClass` (extra classes on the outer section).
- `default`: entry.title / intro / headerImage, split + container, side left, align top, text wide, `section--light` (so `.section--light + .section--light` drops the next row's top padding).
- `hero`: `entry.hero` (Content Block: `heading`, `image`, `intro`, `ctas`), no breadcrumb; maps the old `heroVariant` … `heroImageWidth` names onto `header*`.

## Blocks

Defined inside `{% if false %}` and rendered with `block()` where each layout needs them (so they're defined once but used in several branches): `headerText` (the whole text column: breadcrumb, afterBreadcrumb, beforeTitle, h1, afterTitle, intro, afterIntro, CTAs, afterCtas) and `imageSlot` (only used without an image; detected via `block('imageSlot')|trim|length`). Text colour (`textColor`) is set on the text column, so slot content inherits it; the image slot uses `slotColor` (the panel's slot sits on `bg-hero-bg`, not in the panel). The breadcrumb takes `breadcrumbClass` (default `text-black`).

Usages: news (`afterTitle`: date), calendar (`afterTitle`: details list), search results (`headerIntro: false`, `afterTitle`: "results for"); the knowledge base item and the other pages include `default` plainly.

## Hero field

`hero` is a Content Block field (Craft 5.11; the value is a `craft\elements\ContentBlock`, set it as `['fields' => [...]]` from PHP). Its title field is `heading` (a ContentBlock has a `title` attribute). The old Matrix `hero` + entry type `heroBlock` were removed; their content doesn't migrate on other environments.

Images: an `<img>` with `object-cover`, `object-position` from the focal point, `render_image()` options `loading: 'eager'` and `fetchPriority: 'high'`. Contained image sizes from `craft.trinity.imageSizes('full', 1).sizes` (split: `imageSizes.itemSizes(…, { 0: 1, 788: 2 }, 1, 48)`). Tokens: the Hero section of `theme.css`.
