# Background Image

The Background Image component converts an `<img>` element into a CSS `background-image` on its wrapper element. It waits for the image to load, then applies it as a background, enabling use cases where `object-fit: cover` isn't suitable.

## When to Use This

::: warning Prefer Standard Images
Use this component **only when necessary**. In most cases, a standard `<img>` with `object-fit: cover` and `object-position` is better for accessibility and SEO. See [Better Alternative](#better-alternative) below.
:::

**Valid use cases:**

- Elements requiring text overlay with complex background positioning
- When you need CSS `background-size`, `background-repeat`, or `background-blend-mode` control
- Gradients or multiple backgrounds combined with images
- Complex layouts where `object-fit` behavior is insufficient

**Avoid when:**

- Image is primary content (use `<img>` for accessibility)
- Focal point positioning is needed (use `object-position` instead)
- SEO matters for the image (background images aren't indexed)

## Features

- ✅ **Responsive Images** - Works with `<picture>` and `srcset`
- ✅ **Lazy Loading** - Respects `loading="lazy"` attribute
- ✅ **Focal Point Support** - Use `background-position` CSS for Craft focal points
- ✅ **Color Palette** - Apply placeholder color during load
- ✅ **Dynamic Content** - Works with AJAX-loaded images
- ✅ **Load States** - Adds `is-loaded` class after image loads

## Examples

<iframe src="../../examples/backgroundImage.html" height="400"></iframe>

## Code

```TWIG
{% set image = block.image.collect().first() ? block.image.collect().first() : fallback.image.one() %}
{% set optimizedImage = image.optimizedTextImage %}
{% if optimizedImage|length %}
    <div class="aspect-video" data-bg-image
            style="{% if optimizedImage.colorPalette %}background-color: {{ optimizedImage.colorPalette[0] }};{% endif %} background-position: {% for focalPoint in image.getFocalPoint() %} {{ focalPoint * 100 }}% {% endfor %};">
        <picture>
            {% if craft.imageOptimize.serverSupportsWebP() and image.extension != 'svg' and image.extension != 'gif' and image.extension != 'webp' %}
                <source srcset="{{ optimizedImage.srcsetWebP() }}"
                        sizes="(max-width: 479px) 95vw, (min-width: 480px) and (max-width: 659px) 448px, (min-width: 660px) and (max-width: 819px) 628px, (min-width: 820px) and (max-width: 979px) 378px, (min-width: 980px) and (max-width: 1199px) 458px, (min-width: 1200px) 568px"
                        type="image/webp"/>
            {% endif %}
            <img src="{{ optimizedImage.optimizedImageUrls|length == 0 ? image.getUrl() : optimizedImage.placeholderBox() }}"
                    srcset="{{ optimizedImage.srcset() }}"
                    sizes="(max-width: 479px) 95vw, (min-width: 480px) and (max-width: 659px) 448px, (min-width: 660px) and (max-width: 819px) 628px, (min-width: 820px) and (max-width: 979px) 378px, (min-width: 980px) and (max-width: 1199px) 458px, (min-width: 1200px) 568px"
                    alt="{{ image.alt }}"
                    class="sr-only" loading="lazy"/>
        </picture>
    </div>
{% endif %}
```

## How It Works

### Basic Usage

1. **Add attribute** to wrapper element: `data-bg-image`
2. **Include `<img>`** as child element (or reference by ID)
3. **Component detects** the image on page load or dynamic content insertion
4. **Waits for load** until image is fully loaded (respects `loading="lazy"`)
5. **Applies background** using `currentSrc` (from `srcset`) or `src`
6. **Hides image** with `hidden` class
7. **Adds class** `is-loaded` to wrapper after 250ms delay

### Image Detection

The component searches for images in this order:

1. **Nested image:** `<img>` element inside `[data-bg-image]` wrapper
2. **Referenced image:** If `data-bg-image` has a value (ID), selects that image by ID

```html
<!-- Option 1: Nested image (recommended) -->
<div data-bg-image>
  <img src="image.jpg" alt="Description" class="sr-only" />
</div>

<!-- Option 2: Referenced by ID -->
<div data-bg-image="myImage"></div>
<img id="myImage" src="image.jpg" alt="Description" class="sr-only" />
```

### Load Sequence

**If image already loaded (cached):**

1. Immediately applies as background
2. Hides image
3. Adds `is-loaded` class after 250ms

**If image still loading:**

1. Keeps image visible (unless `loading="lazy"` - then removes `sr-only`)
2. Listens for `load` event
3. When loaded, applies as background
4. Hides image
5. Adds `is-loaded` class after 250ms

### CSS Application

The component sets these styles on the wrapper:

```javascript
wrapper.style.backgroundColor = ''; // Clears any inline background color
wrapper.style.backgroundImage = `url("${imgSrc}")`; // Sets background image
wrapper.classList.add('is-loaded'); // After 250ms delay
```

**Note:** It clears `backgroundColor` but preserves any CSS-based background color (like from placeholder).

## Attributes

| Attribute       | Required | Description                                                                                                             |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `data-bg-image` | ✅ Yes   | Marks the wrapper element. Value can be empty (searches for nested `<img>`) or an ID (selects image by `id` attribute). |

## Dynamic Content

The component automatically works with AJAX-loaded content:

```javascript
// After loading new content with background images
// Component automatically detects and processes them
```

No manual reinitialization needed thanks to `DOMHelper.onDynamicContent`.

## Responsive Images

The component fully supports modern responsive image techniques:

### With `srcset`

```html
<div data-bg-image>
  <img
    src="image-800.jpg"
    srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
    sizes="100vw"
    alt="Description"
    class="sr-only"
  />
</div>
```

The component uses `image.currentSrc` to get the browser-selected image from the `srcset`.

### With `<picture>`

```html
<div data-bg-image>
  <picture>
    <source srcset="image.webp" type="image/webp" />
    <source srcset="image.jpg" type="image/jpeg" />
    <img src="image.jpg" alt="Description" class="sr-only" />
  </picture>
</div>
```

The component automatically uses the correct source chosen by the browser.

## Lazy Loading

Works seamlessly with native lazy loading:

```html
<div data-bg-image>
  <img src="image.jpg" alt="Description" class="sr-only" loading="lazy" />
</div>
```

**Behavior with `loading="lazy"`:**

1. If image has `loading` attribute, component removes `sr-only` class temporarily
2. Image becomes visible while loading (for better UX)
3. Once loaded, image is hidden and background applied
4. `is-loaded` class added after 250ms

## Craft CMS Integration

### With Focal Points

```twig
{% set image = entry.image.one() %}
{% set optimizedImage = image.optimizedTextImage %}

<div
  class="aspect-video bg-cover"
  data-bg-image
  style="
    background-color: {{ optimizedImage.colorPalette[0] }};
    background-position: {% for focalPoint in image.getFocalPoint() %}{{ focalPoint * 100 }}%{% endfor %};
  ">
  <picture>
    {% if craft.imageOptimize.serverSupportsWebP() %}
      <source srcset="{{ optimizedImage.srcsetWebP() }}" type="image/webp" />
    {% endif %}
    <img
      src="{{ optimizedImage.placeholderBox() }}"
      srcset="{{ optimizedImage.srcset() }}"
      sizes="100vw"
      alt="{{ image.alt }}"
      class="sr-only"
      loading="lazy"
    />
  </picture>
</div>
```

**Key points:**

- `background-color` set to first palette color (placeholder during load)
- `background-position` uses Craft's focal point (percentage-based)
- Image uses Image Optimize plugin for responsive images
- Component clears inline `backgroundColor` after load (CSS color remains)

### With Image Optimize

The component works perfectly with the [Image Optimize plugin](https://plugins.craftcms.com/image-optimize):

- Uses `currentSrc` to get the best resolution from `srcset`
- Supports WebP sources in `<picture>` elements
- Works with placeholder images during load
- Respects lazy loading attributes

## Styling & States

### Load State Class

The `is-loaded` class is added **250ms after** the image loads. Use this for transitions:

```css
[data-bg-image] {
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

[data-bg-image].is-loaded {
  opacity: 1;
}
```

**Why 250ms delay?**
Ensures the background image is painted before showing the element, preventing flicker.

### Recommended CSS

```css
[data-bg-image] {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

Or with Tailwind:

```html
<div data-bg-image class="bg-cover bg-center bg-no-repeat">...</div>
```

## Image Hiding

The component hides the `<img>` element after applying it as background:

```javascript
image.classList.add('hidden'); // Tailwind's hidden class
```

**Recommendation:** Start with `sr-only` class for accessibility:

```html
<img src="..." alt="Descriptive text" class="sr-only" />
```

This keeps the image accessible to screen readers until it becomes a background.

::: warning Accessibility Impact
When converted to a background image, the `alt` text is no longer accessible. Only use this component for decorative images or when text content is overlaid.
:::

## Referenced Images

You can reference an image by ID if it's not nested:

```html
<div class="hero bg-cover bg-center" data-bg-image="heroImage">
  <h1>Hero Content</h1>
  <p>This div will get the background image</p>
</div>

<img
  id="heroImage"
  src="hero.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w"
  sizes="100vw"
  alt="Hero background"
  class="sr-only"
/>
```

**When to use:**

- Image is used in multiple places
- Cleaner markup for complex layouts
- Image is in a different part of the DOM

**Nested vs Referenced:**

- ✅ **Nested:** Simpler, more maintainable, better semantics
- ⚠️ **Referenced:** More flexible, but requires unique IDs

## Better alternative

In a lot of cases you don't need an image in the background and you can just use the image with the classes `object-cover` and `object-center`. When the image has a Craft focal point you can not use `object-center`. But you can use the CSS property `object-position`.

An example of what this code would look like.

```TWIG
{% set image = entry.headerImage.one() %}
{% set optimizedImage = image.optimizedContent %}
<picture>
    {% set sizes = "(max-width: 479px) 95vw, (min-width: 480px) and (max-width: 659px) 628px, (min-width: 660px) and (max-width: 819px) 628px, (min-width: 820px) and (max-width: 979px) 788px, (min-width: 980px) and (max-width: 1199px) 948px, (min-width: 1200px) 1168px" %}
    {% if craft.imageOptimize.serverSupportsWebP() and image.extension != 'svg' and image.extension != 'gif' %}
        <source srcset="{{ optimizedImage.srcsetWebP() }}"
                sizes="{{sizes}}"
                type="image/webp"/>
    {% endif %}
    {% if image.extension == 'svg' or image.extension == 'gif' %}
        <img src="{{ image.getUrl() }}"
                width="{{image.width}}" height="{{image.height}}"
                alt="{{ image.alt }}"
                class="w-full object-cover block aspect-video"
                style="object-position: {% for focalPoint in image.getFocalPoint() %} {{ focalPoint * 100 }}% {% endfor %};"
                loading="lazy"/>
    {% else %}
        <img src="{{ optimizedImage.optimizedImageUrls|length == 0 ? image.getUrl() : optimizedImage.placeholderBox() }}"
                srcset="{{ optimizedImage.srcset() }}"
                sizes="{{sizes}}"
                width="{{optimizedImage.placeholderWidth}}" height="{{optimizedImage.placeholderHeight}}"
                alt="{{ image.alt }}"
                class="w-full object-cover block aspect-video"
                style="object-position: {% for focalPoint in image.getFocalPoint() %} {{ focalPoint * 100 }}% {% endfor %};"
                loading="lazy"/>
    {% endif %}
</picture>
```

**Why this is better:**

- ✅ No JavaScript required
- ✅ Works with `object-fit: cover` (same visual effect)
- ✅ `object-position` respects focal points
- ✅ Fully accessible with `alt` text
- ✅ SEO-friendly (images indexed)
- ✅ Prints correctly
- ✅ Progressive enhancement

## Best Practices

::: tip Prefer Standard Images
In 90% of cases, you should use a standard `<img>` with `object-fit: cover` instead of this component. It's better for:

- **SEO** - Search engines index image content
- **Accessibility** - Screen readers access `alt` text
- **Performance** - No JavaScript required
- **Print** - Images print correctly
  :::

::: tip Use with Color Palette
Set a `background-color` from the image's dominant color for smoother loading:

```html
<div data-bg-image style="background-color: #4a5568;">
  <img src="..." class="sr-only" />
</div>
```

The component clears inline background color after load but preserves CSS-based colors.
:::

::: warning Background Position Required
Don't forget to set `background-size` and `background-position` in your CSS or inline styles:

```html
<div data-bg-image class="bg-cover bg-center">...</div>
```

Otherwise the background might appear incorrectly.
:::

## Troubleshooting

**Background not appearing?**

- Check that image has actually loaded (check Network tab)
- Verify the wrapper has dimensions (width/height)
- Check console for errors
- Ensure image path is correct

**Wrong image resolution used?**

- Component uses `currentSrc` which respects `srcset` and `sizes`
- Verify your `sizes` attribute matches actual rendered size
- Check browser's chosen resolution in DevTools

**Image still visible after load?**

- Check that `hidden` class is defined (Tailwind: `display: none`)
- Verify no CSS is overriding the `hidden` class
- Check console for JavaScript errors

**`is-loaded` class not added?**

- Component adds it after 250ms delay
- Check that image actually loaded (no 404 errors)
- Verify wrapper element still exists in DOM

**Focal point not working?**

- Focal point is set via `background-position` CSS, not by the component
- Ensure you're setting inline `style="background-position: X% Y%"`
- Component doesn't modify `background-position`

**Lazy loading not working?**

- Native `loading="lazy"` is handled by the browser
- Component just waits for the `load` event
- Check browser support for lazy loading

**Referenced image not found?**

- Verify the ID matches exactly (case-sensitive)
- Ensure image exists in the DOM when component initializes
- Check that ID doesn't have special characters

## Accessibility Considerations

::: warning Decorative Images Only
Background images are not accessible to screen readers. Only use this component for decorative images or when:

- Equivalent text content is overlaid on the background
- The image doesn't convey important information
- You're okay with the image being invisible to assistive technology
  :::
