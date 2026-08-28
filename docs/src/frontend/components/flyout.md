# Flyout

A slide-in panel component (commonly used for mobile menus) with focus trapping, keyboard accessibility, smooth transitions, and backdrop overlay support. Features automatic ARIA attributes, multiple close buttons, and body scroll locking.

## Features

- ✅ **Focus Trapping** - Keeps keyboard focus within flyout using `A11yUtils.keepFocus()`
- ✅ **Keyboard Navigation** - Escape key closes flyout
- ✅ **ARIA Attributes** - Automatic `aria-expanded` and `aria-controls` management
- ✅ **Smooth Transitions** - CSS transition support with transitionend detection
- ✅ **Multiple Close Buttons** - Support for multiple close triggers (overlay, X button, etc.)
- ✅ **Body Scroll Lock** - Optional body class to prevent background scrolling
- ✅ **Dynamic Content Support** - Works with dynamically added flyout triggers
- ✅ **Auto-focus on Open** - Focuses first close button when flyout opens
- ✅ **Hidden Element Handling** - Disables hidden elements to prevent tab navigation
- ✅ **State Classes** - Configurable active/inactive classes for flyout and close buttons

## Example

<iframe src="../../examples/flyout.html" height="350"></iframe>

```HTML
<div class="flex justify-end">
    <button type="button" class="text-3xl md:hidden ie-hidden print:hidden" data-flyout="flyout">
        <span class="">Menu</span>
    </button>
</div>

<div class="invisible fixed top-0 right-0 bottom-0 w-full z-50 overflow-x-hidden overflow-y-auto bg-white max-w-flyout"
    id="flyout"
    data-flyout-inactive-class="transition-transform duration-200 ease-in-out translate-x-full"
    data-flyout-active-class="transition-transform duration-200 ease-in-out translate-x-0"
    data-flyout-body-active-class="h-screen overflow-hidden">
	<div class="container">
		<div class="absolute top-0 right-0 mt-4 mr-4">
			<button type="button" class="text-2xl cursor-pointer" tabindex="0" data-flyout-close="flyout">
				<span class="">Close menu</span>
			</button>
		</div>
		<div class="mt-12">
			Flyout content here
		</div>
	</div>
</div>
<button type="button"
    class="fixed block inset-0 z-40 cursor-pointer bg-pitch-black/50 transitions duration-300 ease-in-out"
    data-flyout-close="flyout"
    data-flyout-close-inactive-class="opacity-0 pointer-events-none"
    data-flyout-close-active-class="opacity-100">
    <span class="sr-only">Close flyout</span>
</button>
```

The attribute used to make this work (`data-flyout`) is on the button that triggers the flyout. The value is the id of the element that is the flyout.

## Required Attributes

| Attribute     | Required | Element        | Description                                                             |
| ------------- | -------- | -------------- | ----------------------------------------------------------------------- |
| `data-flyout` | ✅ Yes   | Trigger button | ID of the flyout element to open. Trigger must be a `<button>` element. |
| `id`          | ✅ Yes   | Flyout panel   | Unique identifier for the flyout panel. Must match `data-flyout` value. |

::: warning Button Element Requirement
The trigger element **must be a `<button>` element**. The component queries for `button[data-flyout]` specifically.
:::

## Optional Attributes

### Flyout Panel Attributes

| Attribute                       | Element      | Description                                                                               |
| ------------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `data-flyout-inactive-class`    | Flyout panel | Space-separated classes added when flyout is closed (e.g., `translate-x-full opacity-0`). |
| `data-flyout-active-class`      | Flyout panel | Space-separated classes added when flyout is open (e.g., `translate-x-0 opacity-100`).    |
| `data-flyout-body-active-class` | Flyout panel | Space-separated classes added to `<body>` when flyout is open (e.g., `overflow-hidden`).  |

### Close Button Attributes

| Attribute                          | Element      | Description                                                               |
| ---------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `data-flyout-close`                | Button       | ID of flyout to close. Multiple buttons can reference the same flyout ID. |
| `data-flyout-close-inactive-class` | Close button | Space-separated classes added to close button when flyout is closed.      |
| `data-flyout-close-active-class`   | Close button | Space-separated classes added to close button when flyout is open.        |

## Required Structure

### Basic Structure

