# Form Optional Blocks

Conditional form fields that show/hide based on user selections, with automatic field disabling, value clearing, and required attribute management. Perfect for progressive disclosure forms and conditional validation.

## Features

- ✅ **Conditional Visibility** - Show/hide form blocks based on other field values
- ✅ **Multiple Controllers** - Support multiple controlling fields with complex logic
- ✅ **Automatic Disabling** - Disabled fields in hidden blocks won't submit
- ✅ **Required Management** - Preserve and restore `required` attributes automatically
- ✅ **Value Clearing** - Optionally clear field values when blocks hide
- ✅ **Nested Blocks** - Support deeply nested conditional blocks
- ✅ **Optional Required** - Make fields conditionally required based on other inputs
- ✅ **Dynamic Content** - Works with AJAX-loaded form fields
- ✅ **Checkbox/Radio Support** - Handle checked state and value-based logic
- ✅ **Array Values** - Multiple valid values trigger visibility

## Features Overview

This component provides two complementary features:

1. **Optional Blocks** (`data-optional-block`) - Show/hide entire form sections
2. **Optional Required** (`data-optional-required`) - Conditionally require individual fields

## Example optional block

<iframe src="../../examples/form_optional_block.html" height="450"></iframe>

```HTML
<form action="">
    <ul>
        <li>
            <input type="radio" id="extraContentRadio1" name="extraContentRadio" value="1"/>
            <label for="extraContentRadio1">Show extra content</label>
        </li>
        <li>
            <input type="radio" id="extraContentRadio2" name="extraContentRadio" value="2"/>
            <label for="extraContentRadio2">Show extra content</label>
        </li>
        <li>
            <input type="radio" id="extraContentRadio3" name="extraContentRadio" value="3"/>
            <label for="extraContentRadio3">Don't show extra content</label>
        </li>
    </ul>
    <div class="mt-4">
        <input type="checkbox" id="extraContent" name="extraContent" value="1"/>
        <label for="extraContent">Show extra content</label>
    </div>
    <div class="hidden open:block mt-6" data-optional-block="{&quot;extraContentRadio&quot;:[1,2],&quot;extraContent&quot;:1}">
        <label class="form__label" for="optionalContent3">Optional input</label>
        <input class="form__input" name="optionalContent3" id="optionalContent3" type="text" data-clear-on-hide required/>
        <fieldset class="mt-6">
            <legend>Extra nested optional blocks</legend>
            <div class="mt-4">
                <input type="checkbox" id="extraContentOnSubLevel" name="extraSubContent" value="1"/>
                <label for="extraContentOnSubLevel">Show extra sub content</label>
            </div>
            <div class="hidden my-4 open:block" data-optional-block="{&quot;extraSubContent&quot;: 1}" data-clear-all-on-hide="true">
                <label class="form__label" for="optionalContent3">Optional input for sub checkbox</label>
                <input class="form__input" name="optionalContent3" id="optionalSubContent" type="text" required/>
            </div>
        </fieldset>
    </div>
</form>
```

You use the attribute `data-optional-block` on the element that's optional. The value of this attribute is a json object with all the options in which the element should be shown.

### JSON example

```JSON
{
    "inputName": "value",
    "radioInputName": ["validValue1", "validValue2"],
    "checkBoxGroup[]": [1,2,3],
    "checkbox": 1,
    "reversedCheckbox": 0
}
```

When the conditions in the JSON object are true, then the block will receive an attribute of `open`

## Attributes

| Attribute                | Description                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-optional-block`    | This defines the rules whether to show or hide this element                                                                                               |
| `data-clear-all-on-hide` | This will clear the value of all the elements in this block when it's hidden. If not provided the filled in values will be maintained                     |
| `data-clear-on-hide`     | You can add this attribute to individual elements to be cleared on hide. This only has effect when the attribute `data-clear-all-on-hide` is not provided |

## Example optional required

<iframe src="../../examples/form_optional_required.html" height="240"></iframe>

```HTML
<form action="" data-validate>
    <div class="form__field">
        <label class="block" for="noOptionRequiredSelect">This field is required unless the checkbox below is checked.</label>
        <div class="form__custom-select">
            <select data-optional-required="{&quot;noOptionField&quot;: 0}" name="optional-required" id="noOptionRequiredSelect" required>
                <option value="">Select an option</option>
                <option value="1">Item 1</option>
                <option value="2">Item 2</option>
                <option value="3">Item 3</option>
            </select>
        </div>
    </div>
    <div class="mt-4">
        <input type="checkbox" id="noOptionField" name="noOptionField" value="1"/>
        <label for="noOptionField">I don't want an option</label>
    </div>
    <div class="mt-4">
        <button class="btn" type="submit">Submit</button>
    </div>
