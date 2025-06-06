# Other radio option

When the provided options are sometimes not enough, you want to provide the user with the option to provide a custom option. This component facilitates the logic needed to make this work.

## Example

<iframe src="../examples/form_other_radio.html" height="200"></iframe>

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
        <li>
            <input id="otherOptions3" type="radio" name="otherOptions" value="3" required/>
            <label for="otherOptions3">Option 3</label>
        </li>
        <li data-other-option>
            <input type="radio" id="otherOptions4" name="otherOptions" value="" required />
            <label class="" for="otherOptions4">
                <input class="border-1" type="text" placeholder="Other option" novalidate />
            </label>
        </li>
    </ul>
</form>
```

The component gets triggered by the attribute `data-other-option`. This attribute needs to be on a wrapper element. In this elements there need to be an input of type radio and an input of type text.

The text input has preferably a `novalidate` attribute. What the component does is just taking the content of this input and puts it as the value of the radio input. So the text input does not needs to be validated.
