# Modal Video

The Modal Video plugin extends the base Modal component to embed and play videos from YouTube in a modal overlay. It supports single videos, video galleries with navigation, captions, and automatic video pause on close. Perfect for video demonstrations, tutorials, testimonials, or media galleries.

## Features

- ✅ **YouTube Support**: Embed YouTube videos with automatic ID extraction
- ✅ **Gallery Navigation**: Browse through multiple videos
- ✅ **Video Captions**: Optional captions below videos
- ✅ **Auto-Pause**: Stops video when modal closes
- ✅ **Responsive**: Maintains aspect ratio (16:9)
- ✅ **Keyboard Navigation**: Arrow keys, ESC
- ✅ **Loading States**: Shows loader while video loads
- ✅ **URL Flexibility**: Accepts full URLs or video IDs
- ✅ **Fullscreen Support**: Native iframe fullscreen
- ✅ **Custom Styling**: Configurable CSS classes
- ✅ **Programmatic API**: Open from JavaScript

## How It Works

### Single Video Flow

1. **Click Trigger**: User clicks element with `data-modal-video`
2. **Extract ID**: Plugin extracts YouTube/Vimeo ID from URL
3. **Create Dialog**: Creates `<dialog>` element
4. **Add Loader**: Shows loading indicator
5. **Create Iframe**: Builds YouTube embed URL
6. **Load Video**: Iframe loads video player
7. **Hide Loader**: After iframe loads, hide loader
8. **Display**: Video appears in modal
9. **Close**: ESC or close button pauses and closes

### Gallery Flow

With `data-group` attribute:

1. **Collect Videos**: Finds all elements with same `data-group`
2. **Extract IDs**: Gets YouTube IDs from all video URLs
3. **Build Array**: Creates array of embed URLs
4. **Find Index**: Determines clicked video position
5. **Add Navigation**: Shows prev/next buttons
6. **Keyboard**: Left/right arrows navigate
7. **Video Switch**: Changing video stops previous one
8. **Caption Sync**: Updates caption for current video

## Example

<iframe src="../../examples/modal_video.html" height="400"></iframe>

```HTML
<button type="button" data-modal-video="https://www.youtube.com/watch?v=aAkMkVFwAoo&list=RDaAkMkVFwAoo" data-caption="This is a caption for the video" class="btn">Show video</button>
```

## Group Example

<iframe src="../../examples/modal_video_group.html" height="400"></iframe>

```HTML
<button data-group="video-gallery" data-modal-video="https://www.youtube.com/watch?v=WhWc3b3KhnY" data-caption="This is the caption of Video 1">
    <span class="sr-only">Show video gallery</span>
    <img src="https://img.youtube.com/vi/WhWc3b3KhnY/1.jpg" alt=""/>
</button>
<button data-group="video-gallery" data-modal-video="https://www.youtube.com/watch?v=R6MlUcmOul8" data-caption="This is the caption of Video 2">
    <span class="sr-only">Show image gallery</span>
    <img src="https://img.youtube.com/vi/R6MlUcmOul8/1.jpg" alt=""/>
</button>
<button data-group="video-gallery" data-modal-video="https://www.youtube.com/watch?v=PVGeM40dABA">
    <span class="sr-only">Show image gallery</span>
    <img src="https://img.youtube.com/vi/PVGeM40dABA/1.jpg" alt=""/>
</button>
```

## Data Attributes

### Trigger Attributes

| Attribute          | Type      | Description                                                    |
| ------------------ | --------- | -------------------------------------------------------------- |
| `data-modal-video` | URL or ID | **Required**. YouTube URL or video ID                          |
| `data-caption`     | String    | Optional caption text shown below video                        |
| `data-group`       | String    | Gallery group identifier (videos with same group form gallery) |

### Styling Attributes

Override default CSS classes on trigger element:

| Attribute                  | Default Classes                                               | Description          |
| -------------------------- | ------------------------------------------------------------- | -------------------- |
| `data-video-style`         | `modal__video w-screen max-w-[calc(100vw-6rem)] aspect-video` | Video iframe styling |
| `data-video-caption-style` | `modal__caption p-2 bg-black text-sm text-white`              | Caption styling      |

## JavaScript API

### Programmatic Usage

An example of how to trigger an video dialog with code.

```ts
const modalVideoButton = document.getElementById('modalVideoButton');
if (modalVideoButton) {
  const modal = new Modal(
    modalVideoButton,
    {
      src: 'https://www.youtube.com/watch?v=mN0zPOpADL4',
    },
    new VideoModalPlugin('#modalVideoButton')
  );
}
```

or

```ts
const modal = new Modal(
  null,
  {
    src: 'https://www.youtube.com/watch?v=aAkMkVFwAoo&list=RDaAkMkVFwAoo',
    caption: 'This is my caption',
  },
  new VideoModalPlugin('')
);
modal.openPluginModal();
```

## Related Components

- **[Modal (Base)](./modal.md)**: Core modal functionality
- **[Modal AJAX](./modal_ajax.md)**: Load remote content
- **[Modal Confirmation](./modal_confirmation.md)**: Yes/No dialogs
- **[Modal Image](./modal_image.md)**: Image lightbox
- **[Swiper](./swiper.md)**: Video carousels
- **[Video Background](./videoBackground.md)**: Background videos
