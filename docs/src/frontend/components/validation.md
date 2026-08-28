# Form Validation

A comprehensive form validation component built on HTML5 Constraint Validation API with custom error messages, auto-scroll to errors, plugin support, and internationalization.

## Features

- ✅ **HTML5 Validation**: Built on native Constraint Validation API
- ✅ **Custom Error Messages**: Localized, context-aware error messages
- ✅ **Auto-Scroll to Errors**: Automatically scrolls to first invalid field
- ✅ **Plugin Support**: Integrates with passwordConfirm, passwordStrength, formOtherRadio
- ✅ **Error Placement Control**: Flexible error message positioning
- ✅ **Live Validation**: Real-time validation on blur, change events
- ✅ **ARIA Support**: Proper `aria-invalid` and `aria-errormessage` attributes
- ✅ **Screen Reader Friendly**: Error messages with `role="alert"`
- ✅ **Internationalized**: Multi-language error message support
- ✅ **Dynamic Forms**: Works with AJAX-loaded content
- ✅ **Auto-Initialize**: Detects all `form[data-validate]` elements

## How It Works

### Validation Flow

1. **Form Setup**: Add `data-validate` attribute to `<form>`
2. **Element Detection**: Component finds all inputs, textareas, selects
3. **Event Listeners**: Attaches blur/change handlers for live validation
4. **Error Display**: Shows errors with `aria-invalid` and `role="alert"`
5. **Form Submit**: Validates all fields, scrolls to first error, prevents submit if invalid

## Example

<iframe src="../../examples/form_validation.html" height="600"></iframe>

```twig
<form action="#" data-validate>
  <div class="my-4">
    <label for="name">Name</label>
    <input name="name" id="name" type="text" required />
  </div>
  <div class="my-4">
    <label for="errorInLabel"> Error next to label <span class="" data-error-placeholder></span> </label>
    <input name="errorInLabel" id="errorInLabel" type="text" required />
  </div>
  <div class="my-4">
    <label for="email">Email</label>
    <input name="email" id="email" type="email" required />
  </div>
  <div class="my-4">
    <label for="date">Date</label>
    <input class="form__input" name="date" id="date" type="text" data-date-picker required />
  </div>
  <div class="my-4">
    <label for="minlength">Minimum length needs to be 4</label>
    <input id="minlength" name="minlength" type="text" minlength="4" required />
  </div>
  <div class="my-4">
    <label for="maxlength">Maximum length is 20</label>
    <input id="maxlength" name="maxlength" type="text" maxlength="20" required />
  </div>
  <div class="my-4" data-validate-wrapper>
    <label for="password">Password</label>
    <div class="flex items-center js-password-toggle">
      <input class="mb-0 form__input" name="password" id="password" type="password" required />
      <button type="button" class="ml-2 group" data-password-toggle="password">
        {{ icon('visibility', { class: 'group-aria-checked:hidden' }) }} {{ icon('visibility-off', { class: 'hidden
        group-aria-checked:block' }) }}
        <span class="sr-only">{{ "Show/Hide Password"|t }}</span>
      </button>
    </div>
  </div>
  <div class="my-4" data-validate-wrapper>
    <label for="password-confirm">Confirm Password</label>
    <div class="flex items-center js-password-toggle">
      <input
        class="mb-0 form__input"
        name="password-confirm"
        id="password-confirm"
        type="password"
        required
        data-confirm="password"
      />
      <button type="button" class="ml-2 group" data-password-toggle="password-confirm">
        {{ icon('visibility', { class: 'group-aria-checked:hidden' }) }} {{ icon('visibility-off', { class: 'hidden
        group-aria-checked:block' }) }}
        <span class="sr-only">{{ "Show/Hide Password"|t }}</span>
      </button>
    </div>
  </div>
  <div class="my-4 form__field">
    <label for="password">Password Strength</label>
    <input
      id="passwordStrength"
      type="password"
      name="password"
      data-strength
      data-min-length="8"
      data-max-length="30"
      data-cases="true"
      data-numbers="true"
      data-symbols="true"
      data-show-strength-indicator="true"
      data-show-strength-indicator-text="true"
      required
    />
  </div>
  <div class="my-4">
    <label for="minmax">Min 10 - Max 100</label>
    <input id="minmax" name="minmax" type="number" min="10" step="5" max="100" required />
  </div>
  <div class="my-4">
    <label for="pattern">Pattern with extra custom message</label>
    <input
      id="pattern"
      name="pattern"
      type="text"
      required
      pattern="[a-z]{4,8}"
      title="4 to 8 lowercase letters"
      data-extra-message="De waarde moeten kleine letters zijn en tussen de 4 en 8 lang zijn."
    />
  </div>
  <div class="my-4" data-validate-wrapper>
    <label for="choice">Select</label>
    <select name="choice" id="choice" required>
      <option value="">Select something</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="-1">Other</option>
    </select>
  </div>
  <button type="submit" class="btn">Submit</button>
</form>
```

## Styling

This component does not provide extra css classes not does it need specific class in order to work.

When an element is invalid it gets the attribute `[aria-invalid='true']`. You can use this selector to target the element for styling.

The error message also gets a specific attribute `[role='alert']`. You can use this selector to target the element for styling.

### Error message

The DOM position of the error message element is by default at the end of the parent of the form element.

```HTML
<div class="my-4">
    <label for="name">Name</label>
    <input name="name" id="name" type="text" required/>
</div>
```

