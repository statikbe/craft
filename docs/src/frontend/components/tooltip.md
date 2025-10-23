# Tooltip

A lightweight wrapper around [Tippy.js](https://atomiks.github.io/tippyjs/) (~30KB) for accessible tooltips and popovers. Supports text content via data attributes or HTML templates for rich content. Dynamically imports the library only when tooltips are present on the page.

## Features

- ✅ **Dynamic Import**: Loads Tippy.js only when needed (~30KB)
- ✅ **Simple Text Tooltips**: Use `data-tippy-content` attribute
- ✅ **HTML Templates**: Reference DOM element for rich content
- ✅ **Positioning**: 12 placement options (top, bottom, left, right + variations)
- ✅ **Customizable**: Arrow, animation, delay, duration
- ✅ **Interactive**: Tooltips can contain clickable content
- ✅ **Accessible**: ARIA `describedby` support
- ✅ **Theme Support**: Custom styling via CSS
- ✅ **Auto-Initialize**: Detects data attributes
- ✅ **Performance**: Singleton mode for multiple tooltips

## How It Works

### Initialization

1. Scans page for `data-tippy-content` or `data-tippy-template` attributes
2. Dynamically imports Tippy.js library (~30KB gzipped)
3. Creates tooltip instances for each element
4. Applies configuration from data attributes
5. Sets up ARIA relationships
6. Handles show/hide interactions

### Content Modes

**Text Content**:

```html
<button data-tippy-content="Save your changes">Save</button>
```

**HTML Template**:

```html
// Reference hidden DOM element
<button data-tippy-template="tooltipContent">Info</button>

<div id="tooltipContent" class="hidden">
  <strong>Title</strong>
  <p>Rich HTML content</p>
</div>
```

## Example

<iframe src="../../examples/tooltip.html" height="400"></iframe>

```html
<div class="flex flex-wrap gap-12 py-20">
  <button type="button" class="btn" data-tippy-content="Tooltip">Text</button>
  <button type="button" class="btn" data-tippy-content="Another Tooltip">Text</button>
  <button
    type="button"
    class="btn"
    data-tippy-content="Tooltip"
    data-tippy-duration="0"
    data-tippy-arrow="false"
    data-tippy-delay="[1000, 200]"
  >
    No arrow and delay
  </button>
  <button type="button" class="btn" data-tippy-content="Tooltip" data-tippy-placement="bottom">
    Tooltip at the bottom
  </button>
  <button type="button" class="btn" id="button" data-tippy-template="tooltip">With HTML</button>
  <div class="hidden">
    <div id="tooltip" role="tooltip">My tooltip <strong>With html enabled</strong>.</div>
  </div>
  <button type="button" class="btn" id="button" data-tippy-interactive="true" data-tippy-template="tooltipInteractive">
    With HTML and a link
  </button>
  <div class="hidden">
    <div id="tooltipInteractive" role="tooltip">My tooltip <a href="https://www.statik.be">Go to Statik</a>.</div>
  </div>
</div>
```

## Data Attributes

| Attribute                | Type            | Default              | Description                                                                           |
| ------------------------ | --------------- | -------------------- | ------------------------------------------------------------------------------------- |
| `data-tippy-content`     | String          | —                    | Simple text tooltip content                                                           |
| `data-tippy-template`    | ID string       | —                    | ID of DOM element to use as tooltip content                                           |
| `data-tippy-placement`   | String          | `'top'`              | Position: `top`, `bottom`, `left`, `right`, `top-start`, `top-end`, etc. (12 options) |
| `data-tippy-arrow`       | Boolean         | `true`               | Show arrow pointing to element                                                        |
| `data-tippy-delay`       | Number or Array | `0`                  | Show/hide delay in ms. Array: `[show, hide]`                                          |
| `data-tippy-duration`    | Number or Array | `[300, 250]`         | Animation duration. Array: `[show, hide]`                                             |
| `data-tippy-interactive` | Boolean         | `false`              | Allow hovering over tooltip content                                                   |
| `data-tippy-trigger`     | String          | `'mouseenter focus'` | Trigger events: `mouseenter`, `focus`, `click`, `manual`                              |
| `data-tippy-theme`       | String          | `'default'`          | CSS theme class                                                                       |
| `data-tippy-max-width`   | Number          | `350`                | Maximum width in pixels                                                               |

## Placement Options

12 placement options available:

```typescript
'top' |
  'top-start' |
  'top-end' |
  'bottom' |
  'bottom-start' |
  'bottom-end' |
  'left' |
  'left-start' |
  'left-end' |
  'right' |
  'right-start' |
  'right-end';
```

**Examples**:

- `top`: Centered above element
- `top-start`: Above, aligned to left edge
- `top-end`: Above, aligned to right edge
- `bottom`: Centered below element

## Styling

### Custom CSS

Edit `./css/site/components/tippy.css`:

```css
/* Default theme */
.tippy-box[data-theme='default'] {
  background-color: #333;
  color: white;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tippy-box[data-theme='default'][data-placement^='top'] > .tippy-arrow::before {
  border-top-color: #333;
}

/* Custom theme */
.tippy-box[data-theme='light'] {
  background-color: white;
  color: #333;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.tippy-box[data-theme='light'] .tippy-arrow::before {
  border-top-color: white;
}

/* Error theme */
.tippy-box[data-theme='error'] {
  background-color: #dc2626;
  color: white;
}
```

## Accessibility

### ARIA Attributes

Tippy automatically adds `aria-describedby`:

```html
<!-- Before -->
<button data-tippy-content="Help text">Button</button>

<!-- After initialization -->
<button aria-describedby="tippy-1">Button</button>

<div id="tippy-1" role="tooltip" class="tippy-box">Help text</div>
```

### Keyboard Support

- **Tab**: Focus trigger element
- **ESC**: Close tooltip (if open)
- **Enter/Space**: Activate button (tooltip appears on focus)

### Screen Readers

Always provide accessible labels:

```html
<!-- Good ✅ - Icon has aria-label -->
<button aria-label="Help" data-tippy-content="Detailed help text">
  <svg aria-hidden="true"><!-- Icon --></svg>
</button>

<!-- Bad ❌ - No text or label -->
<button data-tippy-content="Help">
  <svg><!-- Icon --></svg>
</button>
```

## Resources

- [Tippy.js Official Documentation](https://atomiks.github.io/tippyjs/)
- [Tippy.js GitHub](https://github.com/atomiks/tippyjs)
- [Popper.js (dependency)](https://popper.js.org/)
- [WAI-ARIA Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)
