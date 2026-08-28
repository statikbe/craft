# Pullout

A pure CSS utility that breaks elements out of their container constraints. Allows content to extend beyond the container grid to the viewport edges, with responsive control and customizable maximum widths. No JavaScript required, just Tailwind CSS utilities.

## Features

- ✅ **Pure CSS Solution**: No JavaScript, just CSS custom properties
- ✅ **Break Container Bounds**: Extend content beyond container width
- ✅ **Directional Control**: Pull left, right, or both directions
- ✅ **Responsive**: Different breakout behavior per breakpoint
- ✅ **Customizable Width**: Limit pullout with `--pullout-amount` variable
- ✅ **Fractional Width Support**: Works with `w-1/2`, `w-1/3`, etc.
- ✅ **Full Width**: Pull full-width elements to viewport edges
- ✅ **Tailwind Integration**: Uses Tailwind utility classes
- ✅ **Layout Flexible**: Works within grid/flex containers
- ✅ **Performance**: Hardware-accelerated CSS transforms

## Example

<a href="../../examples/pullout.html" target="_blank">You can view an example here</a>

```html
<div class="section section--default">
  <div class="container bg-gray-200 py-10">
    <div class="flex flex-wrap">
      <div class="w-full md:w-1/2 pullout pullout--both md:pullout--left-1/2">
        <div class="md:pr-4">
          <img src="https://unsplash.it/800/600?random" alt="" class="w-full" />
        </div>
      </div>
      <div
        class="w-full mt-6 md:w-1/2 md:mt-0 pullout pullout--both md:pullout--right-1/2 [--pullout-amount:100vw] md:[--pullout-amount:30px] lg:[--pullout-amount:130px]"
      >
        <div class="md:pl-4">
          <img src="https://unsplash.it/800/600?random" alt="" class="w-full" />
        </div>
      </div>
    </div>
  </div>
</div>
```

## CSS Classes

| Class                | Description                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `pullout`            | **Required**. Base class that enables pullout functionality                                               |
| `pullout--both`      | Pulls element to both left and right edges. Works only with full-width elements (`w-full`)                |
| `pullout--left-1/2`  | Pulls element to the left edge. Fraction must match element width (e.g., `w-1/2` → `pullout--left-1/2`)   |
| `pullout--right-1/2` | Pulls element to the right edge. Fraction must match element width (e.g., `w-1/2` → `pullout--right-1/2`) |
| `pullout--left-1/3`  | For one-third width elements (`w-1/3`)                                                                    |
| `pullout--right-1/3` | For one-third width elements (`w-1/3`)                                                                    |
| `pullout--left-2/3`  | For two-thirds width elements (`w-2/3`)                                                                   |
| `pullout--right-2/3` | For two-thirds width elements (`w-2/3`)                                                                   |

## CSS Variables

| Variable           | Default       | Description                                                       |
| ------------------ | ------------- | ----------------------------------------------------------------- |
| `--pullout-amount` | Viewport edge | Maximum distance to pull out. Set with `[--pullout-amount:130px]` |

### Setting Custom Width

```html
<!-- Pull out, but max 100px beyond container -->
<div class="pullout pullout--both [--pullout-amount:100px]">
  <div>Content</div>
</div>

<!-- Different limits per breakpoint -->
<div
  class="pullout pullout--right-1/2 
            [--pullout-amount:50px] 
            md:[--pullout-amount:100px] 
            lg:[--pullout-amount:150px]"
>
  <div>Content</div>
</div>
```

## Important Requirements

### ⚠️ Direct Child Required

The pullout element **must have exactly one direct child**:

```html
<!-- ✅ Correct -->
<div class="pullout pullout--both">
  <div>
    <img src="/image.jpg" alt="Image" />
    <p>Caption</p>
  </div>
</div>

<!-- ❌ Wrong - Multiple direct children -->
<div class="pullout pullout--both">
  <img src="/image.jpg" alt="Image" />
  <p>Caption</p>
</div>
```

All CSS transforms are applied to the parent; the child compensates with padding.

### ⚠️ Width Fraction Must Match

When using directional pullouts, the class fraction must match element width:

```html
<!-- ✅ Correct -->
<div class="w-1/2 pullout pullout--left-1/2">
  <div>Content</div>
</div>

<!-- ❌ Wrong - Mismatch -->
<div class="w-1/3 pullout pullout--left-1/2">
  <div>Content</div>
</div>
```
