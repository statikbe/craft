# Code guidelines

Agreements for consistent naming and backend setup in the Base Install: labels, handles, fields, entry types, sections and Twig templates.

Source: [Voorstellen code guidelines](https://statik.atlassian.net/wiki/spaces/CRAFT/pages/3656417281/Voorstellen+code+guidelines) (Confluence, space CRAFT). Only the approved parts are included here. "Update mappenstructuur repository" is still a proposal and is **not** part of these guidelines yet.

Check your work against these guidelines with the `checking-code-guidelines` skill (e.g. "check my work against the code guidelines").

## 1. Naming structure

Names have to be consistent. If you add an image field for windows with blackout blinds, a later image field for roof windows with blackout blinds follows the same pattern.

| What | Structure | Explanation | Example |
| --- | --- | --- | --- |
| Labels | content (type) | Leave out the type when the content makes it clear enough. Add the type when the entry has several variants of the field. | Content only: `Show past projects`, `Description`. With type: `Overview image`, `Hero image` |
| Handles | content + type | Handles have to be unique, so content + type gives more options. Content comes first, the type last. | `overviewImage`, `heroImage` (not `imageOverview`) |

## 2. Spacing and casing

Builds on the naming structure: both apply.

| What | Structure | Example | Exceptions | Note |
| --- | --- | --- | --- | --- |
| Handles | lowerCamelCase | `backgroundColor`, `blockTitle`, `textImage` | | |
| Twig templates & folders | lowerCamelCase | `contentPage`, `newsletterBlock`, `highlightsBlock` | Error pages (`404.twig`, `503.twig`) and templates a plugin requires by name (`_knock-knock.twig`) | The `_site` folder keeps its `_` prefix so its templates can't be browsed to directly. Only `_site` has the prefix: the folders and templates inside it don't get one (`_site/snippet/content/textImage.twig`, not `_site/_snippet/_content/_textImage.twig`) |
| Labels, entry types & fields | Sentence case: first letter uppercase, the rest lowercase | `Show past projects`, `Header image` | Known abbreviations, jargon and proper names, e.g. `VAT number`, `SEO`, `URL`, `LinkedIn` | |
| Sections | Sentence case | `News overview` | Same as above | |

Labels, entry types, fields and sections follow English spacing rules, also when the team works in Dutch:

- No hyphens or dashes between words: use a space (`GTM-Body` → `GTM body`, `CK Editor - Extended` → `CKEditor extended`). Hyphens that belong to a proper name stay.
- A space after a comma, none before it (`Position (left, right, full)`).

Translations in `translations/<language>/site.php` follow the spelling of their own language (Dutch `GTM-body`, `SEO-titel`).

## 3. Language

| What | Language | Translations |
| --- | --- | --- |
| Handles | EN | No |
| Twig templates & folders | EN | No |
| Labels, entry types & fields | EN | Only for labels and fields |
| Sections | EN | Yes |
| Field descriptions (instructions) | EN | Yes |

"Translations: yes" means the English text has a translation in `translations/<language>/site.php` for **every** non-English site language in the project (see `language` in `config/project/sites/*.yaml`, e.g. `nl-BE`, `fr-BE`). Entry type names are not translated.

Put these control panel translations in the folder of the **general language**, without the region: `translations/nl/site.php` and `translations/fr/site.php`, not `nl-BE` / `fr-BE`. Users can only pick a general language (`nl`, `fr`) as their control panel language, and Craft never looks in `translations/nl-BE/` for `nl`. The other way round does work: an `nl-BE` site falls back to `translations/nl/`, so the front end finds them too. In the base install, the tracked copies are in `setup-translations/<language>/`, because `translations/` is gitignored there; `craft statik/setup` copies them into `translations/`.

## 4. Backend display

The view modes and card setup below are guidelines, not hard rules. The right choice depends largely on the context of the project and on the field, entry type or layout it is used in. The exception is the **Content Block**: that one is a strict rule, with one exception (see below).

### Entries / Users fields

Entries and Users fields have four view modes:

- **Cards** (`cards`): to show more info about a page/user/… in the field, e.g. the intro or header image next to the title. The card has to contain that extra info (card view elements on the entry type), otherwise the cards add nothing.
- **Card grid** (`cards-grid`): same as cards, but takes less space. Choose it depending on the layout of the entry type the field is on (e.g. in a narrow column or next to other fields). Handy when the order of the entries doesn't matter much.
- **List** (`list`): for categories, users, linked entries, …, content where you don't need more than the title at first sight.
- **Inline list** (`list-inline`): same as list, for when the list gets long and you want to use the space optimally. Also depending on the entry type layout. Handy when the order of the entries doesn't matter much.

### Entry cards

When an image on the entry adds context, it is shown on the card **aligned right** (entry type setting "Thumbnail alignment" → end, `cardThumbAlignment: end`). In list view the image is shown without a position option.

### Matrix fields

Matrix fields have four view modes:

- **Cards** (`cards`): mainly inside a matrix block (nested matrix). What you show on the card depends on the block, but always show a title.
- **Card grid** (`cards-grid`): mainly inside a matrix block, smaller depending on the available space.
- **Inline blocks** (`blocks`): the most used one. Clear for the editor and gives a quick view of all fields. Exception: a matrix inside a matrix where you only fill in one field (e.g. a date block).
- **Index** (`index`): rarely to never used.

### Content Block

We used to group content with single matrixes (a Matrix field with max. 1 entry). That creates an entry type with revisions each time, which isn't needed. Group related fields with a **Content Block** field instead, e.g. the social media links (`socialLinks`).

Exception: keep the Matrix when the field might need more than one entry in the future (e.g. an event with one date now, several dates later). Converting it back from a Content Block would be impractical. Raise or empty the max. number of entries once several are needed.
