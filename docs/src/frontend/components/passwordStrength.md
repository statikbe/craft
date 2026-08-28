# Password Strength

A visual password strength indicator that helps users create secure passwords. Shows real-time feedback with a progress bar and customizable requirements for length, character types, and complexity. Integrates seamlessly with the validation component to enforce password policies.

## Features

- ✅ **Real-Time Feedback**: Updates as user types
- ✅ **Visual Progress Bar**: 5 strength levels with color coding
- ✅ **Customizable Rules**: Configure length, cases, numbers, symbols
- ✅ **Requirement Checklist**: Shows which requirements are met/unmet
- ✅ **Strength Text**: Displays "Weak", "Fair", "Good", "Strong", "Very Strong"
- ✅ **Validation Integration**: Works with form validation system
- ✅ **Accessible**: Screen reader compatible with ARIA labels
- ✅ **Custom Messages**: Override default requirement text
- ✅ **Auto-Initialization**: Detects `data-strength` attribute
- ✅ **Dynamic Content**: Works with AJAX-loaded forms

## How It Works

The plugin calculates password strength based on configurable requirements:

### Initialization

1. Finds all inputs with `data-strength` attribute
2. Reads configuration from data attributes
3. Creates strength indicator elements (progress bar, text, requirements list)
4. Inserts elements after the password field
5. Sets up event listeners for input changes
6. Validates initial state if field has value

### Validation

Uses HTML5 Constraint Validation API:

```typescript
if (!meetsRequirements) {
  passwordField.setCustomValidity('Password does not meet requirements');
} else {
  passwordField.setCustomValidity('');
}
```

This prevents form submission until password is strong enough.

## Example

<iframe src="../../examples/password_strength.html" height="350"></iframe>

```html
<form action="#" data-validate>
  <div>
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
  <div class="mt-4">
    <button type="submit" class="btn">Submit</button>
  </div>
</form>
```

## Data Attributes

| Attribute                           | Type    | Default | Description                                         |
| ----------------------------------- | ------- | ------- | --------------------------------------------------- |
| `data-strength`                     | Boolean | —       | **Required**. Enables the strength indicator plugin |
| `data-min-length`                   | Number  | `8`     | Minimum number of characters required               |
| `data-max-length`                   | Number  | `30`    | Maximum number of characters allowed                |
| `data-cases`                        | Boolean | `true`  | Requires at least one uppercase letter              |
| `data-numbers`                      | Boolean | `true`  | Requires at least one number (0-9)                  |
| `data-symbols`                      | Boolean | `true`  | Requires at least one special character             |
| `data-show-strength-indicator`      | Boolean | `true`  | Show the progress bar                               |
| `data-show-strength-indicator-text` | Boolean | `true`  | Show strength level text (Weak/Strong)              |
| `data-min-length-message`           | String  | —       | Custom message for minimum length requirement       |
| `data-max-length-message`           | String  | —       | Custom message for maximum length requirement       |
| `data-cases-message`                | String  | —       | Custom message for uppercase requirement            |
| `data-numbers-message`              | String  | —       | Custom message for numbers requirement              |
| `data-symbols-message`              | String  | —       | Custom message for symbols requirement              |

## Related Components

- **[Validation](./validation.md)**: Form validation system (required)
- **[Password Confirm](./passwordConfirm.md)**: Confirm password matching
- **[Password Toggle](./passwordToggle.md)**: Show/hide password visibility
