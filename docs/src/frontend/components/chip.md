# Chip

The Chip component transforms a group of checkboxes or radio buttons into a button that opens a modal dialog for selection. It's commonly used for filters, multi-select controls, and tag selection with comprehensive accessibility support.

## Features

- ✅ **Modal Dialog** - Opens checkbox/radio selections in an accessible modal
- ✅ **Smart Labeling** - Shows selected items or count bubble
- ✅ **Intelligent Positioning** - Uses `@floating-ui/dom` with flip and shift middleware
- ✅ **Keyboard Navigation** - Full keyboard and focus trap support
- ✅ **Accessibility** - WCAG 2.1 AA compliant with ARIA dialog pattern
- ✅ **Clear Actions** - Optional clear buttons in trigger and modal
- ✅ **Flexible Display** - Show selections as text or count bubble
- ✅ **Auto-close** - Optional close on selection
- ✅ **Custom Prefix** - Add icons or elements before trigger text
- ✅ **Highly Customizable** - Override all CSS classes via data attributes

## Use Cases

- **Filters** - Product filtering, search refinement
- **Multi-select** - Tag selection, category assignment
- **Radio Groups** - Single selection with modal UI
- **Mobile-friendly** - Better UX than native multi-select on mobile

## Required Structure

::: danger Heading Required
The first child of `[data-chip]` **must be a heading** (`<h1>`). The component uses it for:

- Modal `aria-labelledby` attribute
- Trigger button default text
- Accessible dialog title

The heading can be visually hidden with `.sr-only` if needed.
:::

**Minimum structure:**

```html
<div data-chip="Category Filter">
  <h1>Category Filter</h1>
  <!-- Required! -->
  <!-- Checkboxes/radios here -->
</div>
```

## How It Works

### Initialization

1. **Finds elements** with `[data-chip]` attribute
2. **Moves content** to a modal dialog element
3. **Creates trigger button** with dropdown indicator
4. **Adds optional elements** (clear buttons, bubble, prefix icon)
5. **Stores input labels** from `<label>` elements for display
6. **Sets up accessibility** (ARIA attributes, focus trap)
7. **Initializes positioning** with `@floating-ui/dom`

### User Interaction Flow

1. User clicks trigger button
2. Modal opens with checkbox/radio list
3. `@floating-ui/dom` positions modal near trigger
4. Focus trapped within modal
5. User selects options
6. **Optional:** Modal closes on selection (if `data-chip-close-on-change="true"`)
7. **Optional:** Modal stays open for multiple selections
8. Trigger text updates to show selection
9. User clicks outside, presses Escape, or clicks close button
10. Modal closes, trigger shows updated selection

## Example

<iframe src="../../examples/chip.html" height="300"></iframe>

```HTML
<div data-chip="Simple Chip"
    data-chip-show-clear-in-button="true"
    data-chip-show-clear-in-modal="false"
    data-chip-show-close-button="false"
    data-chip-close-on-change="false"
    data-chip-show-bubble="false">
    <h1 class="mb-2 text-lg">Simple Chip</h1>
    <ul class="">
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-1" value="1" class="cursor-pointer">
            <label for="category-1" class="inline-block my-1 cursor-pointer">Category 1</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-2" value="1" class="cursor-pointer">
            <label for="category-2" class="inline-block my-1 cursor-pointer">Category 2</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-3" value="1" class="cursor-pointer">
            <label for="category-3" class="inline-block my-1 cursor-pointer">Category 3</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-4" value="1" class="cursor-pointer">
            <label for="category-4" class="inline-block my-1 cursor-pointer">Category 4</label>
        </li>
    </ul>
</div>
```

## Full Example

<iframe src="../../examples/chip_full.html" height="300"></iframe>

```HTML
<div data-chip="Full example"
    data-chip-show-clear-in-button="true"
    data-chip-show-clear-in-modal="true"
    data-chip-modal-clear-label="wissen"
    data-chip-show-close-button="true"
    data-chip-show-bubble="true"
    data-chip-close-on-change="false"
    data-chip-prefix="prefixIcon">
    <div class="mr-2" id="prefixIcon">
        <svg class="icon" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z"></path></svg>
    </div>
    <h1 class="mb-2 text-lg">Full example</h1>
    <ul class="">
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-1" value="1" class="cursor-pointer">
            <label for="category-1" class="inline-block my-1 cursor-pointer">Category 1</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-2" value="1" class="cursor-pointer">
            <label for="category-2" class="inline-block my-1 cursor-pointer">Category 2</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-3" value="1" class="cursor-pointer">
            <label for="category-3" class="inline-block my-1 cursor-pointer">Category 3</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-4" value="1" class="cursor-pointer">
            <label for="category-4" class="inline-block my-1 cursor-pointer">Category 4</label>
        </li>
    </ul>
</div>
```