</form>
```

When the conditions in the JSON object are true, then the element will receive an attribute of `required`.

| Attribute                | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `data-optional-required` | This defines the rules whether to make the element required or not |

## Controller Logic

### JSON Configuration Format

The JSON object maps **input names** to **valid values**:

```typescript
{
  "inputName": "singleValue",           // Single value match
  "selectName": ["value1", "value2"],   // Multiple value match (OR logic)
  "checkbox": 1,                        // Checkbox checked (value = 1)
  "invertedCheckbox": 0,                // Checkbox NOT checked (special case)
  "radio": "specificValue"              // Radio button with specific value checked
}
```

### Value Matching Rules

**For text inputs/selects:**

```typescript
// Single value
{"country": "BE"}  // Show when country = "BE"

// Multiple values (OR logic)
{"country": ["BE", "NL", "DE"]}  // Show when country is BE OR NL OR DE
```

**For checkboxes/radios:**

```typescript
// Checked with specific value
{"terms": 1}  // Show when checkbox with value="1" is checked

// Special case: Inverted (unchecked)
{"newsletter": 0}  // Show when checkbox is NOT checked

// Multiple values
{"interest[]": [1, 2, 3]}  // Show when any checkbox with value 1, 2, or 3 is checked
```

### Multiple Controllers (AND Logic)

All conditions must be true for block to show:

```json
{
  "country": "BE",
  "ageOver18": 1
}
```

**Result:** Block shows only when `country = "BE"` AND `ageOver18` checkbox is checked.

## Attribute Details

### data-optional-block

**Type:** JSON string  
**Required:** Yes  
**Target:** Container element to show/hide

**Format:**

```html
data-optional-block='{"inputName": "value"}'
```

**Examples:**

```html
<!-- Single controller, single value -->
<div data-optional-block='{"showDetails": "yes"}'>
  <!-- Fields shown when showDetails = "yes" -->
</div>

<!-- Single controller, multiple values -->
<div data-optional-block='{"country": ["BE", "NL"]}'>
  <!-- Fields shown when country is BE or NL -->
</div>

<!-- Multiple controllers (AND logic) -->
<div data-optional-block='{"type": "business", "vat": 1}'>
  <!-- Fields shown when type = "business" AND vat checkbox checked -->
</div>

<!-- Inverted checkbox logic -->
<div data-optional-block='{"noAddress": 0}'>
  <!-- Fields shown when noAddress checkbox is NOT checked -->
</div>
```

::: warning JSON Escaping in HTML
Use `&quot;` for quotes in HTML attributes:

```html
data-optional-block="{&quot;name&quot;:&quot;value&quot;}"
```

:::

### data-clear-all-on-hide

**Type:** Boolean (presence check)  
**Required:** No  
**Target:** Same element as `data-optional-block`

**Behavior:**

- **Present:** Clear ALL inputs/textareas/selects when block hides
- **Absent:** Only clear elements with `data-clear-on-hide` attribute

**Example:**

```html
<div data-optional-block='{"type": "other"}' data-clear-all-on-hide>
  <input type="text" name="details" />
  <textarea name="explanation"></textarea>
  <!-- Both cleared when hidden -->
</div>
```

### data-clear-on-hide

**Type:** Boolean (presence check)  
**Required:** No  
**Target:** Individual form elements within optional block

**Behavior:**

- Mark specific fields to clear when block hides
- Only works when `data-clear-all-on-hide` is NOT present
- Allows selective clearing

**Example:**

```html
<div data-optional-block='{"type": "other"}'>
  <input type="text" name="other" data-clear-on-hide />
  <!-- Cleared when hidden -->

  <input type="text" name="keep" />
  <!-- Value preserved when hidden -->
</div>
```

### data-optional-required

**Type:** JSON string  
**Required:** Yes  
**Target:** Individual form element (input/select/textarea)

**Format:**

```html
data-optional-required='{"inputName": "value"}'
```

**Examples:**

```html
<!-- Required unless checkbox checked -->
<input type="text" name="address" data-optional-required='{"noAddress": 0}' required />
<!-- Required by default, becomes optional when noAddress checkbox checked -->

