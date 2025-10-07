# Optional blocks

When creating a form you sometimes want to ask additional content depending on previous answers. This component lets you do just that.

And sometimes you want to require an element except when the users chooses another option.

## Example optional block

<iframe src="../examples/form_optional_block.html" height="450"></iframe>

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

<iframe src="../examples/form_optional_required.html" height="240"></iframe>

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