When the name is invalid the DOM becomes:

```HTML
<div class="my-4" data-validate-wrapper="">
    <label for="name">Name</label>
    <input name="name" id="name" type="text" required="" data-unique-id="validate-0-0" aria-invalid="true" aria-errormessage="error-validate-0-0">
    <div class="" id="error-validate-0-0" role="alert">This value is required.</div>
</div>
```

#### Can I choose where the error is rendered?

You can do this in two ways.

By giving a surrounding element an attribute of `data-validate-wrapper`. The error will then be added at the end of this element.

```HTML
 <div class="my-4" data-validate-wrapper>
    <fieldset>
        <legend>Choose your option</legend>
        <ul>
            <li>
                <input id="radio1" type="checkbox" name="radio" value="1"/>
                <label for="radio1">Option 1</label>
            </li>
            <li>
                <input id="radio2" type="checkbox" name="radio" value="2"/>
                <label for="radio2">Option 2</label>
            </li>
            <li>
                <input id="radio3" type="checkbox" name="radio" value="3"/>
                <label for="radio3">Option 3</label>
            </li>
        </ul>
    </fieldset>
</div>
```

Or by setting an element with the attribute `data-error-placeholder`. Then this element will be used for showing the error.

```HTML
<div class="my-4">
    <label for="errorInLabel">
        Error next to label <span class="" data-error-placeholder></span>
    </label>
    <input name="errorInLabel" id="errorInLabel" type="text" required/>
</div>

<div class="my-4" data-validate-wrapper>
    <label for="errorInLabel">
        Error next to label <span class="" data-error-placeholder></span>
    </label>
    <div>
        <input name="errorInLabel" id="errorInLabel" type="text" required/>
    </div>
</div>
```

## Attributes

| Attribute                | Description                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-validate`          | This triggers the component on a form element                                                                                                                 |
| `data-scroll-to-error`   | By default the page scrolls to the first error occurring in the form. With this attribute you can ignore that behavior. Set to `"false"` to disable scrolling |
| `data-dont-validate`     | You can add this to form elements you don't want the component to check                                                                                       |
| `data-validate-wrapper`  | Add this to a wrapper element of your form element to control the position of the error message                                                               |
| `data-error-placeholder` | Add this to an element if this element needs to function as the error message wrapper                                                                         |
| `data-extra-message`     | Custom error message to append to the default validation message                                                                                              |
| `novalidate`             | Add to form element (automatically added by component) to disable native browser validation                                                                   |

## Validation Types

The component handles all HTML5 validation types:

| Validation                | Triggers             | Example                                    |
| ------------------------- | -------------------- | ------------------------------------------ |
| `required`                | Empty value          | `<input required>`                         |
| `type="email"`            | Invalid email format | `<input type="email">`                     |
| `type="url"`              | Invalid URL format   | `<input type="url">`                       |
| `type="tel"`              | Invalid phone format | `<input type="tel">`                       |
| `type="number"`           | Non-numeric value    | `<input type="number">`                    |
| `min` / `max`             | Out of range         | `<input type="number" min="10" max="100">` |
| `minlength` / `maxlength` | String length        | `<input minlength="4" maxlength="20">`     |
| `pattern`                 | Regex mismatch       | `<input pattern="[a-z]{4,8}">`             |
| `step`                    | Invalid increment    | `<input type="number" step="5">`           |

## Accessibility

### ARIA Attributes

The component automatically adds proper ARIA attributes:

```html
<!-- Before validation -->
<input id="email" type="email" required />

<!-- After invalid submission -->
<input
  id="email"
  type="email"
  required
  data-unique-id="validate-0-1"
  aria-invalid="true"
  aria-errormessage="error-validate-0-1"
/>
<div id="error-validate-0-1" role="alert">Please enter a valid email address.</div>
```

### Screen Reader Support

- **role="alert"**: Error messages are announced immediately
- **aria-invalid**: Indicates invalid state to assistive technology
- **aria-errormessage**: Links error message to input

### Autocomplete

Always add autocomplete attributes for better UX and accessibility:

```html
<input type="text" name="name" autocomplete="name" />
<input type="email" name="email" autocomplete="email" />
<input type="tel" name="phone" autocomplete="tel" />
<input type="password" name="password" autocomplete="new-password" />
```

See [HTML autocomplete options](https://www.w3.org/TR/html52/sec-forms.html#element-attrdef-autocompleteelements-autocomplete).

## JavaScript API

### Trigger Validation Manually

```javascript
const input = document.getElementById('email');
input.dispatchEvent(new Event('check-validation'));
```

### Listen for Valid Submission

```javascript
const form = document.querySelector('form[data-validate]');

form.addEventListener('valid-submit', (e) => {
  console.log('Form is valid and will be submitted');
});
```

### Custom Validation Logic

Use `setCustomValidity()` for custom validation:

```javascript
const input = document.getElementById('username');

input.addEventListener('input', async (e) => {
  const username = e.target.value;
  const exists = await checkUsernameExists(username);

  if (exists) {
    input.setCustomValidity('This username is already taken');
  } else {
    input.setCustomValidity('');
  }
});
```

## Resources

- [HTML5 Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation)
- [ARIA Form Validation](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA21)
- [HTML Autocomplete Attribute](https://www.w3.org/TR/html52/sec-forms.html#autofilling-form-controls-the-autocomplete-attribute)
- [ValidityState Interface](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
