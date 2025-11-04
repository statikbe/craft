# Masonry

The Masonry component creates Pinterest-style grid layouts where items of varying heights pack efficiently into columns without leaving gaps. This component uses CSS Grid as a foundation with JavaScript calculations to achieve the masonry effect.

## Features

- ✅ **Automatic Layout**: Items automatically arrange to minimize vertical gaps
- ✅ **CSS Grid Based**: Uses modern CSS Grid with JavaScript enhancement
- ✅ **Responsive Columns**: Adjusts column count based on breakpoints
- ✅ **Variable Heights**: Handles items of different heights gracefully
- ✅ **Dynamic Content**: Supports items added after page load
- ✅ **Lightweight Library**: Uses [@prof-dev/masonry](https://github.com/Profesor08/masonry) for calculations
- ✅ **Performance Optimized**: Only recalculates on resize/content changes
- ✅ **Image Support**: Works well with lazy-loaded images

## Why JavaScript is Needed

While CSS Grid has proposed native masonry support, it's not yet widely available across browsers. This component bridges the gap using JavaScript to calculate positioning.

### Background on Native Masonry

Mozilla proposed a masonry value for CSS Grid's `grid-template-rows`:

- [MDN: Masonry Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout)

Google Chrome proposed an alternative approach using `masonry-template-tracks`:

- [Chrome: Masonry Proposal](https://developer.chrome.com/blog/masonry)

Until these proposals stabilize and gain browser support, JavaScript-based solutions remain necessary.

## How It Works

### Initialization

1. **Element Detection**: Finds all elements with the `.masonry` class
2. **Instance Creation**: Creates a masonry instance for each grid
3. **Layout Calculation**: Calculates optimal item positions
4. **Margin Application**: Applies negative top margins to pull items up

### Layout Algorithm

The component uses `grid-auto-rows` with a small value (typically 20px) to create a fine-grained grid:

1. Items are placed in CSS Grid normally (flowing left-to-right, top-to-bottom)
2. JavaScript calculates each item's natural height
3. Negative margins are applied to pull items upward to close gaps
4. The result is items packed tightly into columns

### Resize Handling

- Layout recalculates automatically on window resize
- Debounced to prevent excessive calculations
- Maintains layout integrity across viewport changes

## Implementation

This component uses the [@prof-dev/masonry library](https://github.com/Profesor08/masonry) which:

- Calculates the offset for each grid item
- Uses CSS Grid as the base layout system
- Applies negative top margins to "pull up" items
- Handles responsive breakpoint changes

## Example

### Image Example

<iframe src="../../examples/masonry.html" height="800"></iframe>

### Card Example

<iframe src="../../examples/masonry_cards.html" height="800"></iframe>

## Code

### HTML

The HTML uses standard grid markup. Add the `.masonry` class to trigger the component:

```html
<div class="masonry">
  <div>
    <img src="https://unsplash.it/450/325?random&gravity" alt="Dummy Image" />
  </div>
  <div>
    <img src="https://unsplash.it/450/450?random&gravity" alt="Dummy Image" />
  </div>
  <div>
    <img src="https://unsplash.it/450/280?random&gravity" alt="Dummy Image" />
  </div>
  <div>
    <img src="https://unsplash.it/450/540?random&gravity" alt="Dummy Image" />
  </div>
  <div>
    <img src="https://unsplash.it/450/380?random&gravity" alt="Dummy Image" />
  </div>
</div>
```

### CSS

Set up CSS Grid with responsive columns:

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  align-items: start;
  gap: 12px;
}

@media (width >= theme(--breakpoint-sm)) {
  .masonry {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width >= theme(--breakpoint-md)) {
  .masonry {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Attributes

### Required Markup

- **`.masonry`**: Class on the grid container (required to trigger the component)

## Dynamic Content Support

The masonry component integrates with DOMHelper for dynamic content.
This ensures newly added items are properly positioned in the masonry layout.

## Best Practices

### Image Loading

Wait for images to load before calculating layout:

```html
<div class="masonry">
  <div>
    <img src="..." alt="..." loading="lazy" />
  </div>
</div>
```

The component handles this automatically, but you can trigger manual recalculation if needed.

### Gap Consistency

Use consistent gap values:

```css
.masonry {
  gap: 12px; /* Same value for row and column gaps */
}
```

Uneven gaps can create visual misalignment in masonry layouts.

### Content Padding

Keep item padding consistent for visual harmony:

```css
.masonry > * {
  padding: 1rem;
}
```

## Accessibility

### Semantic Structure

Use appropriate semantic elements:

```html
<div class="masonry">
  <article>...</article>
  <article>...</article>
</div>
```

Or for images:

```html
<div class="masonry" role="list">
  <figure role="listitem">
    <img src="..." alt="Descriptive text" />
    <figcaption>Caption</figcaption>
  </figure>
</div>
```

### Reading Order

Items flow visually in columns but the DOM order is left-to-right, top-to-bottom. Ensure the DOM order makes sense for screen readers:

```html
<!-- DOM order (how screen readers experience it) -->
<div class="masonry">
  <div>Item 1 (top-left)</div>
  <div>Item 2 (top-middle)</div>
  <div>Item 3 (top-right)</div>
  <div>Item 4 (second row left)</div>
  <!-- ... -->
</div>
```

## Future Considerations

### Native CSS Masonry

When native CSS masonry becomes widely supported:

```css
/* Future syntax (not yet supported) */
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: masonry; /* Mozilla proposal */
}
```

Or Chrome's proposal:

```css
.masonry {
  masonry-template-tracks: repeat(3, 1fr);
}
```

This component can be deprecated once native support reaches ~90% browser coverage.

### Progressive Enhancement

The component already uses progressive enhancement:

1. **No JavaScript**: Standard grid layout (fallback)
2. **With JavaScript**: Masonry packing effect (enhancement)

## Additional Resources

- [MDN: CSS Grid Masonry Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout)
- [Chrome: Masonry Proposal](https://developer.chrome.com/blog/masonry)
- [@prof-dev/masonry on GitHub](https://github.com/Profesor08/masonry)
- [CSS Grid Layout Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
