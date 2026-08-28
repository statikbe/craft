# Swiper Slider

A wrapper for the powerful Swiper.js slider/carousel library. Provides touch-enabled, responsive sliders with navigation, pagination, and full accessibility support. Auto-initializes all `.swiper` elements with sensible defaults.

## Features

- ✅ **Touch/Swipe Support**: Native mobile swipe gestures
- ✅ **Responsive**: `slidesPerView: 'auto'` adapts to content
- ✅ **Navigation**: Previous/next buttons with automatic disable state
- ✅ **Accessibility**: Keyboard navigation and ARIA labels
- ✅ **Pagination**: Optional dot indicators
- ✅ **Auto-Height**: Adapts to slide content height
- ✅ **Loop Mode**: Infinite looping
- ✅ **Lazy Loading**: Load images as needed
- ✅ **Multiple Instances**: Multiple sliders on one page
- ✅ **Auto-Initialize**: Detects `.swiper` class

## Example

<iframe src="../../examples/swiper.html" height="500"></iframe>

```twig
<div class="!-mx-2 swiper swiper-overflow">
    <div class="flex justify-end gap-12 py-5 pr-2">
        <button type="button" class="swiper-button-prev disabled:opacity-50">
            {{ icon('chevron-left', { class: 'text-primary text-4xl' }) }}
            <span class="sr-only">{{"Vorige"|t}}</span>
        </button>
        <button type="button" class="swiper-button-next disabled:opacity-50">
            {{ icon('chevron-right', { class: 'text-primary text-4xl' }) }}
            <span class="sr-only">{{"Volgende"|t}}</span>
        </button>
    </div>
    <div class="swiper-wrapper">
        {% set images = ["https://unsplash.it/400/400?random&gravity=center", "https://unsplash.it/401/401?random&gravity=center", "https://unsplash.it/402/402?random&gravity=center", "https://unsplash.it/403/403?random&gravity=center", "https://unsplash.it/404/404?random&gravity=center", "https://unsplash.it/405/405?random&gravity=center", "https://unsplash.it/406/406?random&gravity=center", "https://unsplash.it/407/407?random&gravity=center", "https://unsplash.it/408/408?random&gravity=center"] %}
        {% for image in images %}
            <div class="xs:!w-1/2 md:!w-1/3 px-2 swiper-slide">
                <img
                src="{{image}}" alt="" class="block aspect-square object-cover object-center"/>
            </div>
        {% endfor %}
    </div>
</div>
```

## How It Works

### Initialization

1. Scans page for elements with `.swiper` class
2. Imports Swiper.js library (~50KB)
3. Imports required modules (Navigation, A11y)
4. Creates Swiper instances with default config:
   - `slidesPerView: 'auto'` (responsive width)
   - Navigation enabled
   - A11y module for accessibility
   - Loop disabled by default
5. Binds navigation buttons

## Required Classes

| Class                 | Element   | Description                                   |
| --------------------- | --------- | --------------------------------------------- |
| `.swiper`             | Container | **Required**. Main slider container           |
| `.swiper-wrapper`     | Wrapper   | **Required**. Slides wrapper (flex container) |
| `.swiper-slide`       | Slide     | **Required**. Individual slide                |
| `.swiper-button-prev` | Button    | Previous slide button                         |
| `.swiper-button-next` | Button    | Next slide button                             |
| `.swiper-pagination`  | Div       | Pagination dots container                     |

## Configuration Options

### Via Data Attributes

```html
<div class="swiper" data-swiper-loop="true" data-swiper-autoplay="true" data-swiper-slides-per-view="3">
  <!-- Content -->
</div>
```

### Common Options

| Option           | Type              | Default  | Description                    |
| ---------------- | ----------------- | -------- | ------------------------------ |
| `slidesPerView`  | Number or 'auto'  | `'auto'` | Number of slides per view      |
| `spaceBetween`   | Number            | `0`      | Space between slides in pixels |
| `loop`           | Boolean           | `false`  | Enable infinite loop           |
| `autoplay`       | Boolean or Object | `false`  | Auto-advance slides            |
| `speed`          | Number            | `300`    | Transition speed in ms         |
| `centeredSlides` | Boolean           | `false`  | Center active slide            |
| `navigation`     | Boolean or Object | `true`   | Enable navigation buttons      |
| `pagination`     | Boolean or Object | `false`  | Enable pagination dots         |

## Resources

- [Swiper Official Documentation](https://swiperjs.com/)
- [Swiper API Reference](https://swiperjs.com/swiper-api)
- [Swiper Demos](https://swiperjs.com/demos)
- [GitHub Repository](https://github.com/nolimits4web/swiper)
