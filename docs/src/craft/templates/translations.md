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

## Defaults in git, editors' changes in the database

`translations/` is in git and holds every key with its default translation:

```
translations/
├── en/      formie.php, website_name.php
├── nl-BE/   formie.php, website_name.php
├── fr-BE/   formie.php, website_name.php
├── nl/      site.php
└── fr/      site.php
```

Add new keys and change defaults there, like any other code. A deploy brings them to every environment.

What editors change in the control panel ([Translate](https://github.com/statikbe/craft-translate), Statik) isn't written
into these files: with `'storeInDatabase' => true` in `config/translate.php`, the plugin stores only the values that differ
from the default, in the database (table `translate_overrides`), and puts them on top of the files. So:

- a new key or a changed default reaches every environment with the deploy;
- a removed key disappears everywhere;
- a deploy never overwrites a translation an editor changed;
- the editors' translations travel with the database (production → staging → local) and are in every backup.

In the control panel a changed translation shows who changed it and when, with **Restore default**; a filter shows only the
changed ones.

### Checking the keys

```bash
ddev craft statik/translations/check            # keys used in templates/module without a translation; exits with 1
ddev craft statik/translations/check --unused   # also the keys nothing uses any more
```

### The editors' changes on an environment

```bash
ddev craft translate/overrides/list      # what editors changed: key, default, their value, who, when
ddev craft translate/overrides/prune     # removes changes that equal the default, or whose key no longer exists
ddev craft translate/overrides/promote   # locally: writes the changes into the files in translations/ (then commit them)
```

### Projects from before (a shared translations folder on the server)

Older projects had `translations/` git-ignored and shared on the server, with the editors' changes in the files. The first
deploy with the new setup runs `translate/overrides/import-files` on that shared folder (`statik:import_translations` in
`deploy.php`): values that differ from the files in git become overrides; the same values, untranslated keys and empty ones
are skipped. The folder stays as a backup (marked with `.imported`). Afterwards, `translate/overrides/list` shows what was
imported and `prune` removes the keys nothing uses any more.

## Module translations

The Statik module has a category of its own, `statik`, in `modules/statik/src/translations/{en,en-BE,nl-BE,fr-BE}/statik.php`,
with `nl-BE` as the source language. It holds the texts of the module itself, e.g. the cookie texts.

## Source

- `translations/`
- `config/translate.php`, `config/app.php` → `components.i18n`
- `modules/statik/src/console/controllers/TranslationsController.php` (`statik/translations/check`)
- `deploy.php` → `statik:import_translations`
- `modules/statik/src/Statik.php` (the `statik` category)