```html
<!-- Trigger Button -->
<button type="button" data-flyout="menu">Open Menu</button>

<!-- Flyout Panel -->
<div
  id="menu"
  class="invisible fixed inset-y-0 right-0 w-80 bg-white"
  data-flyout-inactive-class="translate-x-full"
  data-flyout-active-class="translate-x-0"
>
  <!-- Close Button (inside flyout) -->
  <button type="button" data-flyout-close="menu">Close</button>

  <!-- Flyout Content -->
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</div>

<!-- Overlay (optional but recommended) -->
<button
  type="button"
  class="fixed inset-0 bg-black/50"
  data-flyout-close="menu"
  data-flyout-close-inactive-class="opacity-0 pointer-events-none"
  data-flyout-close-active-class="opacity-100"
>
  <span class="sr-only">Close menu</span>
</button>
```

### Key Requirements

1. **Trigger button must:**

   - Be a `<button>` element
   - Have `data-flyout` attribute with flyout ID value

2. **Flyout panel must:**

   - Have `id` matching `data-flyout` value
   - Start with `invisible` class (removed after transition)
   - Have fixed positioning
   - Include at least one close button inside

3. **Close buttons must:**
   - Have `data-flyout-close` attribute with flyout ID value
   - Can be inside or outside flyout (overlay)

## Focus Trapping

The component uses `A11yUtils.keepFocus()` to trap keyboard focus:

**What this does:**

- Restricts Tab/Shift+Tab to elements within flyout
- Wraps focus from last to first element (and vice versa)
- Prevents accessing page content behind flyout
- Disabled when flyout closed

**Tabbable elements within flyout:**

- Links (`<a href="...">`)
- Buttons (not disabled)
- Form controls (not disabled)
- Elements with `tabindex="0"` or positive tabindex

## Auto-focus on Open

When flyout opens, first close button receives focus:

**Benefits:**

- Immediate keyboard control
- Screen reader announces flyout content
- User can close with Enter/Space immediately
- Accessible UX

::: tip Include Close Button First
Place a close button near the top of your flyout for optimal UX:

```html
<div id="flyout">
  <button data-flyout-close="flyout">Close</button>
  <!-- Rest of content -->
</div>
```

:::

## Multiple Close Buttons

You can have multiple close buttons for the same flyout:

```html
<!-- Trigger -->
<button data-flyout="menu">Open</button>

<!-- Flyout -->
<div id="menu">
  <!-- Close button inside flyout -->
  <button data-flyout-close="menu">✕</button>

  <!-- Content -->
  <nav>...</nav>

  <!-- Another close button at bottom -->
  <button data-flyout-close="menu">Close Menu</button>
</div>

<!-- Overlay backdrop (also a close button) -->
<button
  data-flyout-close="menu"
  data-flyout-close-inactive-class="opacity-0 pointer-events-none"
  data-flyout-close-active-class="opacity-100"
  class="fixed inset-0 bg-black/50"
>
  <span class="sr-only">Close menu</span>
</button>
```

**All close buttons:**

- Get same ARIA attributes
- Trigger same close behavior
- Receive same class updates
- Work independently

::: tip Overlay as Close Button
The backdrop overlay is commonly implemented as a close button with `sr-only` text for accessibility.
:::

## State Classes

### Flyout Panel Classes

Control flyout animation and visibility:

```html
<div
  id="menu"
  class="invisible"
  data-flyout-inactive-class="transition-transform duration-300 translate-x-full"
  data-flyout-active-class="transition-transform duration-300 translate-x-0"
>
  <!-- ... -->
</div>
```

**Class lifecycle:**

| State   | invisible | inactive-class | active-class |
| ------- | --------- | -------------- | ------------ |
| Initial | ✅ Yes    | ✅ Yes         | ❌ No        |
| Opening | ❌ No     | ❌ No          | ✅ Yes       |
| Open    | ❌ No     | ❌ No          | ✅ Yes       |
| Closing | ❌ No     | ✅ Yes         | ❌ No        |
| Closed  | ✅ Yes    | ✅ Yes         | ❌ No        |

**Why `invisible` class:**

- Completely hides flyout from screen readers
- Added only after transition completes
- Prevents flash of content on page load

### Body Classes

Prevent page scrolling when flyout is open:

```html
<div id="menu" data-flyout-body-active-class="h-screen overflow-hidden">
  <!-- ... -->
</div>
```

**Applied to `<body>` element:**

```html
<!-- When flyout opens -->
<body class="h-screen overflow-hidden">
  <!-- When flyout closes -->
  <body class=""></body>
</body>
```

**Common body classes:**

- `overflow-hidden` - Prevents scrolling
- `h-screen` - Fixes height to viewport
- `fixed` - Prevents body scroll (alternative)

### Close Button Classes

Animate close buttons (especially overlay):

```html
<button
  data-flyout-close="menu"
  data-flyout-close-inactive-class="opacity-0 pointer-events-none"
  data-flyout-close-active-class="opacity-100"
>
  Close
</button>
```

## Keyboard Navigation

