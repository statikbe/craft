# Countdown

This JavaScript plugin provides the option to limit the number of characters in a textarea. The available characters get displayed to the user.

## Usage

By adding the attribute `maxlength` you limit the amount of possible characters to that amount.
With the attribute `data-countdown` you can give the id of an element. The content of this element will dynamically update as the user types, showing the remaining number of characters available.

## Example

<iframe src="../../examples/countdown.html" height="220"></iframe>

```html
<form action="#" data-validate>
  <label for="textarea">Maximum length is 140 and has a countdown</label>
  <textarea
    class=""
    id="textarea"
    name="textarea"
    maxlength="140"
    data-countdown="character-counter"
    required
  ></textarea>
  <div class="flex justify-end text-sm">
    <span class="hidden" id="character-counter" aria-live="polite"
      >Characters left:
      <span class="nr-of-characters" data-countdown-count></span>
    </span>
  </div>
  <div class="mt-4">
    <button type="submit" class="btn">Submit</button>
  </div>
</form>
```
