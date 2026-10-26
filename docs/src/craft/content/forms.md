# Forms

Forms are built with [Formie](https://verbb.io/craft-plugins/formie/docs). Editors make the forms in the control panel and
place them with a Forms field.

## Where forms are shown

| Where                                 | Field                  | Template                                         |
| ------------------------------------- | ---------------------- | ------------------------------------------------ |
| A **Form** column in a content row    | `form` on `cellForm`   | `_site/_snippet/_content/_grid/_form.twig`       |
| The **Contact** page                  | `form` (Contact form)  | `_site/_contact.twig`                            |

Both render the form with `craft.formie.renderForm(form)`. The Form column puts it in a box with the form tokens of
`theme.css` (`--color-form-bg`, or `--color-form-contrast-bg` on a row with a background), `--radius-form` and
`--spacing-form-x/y`; it needs at least a 1/2 column.

On the contact page the template sets the form's redirect to the *submit action entry* in the current site, as Formie
doesn't do that per site ([verbb/formie#693](https://github.com/verbb/formie/issues/693)).

## Theme config

`config/formie.php` holds Formie's `themeConfig`: the classes Formie puts on its markup.

- `resetClasses` removes all of Formie's default `fui-*` classes.
- The form elements themselves (inputs, selects, checkboxes, radios) are styled for every form in
  `frontend/css/site/components/form.css`. `formie.php` only handles Formie's markup: layout, labels, instructions, errors,
  alerts, buttons, pages and special fields (repeater, table, signature, …).
- The classes are Tailwind utilities with the form tokens of `theme.css`, e.g. `text-form-error-text`, `bg-form-success-bg`.
  Tailwind scans `formie.php` (an `@source` in `frontend/css/site/main.css`), so any utility works there.
- Per form, pass extra classes with `craft.formie.renderForm(form, { themeConfig: { … } })`; they are merged on top.

::: tip
`text-form-label` only sets the colour. Use `text-(length:--text-form-label)` for the size, and
`font-(--font-form-label)` for the weight (`font-form-label` would set the font family).
:::

## Project config

| What            | Value                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------- |
| Form template   | *Statik*: Formie's layout CSS in the page header, its JS inside the form, no theme CSS (`outputCssTheme: false`) |
| Email template  | *Site*: `templates/_mail/_template.twig`, which extends `_mail/_layout.twig`                 |
| Stencils        | *Contact form* in NL, EN and FR                                                              |
| Status          | *New*                                                                                        |

## Spam protection (reCAPTCHA)

Formie's reCAPTCHA (v3) captcha reads its settings from `.env`:

| Variable               | What                                     |
| ---------------------- | ---------------------------------------- |
| `RECAPTCHA_ENABLED`    | `true` turns the captcha on (default off) |
| `RECAPTCHA_SITE_KEY`   | The site key                             |
| `RECAPTCHA_SECRET_KEY` | The secret key                           |

`statik/setup` asks for the keys and then sets `RECAPTCHA_ENABLED=true`. Each form also needs the captcha turned on in its
Spam settings. See [Environments and .env](../getting-started/environments).

## Multi-select dropdowns

A Formie dropdown with *multiple* on gets the `data-autocomplete` attribute: the Statik module adds it through Formie's
`Dropdown::EVENT_MODIFY_HTML_TAG` event. The frontend's autocomplete component turns those selects into a searchable
autocomplete. See [Autocomplete](../../frontend/components/autocomplete) and [Formie](../../frontend/components/formie) in the
frontend docs.

## Source

- `config/formie.php`
- `config/project/formie/`
- `modules/statik/src/Statik.php` (the `Dropdown::EVENT_MODIFY_HTML_TAG` handler)
- `frontend/js/components-core/autocomplete.component.ts`, `formie.component.ts`
- `templates/_site/_snippet/_content/_grid/_form.twig`, `templates/_site/_contact.twig`, `templates/_mail/`