| Key         | Action                                    |
| ----------- | ----------------------------------------- |
| `Escape`    | Close flyout and return focus to trigger  |
| `Tab`       | Navigate forward through flyout elements  |
| `Shift+Tab` | Navigate backward through flyout elements |

**Focus trapping:**

- Tab from last element → Wraps to first element
- Shift+Tab from first element → Wraps to last element
- Can't tab to page content behind flyout

## Accessibility

### ARIA Attributes

The component automatically manages ARIA:

**Trigger button:**

```html
<button data-flyout="menu" aria-expanded="false" aria-controls="menu">Open Menu</button>
```

**When flyout opens:**

```html
<button aria-expanded="true" aria-controls="menu">Open Menu</button>
```

**Close buttons:**

```html
<!-- Initially -->
<button data-flyout-close="menu" aria-expanded="true" aria-controls="menu">Close</button>

<!-- When flyout opens -->
<button aria-expanded="false" aria-controls="menu">Close</button>
```

::: tip ARIA expanded state

- Trigger: `aria-expanded="true"` when open
- Close buttons: `aria-expanded="false"` when open (inverted)
- Indicates whether the controlled element is visible
  :::

### Screen Reader Experience

**When user clicks trigger:**

1. Button announces: "Open Menu, button, expanded"
2. Focus moves to first close button
3. Screen reader announces: "Close, button" + flyout content
4. User can navigate flyout with screen reader

**When user presses Escape:**

1. Flyout closes
2. Focus returns to trigger button
3. Screen reader announces: "Open Menu, button, collapsed"

### Best Practices

```html
<!-- Good: Semantic button with clear label -->
<button data-flyout="menu">
  <span>Menu</span>
</button>

<!-- Good: Icon with accessible label -->
<button data-flyout="menu" aria-label="Open navigation menu">
  <svg><!-- Hamburger icon --></svg>
</button>

<!-- Good: Close button with sr-only text -->
<button data-flyout-close="menu">
  <svg><!-- X icon --></svg>
  <span class="sr-only">Close menu</span>
</button>

<!-- Good: Overlay with sr-only text -->
<button data-flyout-close="menu" class="fixed inset-0 bg-black/50">
  <span class="sr-only">Close menu</span>
</button>
```

## Best Practices

::: tip Use Button Elements
Trigger must be a `<button>` element. The component specifically queries for `button[data-flyout]`.
:::

::: tip Include Transitions
Your flyout must have CSS transitions. The component relies on `transitionend` event:

```html
<div
  data-flyout-inactive-class="transition-transform duration-300 translate-x-full"
  data-flyout-active-class="transition-transform duration-300 translate-x-0"
></div>
```

:::

::: tip Position Close Button First
Place first close button near the top for optimal focus management and UX.
:::

::: tip Use Overlay for Mobile
Always include an overlay backdrop to close the flyout by clicking outside:

```html
<button
  data-flyout-close="menu"
  class="fixed inset-0 bg-black/50"
  data-flyout-close-inactive-class="opacity-0 pointer-events-none"
>
  <span class="sr-only">Close menu</span>
</button>
```

:::

::: warning Z-index Management
Ensure proper z-index stacking:

- Overlay: `z-40`
- Flyout: `z-50`
- Prevents flyout appearing behind overlay
  :::

## Troubleshooting

**Flyout not opening?**

- Check console for "Flyout modal element not found" warning
- Verify `data-flyout` value matches flyout `id`
- Ensure trigger is a `<button>` element
- Check flyout element exists in DOM

**Flyout snaps closed instead of animating?**

- Add transition classes to `data-flyout-inactive-class`
- Ensure both active and inactive classes include transitions
- Check CSS transition properties are defined

**Can still tab to page content behind flyout?**

- Focus trap requires `A11yUtils` to be available
- Check console for errors in `keepFocus()` call
- Verify focusable elements exist within flyout

**Flyout stays visible after closing?**

- Component waits for `transitionend` event
- Check flyout has CSS transitions defined
- Verify no JavaScript errors preventing transition completion

**Overlay not clickable?**

- Check overlay has `data-flyout-close` attribute
- Verify no `pointer-events-none` class when open
- Ensure z-index is lower than flyout

**Page still scrolls with flyout open?**

- Add `data-flyout-body-active-class="overflow-hidden"`
- Verify CSS for overflow-hidden is defined
- Check body classes are actually applied

**Close button not focused on open?**

- Ensure close button exists inside flyout
- Check button has `data-flyout-close` attribute
- Verify button isn't hidden or disabled

**Multiple flyouts interfering?**

- Ensure each flyout has unique ID
- Check each trigger references correct flyout ID
- Verify close buttons reference correct flyout ID
