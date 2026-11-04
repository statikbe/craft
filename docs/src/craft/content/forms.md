# Forms

Forms are built with [Formie](https://verbb.io/craft-plugins/formie/docs). Editors make the forms in the control panel and
place them with a Forms field.

## Where forms are shown

| Where                                 | Field                  | Template                                         |
| ------------------------------------- | ---------------------- | ------------------------------------------------ |
| A **Form** column in a content row    | `form` on `cellForm`   | `_site/contentBuilder/columns/form.twig`       |
| The **Contact** page                  | `form` (Contact form)  | `_site/pages/contact.twig`                            |

Both render the form with `craft.formie.renderForm(form)`. The Form column puts it in a box with the form tokens of
`theme.css` (`--color-form-bg`, or `--color-form-contrast-bg` on a row with a background), `--radius-form` and
`--spacing-form-x/y`; it needs at least a 1/2 column.

On the contact page the template sets the form's redirect (`form.setRedirectUrl()`) to the *redirect entry* in the current
site, as Formie doesn't do that per site ([verbb/formie#693](https://github.com/verbb/formie/issues/693)). It only does so when
the form redirects to an entry.

## Theme config

`config/formie.php` holds Formie's `themeConfig`: the classes Formie puts on its markup.

- `resetClasses` removes all of Formie's default `formie-*` classes (Formie 4; Formie 3 used `fui-*`). Formie's own hooks
  are `data-formie-*` attributes (`data-formie-form`, `data-formie-field`, …), which stay.
- The form elements themselves (inputs, selects, checkboxes, radios) are styled for every form in
  `frontend/css/site/components/form.css`. `formie.php` only handles Formie's markup: layout, labels, instructions, errors,
  alerts, buttons, pages and special fields (repeater, table, signature, …).
- The classes are Tailwind utilities with the form tokens of `theme.css`, e.g. `text-form-error-text`, `bg-form-success-bg`.
  Tailwind scans `formie.php` (an `@source` in `frontend/css/site/main.css`), so any utility works there.
- Classes that depend on the form, field or page are structured values, e.g.
  `['if' => ['context' => 'field.layout', 'equals' => 'horizontal'], 'then' => '…', 'else' => '…']` or
  `['if' => 'field.hasErrors', 'then' => 'has-error']`. Formie 4 rejects Twig expressions (`{{ … }}`) in theme config.
- States that change in the browser are top-level state keys, toggled by Formie's JS: `pageHidden`, `rowHidden`,
  `conditionalHidden` (`hidden`), `fieldControlError` (`has-error`, styled in `form.css`), `tabLinkCurrent`,
  `tabLinkInactive` and `tabError`. Keys renamed in Formie 4: `alertError` / `alertSuccess` → `messageError` /
  `messageSuccess`, `buttonWrapper` → `pageButtons`.
- Labels set to *Hidden* get `data-formie-sr-only`; `form.css` hides them visually (`resetClasses` drops Formie's
  `formie-sr-only` class).
- Per form, pass extra classes with `craft.formie.renderForm(form, { themeConfig: { … } })`; they are merged on top.

::: tip
`text-form-label` only sets the colour. Use `text-(length:--text-form-label)` for the size, and
`font-(--font-form-label)` for the weight (`font-form-label` would set the font family).
:::

## Project config

| What            | Value                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------- |
| Form template   | *Statik*: Formie's CSS in the page header, its JS inside the form. Formie 4 merged the layout and theme CSS settings into one (`outputCss`). The templates render with `theme: 'none'`, so only Formie's base CSS loads (needed: it hides hidden pages, rows and fields), not its 63 KB theme CSS; the busy submit button is the `loading` state in `config/formie.php` |
| Email template  | *Site*: `templates/_mail/_template.twig`, which extends `_mail/_layout.twig`                 |
| Stencils        | *Contact form* in NL, EN and FR                                                              |
| Status          | *New*                                                                                        |
| Field palette   | Address, Group, Section, Repeater, Tags and Users are switched off, so the form builder doesn't offer them (Formie → Settings → Fields). A form that already has such a field shows it as "Unavailable field type" |

## Spam protection (reCAPTCHA)

`statik/setup` asks for the reCAPTCHA (v3) keys and writes them to `.env`:

| Variable               | What                                     |
| ---------------------- | ---------------------------------------- |
| `RECAPTCHA_ENABLED`    | `true` once the keys are set (default off) |
| `RECAPTCHA_SITE_KEY`   | The site key                             |
| `RECAPTCHA_SECRET_KEY` | The secret key                           |

Formie 4 keeps its captcha settings in the database, not in the project config, so `statik/setup` also turns Formie's
reCAPTCHA captcha on, with `$RECAPTCHA_ENABLED`, `$RECAPTCHA_SITE_KEY` and `$RECAPTCHA_SECRET_KEY` as its settings. An
environment that gets a copy of that database only needs the keys in its `.env`; on an environment with its own database,
turn reCAPTCHA on by hand in Formie's captcha settings with the same variables. Each form also needs the captcha turned on in
its Spam settings. See [Environments and .env](../getting-started/environments).

## Multi-select dropdowns

A Formie dropdown with *multiple* on gets the `data-autocomplete` attribute: the Statik module adds it through Formie's
`Dropdown::EVENT_MODIFY_SLOT_TAG` event. The frontend's autocomplete component turns those selects into a searchable
autocomplete. See [Autocomplete](../../frontend/components/autocomplete) and [Formie](../../frontend/components/formie) in the
frontend docs.

## Source

- `config/formie.php`
- `config/project/formie/`
- `modules/statik/src/Statik.php` (the `Dropdown::EVENT_MODIFY_SLOT_TAG` handler)
- `frontend/js/components-core/autocomplete.component.ts`, `formie.component.ts`
- `templates/_site/contentBuilder/columns/form.twig`, `templates/_site/pages/contact.twig`, `templates/_mail/`
