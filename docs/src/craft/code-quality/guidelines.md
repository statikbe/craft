# Code guidelines

Our agreements for consistent naming and backend setup: labels, handles, fields, entry types, sections and Twig templates.
The full text, with examples and exceptions, is in
[GUIDELINES.MD](https://github.com/statikbe/craft/blob/develop/GUIDELINES.MD). In short:

| Part                   | The rule                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1. Naming structure    | Handles are content + type (`heroImage`, not `imageHero`). Labels are content, plus the type only when the entry has several fields of that kind (`Hero image`, `Overview image`) |
| 2. Spacing and casing  | Handles, templates and folders in lowerCamelCase. Labels, fields, entry types and sections in sentence case (`Header image`), keeping abbreviations and names (`SEO`, `LinkedIn`). No hyphens or dashes between words, a space after a comma |
| 3. Language            | Everything in English. Field names, labels, section names and instructions get a translation for every other site language, in `translations/nl/site.php` and `translations/fr/site.php` (the general language, not `nl-BE`) |
| 4. Backend display     | Entries and Users fields: cards when the card shows more than the title, otherwise a list. Card images aligned right. Matrix fields as inline blocks. A Content Block instead of a Matrix with one entry, unless it might need more entries later |

Part 4 is a set of guidelines, except the Content Block rule, which is strict.

## Checking your work

Ask Claude "check my work against the code guidelines": the `checking-code-guidelines` skill checks all four parts, or the
ones you choose, on your branch or the whole project, reports what doesn't follow them with a fix, and applies the fixes you
approve. See [Project skills](../claude/skills).

## Source

[GUIDELINES.MD](https://github.com/statikbe/craft/blob/develop/GUIDELINES.MD)
