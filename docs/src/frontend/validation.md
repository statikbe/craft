# Form validation

## A11y

Add [autocomplete options](https://www.w3.org/TR/html52/sec-forms.html#element-attrdef-autocompleteelements-autocomplete) to the appropriate fields if you make a custom form.

## Concept

This component uses for the biggest part the default HTML5 validation. We just layer some sprinkles on top like custom error messages, checkbox ranges, password strength, password repeat, ... .

## Activate component

You can activate the component by adding the attribute `data-validate` to a form element.

## Example

<iframe src="../examples/form_validation.html" height="600"></iframe>

```HTML
<form action="#" data-validate>
    <div class="my-4">
        <label for="name">Name</label>
        <input name="name" id="name" type="text" required/>
    </div>
    <div class="my-4">
        <label for="errorInLabel">
            Error next to label <span class="" data-error-placeholder></span>
        </label>
        <input name="errorInLabel" id="errorInLabel" type="text" required/>
    </div>
    <div class="my-4">
        <label for="email">Email</label>
        <input name="email" id="email" type="email" required/>
    </div>
    <div class="my-4">
        <label for="date">Date</label>
        <input class="form__input js-date-picker" name="date" id="date" type="text" required/>
    </div>
    <div class="my-4">
        <label for="minlength">Minimum length needs to be 4</label>
        <input id="minlength" name="minlength" type="text" minlength="4" required/>
    </div>
    <div class="my-4">
        <label for="maxlength">Maximum length is 20</label>
        <input id="maxlength" name="maxlength" type="text" maxlength="20" required/>
    </div>
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
    <div class="my-4 form__field">
        <label for="password">Password Strength</label>
        <input id="passwordStrength" type="password" name="password" data-strength
                    data-min-length="8"
                    data-max-length="30"
                    data-cases="true"
                    data-numbers="true"
                    data-symbols="true"
                    data-show-strength-indicator="true"
                    data-show-strength-indicator-text="true"
                    required>
    </div>
    <div class="my-4">
        <label for="minmax">Min 10 - Max 100</label>
        <input id="minmax" name="minmax" type="number" min="10" step="5" max="100" required>
    </div>
    <div class="my-4">
        <label for="pattern">Pattern with extra custom message</label>
        <input id="pattern" name="pattern" type="text" required pattern="[a-z]{4,8}" title="4 to 8 lowercase letters" data-extra-message="De waarde moeten kleine letters zijn en tussen de 4 en 8 lang zijn.">
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

| Attribute                | Description                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `data-validate`          | This triggers the component on a form element                                                                          |
| `data-scroll-to-error`   | By default the page scrolls to the first error occurring in the form. With this attribute you can ignore that behavior |
| `data-dont-validate`     | You can add this to form elements you don't want the component to check                                                |
| `data-validate-wrapper`  | Add this to a wrapper element of your form element to control the position of the error message                        |
| `data-error-placeholder` | Add this to an element if this element needs to function as the error message wrapper                                  |
