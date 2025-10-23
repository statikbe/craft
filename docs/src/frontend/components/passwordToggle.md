# Password Visibility Toggle

A simple accessibility-focused component that allows users to toggle password field visibility between masked and plain text, improving usability while maintaining security.

## Features

- ✅ **Toggle Visibility** - Switch between password (masked) and text (visible) input types
- ✅ **ARIA Support** - Uses `aria-checked` to indicate current state
- ✅ **Icon State Management** - Shows/hides appropriate icons based on state
- ✅ **Keyboard Accessible** - Fully operable with keyboard
- ✅ **Dynamic Content Support** - Works with AJAX-loaded forms via `DOMHelper`
- ✅ **Multiple Instances** - Support multiple password toggles on same page
- ✅ **Zero Configuration** - Simple attribute-based setup

## Example

<iframe src="../../examples/password_toggle.html" height="100"></iframe>

```twig
<form action="">
    <div class="flex items-center">
        <input class="mb-0 form__input" name="password" id="password" type="password" required/>
        <button type="button" class="ml-2 group" data-password-toggle="password">
            {{ icon('visibility', { class: 'group-aria-checked:hidden' }) }}
            {{ icon('visibility-off', { class: 'hidden group-aria-checked:block' }) }}
            <span class="sr-only">{{ "Show/Hide Password"|t }}</span>
        </button>
    </div>
</form>
```

## Attributes

### Required Attributes

| Attribute              | Element | Description                                                                |
| ---------------------- | ------- | -------------------------------------------------------------------------- |
| `data-password-toggle` | Button  | Name of the password input to toggle. Must match input's `name` attribute. |
| `name`                 | Input   | Unique identifier for the password input. Referenced by toggle button.     |

### Recommended Attributes

| Attribute                  | Element | Description                                          |
| -------------------------- | ------- | ---------------------------------------------------- |
| `type`                     | Button  | Should be `type="button"` to prevent form submission |
| `aria-label` or `.sr-only` | Button  | Accessible label for screen readers                  |

::: warning Use Name Attribute
The toggle references the input's `name` attribute, not `id`. Ensure your password input has a `name` attribute.
:::

## Best Practices

::: tip Use type="button"
Always set `type="button"` to prevent form submission:

```html
<button type="button" data-password-toggle="password">Toggle</button>
```

:::

::: tip Provide Accessible Label
Include screen reader text or aria-label:

```html
<button data-password-toggle="password">
  <span class="sr-only">Show/Hide Password</span>
  <svg><!-- icon --></svg>
</button>
```

:::

::: tip Position for Easy Access
Place toggle button adjacent to password input:

```html
<div class="flex items-center gap-2">
  <input type="password" name="password" />
  <button data-password-toggle="password">Toggle</button>
</div>
```

:::

::: warning Match Input Name
Ensure toggle references correct input name:

```html
<input name="userPassword" type="password" />
<button data-password-toggle="userPassword">Toggle</button>
<!-- Names must match exactly -->
```

:::

## Related Components

- **[Password Strength](./passwordStrength.md)** - Validate password complexity
- **[Password Confirm](./passwordConfirm.md)** - Validate password matching
- **[Validation Component](./validation.md)** - Form validation
