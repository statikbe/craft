---
name: checking-code-guidelines
description: Use this skill to check work in this Craft project against the Statik code guidelines in GUIDELINES.MD — naming structure (content + type), casing (lowerCamelCase handles and templates, sentence case labels/fields/sections), English naming with translations in translations/<language>/site.php, backend display (Entries/Users/Matrix view modes, card thumbnail alignment, Content Block instead of single matrix), the template folder structure of templates/_site (pages/, contentBuilder/, components/, macros/), and a scan for front-end translation keys (the project's website_name category) that are missing from the translation files. Can check all guideline parts or only the chosen ones. Reports the violations with suggested fixes and applies the approved fixes. Invoke when the user asks to check, verify, review, audit or lint their work, fields, handles, labels, sections, entry types or templates against the code guidelines / conventions / "afspraken", or asks where a template belongs, or before opening a PR. Also invoke when the user asks to scan for missing or unused front-end translations / website_name keys.
---

# Checking the code guidelines

`GUIDELINES.MD` (repo root) holds the rules. **Read it first** — it's the source of truth; this skill describes how to check and fix them. Check §1–6. §5 (template folder structure) applies to the base install and to projects started after the move in `TEMPLATES-MIGRATION-PLAN.md`. A project that still has `templates/_site/_snippet/` was started before the move and keeps its old structure: skip §5 there and say so in the report, and don't flag its `_` prefixes inside `_site/` (C2).

Workflow: **1. scope → 2. collect → 3. check → 4. report → 5. approve → 6. apply → 7. verify.** Never change files before step 5.

## 1. Ask the scope

The scope has three levels: **guideline parts** (which of the four parts of GUIDELINES.MD §1–4, plus the template folder structure of §5 and the front-end translation scan of §6), **subjects** (which kinds of elements within those parts) and **part of the project** (where to look). In this skill, "elements" are the things in the project (a section, a field, a template); "guideline parts" are the four parts of the guidelines. Don't mix the two words up in questions.

Do exactly what the user asked, nothing more: "check the spacing and casing for the sections on this branch" = guideline part *Spacing and casing*, subject *Sections*, part *Branch diff* — no other rules, no fields, no templates. "All sections in the project" = subject *Sections* + *Whole project*, not specific elements. Only ask for the levels the user didn't specify:

1. First AskUserQuestion call: **which guideline parts**, **the template folder structure**, **the front-end translation scan** and **which part of the project** (four questions in one call). The folder structure and the scan are separate yes/no questions because a multiSelect question holds four options at most: "Also check the template folder structure (§5)?" and "Also scan the front-end translations (§6)?" → *Yes* / *No*. When the user only asks about the folder structure ("is this template in the right place?"), run only part *Template folder structure* and don't ask about the other parts. When the user only asks about front-end translations ("scan the translations", "are there website_name keys missing?"), run only the scan (part *Front-end translations*) and don't ask about the other parts.
2. When not all four guideline parts were chosen: a second call asking **which subjects**, with one multiSelect question per chosen guideline part that lists its subjects from the table below (max. 4 options per question, so no separate "all" option: selecting every option means all subjects). When all four were chosen, check all subjects unless the user named some.
3. Only when the user wants specific elements but hasn't named them yet (see *Which part of the project*): ask for them **after** the subjects are known, never in the same call. Either ask in plain text ("Which sections should I check?"), or use AskUserQuestion with the real elements of the chosen subjects as options (e.g. the section names from `config/project/sections/`, multiSelect). Never invent placeholder or example options.

**Which guideline parts** (multiSelect, default all four):

| Guideline part | Rules | GUIDELINES.MD |
| --- | --- | --- |
| Naming structure | N1–N3 | §1 |
| Spacing and casing | C1–C3 | §2 |
| Language | L1–L2 | §3 |
| Backend display | B1–B7 | §4 |
| Template folder structure (separate yes/no question) | S1–S6 | §5 |
| Front-end translations (separate yes/no question) | T1–T5 | §6 |

Run only the rules of the chosen guideline parts. Fixes still have to follow every rule: a proposed new name or handle must also pass the parts that weren't chosen (e.g. a casing fix for `image_hero` is `heroImage`, not `imageHero`), so check the fix against all rules, but only report findings for the chosen parts. Mention in the report title which guideline parts were checked.

**Which subjects:**

| Guideline part | Subjects | What is checked per subject |
| --- | --- | --- |
| Naming structure | Fields, Entry types, Sections | Handle order (N1, N3) and name/label structure (N2) of that kind of element. Layout labels count as *Fields* |
| Spacing and casing | Fields, Entry types, Sections, Templates & folders | Handle casing (C1) and name/label casing (C3) of that kind of element; *Templates & folders* = C2 |
| Language | Fields, Entry types, Sections, Templates & folders | English handle, name, labels and instructions (L1) of that kind of element, plus its translations in `site.php` (L2; entry types have none) |
| Backend display | Entries/Users fields, Entry cards, Matrix fields, Content Block | B1–B3, B4, B5–B6, B7 |
| Template folder structure | none: always all templates in the chosen part of the project, and the section templates | S1–S6 |
| Front-end translations | none: always the whole scan | T1–T5 |

When the user names a subject together with several guideline parts, it applies to each part it belongs to ("casing and language of the sections" = C1/C3 and L1/L2 for sections). Mention the subjects in the report title too. Collect (step 2) only what the chosen subjects need.

**Which part of the project** (single select, two options only):

- **Branch diff**: only what's added or changed on the current branch vs `master` (`git diff master...HEAD --name-status` plus uncommitted changes from `git status --porcelain`). Check the new/changed fields, entry types, sections and templates; for a changed YAML file, check the changed properties only (`git diff master...HEAD -- <file>`).
  For the front-end translation scan: the keys in the changed templates, module PHP and config files (T1–T4). Don't report unused keys (T5) on a branch diff, except keys the branch itself stopped using.
- **Whole project**: everything under `config/project/` and `templates/`, limited to the chosen subjects; for the scan also `modules/` and `config/*.php`, and the unused keys (T5). Description: "Everything in config/project/ and templates/, e.g. all sections when you pick Sections as subject next".

Specific elements ("the news section", one field, a template path) are no option of their own: end the question text with "Or type specific elements under Other, e.g. *the news section*". When the user types elements there, check only those (and only for the chosen subjects). When the Other text is "all sections" or similar, treat it as *Whole project* with that subject.

## 2. Collect

| Source | What |
| --- | --- |
| `config/project/fields/*.yaml` | `name`, `handle`, `instructions`, `type`, `settings.viewMode`, `settings.maxEntries`, `settings.entryTypes` |
| `config/project/entryTypes/*.yaml` | `name`, `handle`, field layout elements (`label`, `instructions`, `includeInCards`, `providesThumbs`, `fieldUid`), `cardThumbAlignment` |
| `config/project/sections/*.yaml` | `name`, `handle`, `siteSettings.*.template`, `uriFormat` |
| `config/project/sites/*.yaml` | `language` → the languages that need translations (all except `en-*`). The translation folder is the general language without the region: `nl-BE` → `nl`, `fr-BE` → `fr` |
| `translations/<language>/site.php` | Existing CP translations, in `translations/nl/`, `translations/fr/`, … (see *Translations* in step 6). In the base install also `setup-translations/<language>/site.php`, the tracked copy |
| `templates/**` | File and folder names |
| `config/app.php` | Front-end translation scan: the project's front-end category, the key under `components` → `i18n` → `translations` with `PhpMessageSource` and `forceTranslation`. `website_name` in the base install, usually the domain name in a project. Below: `<category>` |
| `templates/**/*.twig`, `modules/**/*.php`, `config/*.php` | Front-end translation scan: the keys, see *T — Front-end translations* |
| `translations/<folder>/<category>.php` | Front-end translation scan: the existing translations per site language. The folder is the site language (`nl-BE`, `fr-BE`) or, when that file doesn't exist, its general language (`en` for `en-BE`): Craft falls back from `en-BE` to `en`. A key counts as present when it's in either file. In the base install also `setup-translations/<folder>/website_name.php`, the tracked copy |

Field layouts can be in two YAML forms: `key: value`, or the `__assoc__` form where a key and its value are two consecutive list items (`- label` / `- 'Hero image'`). Read both. Comments after `#` in the YAML (`# Public Files`) are names of the referenced element, handy to map UIDs.

## 3. Check

Give every finding a rule ID, a severity and a concrete fix.

- **error**: clearly against the guidelines (wrong casing, Dutch handle, missing translation, single matrix instead of a Content Block).
- **suggestion**: depends on judgment (label type needed or not, cards vs list). Say why.

### N — Naming structure

| ID | Check | Severity |
| --- | --- | --- |
| N1 | Handle order is content + type: `heroImage`, not `imageHero` / `imageOverview`. Type words: `image(s)`, `photo`, `video`, `text`, `title`, `description`, `date`, `link`, `entries`, `color`, `position`, `width`, `type`, `layout`, … | error |
| N2 | Label is "content (type)": no type when the content is clear enough (`Description`, `Show past projects`); a type when the entry type has several variants of that kind of field (two image fields → `Overview image`, `Hero image`). Look at the other fields in the same layout. | suggestion |
| N3 | Similar fields follow the same pattern: if `overviewImage` exists, a new overview field for a description is `overviewDescription`, not `descriptionOverview` / `summaryOverview`. Compare with existing handles. | suggestion |

### C — Casing

| ID | Check | Severity |
| --- | --- | --- |
| C1 | Handles (fields, entry types, sections, volumes, layout element handle overrides) are lowerCamelCase: `^[a-z][a-zA-Z0-9]*$`, no `_`, `-` or spaces. | error |
| C2 | Template files and folders are lowerCamelCase. The `_site` folder has to keep its `_` prefix; the folders and templates inside `_site/` have no `_` prefix (`_site/contentBuilder/blocks/textImage.twig`, not `_site/contentBuilder/blocks/_textImage.twig`). Outside `_site/`, don't flag a `_` prefix that is present or missing. Exceptions to the casing rule: error pages (`404.twig`, `503.twig`) and files that plugins require (`_knock-knock.twig`). | error |
| C3 | Field names, layout labels, entry type names and section names are sentence case: `Header image`, `News overview`, not `Header Image` / `header image`. Keep abbreviations, jargon and proper names as they are (`SEO`, `GTM`, `URL`, `CTA`, `FAQ`, `VAT`, `CKEditor`, `Facebook`, `LinkedIn`). Words in parentheses follow the same rule (`Lightswitch (default off)`). Spacing follows English rules: a hyphen joining words becomes a space (`GTM-Body` → `GTM body`), and a comma is followed by a space and not preceded by one (`(left,right,full)` → `(left, right, full)`). A dash used as a separator is removed too (`CK Editor - Extended` → `CKEditor extended`). Only keep hyphens that belong to a proper name. | error |

### L — Language

| ID | Check | Severity |
| --- | --- | --- |
| L1 | Handles, template files and folders, field names, labels, entry type names, section names and instructions are English. Suggest the English translation (`afbeelding` → `image`, `omschrijving` → `description`). | error |
| L2 | Field names, layout labels, section names and field instructions (both on the field and overridden in a layout) have a translation in `translations/<language>/site.php` for **every** non-English site language, where `<language>` is the general language (`nl`, `fr`). Entry type names don't need one. Missing file = all its translations missing. A `site.php` in a region folder (`translations/nl-BE/`) doesn't count: report it as an error and move it to the general folder. | error |

### B — Backend display

B1–B6 are guidelines, not hard rules: the right view mode depends largely on the project and on the field, entry type and layout it is used in. These findings are **suggestions**, never errors. Look at the context first (where the field is placed, how many entries it holds, what the editor needs to see) and only report a finding when the guideline clearly fits better. Explain the trade-off, and accept it when the developer keeps the current setup.

The exception is **B7 (Content Block)**: a strict check, always an **error**, whatever the context.

| ID | Check | Severity |
| --- | --- | --- |
| B1 | Entries/Users field (`craft\fields\Entries`, `craft\fields\Users`) has an explicit `viewMode` (`null` falls back to Craft's default). | suggestion |
| B2 | `cards` / `cards-grid` only when the related entry types show extra info on the card (layout elements with `includeInCards: true` or `providesThumbs: true`, besides the title). Otherwise suggest `list`. | suggestion |
| B3 | Fields relating to categories (sections like `*Categories`, entry type `category`), users, or plain linked entries where only the title matters → `list`, or `list-inline` for long lists where the order doesn't matter. | suggestion |
| B4 | Entry types whose cards show an image (`providesThumbs: true` on an asset field): `cardThumbAlignment: end`. | suggestion |
| B5 | Matrix `viewMode: index` → `blocks` (or cards for nested matrixes). | suggestion |
| B6 | Top-level matrix (on a section's entry type) uses `blocks`. `cards` / `cards-grid` are meant for nested matrixes (the field is in the layout of an entry type that is itself used by a Matrix). Nested matrix where each entry has one field (e.g. a date block) may use cards instead of blocks. | suggestion |
| B7 | Matrix with `maxEntries: 1` (single matrix) → should become a Content Block (`craft\fields\ContentBlock`, like `socialLinks`). **Report and describe the conversion only, never convert it**: it needs a content migration. Always ask per finding whether the field might need **more than one entry in the future** (e.g. an event with one date now, several dates later): then a Content Block is impractical, and the fix is to keep the Matrix and raise or empty `maxEntries` when that's already needed, or to leave it as it is. | error |

### S — Template folder structure

Only in a project that has the structure of GUIDELINES.MD §5 (see the top of this skill). Look at the templates in `templates/_site/` and at `siteSettings.*.template` in `config/project/sections/*.yaml`.

| ID | Check | Severity |
| --- | --- | --- |
| S1 | Every template sits in one of the folders of the §5 table: `layout.twig` is the only file directly in `_site/`, and there are no other folders directly in `_site/` than `pages/`, `contentBuilder/`, `components/` and `macros/`. A template that fits none of them: report it and say the team has to agree on a place first (§5), don't invent a new folder. | error |
| S2 | A template is in the folder of its role: a template a section points to in `pages/` (a section with entries: a folder with `index.twig` and `entry.twig`), a block template in `contentBuilder/blocks/` named after the entry type handle, a column template in `contentBuilder/columns/` named after the column type handle without `cell`, a card in `components/cards/`, frame parts (header, footer, flyout, navigation) in `components/frame/`, macros in `macros/`. A template that only a block or column includes for its own parts goes in `components/partials/`, not next to the block or column. | error |
| S3 | Every section's `siteSettings.*.template` points into `_site/pages/` (except `404` and `503`, outside `_site/`) and has no `.twig`. | error |
| S4 | The file name doesn't repeat its folder name: `pages/account/password/set.twig`, not `pages/account/password/passwordSet.twig`. Exception: the main template of a folder, the one that includes the others (`contentBuilder/contentBuilder.twig`, `components/pageHeader/pageHeader.twig`). | suggestion |
| S5 | Templates that belong together are grouped in a subfolder of their folder (`pages/account/password/`, `components/partials/filter/`): report three or more templates with the same prefix in one folder (`filterOptions`, `filterSearch`, `filterClearButton`). | suggestion |
| S6 | Every template reference has `.twig`: `include`, `embed`, `extends`, `import`, `from`, a `set` of a template path (`{% set layout = '_site/layout.twig' %}`), a path built with `~` (ends in `~ '.twig'`), and `renderTemplate()` / `renderPageTemplate()` in `modules/`. Only a section's `siteSettings.*.template` has none (S3). | error |

S6 is fixed by adding `.twig` to the reference. A fix for S1, S2, S4 or S5 is a template move: see *Template / folder renames* in step 6.

### T — Front-end translations

Find the keys with these patterns (single or double quotes, with or without parameters, spaces allowed around `|`):

- Twig: `(['"])(.+?)\1\s*\|\s*t\(\s*['"]<category>['"]` → the key is group 2.
- PHP: `Craft::t\(\s*['"]<category>['"]\s*,\s*(['"])(.+?)\1`.
- Runtime keys: `Craft::t('<category>', $variable)` in `modules/` translates a value from somewhere else. Follow the variable to where the keys are defined, e.g. `rowHeadings` in `config/custom.php` and the `heading` of each source in `config/overview-sources.php`, and add those keys to the list.
- A `|t('<category>')` on a variable or an expression (`entry.someField|t('<category>')`) can't be resolved by the scan: list it for a check by hand.

| ID | Check | Severity |
| --- | --- | --- |
| T1 | Every key has a translation in the `<category>.php` of **every** site language (from `config/project/sites/*.yaml`), English included. Report per language which keys are missing, with the files that use them. In the base install, check `setup-translations/` too: a key missing there is missing for every new project. | error |
| T2 | Templates and module PHP use the project's category. A `|t('website_name')` or `Craft::t('website_name', …)` in a project whose category was renamed doesn't get the project's translations. Fix: switch it to `<category>`. Categories of other sources (`site`, `app`, `formie`, plugin handles) aren't findings. **Exception, also not a finding:** a name from the control panel that is translated in `site.php`, such as a section name, uses `|t('site')` on purpose (`resultEntry.section.name|t('site')` in `pages/search.twig`, GUIDELINES.MD §6). Do the opposite check instead: a control panel name translated with `|t('<category>')` gets no translation, because `<category>.php` has dot-based keys only; suggest `|t('site')` (T4). | error |
| T3 | Keys are dot-based, starting with the part of the site and the template, then the text (`news.entry.relatedTitle`). An English sentence as key, or a key with spaces, in the front-end category: suggest a dot-based key. | suggestion |
| T4 | Translations on a variable or expression (see above) can't be checked automatically: list them with `file:line` so the developer can check them by hand. | suggestion |
| T5 | Keys in the `<category>.php` files that nothing uses any more (no template, module or config file, also not as a runtime key). Search the whole repo for the key before reporting it (also `docs/`, `.claude/`, `frontend/`). **Report only**: remove them only after the user approved it. | suggestion |

Before reporting, check that the fix itself doesn't create a new problem: the new handle must be unique (fields share one namespace; entry type and section handles theirs), and the new name must follow every rule.

## 4. Report

Group by rule category, errors first. Per finding: what, where (`file:line`), why, fix. Example:

```markdown
## Code guidelines check — branch diff vs master — all guideline parts, all subjects (12 findings: 9 errors, 3 suggestions)

### Casing
| # | ID | Severity | Where | Problem | Suggested fix |
|---|----|----------|-------|---------|---------------|
| 1 | C1 | error | `config/project/fields/image_hero--…yaml:2` | Handle `image_hero` isn't lowerCamelCase and the type comes first | Handle → `heroImage` (+ 4 references in templates) |
| 2 | C3 | error | `config/project/fields/heroImage--…yaml:4` | Name `Hero Afbeelding` | Name → `Hero image` |

### Language
| 3 | L2 | error | `translations/fr/site.php` | No translation for `Hero image` | Add `'Hero image' => '…'` (ask for the translation or suggest one) |
```

**Translation updates.** A naming structure (N) or spacing and casing (C) fix that changes a field name, layout label, section name or instruction also changes its translation key in `site.php`. Always propose the matching translation updates with the findings, also when *Language* wasn't chosen, so the translations stay up to date. Add a *Translation updates* block after the findings: per changed text and per non-English site language, either move the existing translation to the new key (`'Author Image' => 'Auteursafbeelding'` → `'Author image' => 'Auteursafbeelding'`, adjust the translation when the meaning changed), or propose a new translation when there is none yet. Entry type names have no translations. Link each update to its finding number: approving a finding includes its translation update unless the user leaves it out.

For T1, propose the translations for every missing language in the report (from the template context and the existing translations), so the user can approve or change them. Mark the ones you aren't sure about.

When *Language* was chosen together with *Naming structure* and/or *Spacing and casing*, base the L2 findings on the names **after** the proposed N and C fixes, not on the current names, so the translations don't have to be redone after the fixes. Don't report a translation for the old name separately: it's part of the translation update of that fix.

End with the count and the question which fixes to apply (all / errors only / pick by number / none). Mention that suggestions are judgment calls.

## 5. Approve

Apply nothing without approval. For handle, template or folder **renames** also ask (once): **"Is this project already live, or has the client already started entering content on the live environment?"** A project that isn't live yet but already has client content counts the same as a live one. If either is true, warn before applying:

> ⚠️ This project is live or already has client content on the live environment. Renaming handles/templates can lead to data loss or broken pages: the live environment applies the new project config while caches, GraphQL queries, element index settings, Feed Me/Formie mappings, external integrations or code that isn't in this repo may still use the old handle. Proceed with caution: deploy templates and project config together, take a database backup first and test on staging.

Then ask to confirm the renames separately (they can still choose to apply only the other fixes).

## 6. Apply

Apply in this order, so the translations are written for the final names:

1. Spacing and casing (C) and naming structure (N) fixes: names, labels, instructions, handles, templates.
2. Translations (L2 findings and the translation updates of the N and C fixes), based on the names after step 1.
3. Front-end translations (T2 category fixes first, then the T1 keys, then the approved T5 removals).
4. The other fixes (backend display).

### Names, labels, instructions, view modes, thumbnail alignment

Edit the value in the YAML file. Keep the YAML style of the file (quoting like `name: 'Hero image'`, the `__assoc__` form where used).

### Handle renames (fields, entry types, sections)

1. Change `handle:` in the YAML and rename the file: `<newHandle>--<uid>.yaml` (the uid part stays).
2. Update every reference to the old handle. Search with word boundaries (`grep -rnw 'oldHandle'`) in:
   - `templates/`, `modules/`, `config/*.php` (e.g. `element-index-defaults.php`, `cta.php`, `custom.php`), `frontend/` (JS reading data attributes), `config/contentbuilder-showcase/`
   - project config: `uriFormat` (`craft.entries.section('newsOverview')`), `titleFormat`, `uiLabelFormat`, `previewTargets`, layout `handle` overrides, conditions
   - Twig patterns: `entry.oldHandle`, `block.oldHandle`, `.section('oldHandle')`, `.type('oldHandle')`, `'blocks/' ~ block.type.handle` (entry type renames also need the matching block template renamed)
   - GraphQL schemas in `config/project/graphql/` and queries in the frontend
   Review each match: don't replace unrelated words that happen to match (`image` is everywhere).

### Template / folder renames

`git mv` the file or folder, then update all references: `include`, `embed`, `extends`, `import`, `from`, `{% include '_site/…' %}` with string concatenation, section `siteSettings.*.template`, `config/routes.php`, and module PHP that renders templates.

### Translations

Add the missing keys to `translations/<language>/site.php` for each non-English site language, in the folder of the general language: `translations/nl/site.php` for an `nl-BE` site, `translations/fr/site.php` for `fr-BE`. Users can only pick a general language (`nl`, `fr`) as their CP language, and Craft doesn't look in `nl-BE/` for `nl`; an `nl-BE` site does fall back to `nl/`, so the front end finds them too. Other categories (`website_name.php`, `formie.php`) stay where they are. In the base install, `translations/` is gitignored: write the same file to `setup-translations/<language>/site.php` too, the tracked copy that `craft statik/setup` copies into `translations/`. Write in the file's existing style (`return array ( 'Pages' => 'Pagina', );`), sorted the way the file is. Create the file if it doesn't exist (`<?php` + `return array ( … );`). The English rules of C3 apply to the English labels only: a translation follows the spelling of its own language (Dutch `GTM-body`, `SEO-titel`). Ask the user for translations you aren't sure about, or propose them and mark them for review in the summary. When a name, label or instruction is changed by an N or C fix, replace the old key with the new one in every `site.php` instead of leaving it behind, and keep or adjust its translation.

### Front-end translations

- **T1:** add each missing key to `translations/<folder>/<category>.php` of every site language that misses it, in the folder that already has the file (see *Collect*). Add the missing keys only, never overwrite or rewrite the file: editors change translations in the control panel with the Translate plugin, which writes to the same files, so the existing values can differ from the ones in Git. Keep the file's style (`return [` or `return array (`, spaces or tabs) and its sort order. In the base install, add them to `setup-translations/<folder>/website_name.php` too; `translations/` is gitignored there.
- **T2:** replace the category in the template or PHP call; the key stays the same.
- **T5:** only the keys the user approved, from every language's file (and `setup-translations/` in the base install).

### Single matrix → Content Block (B7)

Never apply. First ask, per single matrix in the report: **"Could `<field>` need more than one entry in the future?"** Mention what depends on it being a Matrix (code that queries its entries, e.g. `Entry::find()->field('<handle>')`, `.all()` loops in templates), because a Content Block can't be queried that way.

- **Yes, maybe more later**: keep the Matrix. A Content Block would have to be converted back. Raise or empty `maxEntries` only when the user wants several entries now; otherwise leave the field as it is and mark the finding as accepted (not an error any more) in the summary.
- **No, always one**: describe the steps (new Content Block field with the same subfields, template changes from `field.one().x` / `field.all()` to `field.x`, code that queries the matrix entries, content migration) so the developer can plan it.

## 7. Verify

```bash
ddev craft project-config/apply        # applies the YAML changes; must finish without errors
ddev craft project-config/diff         # should show nothing left over afterwards
```

See the `working-with-ddev` skill for DDEV commands. Then:

- Grep again for the old handles/template paths: no hits may remain.
- Front-end translations: `ddev exec php -l translations/<folder>/<category>.php` for every changed file, then rerun the scan: no T1 findings may remain.
- Render the affected pages (`curl -s -o /dev/null -w '%{http_code}' https://<project>.ddev.site/<uri>`) and look for Twig errors in `storage/logs/web-*.log`.
- Rerun the checks on the fixed elements and report what was fixed, what was skipped (and why) and which translations still need review.

Never run `project-config/apply` or migrations on staging/production yourself — tell the user what to deploy.
