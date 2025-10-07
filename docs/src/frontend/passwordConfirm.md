# Password confirm

When people need to choose a password, you want to make sure they type in the correct password. In order to validate this, you need this plugin.

## Example

<iframe src="../examples/password_confirm.html" height="350"></iframe>

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

## Usage

Add an attribute of `data-confirm` on the controller input with a value of the ID of the original input. This enables the plugin to automatically check that the value entered in the confirmation field matches the original password field. If the values do not match, the form will display a validation error and prevent submission until both fields contain the same password.
