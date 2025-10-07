# Checkbox range

By default, HTML does not provide an option to validate a minimum or maximum number of selected checkboxes. The `checkboxRange` plugin adds this functionality.

## Usage

By adding the attribute `min` or `max` to checkboxes with the same name, you create a range selection of checkboxes.

## Example

The following example demonstrates a checkbox group where you must select at least 2 and at most 4 options before submitting.

<iframe src="../examples/checkboxRange.html" height="400"></iframe>

```html
<form action="#" data-validate>
  <fieldset data-validate-wrapper>
    <legend class="mb-4">Checkbox range min 2 - max 4</legend>
    <ul>
      <li>
        <input id="checkboxRange1" type="checkbox" name="checkboxRange[]" value="1" min="2" max="4" />
        <label for="checkboxRange1">Option 1</label>
      </li>
      <li>
        <input id="checkboxRange2" type="checkbox" name="checkboxRange[]" value="2" min="2" max="4" />
        <label for="checkboxRange2">Option 2</label>
      </li>
      <li>
        <input id="checkboxRange3" type="checkbox" name="checkboxRange[]" value="3" min="2" max="4" />
        <label for="checkboxRange3">Option 3</label>
      </li>
      <li>
        <input id="checkboxRange4" type="checkbox" name="checkboxRange[]" value="4" min="2" max="4" />
        <label for="checkboxRange4">Option 4</label>
      </li>
      <li>
        <input id="checkboxRange5" type="checkbox" name="checkboxRange[]" value="5" min="2" max="4" />
        <label for="checkboxRange5">Option 5</label>
      </li>
      <li>
        <input id="checkboxRange6" type="checkbox" name="checkboxRange[]" value="6" min="2" max="4" />
        <label for="checkboxRange6">Option 6</label>
      </li>
      <li>
        <input id="checkboxRange7" type="checkbox" name="checkboxRange[]" value="7" min="2" max="4" />
        <label for="checkboxRange7">Option 7</label>
      </li>
    </ul>
  </fieldset>
  <div class="mt-4">
    <button type="submit" class="btn">Submit</button>
  </div>
</form>
```