## Required Attributes

| Attribute   | Required | Description                                                                                            |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `data-chip` | ✅ Yes   | Marks the wrapper element. Value is used as the chip name/title in the trigger button and ARIA labels. |

## Configuration Attributes

Control the chip's behavior and appearance:

| Attribute                        | Default | Description                                                                                               |
| -------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `data-chip-show-clear-in-button` | `true`  | Shows a clear button next to the trigger button when items are selected.                                  |
| `data-chip-show-clear-in-modal`  | `true`  | Shows a clear button at the bottom of the modal to deselect all items.                                    |
| `data-chip-modal-clear-label`    | -       | Custom text for the modal clear button (defaults to language file value).                                 |
| `data-chip-show-close-button`    | `true`  | Shows a close (X) button in the top-right corner of the modal.                                            |
| `data-chip-show-bubble`          | `true`  | Shows a count bubble instead of selected text. When `true`, trigger shows chip name with count badge.     |
| `data-chip-close-on-change`      | `true`  | Closes the modal automatically when a selection changes. Set to `false` for multi-select that stays open. |
| `data-chip-prefix`               | -       | ID of an element to show before the trigger text (e.g., icon). Element is moved into the trigger button.  |

### Display Modes

**Bubble Mode** (`data-chip-show-bubble="true"`):

- Trigger shows: `"Category Filter"` with badge `"3"`
- Compact display, good for filters with many selections

**Text Mode** (`data-chip-show-bubble="false"`):

- Trigger shows selected items:
  - 0 selected: `"Category Filter"`
  - 1 selected: `"Electronics"`
  - Multiple: `"Electronics +2"`
- Verbose display, shows what's selected

### Close Behavior

**Auto-close** (`data-chip-close-on-change="true"`):

- Best for single-select (radio buttons)
- Modal closes immediately after selection
- Quick interaction

**Stay open** (`data-chip-close-on-change="false"`):

- Best for multi-select (checkboxes)
- User can make multiple selections before closing
- Close via outside click, Escape, or close button

## Styling Customization

Override individual UI elements by adding data attributes. These replace the default Tailwind classes:

| Attribute                   | Applied To                  | Default Classes                                                                                                                                                                                                                                        |
| --------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-chip-element`         | Wrapper element             | `relative`                                                                                                                                                                                                                                             |
| `data-chip-trigger-wrapper` | Trigger button container    | `chip-trigger-wrapper relative flex`                                                                                                                                                                                                                   |
| `data-chip-trigger`         | Trigger button              | `chip-trigger flex items-center after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-down.svg")] after:shrink-0 after:ml-2` |
| `data-chip-trigger-clear`   | Trigger clear button        | `chip-trigger-clear after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`                                  |
| `data-chip-option-after`    | Option items (li elements)  | `chip-option px-2 text-current after:hidden after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/check.svg")]`                      |
| `data-chip-bubble`          | Count bubble                | `chip-bubble absolute -top-4 -right-2 h-5 min-w-5 bg-blue-500 text-white rounded-full text-sm leading-0 flex justify-center items-center`                                                                                                              |
| `data-chip-modal`           | Modal dialog container      | `chip-modal fixed top-0 left-0 z-10 p-6 bg-white shadow-sm max-w-max w-[90vw]`                                                                                                                                                                         |
| `data-chip-modal-close`     | Modal close (X) button      | `chip-modal-close absolute top-0 right-0 p-2 after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`         |
| `data-chip-modal-clear`     | Modal clear button (bottom) | `chip-modal-clear flex items-center ml-auto before:mr-2 before:text-black before:shrink-0 before:w-[1em] before:h-[1em] before:mask-center before:mask-no-repeat before:mask-contain before:bg-current before:mask-[url("/frontend/icons/clear.svg")]` |

**Example:**

```html
<div
  data-chip="Colors"
  data-chip-trigger="btn btn-primary"
  data-chip-modal="rounded-lg shadow-2xl p-8"
  data-chip-bubble="bg-red-500 text-white"
>
  <h1>Select Colors</h1>
  <!-- Options -->
</div>
```