<!-- Required only when specific option selected -->
<textarea name="explanation" data-optional-required='{"needsExplanation": "yes"}'></textarea>
<!-- Optional by default, becomes required when needsExplanation = "yes" -->
```

## Clearing Behavior

### Clearing Strategies

**Strategy 1: Clear All (data-clear-all-on-hide)**

```html
<div data-optional-block='{"show": 1}' data-clear-all-on-hide>
  <input type="text" name="field1" />
  <input type="email" name="field2" />
  <textarea name="field3"></textarea>
  <!-- All cleared when block hides -->
</div>
```

**Strategy 2: Selective Clearing**

```html
<div data-optional-block='{"show": 1}'>
  <input type="text" name="temp" data-clear-on-hide />
  <!-- Cleared -->

  <input type="text" name="persistent" />
  <!-- Preserved -->
</div>
```

**Strategy 3: No Clearing**

```html
<div data-optional-block='{"show": 1}'>
  <input type="text" name="field" />
  <!-- Value preserved when hidden (but field disabled) -->
</div>
```

### What Gets Cleared

- Text inputs
- Checkboxes/Radios
- Textareas

::: tip Select Element Clearing
The current implementation only clears `input` and `textarea` elements. Select elements are disabled but their selected option is preserved.
:::

## Nested Optional Blocks

Blocks can be nested for complex conditional logic:

```html
<div data-optional-block='{"level1": 1}'>
  <!-- Level 1 content -->

  <div data-optional-block='{"level2": 1}'>
    <!-- Level 2 content (only visible if both level1 and level2 conditions met) -->

    <div data-optional-block='{"level3": 1}' data-clear-all-on-hide>
      <!-- Level 3 content -->
    </div>
  </div>
</div>
```

**Behavior:**

- Each block evaluates independently
- Inner blocks only visible when outer blocks are open
- Clearing cascades (inner blocks cleared when outer blocks hide)
- Each block manages its own required attributes

## Dynamic Content Support

The component monitors for dynamically added optional blocks

**Works with:**

- AJAX-loaded form sections
- Single-page app route changes
- Modal dialogs with conditional fields
- Dynamically added form steps

## Styling with CSS

The component adds an `open` attribute, perfect for Tailwind or custom CSS:

### Tailwind CSS

```html
<!-- Hidden by default, block when open -->
<div class="hidden open:block" data-optional-block='{"show": 1}'>
  <!-- Content -->
</div>

<!-- Opacity transition -->
<div class="opacity-0 open:opacity-100 transition-opacity" data-optional-block='{"show": 1}'>
  <!-- Content -->
</div>

<!-- Height animation -->
<div class="max-h-0 open:max-h-screen overflow-hidden transition-all" data-optional-block='{"show": 1}'>
  <!-- Content -->
</div>
```

## Accessibility

### Screen Reader Experience

**When block becomes visible:**

- Fields become focusable (no longer disabled)
- Screen readers can navigate to new fields
- Required fields announce as required

**Best practices:**

```html
<!-- Use fieldset/legend for grouped conditional fields -->
<fieldset class="hidden open:block" data-optional-block='{"needsDetails": 1}'>
  <legend>Additional Details</legend>
  <!-- Fields -->
</fieldset>

<!-- Announce changes with aria-live (optional) -->
<div class="hidden open:block" data-optional-block='{"show": 1}' aria-live="polite">
  <!-- Content changes announced to screen readers -->
</div>

<!-- Label optional sections clearly -->
<div data-optional-block='{"type": "other"}'>
  <p class="sr-only">Additional fields for "Other" selection</p>
  <!-- Fields -->
</div>
```

## Best Practices

::: tip Use Semantic HTML
Wrap related conditional fields in `<fieldset>` with descriptive `<legend>`:

```html
<fieldset data-optional-block='{"show": 1}'>
  <legend>Optional Information</legend>
  <!-- Fields -->
</fieldset>
```

:::

::: tip Clear Values for Sensitive Data
Use `data-clear-all-on-hide` for conditional blocks containing sensitive information:

```html
<div data-optional-block='{"shareData": 1}' data-clear-all-on-hide>
  <input type="text" name="creditCard" />
</div>
```

:::

::: tip Start with Required
For `data-optional-required`, start with the field as `required` and use inverted checkbox logic:

```html
<input type="text" name="phone" data-optional-required='{"noPhone": 0}' required />
```

This ensures validation by default, field becomes optional only when checkbox checked.
:::

## Related Components

- **[Validation Component](./validation.md)** - HTML5 form validation
