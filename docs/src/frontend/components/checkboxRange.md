# Checkbox Range

The Checkbox Range validation plugin enforces minimum and maximum selection limits on checkbox groups. Native HTML doesn't support this validation, so this plugin extends the [Validation Component](/frontend/components/validation) to provide it.

## Features

- ✅ **Min/Max Validation** - Enforce selection limits on checkbox groups
- ✅ **Real-time Validation** - Validates on every change
- ✅ **Custom Messages** - Localized error messages with placeholders
- ✅ **Native Integration** - Uses HTML5 Constraint Validation API
- ✅ **Dynamic Content** - Works with AJAX-loaded checkboxes
- ✅ **Grouped by Name** - Automatically groups checkboxes by `name` attribute

::: info Validation Component Required
This is a **validation plugin**, not a standalone component. It requires the [Validation Component](/frontend/components/validation) to be initialized with `data-validate` on the form.
:::

## How It Works

1. **Form Setup** - Form must have `data-validate` attribute
2. **Detection** - Plugin finds all `input[type=checkbox]` with `min` or `max` attributes
3. **Grouping** - Groups checkboxes by `name` attribute
4. **Event Listeners** - Adds `change` and `check-validation` event listeners
5. **Validation** - On change, counts checked boxes in the group
6. **Custom Validity** - Sets validation message via `setCustomValidity()`
7. **Reporting** - Calls `reportValidity()` and integrates with Validation Component

## Example

The following example demonstrates a checkbox group where you must select at least 2 and at most 4 options before submitting.

<iframe src="../../examples/checkboxRange.html" height="400"></iframe>

```html
<form action="#" data-validate>
  <fieldset data-validate-wrapper>
    <legend class="mb-4">Checkbox range min 2 - max 4</legend>
    <ul>
      <li>
        <input id="checkboxRange1" type="checkbox" name="checkboxRange[]" value="1" min="2" max="4" />
        <label for="checkboxRange1">Option 1</label>
      </li>
      <li>
        <input id="checkboxRange2" type="checkbox" name="checkboxRange[]" value="2" min="2" max="4" />
        <label for="checkboxRange2">Option 2</label>
      </li>
      <li>
        <input id="checkboxRange3" type="checkbox" name="checkboxRange[]" value="3" min="2" max="4" />
        <label for="checkboxRange3">Option 3</label>
      </li>
      <li>
        <input id="checkboxRange4" type="checkbox" name="checkboxRange[]" value="4" min="2" max="4" />
        <label for="checkboxRange4">Option 4</label>
      </li>
      <li>
        <input id="checkboxRange5" type="checkbox" name="checkboxRange[]" value="5" min="2" max="4" />
        <label for="checkboxRange5">Option 5</label>
      </li>
      <li>
        <input id="checkboxRange6" type="checkbox" name="checkboxRange[]" value="6" min="2" max="4" />
        <label for="checkboxRange6">Option 6</label>
      </li>
      <li>
        <input id="checkboxRange7" type="checkbox" name="checkboxRange[]" value="7" min="2" max="4" />
        <label for="checkboxRange7">Option 7</label>
      </li>
    </ul>
  </fieldset>
  <div class="mt-4">
    <button type="submit" class="btn">Submit</button>
  </div>
</form>
```

## Required Attributes

The plugin requires specific attributes on checkbox elements and their form:

### Form Level

| Attribute       | Required | Description                                                                    |
| --------------- | -------- | ------------------------------------------------------------------------------ |
| `data-validate` | ✅ Yes   | Enables the Validation Component on the form. Without this, plugin won't work. |

### Checkbox Level

| Attribute | Required | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| `name`    | ✅ Yes   | Groups checkboxes together. All checkboxes with same `name` are validated as a group. |
| `min`     | ⚠️ One   | Minimum number of checkboxes that must be selected. Must be a positive integer.       |
| `max`     | ⚠️ One   | Maximum number of checkboxes that can be selected. Must be a positive integer.        |

::: warning At Least One Required
Each checkbox **must have** either `min`, `max`, or both attributes. Checkboxes without these attributes are ignored by the plugin.
:::

::: tip Apply to All Checkboxes in Group
Add `min` and `max` attributes to **every checkbox** in the group, not just the first one. The plugin validates against all checkboxes with the same `name`.
:::

## Validation Modes

### Minimum Only

Require at least N checkboxes to be selected:

```html
<input type="checkbox" name="skills[]" value="html" min="2" />
<input type="checkbox" name="skills[]" value="css" min="2" />
<input type="checkbox" name="skills[]" value="js" min="2" />
<input type="checkbox" name="skills[]" value="php" min="2" />
```

**Validation:** At least 2 must be selected.

### Maximum Only

Allow at most N checkboxes to be selected:

```html
<input type="checkbox" name="days[]" value="mon" max="3" />
<input type="checkbox" name="days[]" value="tue" max="3" />
<input type="checkbox" name="days[]" value="wed" max="3" />
<input type="checkbox" name="days[]" value="thu" max="3" />
<input type="checkbox" name="days[]" value="fri" max="3" />
```

**Validation:** No more than 3 can be selected.

