# Video Background

A component for playing YouTube and Vimeo videos as full-screen backgrounds with play/pause controls, automatic aspect ratio management, and accessibility support.

## Features

- ✅ **YouTube Support**: Background playback using YouTube IFrame API
- ✅ **Vimeo Support**: Background playback using Vimeo Player SDK
- ✅ **Play/Pause Controls**: Toggle button with state attributes
- ✅ **Aspect Ratio Management**: Automatically scales video to fill container
- ✅ **Reduced Motion Support**: Respects `prefers-reduced-motion` user preference
- ✅ **Auto-Play**: Videos start playing on load (muted for autoplay policies)
- ✅ **Looping**: Continuous video playback
- ✅ **Responsive**: Maintains 16:9 aspect ratio across all screen sizes
- ✅ **Custom CSS Classes**: Override default classes via data attributes
- ✅ **Accessible**: Hidden from screen readers, keyboard-accessible controls

## How It Works

### Initialization

The component detects elements with `data-video-bg` attribute and initializes the appropriate video player:

1. **API Loading**: Dynamically loads YouTube IFrame API or Vimeo Player SDK
2. **Container Setup**: Adds wrapper classes and positioning
3. **Player Creation**: Creates iframe with autoplay, loop, and mute settings
4. **Aspect Ratio Calculation**: Scales video to fill container maintaining 16:9 ratio
5. **Control Binding**: Connects play/pause button with state attributes

### YouTube IFrame API

For YouTube videos, the component loads the IFrame API and creates a player with:

- Autoplay enabled (muted)
- Looping (via playlist parameter)
- Controls hidden
- Modest branding
- Inline playback for mobile

### Vimeo Player SDK

For Vimeo videos, the component dynamically imports the Vimeo Player SDK and creates a player with:

- Background mode enabled
- Autoplay (muted)
- Looping enabled

### Aspect Ratio Management

The component ensures videos fill their containers by:

- Calculating 16:9 aspect ratio against container dimensions
- Scaling width or height as needed
- Centering video with CSS transforms
- Responding to window resize events

### Accessibility

- Videos are hidden from screen readers with `aria-hidden="true"`
- Play/pause button includes visible screen reader text
- Respects `prefers-reduced-motion` by pausing videos on load

## Example youtube

<iframe src="../../examples/videoBackgroundYoutube.html" height="330"></iframe>

```twig
{% set embed = craft.videoparser.parse(block.video) %}
<div class="p-12" id="videoWrapper">
    <div data-youtube-id="{{embed.id}}" data-video-bg="videoWrapper" data-video-controls="videoControls"></div>
    <div class="text-white">
        <h3>This is a youtube video in the background</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
    </div>
    <div class="flex justify-end">
        <button type="button" class="text-white text-3xl group" id="videoControls">
        {{ icon('play', { class: 'hidden group-data-paused:block' }) }}
        <span class="sr-only hidden group-data-paused:block">Play Video</span>
        {{ icon('pause', { class: 'hidden group-data-playing:block' }) }}
        <span class="sr-only hidden group-data-playing:block">Pause Video</span>
        </button>
    </div>
</div>
```

## Example vimeo

<iframe src="../../examples/videoBackgroundVimeo.html" height="330"></iframe>

```twig
{% set embed = craft.videoparser.parse(block.video) %}
<div class="p-12" id="videoWrapperVimeo">
    <div data-vimeo-id="{{embed.id}}" data-video-bg="videoWrapperVimeo" data-video-controls="videoControlsVimeo"></div>
    <div class="text-white">
        <h3>This is a Vimeo video in the background</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
    </div>
    <div class="flex justify-end">
        <button type="button" class="text-white text-3xl group" id="videoControlsVimeo">
        {{ icon('play', { class: 'hidden group-data-paused:block' }) }}
        <span class="sr-only hidden group-data-paused:block">Play Video</span>
        {{ icon('pause', { class: 'hidden group-data-playing:block' }) }}
        <span class="sr-only hidden group-data-playing:block">Pause Video</span>
        </button>
    </div>
</div>
```

## Toggle button

The video controls button gets two different attributes depending on the state: `data-paused` and `data-playing`.

## Attributes

| Attribute             | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `data-video-bg`       | This attribute triggers the component and contains the id of the wrapper   |
| `data-video-controls` | The ID of the button that controls the video. This is a required attribute |
| `data-youtube-id`     | YouTube video ID for YouTube videos                                        |
| `data-vimeo-id`       | Vimeo video ID for Vimeo videos                                            |
| `data-paused`         | Added to control button when video is paused (state attribute)             |
| `data-playing`        | Added to control button when video is playing (state attribute)            |

## CSS Classes

The component adds CSS classes to structure the video background. You can override these classes by setting corresponding data attributes on the video element:

| Class               | Description                | Override Attribute      |
| ------------------- | -------------------------- | ----------------------- |
| `video-bg__wrapper` | Added to container element | `data-video-bg-wrapper` |
| `video-bg__iframe`  | Added to video iframe      | `data-video-bg-iframe`  |

Default classes:

```typescript
{
  videoBGWrapper: 'video-bg__wrapper relative isolate overflow-hidden',
  videoBGIframe: 'video-bg__iframe absolute top-0 left-0 w-full h-full -z-1 pointer-events-none'
}
```

## Styling

### Control Button States

Use the state attributes to style the control button:

```css
/* Paused state */
button[data-paused] {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Playing state */
button[data-playing] {
  background-color: rgba(0, 0, 0, 0.3);
}
```

### Tailwind Group Modifiers

```html
<button class="group">
  <svg class="hidden group-data-paused:block">
    <!-- Show when paused -->
  </svg>
  <svg class="hidden group-data-playing:block">
    <!-- Show when playing -->
  </svg>
</button>
```

## Accessibility

### Screen Reader Considerations

Videos are automatically hidden from screen readers with `aria-hidden="true"`.

### Prefers Reduced Motion

The component respects user motion preferences by pausing videos for users who prefer reduced motion.

## Related Components

- **[Video Toggle](./videoToggle)**: On-demand video loading

## Resources

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Vimeo Player SDK](https://developer.vimeo.com/player/sdk)
- [Autoplay Policy](https://developer.chrome.com/blog/autoplay/)
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
