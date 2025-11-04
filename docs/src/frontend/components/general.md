# General Component

A foundational component that handles essential page-level functionality including JavaScript detection, transition preloading prevention, and keyboard-based focus outline management for improved accessibility and user experience.

## Features

- ✅ **JS Detection** - Adds `.js-enabled` class to `<body>` for progressive enhancement
- ✅ **Preload Transition Prevention** - Prevents unwanted animations on page load
- ✅ **Smart Focus Outlines** - Shows outlines for keyboard users, hides for mouse users
- ✅ **Automatic Initialization** - Runs on every page without configuration
- ✅ **Accessibility First** - Maintains keyboard navigation while improving mouse UX
- ✅ **Zero Configuration** - Works automatically on instantiation

## Features Overview

This component provides three essential page-level enhancements:

1. **JS Enabled Class** - Enables JavaScript-specific styling
2. **Preload Transitions** - Prevents animations from firing on page load
3. **User is Tabbing** - Manages focus outlines based on input method

## JS Enabled

The body element gets a class of `js-enabled` when the javascript is run.

## Preload transitions

When you have elements with a transition that are triggered on load, these gets animated right away. And that's something you almost never want.

On load the body has the class `preload-transitions`.

```CSS
.preload-transitions * {
  transition: none !important;
}
```

This class gets removed once the page is loaded.

## User is tabbing

As long as a user is not using the tab key, the outline on focus is removed. This is to prevent the outline is shown when a link is clicked.

```CSS
body:not(.user-is-tabbing) *:focus {
  outline: none;
  box-shadow: none;
}
```

When the user hits the tab-key the class `.user-is-tabbing` is added to the body element.

## How It Works

### Preload Transitions Feature

**Problem:** CSS transitions can fire immediately on page load, creating unwanted animations.

**Solution:** Temporarily disable all transitions until page is fully loaded.

**Initial HTML:**

```html
<body class="preload-transitions">
  <!-- Page content -->
</body>
```

**CSS to disable transitions:**

```css
.preload-transitions * {
  transition: none !important;
}
```

**JavaScript removes class when ready:**

```typescript
const node = document.querySelector('.preload-transitions');
if (node) {
  document.addEventListener('DOMContentLoaded', function () {
    node.classList.remove('preload-transitions');
  });

  // Fallback for late initialization
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    node.classList.remove('preload-transitions');
  }
}
```

**After DOM loaded:**

```html
<body class="js-enabled">
  <!-- Transitions now work normally -->
</body>
```

**Timing:**

- `DOMContentLoaded` event: When HTML parsed (before images/stylesheets fully loaded)
- Fallback check: If component initializes after DOM already loaded
- Covers both early and late initialization scenarios

### User is Tabbing Feature

**Problem:** Focus outlines help keyboard users but look ugly when clicking with mouse.

**Solution:** Only show focus outlines when user presses Tab key.

**Default CSS (no outlines for mouse users):**

```css
body:not(.user-is-tabbing) *:focus {
  outline: none;
  box-shadow: none;
}
```

**JavaScript detects first Tab key press:**

```typescript
function handleFirstTab(e) {
  if (e.keyCode === 9) {
    // Tab key
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
}
window.addEventListener('keydown', handleFirstTab);
```

**After user presses Tab:**

```html
<body class="js-enabled user-is-tabbing">
  <!-- Focus outlines now visible -->
</body>
```

**CSS with outlines for keyboard users:**

```css
/* Outlines visible when user is tabbing */
body.user-is-tabbing *:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Or use default browser outlines */
body.user-is-tabbing *:focus {
  /* Browser default outline appears */
}
```

**Why remove listener after first Tab?**

- Only need to detect once
- Class persists for entire session
- Improves performance (one fewer global listener)
