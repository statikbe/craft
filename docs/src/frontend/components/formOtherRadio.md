# Form Other Radio Option

A specialized form component that enables users to provide custom text input when none of the predefined radio options are suitable, creating a seamless "Other (please specify)" pattern with automatic validation and value synchronization.

## Features

- ✅ **Custom Text Input** - Allows free-form text when radio options aren't sufficient
- ✅ **Automatic Radio Selection** - Text input focus automatically checks the "Other" radio
- ✅ **Value Synchronization** - Text input value becomes the radio button value
- ✅ **Smart Validation** - Validates text input only when "Other" option selected
- ✅ **Required Field Support** - Unchecks radio if required text input left empty
- ✅ **Dynamic Content Support** - Works with AJAX-loaded forms via `DOMHelper`
- ✅ **Validation Integration** - Triggers validation check on blur
- ✅ **Zero Configuration** - Simple attribute-based setup

## Example

<iframe src="../../examples/form_other_radio.html" height="200"></iframe>

```HTML
<form action="">
    <ul>
        <li>
            <input id="otherOptions1" type="radio" name="otherOptions" value="1" required/>
            <label for="otherOptions1">Option 1</label>
        </li>
        <li>
            <input id="otherOptions2" type="radio" name="otherOptions" value="2" required/>
            <label for="otherOptions2">Option 2</label>
        </li>
        <li data-other-option>
            <input id="otherOptions3" type="radio" name="otherOptions" value="" required/>
            <label for="otherOptions3">Other</label>
            <input type="text" placeholder="Please specify" novalidate/>
        </li>
    </ul>
</form>
```

### Value Synchronization

**Initial state:**

```html
<input type="radio" name="reason" value="" /> <input type="text" />
```

**After user types "Budget constraints":**

```html
<input type="radio" name="reason" value="Budget constraints" checked /> <input type="text" value="Budget constraints" />
```

**Form submission:**

```
reason=Budget constraints
```

## Attributes

### Required Attribute

| Attribute           | Element         | Description                                                              |
| ------------------- | --------------- | ------------------------------------------------------------------------ |
| `data-other-option` | Wrapper element | Triggers the component. Must contain one radio input and one text input. |

### Text Input Recommendations

| Attribute     | Recommended | Reason                                                                    |
| ------------- | ----------- | ------------------------------------------------------------------------- |
| `novalidate`  | ✅ Yes      | Prevents native HTML5 validation on text input (radio handles validation) |
| `placeholder` | ✅ Yes      | Guides user with hint text (e.g., "Please specify")                       |

### Radio Input Recommendations

| Attribute  | Use Case                         | Behavior                                                   |
| ---------- | -------------------------------- | ---------------------------------------------------------- |
| `required` | When user MUST provide an answer | If text empty on blur, radio unchecks (forces valid input) |
| `value=""` | Always recommended               | Empty initial value, filled with user text on blur         |

## Validation Behavior

### Required Radio with Empty Text

**Scenario:** User focuses text input (radio auto-checks), then leaves it empty.

```html
<div data-other-option>
  <input type="radio" name="reason" value="" required />
  <input type="text" novalidate />
</div>
```

**Flow:**

1. User focuses text input → Radio checked
2. User leaves text input empty (blur)
3. Form submission fails: "Please select one option" (no radio checked)

### Non-required Radio

**Scenario:** Optional "Other" option.

```html
<div data-other-option>
  <input type="radio" name="reason" value="" />
  <input type="text" novalidate />
</div>
```

**Flow:**

1. User focuses text input → Radio checked
2. User leaves text input empty
3. Radio stays checked with empty value
4. Form submission succeeds: `reason=`

::: tip Use Required for Quality Data
Add `required` to the radio input to ensure users provide actual text when selecting "Other":

```html
<input type="radio" name="field" value="" required />
```

:::

## Why novalidate on Text Input?

The component uses `novalidate` on the text input for good reason:

```html
<input type="text" placeholder="Please specify" novalidate />
```

**Without novalidate:**

- Browser validates text input independently
- Could prevent form submission even when "Other" not selected
- Creates confusing validation experience

**With novalidate:**

- Text input won't trigger HTML5 validation
- Radio button handles validation via `required` attribute
- Validation only applies when "Other" is selected

::: warning Always Use novalidate
The text input should **preferably** have `novalidate` attribute to prevent conflicting validation behaviors.
:::

## Validation Integration

The component dispatches a custom event to trigger validation:

```typescript
const event = new Event('check-validation');
radio.dispatchEvent(event);
```

**Purpose:**

- Notifies validation component that value changed
- Re-validates the form field
- Updates error messages if needed

**Works with:**

- [Validation Component](./validation.md) - Listens for `check-validation` event
- Custom validation handlers
- Form validation libraries

## Dynamic Content Support

The component automatically initializes new "Other" options added to the DOM:

## Accessibility

### Screen Reader Experience

**When user tabs to text input:**

1. Radio automatically checks
2. Screen reader announces: "Other, radio button, checked"
3. Screen reader announces text input label

### Keyboard Navigation

| Action                | Behavior                               |
| --------------------- | -------------------------------------- |
| `Tab` to text input   | Radio automatically checks             |
| `Shift+Tab` away      | Value synced, validation checked       |
| `Arrow keys` on radio | Navigate radio group (native behavior) |

## Best Practices

::: warning One Radio, One Text Input
Each `[data-other-option]` wrapper must contain exactly:

- One `input[type=radio]`
- One `input[type=text]`

Multiple inputs will only bind to the first of each type.
:::

## Related Components

- **[Validation Component](./validation.md)** - Listens for `check-validation` event
