# Dropdown

A fully accessible dropdown component that uses [@floating-ui/dom](https://floating-ui.com/) for intelligent positioning. It provides keyboard navigation, ARIA support, and automatic repositioning on scroll with support for both absolute and fixed positioning strategies.

## Features

- ✅ **Intelligent Positioning** - Uses @floating-ui/dom with flip, shift, and size middleware
- ✅ **Keyboard Navigation** - Full arrow key navigation and Tab/Shift+Tab support
- ✅ **Accessibility** - ARIA attributes and screen reader support
- ✅ **Auto-positioning** - Repositions on scroll with autoUpdate
- ✅ **Click Outside Detection** - Automatically closes when clicking outside
- ✅ **Dynamic Content Support** - Works with dynamically added dropdowns
- ✅ **Flexible Positioning** - Absolute or fixed positioning strategies
- ✅ **Min-width Matching** - Menu width matches trigger button by default
- ✅ **Custom Position Element** - Can position relative to different element

## Use Cases

- **Navigation Menus** - User account dropdowns, settings menus
- **Action Menus** - Contextual actions for items in lists
- **Filter Dropdowns** - Sorting and filtering options
- **Mobile Menus** - Responsive navigation patterns

## Example

<iframe src="../../examples/dropdown.html" height="250"></iframe>

```html
<button type="button" id="menuTrigger" class="btn cursor-pointer">Toggle the dropdown</button>
<ul data-dropdown data-dropdown-trigger="menuTrigger" class="hidden p-4 bg-white shadow rounded-lg text-black">
  <li>
    <a href="#" class="block">Item 1</a>
  </li>
  <li>
    <a href="#" class="block">Item 2</a>
  </li>
  <li>
    <a href="#" class="block">Item 3</a>
  </li>
</ul>
```

<iframe src="../../examples/dropdown_position.html" height="300"></iframe>

```html
<div>
  <div class="p-4 bg-light" id="positionElement">
    <button type="button" id="menuTrigger" class="btn cursor-pointer mb-6">Toggle the dropdown</button>
  </div>
  <ul
    data-dropdown
    data-dropdown-trigger="menuTrigger"
    data-dropdown-position-element="positionElement"
    class="hidden py-2 bg-white shadow rounded-lg text-black"
  >
    <li>
      <a href="#" class="block hover:bg-light focus:bg-light px-4 py-2">Item 1</a>
    </li>
    <li>
      <a href="#" class="block hover:bg-light focus:bg-light px-4 py-2">Item 2</a>
    </li>
    <li>
      <a href="#" class="block hover:bg-light focus:bg-light px-4 py-2">Item 3</a>
    </li>
  </ul>
</div>
```

## Attributes

Below is a table describing the attributes you can use with the dropdown component. These attributes control the behavior and appearance of the dropdown.

| Attribute                        | Default        | Description                                                                                                                                               |
| -------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-dropdown`                  | —              | Main attribute that initializes the dropdown component. Must be on the menu element.                                                                      |
| `data-dropdown-trigger`          | **Required**   | ID of the trigger button that toggles the dropdown. The button element must have this ID and be a `<button>` element.                                     |
| `data-dropdown-placement`        | `bottom-start` | Placement of the dropdown relative to trigger. See [@floating-ui placements](https://floating-ui.com/docs/computePosition#placement) for all options.     |
| `data-dropdown-position-element` | trigger button | ID of an element to calculate positioning from (defaults to the trigger button). Useful when button is inside a larger container.                         |
| `data-dropdown-strategy`         | `absolute`     | Positioning strategy: `"absolute"` (relative to offset parent) or `"fixed"` (relative to viewport). Use `"fixed"` for dropdowns in scrollable containers. |

::: warning Button Element Requirement
The trigger element **must be a `<button>` element**. The component validates this and logs an error if it's not a button:

```
Dropdown button must be a <button> element
```

:::

::: danger Required Attributes
Both `data-dropdown` and `data-dropdown-trigger` are required. Missing them will cause console errors and prevent initialization.
:::

## Required Structure

### Basic Structure

```html
<!-- Trigger button with unique ID -->
<button type="button" id="my-dropdown-trigger">Toggle Menu</button>

<!-- Menu with data-dropdown and reference to trigger ID -->
<div data-dropdown data-dropdown-trigger="my-dropdown-trigger" class="hidden"></div>
```

**Key requirements:**

1. Button must have an `id` attribute
2. Menu must have `data-dropdown` attribute
3. Menu must have `data-dropdown-trigger` matching the button's `id`
4. Menu should start with `hidden` class (removed when opened)
5. Menu items should be focusable (links, buttons, inputs, etc.)

## How It Works

1. **Element Detection** - Finds all `[data-dropdown]` elements on page load
2. **Duplicate Prevention** - Checks for `data-dropdown-initialized` to prevent re-initialization
3. **Trigger Validation** - Validates trigger button exists and is a `<button>` element
4. **Menu Setup:**
   - Hides menu with `hidden` class
   - Assigns ID if not present
   - Sets ARIA attributes (`aria-controls`, `aria-expanded`)
   - Adds positioning strategy class (`absolute` or `fixed`)
5. **Interactive Elements** - Collects all focusable elements within menu
6. **Event Listeners** - Attaches click, keydown, scroll, and click-outside listeners
7. **Position Element** - Identifies element to position relative to (button or custom element)
8. **Initial State** - If menu has `open` attribute, positions and shows menu

### Opening/Closing Flow

**Opening:**

1. User clicks trigger button
2. Component adds `open` attribute to menu
3. Sets `aria-expanded="true"` on button
4. Positions menu using @floating-ui/dom
5. Adds global listeners (click outside, keyboard, scroll)

**Closing:**

1. User clicks outside, presses Escape, or tabs away
2. Component removes `open` attribute
3. Sets `aria-expanded="false"` on button
4. Removes global listeners

## Placement Options

Use `data-dropdown-placement` to control where the menu appears:

| Placement      | Description                   |
| -------------- | ----------------------------- |
| `top`          | Above, centered               |
| `top-start`    | Above, left-aligned           |
| `top-end`      | Above, right-aligned          |
| `bottom`       | Below, centered               |
| `bottom-start` | Below, left-aligned (default) |
| `bottom-end`   | Below, right-aligned          |
| `left`         | Left, centered                |
| `left-start`   | Left, top-aligned             |
| `left-end`     | Left, bottom-aligned          |
| `right`        | Right, centered               |
| `right-start`  | Right, top-aligned            |
| `right-end`    | Right, bottom-aligned         |

**Example:**

```html
<button id="btn">Menu</button>
<div data-dropdown data-dropdown-trigger="btn" data-dropdown-placement="bottom-end">
  <!-- Menu appears below, right-aligned -->
</div>
```

::: tip Automatic Flipping
Don't worry too much about placement—the flip middleware automatically adjusts if there's not enough space.
:::

## Positioning Strategies

### Absolute Positioning (Default)

```html
<div data-dropdown data-dropdown-trigger="btn" data-dropdown-strategy="absolute">
  <!-- Positioned relative to nearest positioned ancestor -->
</div>
```

**Use when:**

- Dropdown is within normal document flow
- No complex scrolling containers
- Standard navigation menus

**Applied CSS class:** `absolute`

### Fixed Positioning

```html
<div data-dropdown data-dropdown-trigger="btn" data-dropdown-strategy="fixed">
  <!-- Positioned relative to viewport -->
</div>
```

**Use when:**

- Dropdown is inside scrollable containers
- Dropdown needs to stay in viewport
- Complex layouts with overflow

**Applied CSS class:** `fixed`

::: warning Strategy Class
The component automatically adds the strategy as a CSS class (`absolute` or `fixed`). Ensure your CSS supports this:

```css
.absolute {
  position: absolute;
}
.fixed {
  position: fixed;
}
```

:::

## Custom Position Element

Position the dropdown relative to a different element than the trigger button:

```html
<div id="container" class="p-4 bg-gray-100">
  <button id="btn" class="btn">Toggle</button>
  <p>Some other content...</p>
</div>

<div data-dropdown data-dropdown-trigger="btn" data-dropdown-position-element="container">
  <!-- Menu positioned relative to container, not button -->
  <a href="#">Item 1</a>
  <a href="#">Item 2</a>
</div>
```

**Use cases:**

- Button inside a card/container
- Menu should align with container edges
- Complex layouts with nested elements

## Keyboard Navigation

The dropdown includes full keyboard support:

| Key               | Action                                                |
| ----------------- | ----------------------------------------------------- |
| `Click` / `Enter` | Open/close dropdown                                   |
| `Escape`          | Close dropdown and return focus to trigger button     |
| `Arrow Down`      | Move focus to next menu item                          |
| `Arrow Up`        | Move focus to previous menu item                      |
| `Tab`             | Move to next item (closes menu after last item)       |
| `Shift + Tab`     | Move to previous item (closes menu before first item) |

**Features:**

- Prevents default scrolling behavior
- Stops at first/last item (no wrapping)
- Only navigates through focusable elements

## Accessibility

The component implements ARIA best practices:

### ARIA Attributes

```html
<!-- Button with controls and expanded state -->
<button id="trigger" aria-controls="dropdown-menu-0" aria-expanded="false">Toggle Menu</button>

<!-- Menu with matching ID -->
<div id="dropdown-menu-0" data-dropdown data-dropdown-trigger="trigger">...</div>
```

**Attributes:**

- ✅ `aria-controls` - Links button to menu via ID
- ✅ `aria-expanded` - Indicates open/closed state (`true` or `false`)
- ✅ Auto-generated IDs - Menu gets ID if not provided: `dropdown-menu-{index}`

### Focusable Elements

The component tracks these focusable elements for keyboard navigation:

**Supported elements:**

- Links with `href` attribute
- Enabled buttons
- Enabled inputs
- Enabled textareas
- Enabled selects

::: tip Screen Reader Support
When menu opens, screen readers announce:

- "Menu expanded" (via `aria-expanded`)
- Number of items available
- Current focus position
  :::

## Click Outside Detection

The dropdown automatically closes when clicking outside:

**Behavior:**

- Click on menu → Menu stays open
- Click on trigger → Toggles menu
- Click anywhere else → Menu closes

**Event listener lifecycle:**

- Added when menu opens
- Removed when menu closes
- Prevents memory leaks

## Dynamic Content Support

Dropdowns added dynamically are automatically initialized:

**Features:**

- ✅ Automatic initialization
- ✅ Duplicate prevention via `data-dropdown-initialized`
- ✅ Works with AJAX-loaded content
- ✅ Works in modals and dynamic sections

## Initial Open State

Open the dropdown by default on page load:

```html
<button id="btn">Menu</button>
<div data-dropdown data-dropdown-trigger="btn" open>
  <!-- Menu is open when page loads -->
  <a href="#">Item 1</a>
  <a href="#">Item 2</a>
</div>
```

The component detects the `open` attribute and:

1. Positions the menu
2. Sets `aria-expanded="true"`
3. Adds event listeners
4. Shows the menu

## Styling

### Basic Styling

```css
/* Dropdown menu */
[data-dropdown] {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

/* Menu items */
[data-dropdown] a,
[data-dropdown] button {
  display: block;
  padding: 0.5rem 1rem;
  color: #374151;
}

[data-dropdown] a:hover,
[data-dropdown] a:focus {
  background: #f3f4f6;
}
```

::: tip Z-index Management
Ensure dropdowns have appropriate z-index values, especially when using fixed positioning or dropdowns in modals.
:::

## Best Practices

::: tip Use Button Elements
Always use `<button type="button">` for trigger elements. The component validates this and will error otherwise.
:::

::: tip Unique IDs
Ensure trigger button IDs are unique on the page. Multiple dropdowns need distinct IDs.
:::

::: tip Start Hidden
Add `hidden` class to menu initially. The component manages visibility via the `open` attribute.
:::

::: tip Focusable Items
Ensure menu items are focusable (links, buttons, inputs). This enables keyboard navigation.
:::

::: warning Z-index Conflicts
If dropdowns appear behind other elements, adjust z-index values. Fixed strategy may need higher z-index.
:::

## Troubleshooting

**Dropdown not initializing?**

- Check console for error messages
- Verify `data-dropdown-trigger` matches button's `id`
- Ensure trigger is a `<button>` element (not `<a>` or `<div>`)
- Check that both attributes are present

**Menu positioned incorrectly?**

- Verify positioning strategy (`absolute` vs `fixed`)
- Check if parent has `position: relative` (for absolute)
- Ensure @floating-ui/dom is loaded
- Try using `data-dropdown-position-element` for custom reference

**Keyboard navigation not working?**

- Ensure menu items are focusable elements
- Check that items aren't disabled
- Verify menu has `open` attribute when visible
- Check console for JavaScript errors

**Click outside not closing?**

- Event listener only added when menu opens
- Check if another script is stopping event propagation
- Verify menu doesn't have pointer-events: none

**Menu too narrow?**

- Component sets `minWidth` to match trigger button
- Override with CSS: `min-width: 200px !important;`
- Or make trigger button wider

**Dropdown behind modal?**

- Use `data-dropdown-strategy="fixed"`
- Increase z-index: `z-index: 100;`
- Ensure modal z-index is appropriate

**Dynamic dropdowns not working?**

- Component handles this automatically via `DOMHelper`
- Check console for initialization errors
- Verify new dropdowns have required attributes
- Check that `data-dropdown-initialized` isn't already set

## Related Components

- **[@floating-ui/dom](https://floating-ui.com/)** - Positioning library

**CSS classes added:**

- Strategy class (`absolute` or `fixed`)
- `data-dropdown-initialized` attribute (prevents duplicates)
