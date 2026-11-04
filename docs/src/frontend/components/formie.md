# Formie

The `formie` component is registered for [Verbb Formie](https://verbb.io/craft-plugins/formie/features) forms, on the
`[data-formie-form]` attribute that Formie 4 puts on every `<form>` it renders (Formie 3 used `data-fui-form` and the
`.fui-form` class).

It does nothing on its own any more: Formie's own JavaScript handles validation, pages and conditions, and the form styling
comes from `frontend/css/site/components/form.css` and the theme config in `config/formie.php` (see
[Forms](../../craft/content/forms)). Keep the registration if a project needs Formie-specific front-end code: put it in
`frontend/js/components-core/formie.component.ts`.

## Multi-select as Autocomplete

A Formie dropdown with *multiple* on gets the `data-autocomplete` attribute server-side (the Statik module, through Formie's
`Dropdown::EVENT_MODIFY_SLOT_TAG` event). The [Autocomplete component](./autocomplete.md) turns those selects into a
searchable autocomplete.

```html
<select name="fields[interests][]" multiple data-formie-select data-autocomplete>
  <option value="tech">Technology</option>
  <option value="design">Design</option>
</select>
```

## Formie's markup hooks

With `resetClasses` the elements have no `formie-*` classes, only the classes from `config/formie.php`. Use Formie's data
attributes to target its markup:

| Attribute | Element |
| --- | --- |
| `data-formie-form` | `<form>` |
| `data-formie-page`, `data-formie-page-hidden` | A page; the attribute is set on the pages that aren't active |
| `data-formie-row` | A row of fields |
| `data-formie-field`, `data-formie-field-type="…"` | A field wrapper |
| `data-formie-field-errors`, `data-formie-field-error` | The error list of a field, one error |
| `data-formie-sr-only` | A label set to *Hidden* (visually hidden in `form.css`) |

## Related

- **[Autocomplete Component](./autocomplete.md)**
- **[Forms](../../craft/content/forms)** (theme config, project config)
