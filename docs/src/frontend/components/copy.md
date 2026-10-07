# Copy

A component that copies a value to the clipboard on click, with an optional toaster message as
feedback. The value is either written literally in the data attribute, or read from another element
on the page (an input value or its text content).

## Features

- ✅ **Literal or referenced value**: copy a hardcoded string, or the content of another element
- ✅ **Works on any element**: `<button>`, `<a>`, or anything clickable — the default action is prevented
- ✅ **Async Clipboard API**: uses `navigator.clipboard` in secure contexts
- ✅ **Legacy fallback**: falls back to a hidden textarea + `document.execCommand('copy')`
- ✅ **Optional toaster**: shows a temporary confirmation message when `data-copy-feedback` is set
- ✅ **Live region**: the toaster container is an `aria-live="polite"` region, toasts get `role="status"`
- ✅ **Dynamic content safe**: re-initialisation is guarded by a `copy-initialized` class
- ✅ **Multiple instances**: every `[data-copy]` element on the page is initialised independently

## How It Works

### Initialization

1. **Trigger detection**: the component selects all `[data-copy]` elements
2. **Guard check**: elements that already have the `copy-initialized` class are skipped
3. **Event binding**: a click handler is attached and the `copy-initialized` class is added

The component is registered in `frontend/js/site.ts` with selector `[data-copy]`, so it is lazy
loaded only on pages that actually contain a copy trigger.

### Copying

1. **Read the value**: the value of `data-copy` is taken
2. **Resolve the source**:
   - value **does not** start with `#` → the value itself is the text to copy
   - value **starts with** `#` → it is used as a selector; the target's `value` (form fields) or
     `textContent` is copied, trimmed
3. **Write to clipboard**: `navigator.clipboard.writeText()` in a secure context, otherwise the
   textarea fallback
4. **Feedback**: if `data-copy-feedback` is set, a toaster with that message is shown

An empty `data-copy` is a silent no-op. A selector that matches nothing, or a failed clipboard write,
logs a `console.warn` and shows no toaster.

### Clipboard write strategy

```typescript
if (navigator.clipboard && window.isSecureContext) {
  await navigator.clipboard.writeText(text);
  return;
}

// Fallback for non-secure contexts / older browsers:
// a fixed, transparent, readonly textarea is appended, selected,
// copied with document.execCommand('copy') and removed again.
```

The fallback matters for local development over plain `http://` and for embedded contexts where the
async Clipboard API is unavailable.

### Toaster

The toaster is created by the component itself — there is no markup to add:

1. **Container**: on first use, a `div.js-copy-toaster.c-toaster` is appended to `<body>` with
   `aria-live="polite"` and `aria-atomic="true"`. It is reused for every following toast.
2. **Item**: a `div.c-toaster__item` with `role="status"` and the feedback message as text
3. **Enter**: `c-toaster__item--visible` is added on the next animation frame, so the enter
   transition runs
4. **Leave**: after 3000 ms the `--visible` class is removed
5. **Cleanup**: the element is removed from the DOM on its `transitionend`

## Examples

<iframe src="../../examples/copy.html" height="420"></iframe>

### Copy a literal value

```twig
<button type="button"
        class="btn btn--primary"
        data-copy="{{ entry.url }}"
        data-copy-feedback="{{ 'Link copied to clipboard'|t }}">
    {{ icon('link', { class: 'mr-2 text-xl' }) }} {{ 'Copy link'|t }}
</button>
```

### Copy the content of another element

Prefix the value with `#` to point at an element by ID. Form fields are read from their `value`,
everything else from its text content.

```twig
<input type="text" id="shareUrl" class="form__input" value="{{ entry.url }}" readonly>

<button type="button"
        class="btn"
        data-copy="#shareUrl"
        data-copy-feedback="{{ 'Link copied'|t }}">
    {{ 'Copy'|t }}
</button>
```

```twig
<code id="couponCode">SUMMER-2026</code>

<button type="button"
        class="btn"
        data-copy="#couponCode"
        data-copy-feedback="{{ 'Coupon code copied'|t }}">
    {{ 'Copy code'|t }}
</button>
```

### Copy without feedback

Omit `data-copy-feedback` when you provide your own feedback (for example a tooltip or an icon
swap). No toaster is created.

```twig
<button type="button" class="btn" data-copy="{{ entry.url }}">
    {{ 'Copy link'|t }}
</button>
```

### Copy on a link

The click handler calls `preventDefault()`, so an anchor can be used as a trigger without navigating.
Keep an `href` as a no-JavaScript fallback.

```twig
<a href="{{ entry.url }}"
   data-copy="{{ entry.url }}"
   data-copy-feedback="{{ 'Link copied'|t }}">
    {{ 'Copy this page'|t }}
</a>
```

## Attributes

