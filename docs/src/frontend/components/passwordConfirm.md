# Password Confirm

The Password Confirm plugin validates that password confirmation fields match the original password input. It integrates with the Validation component to provide real-time feedback, preventing form submission when passwords don't match. This ensures users correctly confirm their passwords during registration or password changes.

## Features

- ✅ **Real-Time Validation**: Checks match on blur events
- ✅ **Custom Error Messages**: Localized "must match" messages
- ✅ **Validation Integration**: Works with form validation component
- ✅ **Dynamic Content Support**: Handles dynamically added password fields
- ✅ **Bidirectional Checking**: Validates on both fields
- ✅ **Browser Native**: Uses `setCustomValidity()` API
- ✅ **Accessible**: Works with screen readers via validation messages
- ✅ **Auto-Discovery**: Finds fields via `data-confirm` attribute

## How It Works

### Initialization Flow

1. **Find Elements**: Component finds all `input[data-confirm]` elements
2. **Link to Original**: Gets original password field by ID from `data-confirm`
3. **Add Listeners**: Attaches blur events to both fields
4. **Validate on Blur**: When user leaves field, checks if values match
5. **Set Validity**: Uses `setCustomValidity()` to mark field valid/invalid
6. **Show Error**: Validation component displays error message
7. **Prevent Submit**: Invalid field blocks form submission

### Validation Process

**On Confirm Field Blur**:

1. Get original password value
2. Get confirmation password value
3. Compare values
4. If different: setCustomValidity("Passwords must match")
5. If same: setCustomValidity("") // Clear error
6. Call reportValidity() to show/hide error

**On Original Field Blur**:

1. Also triggers validation on confirm field
2. Ensures both fields stay in sync
3. Clears errors if now matching

## Example

<iframe src="../../examples/password_confirm.html" height="350"></iframe>

```twig
<form action="#" data-validate>
    <div class="my-4" data-validate-wrapper>
        <label for="password">Password</label>
        <div class="flex items-center js-password-toggle">
            <input class="mb-0 form__input" name="password" id="password" type="password" required/>
            <button type="button" class="ml-2 group" data-password-toggle="password">
                {{ icon('visibility', { class: 'group-aria-checked:hidden' }) }}
                {{ icon('visibility-off', { class: 'hidden group-aria-checked:block' }) }}
                <span class="sr-only">{{ "Show/Hide Password"|t }}</span>
            </button>
        </div>
    </div>
    <div class="my-4" data-validate-wrapper>
        <label for="password-confirm">Confirm Password</label>
        <div class="flex items-center js-password-toggle">
            <input class="mb-0 form__input" name="password-confirm" id="password-confirm" type="password" required data-confirm="password"/>
            <button type="button" class="ml-2 group" data-password-toggle="password-confirm">
                {{ icon('visibility', { class: 'group-aria-checked:hidden' }) }}
                {{ icon('visibility-off', { class: 'hidden group-aria-checked:block' }) }}
                <span class="sr-only">{{ "Show/Hide Password"|t }}</span>
            </button>
        </div>
    </div>
    <div class="mt-4">
        <button type="submit" class="btn">Submit</button>
    </div>
</form>
```

## Data Attributes

| Attribute               | Type      | Description                                                      |
| ----------------------- | --------- | ---------------------------------------------------------------- |
| `data-confirm`          | ID string | **Required**. ID of the original password field to match against |
| `data-validate`         | Boolean   | Should be on parent `<form>` to enable validation                |
| `data-validate-wrapper` | Boolean   | Wraps field for proper error message placement                   |

## Accessibility

### Labels and IDs

Always use proper labels:

```html
<!-- Good ✅ -->
<label for="password">Password</label>
<input type="password" id="password" />

<label for="password-confirm">Confirm Password</label>
<input type="password" id="password-confirm" data-confirm="password" />

<!-- Bad ❌ - No labels -->
<input type="password" placeholder="Password" id="password" />
<input type="password" placeholder="Confirm" data-confirm="password" />
```

### Multiple Password Pairs

```html
<form data-validate>
  <!-- Pair 1: Login password -->
  <input type="password" id="login-pass" />
  <input type="password" data-confirm="login-pass" />

  <!-- Pair 2: Transaction password -->
  <input type="password" id="transaction-pass" />
  <input type="password" data-confirm="transaction-pass" />
</form>
```

Each pair validates independently.

## Related Components

- **[Validation](./validation.md)**: Form validation system (required)
- **[Password Strength](./passwordStrength.md)**: Password strength indicator
- **[Password Toggle](./passwordToggle.md)**: Show/hide password visibility