## Input Label Storage

The component stores each input's label for display purposes:

```html
<input type="checkbox" id="cat1" /> <label for="cat1">Electronics</label>
```

During initialization:

```typescript
// Component adds this attribute:
<input data-chip-input-label="Electronics" />
```

This label is used for:

- Trigger button text (shows selected item name)
- Comparison when unchecking items
- Determining which selection to display

::: tip Label Requirement
Each input should have an associated `<label>` element with matching `for` attribute. Without it, the component can't display selection names properly.
:::

## Trigger Text Logic

The trigger button text changes based on selections:

| Selections | Bubble Mode Display     | Text Mode Display  |
| ---------- | ----------------------- | ------------------ |
| 0          | `"Filter"` (no bubble)  | `"Filter"`         |
| 1          | `"Filter"` + bubble `1` | `"Electronics"`    |
| 2+         | `"Filter"` + bubble `N` | `"Electronics +2"` |

**Text mode logic:**

- Shows first selected item's label
- Adds `+N` for additional selections
- Strips HTML from labels (uses `DOMParser`)

## Modal Positioning

Uses `@floating-ui/dom` with sophisticated positioning:

### Middleware

1. **`flip()`** - Flips modal to opposite side if no space
2. **`shift({ padding: 16 })`** - Shifts modal to stay in viewport with 16px padding
3. **`size()`** - Sets minimum width (300px or available width, whichever is smaller)
4. **`autoUpdate()`** - Automatically repositions on scroll, resize, and DOM changes

### Placement

- **Default:** `bottom-start` (below trigger, left-aligned)
- **Strategy:** `fixed` positioning
- **Min width:** 300px (configurable via `modalMinWidth` property)
- **Max width:** 90vw
- **Responsive:** Adjusts to available viewport space

## Accessibility

The component implements the ARIA Dialog pattern with comprehensive accessibility:

### ARIA Attributes

**Trigger Button:**

- `aria-haspopup="dialog"` - Indicates button opens a dialog
- `aria-label` - Descriptive label with selection state
  - Not selected: `"Category Filter, no items selected"`
  - Selected: `"Electronics +2, Category Filter, items selected"`

**Modal:**

- `role="dialog"` - Identifies as modal dialog
- `aria-modal="true"` - Indicates modal behavior
- `aria-labelledby` - References heading element for accessible name
- `tabindex="-1"` - Makes modal focusable for screen readers

### Focus Management

**Focus Trap:**

- Uses `A11yUtils.keepFocus(modalElement)` to trap focus
- Tab cycles through elements within modal only
- Shift+Tab works in reverse
- Focus returns to trigger on close

**Initial Focus:**

- Modal itself receives focus on open
- Screen readers announce dialog title

### Keyboard Support

| Key           | Action                                 |
| ------------- | -------------------------------------- |
| `Enter/Space` | Toggles trigger button (opens modal)   |
| `Escape`      | Closes modal                           |
| `Tab`         | Cycles through modal elements          |
| `Shift+Tab`   | Cycles backward through modal elements |
| `Space`       | Toggles checkboxes/radios              |
| Click outside | Closes modal                           |

### Screen Reader Support

**Announcements:**

- Opening: "Category Filter, dialog"
- Trigger label includes selection count and state
- Clear buttons have `aria-label` attributes
- Close button has screen reader-only label text

**Language Support:**

- Messages from i18n file: `s-chip-{lang}.json`
- Keys: `clear`, `modalClose`, `modalClear`, `triggerNotSelectedLabel`, `triggerSelectedLabel`

## Custom Events

The component dispatches custom events you can listen for:

| Event              | Bubbles | When                                  | Use Case                                  |
| ------------------ | ------- | ------------------------------------- | ----------------------------------------- |
| `chip-modal-open`  | ✅ Yes  | Modal opens                           | Analytics, external state management      |
| `chip-modal-close` | ✅ Yes  | Modal closes                          | Analytics, cleanup, external updates      |
| `chip-cleared`     | ✅ Yes  | Clear button clicked (all deselected) | Reset filters, update other UI components |

**Example:**

```javascript
const chip = document.querySelector('[data-chip]');

chip.addEventListener('chip-modal-open', () => {
  console.log('Chip modal opened');
});

chip.addEventListener('chip-cleared', () => {
  console.log('All selections cleared');
  // Update URL, reset other filters, etc.
});
```

