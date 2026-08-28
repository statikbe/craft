# Datepicker

A component that integrates [Flatpickr](https://flatpickr.js.org) to provide date selection functionality. It dynamically imports the Flatpickr library with full localization support and integrates with the validation component.

## Features

- ✅ **Dynamic Import** - Flatpickr loaded asynchronously to optimize performance
- ✅ **Full Localization** - Supports Dutch and French with locale-specific date formats
- ✅ **Validation Integration** - Triggers validation checks on date selection
- ✅ **Dynamic Content Support** - Works with dynamically added elements
- ✅ **Flexible Date Formats** - Uses Flatpickr defaults or locale-specific formats
- ✅ **Input Restoration** - Removes temporary classes on initialization
- ✅ **Alternative Input Support** - Works with Flatpickr's altInput feature

## Example

```html
<form>
  <div class="my-4">
    <label class="form__label" for="date">Date</label>
    <input class="form__input" name="date" id="date" type="text" data-date-picker required />
  </div>
</form>
```

## Required Attributes

| Attribute          | Required | Description                                                              |
| ------------------ | -------- | ------------------------------------------------------------------------ |
| `data-date-picker` | ✅ Yes   | Initializes Flatpickr on the input element. Must be on an input element. |

::: warning Element Type Requirement
This component **only works on `<input>` elements**. Flatpickr requires an input field to function properly.
:::

## Configuration Attributes

The component uses Flatpickr's default date format (or locale-specific format when localized). You can customize behavior with standard Flatpickr data attributes:

| Attribute           | Description                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-date-format`  | Sets custom date format (e.g., `"Y-m-d"` for ISO, `"d/m/Y"` for European). Uses Flatpickr's [formatting tokens](https://flatpickr.js.org/formatting/). |
| `data-min-date`     | Sets the minimum selectable date (e.g., `"2025-01-01"` or `"today"`).                                                                                  |
| `data-max-date`     | Sets the maximum selectable date (e.g., `"2025-12-31"` or `"+30 days"`).                                                                               |
| `data-default-date` | Sets the default selected date when the picker opens.                                                                                                  |

::: tip Flatpickr Data Attributes
The component passes the input element to Flatpickr, which automatically reads data attributes. See [Flatpickr documentation](https://flatpickr.js.org/options/) for all available options.
:::

## How It Works

1. **Element Detection** - Finds all `[data-date-picker]` elements on page load
2. **Dynamic Import** - Asynchronously imports Flatpickr library
3. **Localization** - Detects site language via `SiteLang.getLang()`:
   - `nl` → Applies Dutch localization
   - `fr` → Applies French localization
   - Others → Uses Flatpickr defaults (English)
4. **Class Removal** - Removes `js-time-picker` class from each picker
5. **Flatpickr Initialization** - Creates Flatpickr instance with:
   - Locale-specific date format (if applicable)
   - onChange callback for validation
   - Any data attributes passed to Flatpickr
6. **Validation Integration** - Dispatches `check-validation` event on date selection
7. **Dynamic Content** - Monitors DOM for new date pickers via `DOMHelper`

### Date Format

The component **no longer hardcodes a date format**. Instead, it uses:

- **Default:** Flatpickr's default format (typically `Y-m-d`)
- **Localized:** Locale-specific formats when Dutch or French is active
- **Custom:** Can be overridden with `data-date-format` attribute

**Examples:**

```html
<!-- Uses Flatpickr default (Y-m-d) -->
<input data-date-picker />

<!-- Custom format -->
<input data-date-picker data-date-format="d/m/Y" />

<!-- ISO format -->
<input data-date-picker data-date-format="Y-m-d" />
```

::: tip Flexible Formatting
Use [Flatpickr's formatting tokens](https://flatpickr.js.org/formatting/) to customize the date format:

- `Y-m-d` → "2025-12-31" (ISO)
- `d/m/Y` → "31/12/2025" (European)
- `F j, Y` → "December 31, 2025" (Full month)
- `M d, Y` → "Dec 31, 2025" (Short month)
  :::

## Validation Integration

The component integrates with the validation component by dispatching events:

```typescript
onChange: function (selectedDates, dateStr, instance) {
  instance.input.dispatchEvent(new Event('check-validation'));
  if (instance.altInput) {
    instance.altInput.dispatchEvent(new Event('check-validation'));
  }
}
```

**What happens:**

1. User selects a date in the picker
2. Flatpickr's `onChange` fires
3. Component dispatches `check-validation` event on the input
4. If `altInput` is used, event dispatched there too
5. Validation component checks input validity

**Benefits:**

- Required fields validated immediately after selection
- Min/max date validation triggered
- Custom validation patterns checked
- User gets instant feedback

### Example with Validation

```html
<form data-validate>
  <label for="birthdate">Birth Date</label>
  <input type="text" id="birthdate" name="birthdate" data-date-picker data-max-date="today" required />
  <span class="error-message"></span>

  <button type="submit">Submit</button>
</form>
```

When the user selects a date:

- ✅ "required" validation passes
- ✅ "max-date" validation checks selection
- ✅ Error message clears if valid

## Alternative Input (altInput)

Flatpickr's `altInput` feature shows a formatted date while storing a different format:

```html
<input type="text" data-date-picker data-date-format="Y-m-d" data-alt-input="true" data-alt-format="F j, Y" />
```

**How it works:**

- **User sees:** "December 31, 2025" (readable format via altFormat)
- **Form submits:** "2025-12-31" (ISO format via dateFormat)

The component handles validation for both inputs:

```typescript
if (instance.altInput) {
  instance.altInput.dispatchEvent(new Event('check-validation'));
}
```

## Dynamic Content Support

Date pickers added dynamically are automatically initialized:

```typescript
DOMHelper.onDynamicContent(document.documentElement, '[data-date-picker]', (pickers: NodeListOf<HTMLElement>) => {
  this.initDatePickers(pickers);
});
```

**Examples:**

- AJAX-loaded form fields
- Modal dialogs with date inputs
- Dynamically added rows in tables
- Single-page app route changes

No manual re-initialization needed!

## Localization

The component includes **active localization** for Dutch and French:

```typescript
const lang = SiteLang.getLang();

switch (lang) {
  case 'nl':
    flatpickr.default.localize(Dutch);
    break;
  case 'fr':
    flatpickr.default.localize(French);
    break;
}
```

**What gets localized:**

- ✅ **Month names** - "January" → "januari" (NL) / "janvier" (FR)
- ✅ **Day names** - "Monday" → "maandag" (NL) / "lundi" (FR)
- ✅ **Weekday abbreviations** - "Mon" → "ma" (NL) / "lun" (FR)
- ✅ **Date format** - Uses locale-appropriate default format
- ✅ **Button text** - "Today", "Clear" buttons in local language

**Supported languages:**

- `nl` - Dutch (Nederlands)
- `fr` - French (Français)
- Default - English (fallback)

**Language detection:** `SiteLang.getLang()` typically reads from `<html lang="...">` attribute.

### Adding More Languages

To add additional languages:

1. Import the locale:

```typescript
import { German } from 'flatpickr/dist/l10n/de.js';
```

2. Add to the switch statement:

```typescript
switch (lang) {
  case 'nl':
    flatpickr.default.localize(Dutch);
    break;
  case 'fr':
    flatpickr.default.localize(French);
    break;
  case 'de':
    flatpickr.default.localize(German);
    break;
}
```

See [Flatpickr localization](https://flatpickr.js.org/localization/) for available locales.

## Common Date Configurations

### Today as Minimum Date

Prevent past date selection:

```html
<input type="text" data-date-picker data-min-date="today" placeholder="Select date" />
```

### Date Range (Next 30 Days)

```html
<input
  type="text"
  data-date-picker
  data-min-date="today"
  data-max-date="+30 days"
  placeholder="Select within 30 days"
/>
```

### Birth Date (Must be 18+ Years Old)

```html
<input type="text" data-date-picker data-max-date="-18 years" placeholder="Must be 18 or older" required />
```

### Default to Specific Date

```html
<input type="text" data-date-picker data-default-date="2025-12-31" placeholder="Defaults to New Year's Eve" />
```

### Business Days Only (Requires Flatpickr Config)

```html
<input type="text" data-date-picker data-disable='["2025-12-25", "2025-12-26"]' />
```

::: tip Advanced Configuration
For complex configurations (disable weekends, enable only specific dates, etc.), you'll need to extend the component or use Flatpickr's data attributes. See [Flatpickr options](https://flatpickr.js.org/options/).
:::

## Styling

Flatpickr includes default CSS. To customize:

### Load Flatpickr CSS

```css
@import 'flatpickr/dist/flatpickr.min.css';
```

### Custom Theme

```css
/* Override Flatpickr variables */
.flatpickr-calendar {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.flatpickr-day.selected {
  background: #3b82f6;
  border-color: #3b82f6;
}

.flatpickr-day:hover {
  background: #e5e7eb;
}
```

## Accessibility

Flatpickr includes accessibility features:

- ✅ **Keyboard Navigation** - Arrow keys navigate dates, Enter selects
- ✅ **Screen Reader Support** - ARIA labels on calendar elements
- ✅ **Focus Management** - Proper focus handling when opening/closing
- ✅ **ESC to Close** - Escape key closes the picker

**Keyboard shortcuts:**

- `Arrow Keys` - Navigate between dates
- `Enter` - Select current date
- `Escape` - Close picker
- `PageUp/PageDown` - Previous/next month
- `Home/End` - First/last day of month

### Best Practices

```html
<label for="appointment-date">Appointment Date</label>
<input
  type="text"
  id="appointment-date"
  name="appointment-date"
  data-date-picker
  aria-describedby="date-help"
  required
/>
<small id="date-help">Format: DD/MM/YYYY</small>
```

## Best Practices

::: tip Always Use Labels
Proper labels improve accessibility and UX:

```html
<label for="date-input">Select Date</label> <input id="date-input" data-date-picker />
```

:::

::: tip Set Appropriate Constraints
Use `data-min-date` and `data-max-date` to guide users:

```html
<input data-date-picker data-min-date="today" data-max-date="+1 year" />
```

:::

::: tip Include Placeholder or Help Text
Tell users the expected format:

```html
<input data-date-picker placeholder="DD/MM/YYYY" aria-describedby="date-format" />
<small id="date-format">Format: 31/12/2025</small>
```

:::

## Troubleshooting

**Picker not initializing?**

- Check that Flatpickr is installed: `npm install flatpickr`
- Verify element is an `<input>` (not textarea or div)
- Check console for import errors
- Ensure `data-date-picker` attribute is present

**Wrong date format showing?**

- Component uses Flatpickr's default format (typically `Y-m-d`)
- Set custom format with `data-date-format="d/m/Y"` or other format
- Or use `altInput` with `data-alt-format` for display format
- Locale may affect default format (Dutch/French use locale defaults)

**Validation not triggering?**

- Ensure form has `data-validate` attribute
- Check that validation component is loaded
- Verify input has validation attributes (`required`, etc.)
- Look for JavaScript errors preventing event dispatch

**Min/max dates not working?**

- Use ISO format: `data-min-date="2025-01-01"`
- Or relative: `data-min-date="today"`
- Check Flatpickr console warnings
- Verify date strings are valid

**Picker calendar not visible?**

- Check that Flatpickr CSS is loaded
- Verify no z-index conflicts with modals/dropdowns
- Check browser console for CSS errors
- Try adding explicit z-index to `.flatpickr-calendar`

**Dynamic date pickers not working?**

- Component should handle this automatically
- Verify `DOMHelper` is available
- Check console for initialization errors
- Ensure new inputs have `data-date-picker` attribute

**Localization not working?**

- Verify `SiteLang.getLang()` returns correct language code (`nl`, `fr`)
- Check that locale files are installed (`flatpickr/dist/l10n/`)
- Only Dutch and French are currently supported
- Add additional languages by importing locale and updating switch statement
- Check `<html lang="...">` attribute matches supported locale

## Related Components

- **[Flatpickr Documentation](https://flatpickr.js.org/)** - Full Flatpickr API reference
- **[Validation Component](../components/validation.md)** - Form validation integration
