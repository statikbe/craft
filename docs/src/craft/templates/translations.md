# Translations

The base install has three sites: English (`en-BE`), Dutch (`nl-BE`) and French (`fr-BE`). Texts are translated in three
places, each with its own category.

| Category       | For                                                        | Keys                                       | Files                                         |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| `website_name` | Static texts in the front-end templates                    | Dot-based keys: `components.cards.default.readMore`       | `translations/{en,nl-BE,fr-BE}/website_name.php` |
| `site`         | The control panel: field names, labels, instructions, section names | The English text: `'Author image'`   | `translations/{nl,fr}/site.php`               |
| `formie`       | Formie's front-end messages                                | Formie's English text                      | `translations/{en,nl-BE,fr-BE}/formie.php`    |

## Front end: `website_name`

Templates translate keys, never Dutch or English sentences:

```twig
{{ 'components.cards.default.readMore'|t('website_name') }}
{{ 'components.partials.filter.clearButton.removeFilter'|t('website_name') }}
```

The keys follow the template they're used in (`account.password.set.*` for `pages/account/password/set.twig`,
`components.frame.header.*` for `components/frame/header.twig`, `contentBuilder.columns.video.*`, `news.*`, `search.*`, …). A new
text needs its key in all three files. The category is registered in `config/app.php` (`i18n` → `translations` →
`website_name`, with `forceTranslation`, so the English site gets the English text too).

## Control panel: `site`

Craft translates field names, layout labels, section names and instructions in the `site` category, with the English text as
the key. The files are in the general language (`nl`, `fr`, not `nl-BE`): that's where the control panel looks, and an `nl-BE`
site falls back to it. Entry type names don't need a translation.

```php
return array (
    'Author image' => 'Afbeelding auteur',
    'Background color' => 'Achtergrondkleur',
);
```

When you add or rename a field, label, section or instruction, add or move its translation too. The
[code guidelines](../code-quality/guidelines) require a translation for every non-English site language.

## `setup-translations` and `translations`

`translations/` is in `.gitignore`: it's the live copy that editors change through the Translate plugin. The versions in the
repo are in `setup-translations/`:

```
setup-translations/
├── en/      formie.php, website_name.php
├── nl-BE/   formie.php, website_name.php
├── fr-BE/   formie.php, website_name.php
├── nl/      site.php
└── fr/      site.php
```

Copy them into `translations/` with:

```bash
ddev craft statik/setup/install-translation-files
```

The command only copies when `translations/` is empty, so it never overwrites translations that were changed since. To start
over locally, empty `translations/` first.

::: tip
Add new texts to `setup-translations/`, the files in the repo. A change made only in `translations/` stays on your machine.
:::

## Translate plugin

Editors change the front-end translations in the control panel with
[Translate](https://github.com/statikbe/craft-translate) (Statik). It writes to the files in `translations/`.

## Module translations

The Statik module has a category of its own, `statik`, in `modules/statik/src/translations/{en,en-BE,nl-BE,fr-BE}/statik.php`,
with `nl-BE` as the source language. It holds the texts of the module itself, e.g. the cookie texts.

## Source

- `setup-translations/`
- `config/app.php` → `components.i18n`
- `modules/statik/src/console/controllers/SetupController.php` → `actionInstallTranslationFiles()`
- `modules/statik/src/Statik.php` (the `statik` category)
