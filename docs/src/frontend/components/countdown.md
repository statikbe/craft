# Countdown

A validation plugin that displays a live character counter for textarea elements with maximum length limits. It shows remaining characters in the format "remaining/maximum" and automatically hides when the field is empty.

## Features

- ✅ **Live Character Counting** - Updates on every keystroke
- ✅ **Automatic Visibility** - Shows counter only when user types
- ✅ **Integration with maxlength** - Works with native HTML maxlength attribute
- ✅ **Accessible** - Uses aria-live for screen reader announcements
- ✅ **Dynamic Content Support** - Works with dynamically added elements
- ✅ **Validation Plugin** - Part of the validation component system

## Use Cases

- **Social Media Posts** - Twitter-style character limits
- **Form Fields** - Bio, description, or comment fields with limits
- **Meta Descriptions** - SEO fields with optimal character counts
- **SMS Messages** - Character counting for message composition
- **User Input** - Any textarea where character limits need visibility

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

## Required Attributes

| Attribute        | Required | Description                                                                                      |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `data-countdown` | ✅ Yes   | ID of the element that will display the character count. Must match an element's `id` attribute. |
| `maxlength`      | ✅ Yes   | Native HTML attribute that limits the maximum number of characters allowed in the textarea.      |

::: warning Element Type Requirement
This plugin **only works on textarea elements**. It monitors `keyup` events and reads the `value.length` property.
:::

## Counter Display Structure

The counter element (referenced by `data-countdown`) must contain:

| Child Attribute        | Required | Description                                                           |
| ---------------------- | -------- | --------------------------------------------------------------------- |
| `data-countdown-count` | ✅ Yes   | Element where the count text will be inserted (typically a `<span>`). |

**Required structure:**

```html
<!-- Element with ID matching data-countdown value -->
<span id="character-counter" aria-live="polite">
  Characters left:
  <!-- Child with data-countdown-count -->
  <span data-countdown-count></span>
</span>
```

::: danger Missing Elements
If the plugin can't find the counter element or its `data-countdown-count` child, you'll see this console warning:

```
Make sure your data-countdown element exists and it has a child span.
```

The countdown won't work until these elements are present.
:::

### Counter Format

The counter displays in this format:

```
[remaining]/[maximum]
```

**Examples:**

- User types 15 characters with maxlength="140": `"125/140"`
- User types 140 characters: `"0/140"`
- User deletes all content: Counter hides

## Visibility Behavior

The counter automatically manages its visibility:

| Condition               | Counter State | Class Applied    |
| ----------------------- | ------------- | ---------------- |
| Textarea is empty       | Hidden        | `hidden`         |
| User types (length > 0) | Visible       | `hidden` removed |
| User deletes all text   | Hidden        | `hidden`         |

::: tip Initial State
Start with the `hidden` class on your counter element:

```html
<span class="hidden" id="character-counter">...</span>
```

The plugin will show it when the user starts typing.
:::

## Dynamic Content Support

The plugin supports dynamically added countdowns:

```typescript
DOMHelper.onDynamicContent(document.documentElement, '[data-countdown]', (countdowns: NodeListOf<Element>) => {
  countdowns.forEach((countdown) => {
    this.initCountdown(countdown);
  });
});
```

**What this means:**

- Countdowns added via AJAX work automatically
- Modal dialogs with countdowns initialize properly
- No manual re-initialization needed
- Uses `MutationObserver` under the hood

## Accessibility

The component includes accessibility features:

✅ **Live Region Announcements**

```html
<span id="character-counter" aria-live="polite"> Characters left: <span data-countdown-count></span> </span>
```

**Why `aria-live="polite"`?**

- Screen readers announce character count changes
- `polite` waits for user to pause before announcing
- Prevents interrupting user input
- Updates announced as "Characters left: 85 out of 140"

✅ **Visual Feedback**

- Counter visible when typing
- Clear format: "remaining/maximum"
- Positioned near the textarea (typically)

::: tip Screen Reader Experience
Use descriptive text before the counter:

```html
<span aria-live="polite"> Characters remaining: <span data-countdown-count></span> </span>
```

This provides context for screen reader users.
:::

## Styling the Counter

### Basic Styling

```css
/* Counter container */
#character-counter {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
}

/* Count number */
[data-countdown-count] {
  font-weight: 600;
  color: #374151;
}
```

## Multiple Countdowns

You can have multiple countdowns on one page:

```html
<form data-validate>
  <!-- First countdown -->
  <label for="bio">Bio (200 characters)</label>
  <textarea id="bio" maxlength="200" data-countdown="bio-counter"> </textarea>
  <span class="hidden" id="bio-counter" aria-live="polite">
    <span data-countdown-count></span>
  </span>

  <!-- Second countdown -->
  <label for="tagline">Tagline (50 characters)</label>
  <textarea id="tagline" maxlength="50" data-countdown="tagline-counter"> </textarea>
  <span class="hidden" id="tagline-counter" aria-live="polite">
    <span data-countdown-count></span>
  </span>
</form>
```

Each countdown operates independently.

## Best Practices

::: tip Match Native Behavior
Always use the native `maxlength` attribute. The countdown plugin **enhances** it, not replaces it. This ensures:

- Browser enforces the limit
- Users can't exceed maxlength
- Countdown calculation is accurate
  :::

::: tip Position Near Input
Place the counter close to the textarea, typically below or to the right:

```html
<div class="relative">
  <textarea data-countdown="counter" maxlength="140"></textarea>
  <div class="flex justify-end mt-1">
    <span class="hidden" id="counter">...</span>
  </div>
</div>
```

:::

::: warning Don't Rely on JavaScript Alone
The countdown is a **UX enhancement**. The `maxlength` attribute is the actual enforcement. JavaScript could fail or be disabled.
:::

## Troubleshooting

**Counter not showing?**

- Check that counter element has `id` matching `data-countdown` value
- Verify counter has child with `data-countdown-count` attribute
- Check console for the warning message
- Ensure counter starts with `hidden` class
- Type in the textarea (counter only shows when length > 0)

**Counter not updating?**

- Verify textarea has `maxlength` attribute
- Check that `maxlength` is a valid number
- Look for JavaScript errors in console
- Ensure `keyup` event isn't prevented by other scripts

**Counter shows wrong count?**

- Verify `maxlength` attribute value is correct
- Check that you're not modifying value programmatically without triggering `keyup`
- Ensure only one counter is associated with each textarea

**Counter visible on page load?**

- Add `hidden` class to counter element initially
- Plugin removes it when user types
- Don't use `display: none` in CSS (use Tailwind `hidden` or similar)

**Dynamic countdowns not working?**

- Plugin should handle this automatically via `DOMHelper`
- Check that validation component is initialized
- Verify new textareas have correct attributes
- Check console for initialization errors

**Multiple countdowns conflicting?**

- Ensure each textarea has unique `data-countdown` value
- Each counter must have unique `id`
- Don't reuse counter elements for multiple textareas

## Integration with Forms

### Basic Form Integration

```html
<form data-validate method="POST" action="/submit">
  <label for="description">Description</label>
  <textarea id="description" name="description" maxlength="500" data-countdown="desc-counter" required> </textarea>

  <div class="text-right text-sm text-gray-600">
    <span class="hidden" id="desc-counter" aria-live="polite">
      Characters left: <span data-countdown-count></span>
    </span>
  </div>

  <button type="submit">Submit</button>
</form>
```

::: danger Never Trust Client-Side Limits
JavaScript can be disabled or bypassed. Always enforce maxlength server-side.
:::

## Related Components

- **[Validation Component](../components/validation.md)** - Parent component that loads this plugin
