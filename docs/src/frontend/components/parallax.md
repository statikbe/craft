# Parallax

The Parallax component enables scroll-driven animations using CSS `animation-timeline`. It creates visual effects where elements move, scale, or transform based on scroll position. The component automatically detects browser support and polyfills older browsers with a JavaScript fallback, making modern scroll animations accessible across all browsers.

## Features

- ✅ **CSS-Based**: Uses native CSS `animation-timeline` for performance
- ✅ **Auto-Polyfill**: Automatically loads polyfill for unsupported browsers
- ✅ **Progressive Enhancement**: Works in all browsers (native or polyfilled)
- ✅ **Scroll-Driven**: Animations sync with scroll position
- ✅ **View Timeline**: Trigger animations when elements enter viewport
- ✅ **Performance**: Hardware-accelerated CSS animations
- ✅ **No JavaScript Required**: Pure CSS animations (after polyfill loads)
- ✅ **Simple Setup**: Just add `.parallax` class and define keyframes

## How It Works

### Browser Support Detection

1. **Check Support**: Component checks if browser supports `animation-timeline`
2. **Load Polyfill**: If not supported, dynamically imports polyfill
3. **Apply Class**: Add `.parallax` class to enable component
4. **Define Keyframes**: Create CSS `@keyframes` for animation
5. **Set Timeline**: Apply `animation-timeline: scroll()` or `view()`
6. **Animate**: Element animates based on scroll position

### Timeline Types

**`animation-timeline: scroll()`**

- Animates based on scroll container position
- 0% = top of scroll, 100% = bottom of scroll
- Good for: progress bars, fixed elements

**`animation-timeline: view()`**

- Animates based on element visibility in viewport
- 0% = enters viewport, 100% = leaves viewport
- Good for: fade-ins, element-specific effects

### Polyfill Behavior

The polyfill is loaded only when needed:

```typescript
if (!CSS.supports('animation-timeline: --works')) {
  import('../libs/scroll-timeline.js');
}
```

This ensures modern browsers use native CSS, while older browsers get JavaScript support.

## Browser Compatibility

[Check current browser support](https://caniuse.com/?search=animation-timeline)

## Example

<iframe src="../../examples/parallax.html" height="400"></iframe>

## CSS Setup

### Basic Scroll Progress

```css
@keyframes progressbar {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

#progress.parallax {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #6664cf;
  animation: progressbar linear both;
  animation-timeline: scroll(); /* Animates with page scroll */
}
```

```html
<div class="parallax" id="progress"></div>
<p>Aliqua excepteur dolor ipsum in eiusmod.</p>
<p>Pariatur cillum cillum nisi occaecat</p>
<p>Consequat magna sint irure ex enim</p>
<p>Exercitation dolore minim tempor quis mollit</p>
<p>Laboris quis ut aliquip nulla fugiat</p>
```

### Color Change on View

```css
@keyframes changeColor {
  0% {
    color: #000000;
  }
  20% {
    color: #ff0000;
  }
  80% {
    color: #00ff00;
  }
  100% {
    color: #000000;
  }
}

.change-color.parallax {
  animation: changeColor linear both;
  animation-timeline: view(block 20% 20%); /* Animates when in viewport */
}
```

```html
<p>Aliqua excepteur dolor ipsum in eiusmod.</p>
<p>Pariatur cillum cillum nisi occaecat</p>
<p>Consequat magna sint irure ex enim</p>
<p class="change-color parallax">Reprehenderit sunt veniam aliquip commodo.</p>
<p>Exercitation dolore minim tempor quis mollit</p>
<p>Laboris quis ut aliquip nulla fugiat</p>
```

The `view(block 20% 20%)` means:

- Start animation when element is 20% into viewport
- End animation when element is 20% from leaving viewport

## Animation Properties

### `animation-timeline`

Defines what drives the animation:

```css
/* Scroll of root element */
animation-timeline: scroll();

/* Scroll of nearest scrollable ancestor */
animation-timeline: scroll(nearest);

/* Based on element visibility in viewport */
animation-timeline: view();

/* Custom scroll container */
animation-timeline: scroll(inline nearest);
```

### `animation-range`

Controls when animation starts/ends:

```css
/* Start at document start, end at document end */
animation-range: 0% 100%;

/* Start when element enters viewport */
animation-range: entry 0% entry 100%;

/* End when element exits viewport */
animation-range: exit 0% exit 100%;

/* Specific pixel range */
animation-range: 0px 500px;

/* Percentage of scroll height */
animation-range: 0vh 50vh;
```

### View Timeline Insets

Control trigger points for `view()` timeline:

```css
/* 20% inset from top/bottom of viewport */
animation-timeline: view(block 20% 20%);

/* Different insets */
animation-timeline: view(block 10% 30%);

/* No insets (full viewport) */
animation-timeline: view();
```

## Attributes

| Attribute/Class | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| `.parallax`     | **Required**. Enables scroll-timeline support and polyfill detection |

## Accessibility

### Respect Motion Preferences

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .parallax {
    animation: none !important;
  }
}
```

### Maintain Readability

```css
.text-parallax.parallax {
  animation: fadeIn linear both;
  animation-timeline: view();
}

@media (prefers-reduced-motion: reduce) {
  .text-parallax.parallax {
    animation: none;
    opacity: 1; /* Ensure text is always visible */
  }
}
```

## Related Components

- **[Sticky Header](./stickyHeader.md)**: Header that reveals on scroll up
- **[Video Background](./videoBackground.md)**: Background videos with parallax

## Resources

- [MDN: animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)
- [Scroll-driven Animations Spec](https://drafts.csswg.org/scroll-animations/)
- [Polyfill Repository](https://github.com/flackr/scroll-timeline)
- [Browser Support](https://caniuse.com/?search=animation-timeline)
- [Chrome DevTools Animation Inspector](https://developer.chrome.com/docs/devtools/css/animations/)