### Range (Min and Max)

Require between N and M checkboxes:

```html
<input type="checkbox" name="colors[]" value="red" min="2" max="4" />
<input type="checkbox" name="colors[]" value="blue" min="2" max="4" />
<input type="checkbox" name="colors[]" value="green" min="2" max="4" />
<input type="checkbox" name="colors[]" value="yellow" min="2" max="4" />
<input type="checkbox" name="colors[]" value="purple" min="2" max="4" />
<input type="checkbox" name="colors[]" value="orange" min="2" max="4" />
```

**Validation:** Between 2 and 4 (inclusive) must be selected.

## Validation Messages

The plugin uses localized messages from the Validation Component's language files:

### Message Types

| Validation Type | Message Key | Placeholders     | Example                          |
| --------------- | ----------- | ---------------- | -------------------------------- |
| Range (min+max) | `range`     | `{min}`, `{max}` | "Select between 2 and 4 options" |
| Minimum only    | `minGroup`  | `{min}`          | "Select at least 2 options"      |
| Maximum only    | `maxGroup`  | `{max}`          | "Select at most 4 options"       |

### Language File Example

```json
{
  "minGroup": "Select at least {min} options",
  "maxGroup": "Select at most {max} options",
  "range": "Select between {min} and {max} options"
}
```

The plugin uses `Formatter.sprintf()` to replace placeholders with actual values.

## Validation Timing

Validation occurs on these events:

1. **`change` event** - When user checks/unchecks any checkbox in the group
2. **`check-validation` event** - Custom event for programmatic validation
3. **`invalid` event** - When browser reports validation failure
4. **Form submission** - Validation Component checks all fields

::: tip Real-time Feedback
Users get immediate feedback as they select/deselect checkboxes. The validation state updates instantly.
:::

## Dynamic Content

The plugin automatically handles AJAX-loaded checkboxes:

```javascript
// After loading new form content with checkboxes
// Plugin automatically detects and initializes them
```

Uses `DOMHelper.onDynamicContent()` to watch for new checkboxes with `min` or `max` attributes.

## Integration with Validation Component

This plugin is part of the validation system. It requires:

1. **Form with `data-validate`**
2. **Validation Component initialized**
3. **Validation wrapper** (optional but recommended): `data-validate-wrapper` on fieldset

**Complete example:**

```html
<form action="#" data-validate>
  <fieldset data-validate-wrapper>
    <legend>Choose your preferences</legend>

    <input type="checkbox" name="prefs[]" value="1" min="2" max="3" />
    <label>Option 1</label>

    <input type="checkbox" name="prefs[]" value="2" min="2" max="3" />
    <label>Option 2</label>

    <input type="checkbox" name="prefs[]" value="3" min="2" max="3" />
    <label>Option 3</label>

    <input type="checkbox" name="prefs[]" value="4" min="2" max="3" />
    <label>Option 4</label>

    <!-- Validation error appears here -->
    <div data-validate-error></div>
  </fieldset>

  <button type="submit">Submit</button>
</form>
```

## Programmatic Validation

Trigger validation manually with the `check-validation` custom event:

```javascript
const checkbox = document.querySelector('input[name="skills[]"]');

// Trigger validation
checkbox.dispatchEvent(new Event('check-validation'));
```

This is useful after programmatically changing checkbox states.

## Accessibility

### ARIA Support

The plugin integrates with the Validation Component's ARIA implementation:

- Error messages linked via `aria-describedby`
- Invalid state indicated with `aria-invalid="true"`
- Error containers have `role="alert"` for screen reader announcements

### Keyboard Support

- ✅ All checkboxes remain keyboard accessible
- ✅ Space bar toggles checkboxes
- ✅ Tab key navigates between checkboxes
- ✅ Error messages announced by screen readers

### Best Practices

```html
<fieldset data-validate-wrapper>
  <legend>Required: Choose 2-4 options</legend>
  <!-- Describes requirement -->

  <div>
    <input id="opt1" type="checkbox" name="opts[]" min="2" max="4" />
    <label for="opt1">Option 1</label>
    <!-- Explicit label association -->
  </div>

  <!-- More checkboxes... -->

  <div data-validate-error></div>
  <!-- Error location -->
</fieldset>
```

::: tip Use Fieldset and Legend
Wrap checkbox groups in `<fieldset>` with `<legend>` describing the group and requirements. This provides context for screen reader users.
:::

## Best Practices

::: tip Consistent Attributes
Apply the same `min` and `max` values to **all checkboxes** in a group. While the plugin reads from the first checkbox that triggers validation, consistency makes the code more maintainable.
:::

::: tip Clear Instructions
Tell users the requirements upfront in the legend or label:

```html
<legend>Select 2-4 of your favorite colors</legend>
```

:::

::: tip Error Placement
Use `data-validate-error` inside `data-validate-wrapper` to ensure error messages appear near the checkbox group.
:::

::: warning Form Submission Prevention
The Validation Component prevents form submission when checkboxes are invalid. Users must satisfy the min/max requirements before submitting.
:::

## Related Components

- **[Validation](/frontend/components/validation)** - Base validation system (required)
