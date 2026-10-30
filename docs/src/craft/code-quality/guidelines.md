# Code guidelines

Our agreements for consistent naming and backend setup: labels, handles, fields, entry types, sections, Twig templates
and where they go, and the front-end translations.
The full text, with examples and exceptions, is in
[GUIDELINES.MD](https://github.com/statikbe/craft/blob/develop/GUIDELINES.MD). In short:

| Part                   | The rule                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1. Naming structure    | Handles are content + type (`heroImage`, not `imageHero`). Labels are content, plus the type only when the entry has several fields of that kind (`Hero image`, `Overview image`) |
| 2. Spacing and casing  | Handles, templates and folders in lowerCamelCase. Labels, fields, entry types and sections in sentence case (`Header image`), keeping abbreviations and names (`SEO`, `LinkedIn`). No hyphens or dashes between words, a space after a comma |
| 3. Language            | Everything in English. Field names, labels, section names and instructions get a translation for every other site language, in `translations/nl/site.php` and `translations/fr/site.php` (the general language, not `nl-BE`) |
| 4. Backend display     | Entries and Users fields: cards when the card shows more than the title, otherwise a list. Card images aligned right. Matrix fields as inline blocks. A Content Block instead of a Matrix with one entry, unless it might need more entries later |
| 5. Template folder structure | Every template in `templates/_site/` sits in the folder of its role: `layout.twig`, `pages/` (what sections point to), `contentBuilder/` (`blocks/`, `columns/`), `components/` (`frame/`, `pageHeader/`, `cards/`, `partials/`) and `macros/`. No new folders directly in `_site/`, no `_` prefix inside it, the file name doesn't repeat the folder, and every template reference ends in `.twig` (a section's template setting doesn't) |
| 6. Front-end translations | Fixed texts in templates use dot-based keys in the front-end category (`website_name` in the base install, usually the domain name in a project) that follow the template's path: `news.entry.relatedTitle` for `pages/news/entry.twig`. Every key is translated in every site language. A name that comes from the control panel uses `site` |

Part 4 is a set of guidelines, except the Content Block rule, which is strict. Projects started before the template
restructure (October 2026) keep their old `_site/_snippet/…` structure: part 5 doesn't apply to them.

## Checking your work

Ask Claude "check my work against the code guidelines": the `checking-code-guidelines` skill checks the parts you choose, on
your branch or the whole project, reports what doesn't follow them with a fix, and applies the fixes you approve. Parts 5 and
6 are separate yes/no questions: the folder check looks at every template and every section's template setting, and the
translation check scans templates, the module and config for keys missing from the translation files. See [Project skills](../claude/skills).

## Source

[GUIDELINES.MD](https://github.com/statikbe/craft/blob/develop/GUIDELINES.MD)
