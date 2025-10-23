# Video Toggle

A component for on-demand video loading that defers iframe creation until user interaction, improving page performance. Features include aspect ratio adjustment, customizable controls, and accessible toggle patterns.

## Features

- ✅ **Lazy Loading**: Videos load only when user clicks trigger button
- ✅ **Performance Optimization**: Reduces initial page weight and rendering time
- ✅ **Aspect Ratio Management**: Auto-adjusts container height based on video dimensions
- ✅ **Flexible Triggers**: Hide, keep visible, or toggle trigger button content
- ✅ **Close Button**: Optional close button for dismissing videos
- ✅ **Custom Events**: Dispatches `videotoggle.open` and `videotoggle.close` events
- ✅ **Multiple Instances**: Supports multiple videos on same page
- ✅ **ARIA Support**: Proper `aria-expanded` and `aria-controls` attributes
- ✅ **Autoplay**: Videos start playing immediately when loaded
- ✅ **Custom CSS Classes**: Override default classes via data attributes

## How It Works

### Initialization

1. **Button Detection**: Component finds all `button[data-video-toggle]` elements
2. **Container Preparation**: Creates video content wrapper and iframe element
3. **Event Binding**: Attaches click handler to trigger button
4. **ARIA Setup**: Adds `aria-expanded="false"` and `aria-controls` attributes

### Opening Video

1. **Clear Container**: Removes any existing videos from container
2. **Create Iframe**: Dynamically creates iframe element
3. **Set Source**: Sets iframe `src` with autoplay parameter
4. **Adjust Height**: Calculates and sets container height based on aspect ratio
5. **Toggle Trigger**: Hides button or swaps content based on settings
6. **Dispatch Event**: Fires `videotoggle.open` custom event

### Closing Video

1. **Clear Source**: Removes iframe `src` to stop playback
2. **Hide Elements**: Hides video content and close button
3. **Reset Height**: Removes inline height styles
4. **Restore Trigger**: Shows button or restores original content
5. **Dispatch Event**: Fires `videotoggle.close` custom event

### Aspect Ratio Calculation

When `data-video-toggle-aspect-ratio` is set (e.g., "16:9"):

```typescript
const aspectRatio = '16:9'.split(':');
const width = parseInt(aspectRatio[0]); // 16
const height = parseInt(aspectRatio[1]); // 9
const newHeight = (container.offsetWidth * height) / width;
container.style.height = newHeight + 'px';
```

## Examples

### Basic toggle

<iframe src="../../examples/videoToggleBasic.html" height="420"></iframe>

```twig
<div class="relative bg-gray-200 aspect-video" id="video">
    <div class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        {% set embed = craft.videoparser.parse("https://www.youtube.com/watch?v=r2GZHjFBhp4") %}
        {% if embed %}
        <button type="button" class="px-4 py-2 bg-white rounded"
                data-video-toggle="{{embed.embedSrc}}"
                data-video-toggle-container="#video">
            {{ icon('play-arrow', { class: 'ml-2 text-xl' }) }}  {{ 'Play video'|t }}
        </button>
        {% endif %}
    </div>
</div>
```

### Toggle with growing screen

<iframe src="../../examples/videoToggleGrow.html" height="420"></iframe>

```twig
<div class="relative h-20 bg-gray-200 transition-all duration-300 ease-in-out" id="video">
    <div class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        {% set embed = craft.videoparser.parse("https://www.youtube.com/watch?v=r2GZHjFBhp4") %}
        {% if embed %}
        <button type="button" class="px-4 py-2 bg-white rounded"
                data-video-toggle="{{embed.embedSrc}}"
                data-video-toggle-container="#video"
                data-video-toggle-aspect-ratio="16:9">
            {{ icon('play-arrow', { class: 'ml-2 text-xl' }) }} {{ 'Play video'|t }}
        </button>
        {% endif %}
    </div>
</div>
```

### Keep the trigger button

<iframe src="../../examples/videoToggleVisibleTrigger.html" height="500"></iframe>

```twig
<div class="relative h-20 bg-gray-200">
    <div class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        {% set embed = craft.videoparser.parse("https://www.youtube.com/watch?v=r2GZHjFBhp4") %}
        {% if embed %}
        <button type="button" class="px-4 py-2 bg-white rounded"
                data-video-toggle="{{embed.embedSrc}}"
                data-video-toggle-container="#video"
                data-video-toggle-aspect-ratio="16:9"
                data-video-toggle-hide-trigger="false"
                data-video-toggle-toggle-content='{{ svg("@webroot/frontend/icons/clear.svg")|attr({class: "icon ml-2 text-xl"}) }} {{ "Stop video"|t }}'>
            {{ icon('play-arrow', { class: 'ml-2 text-xl' }) }} {{ 'Play video'|t }}
        </button>
        {% endif %}
    </div>
</div>
<div id="video"></div>
```

