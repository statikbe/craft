# Toggle

A show/hide content toggle component with ARIA support and smooth animations. Uses the `open` attribute for visibility control and provides JavaScript fallback for browser features like `interpolate-size`. Supports grouped toggles where opening one closes others.

## Features

- ✅ **Simple Toggle**: Click trigger to show/hide content
- ✅ **open Attribute**: Semantic visibility control
- ✅ **ARIA Support**: `aria-expanded` on triggers
- ✅ **Smooth Animations**: CSS transitions with `interpolate-size`
- ✅ **JavaScript Fallback**: For browsers without `interpolate-size` support
- ✅ **Group Behavior**: Close other items when one opens (accordion-style)
- ✅ **Scroll Support**: Scroll to element after toggle
- ✅ **Custom Events**: `open` and `close` events
- ✅ **Multiple Triggers**: Same target can have multiple triggers
- ✅ **Auto-Initialize**: Detects `data-toggle` attribute

## How It Works

### Basic Toggle

1. User clicks element with `data-toggle` attribute
2. Component finds target by ID from attribute value
3. Toggles `open` attribute on target element
4. Updates `aria-expanded` on trigger
5. CSS shows/hides based on `open` attribute

### Animation Fallback

Modern browsers support `interpolate-size` for smooth height animations:

```css
.content {
  block-size: 0;
  overflow: clip;
  transition: block-size 0.3s;
  interpolate-size: allow-keywords;
}

.content[open] {
  block-size: auto;
}
```

For older browsers, JavaScript calculates and animates height manually.

### Group Behavior

When `data-toggle-group` is set:

```typescript
// Opening one item
function openToggle(target) {
  const groupName = target.dataset.toggleGroup;

  if (groupName) {
    // Close all other items in group
    const groupItems = document.querySelectorAll(`[data-toggle-group="${groupName}"]`);
    groupItems.forEach((item) => {
      if (item !== target) {
        item.removeAttribute('open');
      }
    });
  }

  // Open this item
  target.setAttribute('open', '');
}
```

## Examples

### A simple example

<iframe src="../../examples/toggle_simple.html" height="250"></iframe>

```HTML
<h3 data-toggle="toggleContent">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

### An example with animation

<iframe src="../../examples/toggle_animation.html" height="250"></iframe>

```HTML
<h3 data-toggle="toggleContent" class="cursor-pointer flex justify-between group">This is a simple toggle trigger with animation {{ icon('chevron-down', {class: 'group-aria-expanded:rotate-180 transition duration-300 ease-in-out'}) }}</h3>
<div class="[interpolate-size:allow-keywords] [block-size:0] transition-all transition-discrete duration-300 ease-in-out open:[block-size:auto] overflow-clip" id="toggleContent">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

::: warning
The animation is done with the `block-size` property in modern browsers. For older browsers a javascript fallback is provided. In the future this fallback will be removed, [once all browsers support this feature](https://caniuse.com/?search=interpolate-size).  
:::

### A full example

<iframe src="../../examples/toggle_full.html" height="300"></iframe>

```HTML
<h3 class="flex justify-between group" data-toggle="toggleContent" id="scrollPoint">
    This is a simple toggle trigger with multiple toggle actions and scroll
    <span class="group-aria-expanded:hidden">{{ icon('chevron-down') }}<span class="sr-only">Open</span></span>
    <span class="hidden group-aria-expanded:block">{{ icon('chevron-up') }}<span class="sr-only">Close</span></span>
</h3>
<div class="hidden open:block" id="toggleContent">
    <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
    </p>
    <div>
        <button type="button" class="underline" data-toggle="toggleContent" data-toggle-scroll="#scrollPoint">Close Content</button>
    </div>
</div>
```

### A group example

<iframe src="../../examples/toggle_group.html" height="300"></iframe>

```HTML
<h3 data-toggle="toggleContent1">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent1" data-toggle-group="toggleGroup">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
<h3 data-toggle="toggleContent2">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent2" data-toggle-group="toggleGroup">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
<h3 data-toggle="toggleContent3">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent3" data-toggle-group="toggleGroup">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

## Data Attributes

### On Trigger

| Attribute            | Type         | Required | Description                         |
| -------------------- | ------------ | -------- | ----------------------------------- |
| `data-toggle`        | ID string    | Yes      | ID of the target element to toggle  |
| `data-toggle-scroll` | CSS selector | No       | Scroll to this element after toggle |

### On Target

| Attribute           | Type       | Required | Description                       |
| ------------------- | ---------- | -------- | --------------------------------- |
| `data-toggle-group` | Group name | No       | Group name for accordion behavior |

## Events

### Dispatch Events

You can programmatically open/close by dispatching events:

```typescript
const target = document.getElementById('content');

// Open
target.dispatchEvent(new Event('open'));

// Close
target.dispatchEvent(new Event('close'));
```

### Listen for Changes

```typescript
const trigger = document.querySelector('[data-toggle]');

trigger.addEventListener('click', (e) => {
  const targetId = trigger.dataset.toggle;
  const target = document.getElementById(targetId);
  const isOpen = target.hasAttribute('open');

  console.log('Toggle state:', isOpen ? 'open' : 'closed');
});
```

## Accessibility

### ARIA Attributes

Component automatically manages:

```html
<button
  data-toggle="content"
  aria-expanded="false"  <!-- Changes to "true" when open -->
  aria-controls="content">
  Toggle
</button>

<div
  id="content"
  role="region"
  aria-labelledby="toggle-btn">
  Content
</div>
```

### Keyboard Support

- **Enter/Space**: Activates toggle button
- **Tab**: Navigate to/from toggle and content
- **ESC**: Close (if implemented)

### Screen Reader Labels

```html
<button data-toggle="help" aria-label="Show help information">
  <svg aria-hidden="true"><!-- Icon --></svg>
</button>
```

## Related Components

- **[Accordion](./accordion.md)**: Similar grouped toggle behavior
- **[Tabs](./tabs.md)**: Alternative content switching

## Styling

### The Trigger

The trigger gets an attribute `aria-expanded` with values `true` or `false` depending the target element is open or not.  
You can then use Tailwind to style the element accordingly. You can also use this with the `group` class.

#### Example

```HTML
<h3 data-toggle="toggleContent" class="cursor-pointer flex justify-between aria-expanded:bg-light group">
    This is a simple toggle trigger with animation
    {{ icon('chevron-down', {class: 'group-aria-expanded:rotate-180 transition duration-300 ease-in-out'}) }}
</h3>
```

### The Target

The target gets an attribute `open` depending wether the element is open or not.  
You can then use Tailwind to style the element accordingly. You can also use this with the `group` class.

#### Example

```HTML
<div class="hidden open:block" id="toggleContent">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```
