# Code guidelines

Agreements for consistent naming and backend setup in the Base Install: labels, handles, fields, entry types, sections and Twig templates.

Source: [Voorstellen code guidelines](https://statik.atlassian.net/wiki/spaces/CRAFT/pages/3656417281/Voorstellen+code+guidelines) (Confluence, space CRAFT). Only the approved parts are included here. Of "Update mappenstructuur repository", the template folder structure is approved (§5); the rest of it is still a proposal.

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
| Twig templates & folders | lowerCamelCase | `contentPage`, `newsletterBlock`, `highlightsBlock` | Error pages (`404.twig`, `503.twig`) and templates a plugin requires by name (`_knock-knock.twig`) | The `_site` folder keeps its `_` prefix so its templates can't be browsed to directly. Only `_site` has the prefix: the folders and templates inside it don't get one (`_site/contentBuilder/blocks/textImage.twig`, not `_site/_snippet/_content/_blocks/_textImage.twig`) |
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

## 5. Template folder structure

> Applies once the move in `TEMPLATES-MIGRATION-PLAN.md` is done in the base install. Projects started before the move keep their old structure: they aren't migrated.

Every template in `templates/_site/` has one obvious place, sorted by role:

| Folder | What goes in it | Example |
| --- | --- | --- |
| `layout.twig` | The base layout, the only template directly in `_site/` | |
| `pages/` | The templates a section (or route) points to. A single gets a file; a section with entries gets a folder with `index.twig` (the overview) and `entry.twig` (the detail) | `pages/contact.twig`, `pages/news/index.twig`, `pages/news/entry.twig` |
| `contentBuilder/` | The content builder: the loop (`contentBuilder.twig`), the row (`gridRow.twig`), `blocks/` and `columns/` | `contentBuilder/columns/image.twig` |
| `contentBuilder/blocks/` | One template per block, named after the block's entry type handle | `contentBuilder/blocks/textImage.twig` |
| `contentBuilder/columns/` | One template per column type of the content row, named after the column type's handle without `cell` | `contentBuilder/columns/quote.twig` (for `cellQuote`) |
| `components/` | Reusable parts you can include anywhere | `components/cta.twig`, `components/image.twig` |
| `components/frame/` | What's around every page: header, footer, flyout, navigation (`frame/nav/`) | `components/frame/footer.twig` |
| `components/pageHeader/` | The page header and its presets | `components/pageHeader/hero.twig` |
| `components/cards/` | The cards of overviews and related entries, one per card type | `components/cards/news.twig` |
| `components/partials/` | Small parts that other templates include, also the ones the content builder uses | `components/partials/textColumn.twig` |
| `macros/` | Twig macros | `macros/imageSizes.twig` |

Rules:

- **Don't add folders directly in `_site/`.** A new template goes in one of the folders above. When it fits none of them, agree on a new place with the team and add it to this table first.
- **Group templates that belong together in a subfolder** of their folder, e.g. `pages/account/password/` and `pages/account/registration/`, or `components/partials/filter/`.
- **Don't repeat the folder name in the file name.** The folder already says what it is: `pages/account/password/set.twig`, not `pages/account/password/passwordSet.twig`; `components/cards/news.twig`, not `components/cards/newsCard.twig`. Exception: the main template of a folder, the one that includes the others, has the folder's name (`contentBuilder/contentBuilder.twig`, `components/pageHeader/pageHeader.twig`).
- **A section's template setting has no `.twig`:** `_site/pages/news/entry`, not `_site/pages/news/entry.twig`.
- **A template a block or column includes for its own parts** goes in `components/partials/`, not next to the block or column, so other templates can use it too.
- **No `_` prefix** inside `_site/` (see §2).

## 6. Front-end translations

Fixed texts in the front end (labels, buttons, messages in templates) are translated with dot-based keys in the project's front-end category, not with the English text as key.

**The category name differs per project.** In the base install it's the placeholder `website_name`; in a project it's usually the project's domain name. The category is registered in `config/app.php` (`components` → `i18n` → `translations`, the one with `PhpMessageSource` and `forceTranslation`): look it up there first. Below, `<category>` stands for that name.

- Twig: `'calendar.entry.location'|t('<category>')`
- PHP: `Craft::t('<category>', 'calendar.dateFormat')`

**Exception: names from the control panel.** A name that comes from the control panel and is already translated in `site.php` (§3), such as a section name, uses the `site` category, not the front-end category. Example: the section label on the search results page, `resultEntry.section.name|t('site')`. It reuses the existing control panel translations, so the section names don't need a second translation as front-end keys.

A key starts with the part of the site and the template it belongs to, then the text: `news.entry.relatedTitle`, `account.passwordSet.invalidLink`. A text that several templates share keeps one key (`news.index.filter` is used by the news, calendar and knowledge base overviews).

Every key has a translation in `translations/<language>/<category>.php` for **every** site language, English included. These go in the folder of the site language (`nl-BE/`, `fr-BE/`), unlike the control panel translations in `site.php` (§3), or in the folder of its general language when that's where the file is: the `en-BE` site uses `en/`, because Craft falls back from `en-BE` to `en`. In the base install, also add them to the tracked copy in `setup-translations/<language>/website_name.php`.

**Scan for new translations.** Whenever templates are added or changed, scan the project for keys of the front-end category and add the missing ones to the `<category>.php` of every language:

- `templates/**/*.twig`: every `'…'|t('<category>')` (with single or double quotes, with or without parameters);
- `modules/**/*.php`: every `Craft::t('<category>', '…')`;
- `config/*.php`: keys that the module translates at runtime, e.g. `rowHeadings` in `config/custom.php` and the `heading` of each source in `config/overview-sources.php`.

A scan can't find keys that are built at runtime (e.g. `entry.someField|t('<category>')`): check those by hand. A `|t('site')` on a control panel name (see the exception above) is not a finding.

When the scan finds templates that still use `website_name` in a project where the category was renamed, those texts don't get the project's translations: report them and switch them to the project's category.

When adding to an existing `<category>.php`, add the missing keys and keep what's there: editors can change translations in the control panel with the Translate plugin, which writes to the same files. Keep the file's style and sort order. Keys that nothing uses any more are reported first, after checking that no template, module or config file uses them. Only remove them, from every language's file, once the user has approved it.