| Attribute                             | Description                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `data-video-toggle`                   | This attribute triggers the component and contains url to the video                                             |
| `data-video-toggle-container`         | The ID of the element where the video will be loaded. Defaults to parent element                                |
| `data-video-toggle-aspect-ratio`      | The aspect ratio that the container needs to get when the video is loaded. Format: "16:9". Default: "auto"      |
| `data-video-toggle-hide-trigger`      | The trigger button is by default removed when clicked. Set to `"false"` to keep button visible. Default: `true` |
| `data-video-toggle-toggle-content`    | The HTML content the trigger button displays when video is shown. Used when `hide-trigger="false"`              |
| `data-video-toggle-show-close-button` | By default, a close button will be shown when the video is loaded. Set to `"false"` to hide. Default: `true`    |
| `data-video-toggle-hide-class`        | CSS class used to hide elements. Default: `"hidden"`                                                            |
| `aria-expanded`                       | Automatically set to `"true"` when video open, `"false"` when closed                                            |
| `aria-controls`                       | Automatically set to ID of video content element                                                                |

## CSS Classes

The component creates elements with CSS classes. You can override these by setting corresponding data attributes on the trigger button:

| Class                       | Description                                 | Override Attribute              |
| --------------------------- | ------------------------------------------- | ------------------------------- |
| `video-toggle__container`   | Added to container element                  | N/A (always added)              |
| `video-toggle__content`     | Video content wrapper (absolute positioned) | `data-video-toggle-content`     |
| `video-toggle__iframe`      | Video iframe element                        | `data-video-toggle-iframe`      |
| `video-toggle__close`       | Close button                                | `data-video-toggle-close`       |
| `video-toggle__close-after` | Close button icon (SVG mask)                | `data-video-toggle-close-after` |

Default classes:

```typescript
{
  videoToggleContainer: 'video-toggle__container relative',
  videoToggleContent: 'video-toggle__content absolute top-0 right-0 bottom-0 left-0',
  videoToggleIframe: 'video-toggle__iframe',
  videoToggleClose: 'video-toggle__close absolute top-0 right-0 p-2 bg-white',
  videoToggleCloseAfter: 'after:block after:shrink-0 after:w-[1em] after:h-[1em] ...'
}
```

## Styling

### Custom Close Button

```html
<button
  data-video-toggle="..."
  data-video-toggle-close="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full hover:bg-red-600"
  data-video-toggle-close-after="after:content-['×'] after:text-2xl after:font-bold"
>
  Play
</button>
```

## Events

### Listen for Video Open

```javascript
document.addEventListener('videotoggle.open', (e) => {
  console.log('Video opened:', e.detail); // Video content element

  // Pause other videos, track analytics, etc.
});
```

### Listen for Video Close

```javascript
document.addEventListener('videotoggle.close', (e) => {
  console.log('Video closed:', e.detail);

  // Resume background music, track viewing time, etc.
});
```

## Accessibility

### ARIA Attributes

The component automatically manages ARIA attributes:

```html
<!-- Before click -->
<button data-video-toggle="..." aria-expanded="false" aria-controls="videoToggleContent0">Play Video</button>

<!-- After click -->
<button data-video-toggle="..." aria-expanded="true" aria-controls="videoToggleContent0">Stop Video</button>
```

### Screen Reader Support

Always include descriptive text:

```html
<button data-video-toggle="...">
  <svg aria-hidden="true"><!-- Icon --></svg>
  <span class="sr-only">Play product demo video</span>
</button>
```

### Keyboard Support

- **Enter/Space**: Activate video toggle
- **Tab**: Navigate to close button
- **Escape**: Could be added to close video (custom implementation)

## Related Components

- **[Video Background](./videoBackground)**: Background video playback
- **[Modal](./modal)**: Video toggles in modal dialogs
- **[Toggle](./toggle)**: General show/hide toggle component

## Resources

- [YouTube Embed Parameters](https://developers.google.com/youtube/player_parameters)
- [Vimeo Embed Options](https://developer.vimeo.com/player/sdk/embed)
- [ARIA: button role](https://www.w3.org/TR/wai-aria-1.1/#button)
- [Lazy Loading Best Practices](https://web.dev/lazy-loading/)
