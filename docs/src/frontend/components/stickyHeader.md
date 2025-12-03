# Sticky Header

A scroll-responsive header that hides when scrolling down and reveals when scrolling up. Built on CSS `position: sticky` with JavaScript-enhanced scroll direction detection. The component dynamically adds a `data-show` attribute that CSS can target for smooth transitions.

## Features

- ✅ **Scroll Direction Detection**: Tracks whether user scrolls up or down
- ✅ **Auto Hide/Show**: Hides on scroll down, reveals on scroll up
- ✅ **Data Attribute Toggle**: Adds/removes `data-show` for CSS targeting
- ✅ **CSS Transition Ready**: Works with any transition/animation
- ✅ **Tailwind Compatible**: Supports `data-show:` prefix utilities
- ✅ **Lightweight**: Minimal JavaScript overhead
- ✅ **Performance**: Uses `requestAnimationFrame` for smooth updates
- ✅ **Threshold Support**: Configurable scroll threshold
- ✅ **Works with Sticky**: Enhances native CSS `position: sticky`
- ✅ **No Dependencies**: Pure JavaScript implementation

## How It Works

### Why JavaScript?

CSS `position: sticky` makes headers stick, but detecting **scroll direction** requires JavaScript:

```css
/* CSS can make it sticky */
header {
  position: sticky;
  top: 0;
}
```

But CSS can't detect scroll direction
JavaScript adds `data-show` attribute

### Scroll Detection

```typescript
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    // Scrolling DOWN - hide header
    header.removeAttribute('data-show');
  } else {
    // Scrolling UP - show header
    header.setAttribute('data-show', '');
  }

  lastScrollY = currentScrollY;
});
```

### CSS Integration

The component adds `data-show`, which CSS can target:

```css
/* Header starts above viewport */
header {
  position: sticky;
  top: -160px; /* Header height */
  transition: top 0.5s ease;
}

/* When data-show is present, slide into view */
header[data-show] {
  top: 0;
}
```

### Tailwind Approach

```html
<header class="sticky -top-40 data-show:top-0 transition-all duration-500" data-sticky-header-reveal>
  <!-- Header content -->
</header>
```

The `data-show:top-0` class applies when `data-show` attribute is present.

## Examples

### Scroll Up to Reveal

<iframe src="../../examples/stickyHeaderScrollUp.html" height="400"></iframe>

```html
<header
  class="bg-red-500 z-10 sticky -top-40 data-show:top-0 transition-all duration-500 ease-in-out"
  data-sticky-header-reveal
>
  <div class="p-6">This is the header</div>
</header>
<div>Content</div>
```

Notice the `data-show:` prefix. This custom data attribute is dynamically added to the header element by JavaScript when the user scrolls up, and removed when scrolling down. In your CSS, you can use selectors like `[data-show]` or classes prefixed with `data-show:` to apply styles that reveal or hide the header based on its presence, allowing for smooth transitions and interactive behavior.

### Shrinking Header (CSS-Only)

This example can be done with 100% CSS in modern browsers. We need the parallax polyfill for older browsers.

<iframe src="../../examples/stickyHeaderScrollShrink.html" height="400"></iframe>

```css
@keyframes headerAni {
  to {
    height: 60px;
  }
}
header {
  height: 100px;
  animation: headerAni linear both;
  animation-timeline: scroll(block root);
  animation-range: 0px 100px;
}
```

```html
<header class="bg-red-500 z-10 sticky top-0 parallax p-3 flex justify-between">
  <a href="{{ siteUrl }}" class="w-20 bg-blue-500 flex items-center justify-center"> Site logo </a>
  <ul class="flex flex-wrap space-x-6 items-center">
    <li class=""><a href="#">item 1</a></li>
    <li class=""><a href="#">item 2</a></li>
    <li class=""><a href="#">item 3</a></li>
    <li class=""><a href="#">item 4</a></li>
    <li class=""><a href="#">item 5</a></li>
  </ul>
</header>
<div>Content</div>
```

## Data Attributes

| Attribute                   | Type    | Required | Description                                               |
| --------------------------- | ------- | -------- | --------------------------------------------------------- |
| `data-sticky-header-reveal` | Boolean | Yes      | Enables scroll direction detection and data-show toggling |
