# Team

Section `team` (structure, maxLevels 1, no URLs), entry type `person` (no title field; `titleFormat` `{firstName} {lastName}`). Fields: `firstName`, `lastName` (PlainText, required, not translatable), `photo` (Assets, 1 image, upload location Public Files), `jobTitle` (PlainText, translatable per site), `email` (Email), `phoneNumber` (PlainText, not translatable; the existing `phone` field is translatable per site, so it isn't reused).

## Column types

- `cellPerson` ("Cell – Person", group General): `person` (Entries → team, max 1, required) + Mobile tab. `maxWidthPerType` 1/2 in `config/trinity.php`. Template `_grid/_person.twig`: horizontal card when `column.width` ≈ 0.5 (photo 2/5 via `imageSizes.itemSizes(column.sizes, { 0: 1, 448: 2.5 }, 1, 0)`).
- `cellTeam` ("Cell – Team", group Dynamic data, after Overview): `blockTitle`, `text` (the shared "CK Editor – Extended" field with handle override `text`), `teamColumns` (Button Group 2 / 3 / 4, default 3; 4 = `@xl:grid-cols-4`, perRow `1168: 4`), `teamMembers` (Entries → team). `minWidthPerType` 1; no Mobile tab (full width, like cellOverview). Template `_grid/_team.twig`: chosen members, else `craft.entries.section('team').all()` (structure order); grid 1 → 2 (@sm) → 3 (@md, only with 3 columns); with 2 columns each card in its own `@container` and `horizontal: true`; `photoFallback: true`.
- Both were added to the `gridCells` Matrix by editing its YAML (entry type uid + name + group) and `project-config/apply`.

## Person card

`_cards/_person.twig` (variables `person`, `showContrast`, `sizes`, `srcsetSizes`, `horizontal`, `photoFallback`): standalone (people have no page). Email via `{% apply obfuscate_emails %}`, phone via `|tel` / `|tel('display')`. Horizontal = `@xs:flex-row` (448px of the nearest container). No photo: no image area, or with `photoFallback` the `person-silhouette` icon on `bg-person-fallback-bg` / `text-person-fallback-icon` (tokens in `theme.css`).

## Dummy content and showcase

`ddev craft statik/dummy-content/team --count=8` (`TeamDummyContent`, names etc. under `team` in `config/dummy-content/content.json`; every 4th person without a photo). Showcase content: `blocks.cellPerson.fields.person` and `blocks.cellTeam.fields.teamMembers` = `"@section:team"` (`ContentbuilderController`: rotated per page via `$sectionCursors`).
