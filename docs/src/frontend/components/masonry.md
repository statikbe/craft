# Masonry

This component makes it possible to make a grid in masonry style. For now this needs t o be calculated with javascript. In the future this will be possible as a native CSS property.

Some information about the [grid property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout)

Google Chrome made an [alternative proposal for a masonry layout](https://developer.chrome.com/blog/masonry).

## Implementation

For this component we use a [little javascript lib](https://github.com/Profesor08/masonry) to calculate the offset of each block. It uses the basic grid implementation but gives a negative top margin to certain blocks to pull them up.

## Example

### Image example

<iframe src="../../examples/masonry.html" height="800"></iframe>

### Card example

<iframe src="../../examples/masonry_cards.html" height="800"></iframe>

## Code

### HTML

The HTML is the same setup as a normal grid system. The grid itself needs a class of `masonry` to trigger the component.

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