## Programmatic Control

### External Changes

Trigger external updates with `jschange` event:

```javascript
// Programmatically check an option
const checkbox = document.querySelector('#cat1');
checkbox.checked = true;

// Notify chip to update display
const triggerButton = document.querySelector('[data-chip] .chip-trigger');
triggerButton.dispatchEvent(new Event('jschange'));
```

The component listens for:

- `change` events on inputs (user interaction)
- `jschange` events on inputs (programmatic changes)
- `jschange` events on trigger button (external updates)

### Clear All Selections

```javascript
// Trigger clear action
const clearButton = document.querySelector('[data-chip] .chip-trigger-clear');
clearButton.click();

// Or programmatically:
const chip = document.querySelector('[data-chip]');
const inputs = chip.querySelectorAll('input:checked');
inputs.forEach((input) => {
  input.checked = false;
  input.dispatchEvent(new Event('jschange', { bubbles: true }));
});
```

## State Management

The component maintains an `active` class on the wrapper:

```css
[data-chip].active {
  /* Styles for when items are selected */
}
```

**When applied:**

- At least one checkbox/radio is checked
- Automatically added/removed on selection changes
- Use for visual indication of active filters

## Best Practices

::: tip Radio vs Checkbox

- **Radio buttons:** Set `data-chip-close-on-change="true"` for single selection
- **Checkboxes:** Set `data-chip-close-on-change="false"` for multi-select that stays open
  :::

::: tip Bubble vs Text Mode

- **Bubble mode:** Best when many items can be selected (shows count)
- **Text mode:** Best when user needs to see what's selected without opening modal
  :::

::: tip Clear Button Placement

- **In trigger:** Use `data-chip-show-clear-in-button="true"` for quick access
- **In modal:** Use `data-chip-show-clear-in-modal="true"` for bulk deselection
- **Both:** Combine for maximum flexibility
  :::

::: tip Prefix Icons
Use `data-chip-prefix` for:

- Filter icons
- Category indicators
- Visual hierarchy

```html
<div data-chip="Favorites" data-chip-prefix="heartIcon">
  <span id="heartIcon">❤️</span>
  <h1>Favorites</h1>
  <!-- Options -->
</div>
```

:::

::: warning Heading Requirement
Always include an `<h1>` as the first child. The component throws an error if it's missing, and accessibility suffers.
:::

## Troubleshooting

**Modal not opening?**

- Check console for errors
- Verify heading element exists as first child
- Ensure `data-chip` attribute has a value (chip name)
- Check that `@floating-ui/dom` is loaded

**Trigger text not updating?**

- Verify inputs have associated `<label>` elements
- Check that labels have `for` attribute matching input `id`
- Ensure `data-chip-input-label` is being set during initialization

**Clear button not showing?**

- Verify `data-chip-show-clear-in-button="true"` is set
- Check that at least one item is selected
- Ensure `.active` class is being added to wrapper

**Bubble not showing?**

- Verify `data-chip-show-bubble="true"` is set
- Check that bubble element is created
- Ensure count is greater than 0

**Modal positioning wrong?**

- Verify `@floating-ui/dom` is loaded correctly
- Check for `overflow: hidden` on parent containers
- Test with different `placement` values if needed
- Ensure trigger button is visible when modal opens

**Focus trap not working?**

- Check that `A11yUtils.keepFocus()` is available
- Verify modal has `tabindex="-1"`
- Ensure modal is actually focused after opening
- Check for JavaScript errors

**Selections not persisting?**

- Component doesn't save state to localStorage automatically
- Track selections externally if needed across page loads
- Consider using form submission or URL parameters

**Language strings not showing?**

- Verify language file exists: `i18n/s-chip-{lang}.json`
- Check that `SiteLang.getLang()` returns correct language code
- Ensure language file has all required keys

## Language Support

The component requires a language file at `../i18n/s-chip-{lang}.json`:

```json
{
  "clear": "Clear",
  "modalClose": "Close",
  "modalClear": "Clear all",
  "triggerNotSelectedLabel": "no items selected",
  "triggerSelectedLabel": "items selected"
}
```

**Used for:**

- Clear button labels (trigger and modal)
- Close button `aria-label`
- Trigger button `aria-label` (includes selection state)