| Attribute            | Description                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `data-copy`          | This attribute triggers the component. Contains the text to copy, or a `#id` selector pointing at the element to read the value from |
| `data-copy-feedback` | The message shown in the toaster after a successful copy. When omitted, no toaster is shown                                          |
| `copy-initialized`   | CSS class added automatically after binding, to prevent a second click handler on re-initialisation. Do not set or remove it by hand |

## CSS Classes

The toaster elements are created in JavaScript with these classes:

| Class                      | Element           | Description                                                   |
| -------------------------- | ----------------- | ------------------------------------------------------------- |
| `js-copy-toaster`          | Toaster container | JS hook used to find and reuse the container. Do not style it |
| `c-toaster`                | Toaster container | Styling hook for the container (position, stacking, spacing)  |
| `c-toaster__item`          | A single toast    | Styling hook for one message                                  |
| `c-toaster__item--visible` | A single toast    | Added on enter, removed on leave. Drives the transition       |

::: warning Uncomment the CSS import
The toaster styling ships in `frontend/css/site/components/toaster.css`, but — like the other
optional components — its import in `frontend/css/site/main.css` is commented out by default.
Uncomment it before using `data-copy-feedback`:

```css
@import './components/toaster.css' layer(components);
```

Without the CSS the toaster renders as unstyled text, and — because cleanup is bound to
`transitionend` — **the toasts are never removed from the DOM**.
:::

The shipped styling puts the toaster at the top centre of the viewport, stacked vertically, on the
primary colour:

```css
.c-toaster {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100vw - 2rem);
  pointer-events: none;
}

.c-toaster__item {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  box-shadow: var(--shadow-card);
  font-size: var(--text-sm);
  text-align: center;
  pointer-events: auto;
  opacity: 0;
  transform: translateY(-1rem);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.c-toaster__item--visible {
  opacity: 1;
  transform: translateY(0);
}
```

It uses the `--color-primary`, `--color-primary-contrast`, `--shadow-card` and `--text-sm` theme
tokens, so it follows the project theme without further changes. Override the file in your project
to move the toaster (for example to `bottom: 1rem`) or to restyle the items.

::: danger Keep a transition on `.c-toaster__item`
The component removes a toast from the DOM on its `transitionend`. If you override the styling and
drop the `transition` — or transition a property that does not actually change — the event never
fires and toasts pile up invisibly in the container.
:::

## Dynamic Content

The component loader watches the DOM and re-instantiates the component when new `[data-copy]`
elements are added (after an ajax load, a modal, a load-more, …). Existing triggers are skipped
thanks to the `copy-initialized` class, so no handler is bound twice.

```javascript
// New copy triggers inside ajax-loaded content are picked up automatically.
// No manual re-initialisation is needed.
```

## Notes & Gotchas

- **Values starting with `#` are treated as a selector.** A literal value such as a hex color
  (`#e02020`) or a hashtag (`#statik`) will be interpreted as a selector, warn in the console, and
  copy nothing. Copy those from a referenced element instead.
- **Only ID selectors are practical.** The selector branch is triggered by a leading `#`, so a class
  selector like `.js-code` is copied as literal text.
- **The toaster duration is fixed at 3000 ms** (`toasterDuration`) and is not configurable through a
  data attribute. Change it in the component if a project needs another duration.
- **Multiple toasts stack.** Every successful copy appends a new item to the same container; nothing
  is deduplicated or replaced.
- **The clipboard needs a user gesture.** Copying works from the click handler; calling it from a
  timeout or an async callback later can be blocked by the browser.

## Accessibility

### Announcements

The toaster container is a polite live region, and each toast additionally carries `role="status"`:

```html
<div class="js-copy-toaster c-toaster" aria-live="polite" aria-atomic="true">
  <div class="c-toaster__item c-toaster__item--visible" role="status">Link copied to clipboard</div>
</div>
```

Because `aria-atomic="true"` is set on the container, the whole region is re-announced when a second
toast is added. Note that `role="status"` on the item is itself a live region nested in the
container's — depending on the screen reader, a message can be announced twice. If that is a problem
in your project, drop `data-copy-feedback` and announce the result yourself.

### Trigger markup

Use a real `<button type="button">` where possible, and give it an accessible label:

```html
<button type="button" data-copy="#shareUrl" data-copy-feedback="Link copied">
  <svg aria-hidden="true"><!-- Icon --></svg>
  <span class="sr-only">Copy the link to this page</span>
</button>
```

### Keyboard Support

- **Enter/Space**: activate the copy trigger (native button behaviour)

## Related Components

- **[Tooltip](./tooltip)**: alternative in-place feedback next to the trigger
- **[Toggle](./toggle)**: general show/hide behaviour, e.g. to reveal the value being copied
- **[General](./general)**: utility helpers shared by the components

## Resources

- [Clipboard API: writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
- [Window.isSecureContext](https://developer.mozilla.org/en-US/docs/Web/API/Window/isSecureContext)
- [ARIA: status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role)
- [ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
