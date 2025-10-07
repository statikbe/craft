# Password visibility toggle

This is a simple button to switch an input from password to text in order to read the password.

## Example

<iframe src="../examples/password_toggle.html" height="100"></iframe>

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

To set this up, you need to create a button element with an attribute of `data-password-toggle`. The value of this attribute is the name of the password field.
