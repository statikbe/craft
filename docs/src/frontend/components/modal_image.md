# Modal image

The Modal Image plugin extends the base Modal component to create a lightbox for displaying images. It supports single images, image galleries with navigation, captions, and loading states. Perfect for product images, photo galleries, or any scenario where you need to show images in a modal overlay.

## Features

- ✅ **Lightbox Display**: Full-screen image viewing
- ✅ **Gallery Support**: Navigate through multiple images
- ✅ **Responsive Images**: Serve modern formats and sizes with `data-modal-srcset`
- ✅ **Gallery Opener**: Open a gallery from any button with `data-open-gallery`
- ✅ **Image Captions**: Optional captions below images
- ✅ **Loading States**: Shows loader while image loads
- ✅ **Keyboard Navigation**: Arrow keys, ESC, Enter
- ✅ **Touch/Swipe Support**: Navigate on mobile devices
- ✅ **Responsive Sizing**: Adapts to viewport size
- ✅ **Lazy Image Loading**: Images load only when modal opens
- ✅ **Group Management**: Organize images into galleries
- ✅ **Custom Styling**: Configurable CSS classes
- ✅ **Programmatic API**: Open from JavaScript
- ✅ **Auto-Hide Controls**: Close button appears after image loads

## How It Works

### Single Image Flow

1. **Click Trigger**: User clicks element with `data-modal-image`
2. **Create Dialog**: Plugin creates `<dialog>` element
3. **Add Loader**: Shows loading indicator
4. **Load Image**: Creates a `<picture>` with an `<img>` using the specified `src`, plus a `<source>` for each entry in `data-modal-srcset`
5. **Image Load Event**: When image loads:
   - Hide loader
   - Show close button
   - Show caption (if present)
6. **Display**: Image appears in modal
7. **Close**: ESC or close button closes modal

### Gallery Flow

With `data-group` attribute:

1. **Collect Images**: Finds all elements with same `data-group`
2. **Build Array**: Creates array of image URLs
3. **Find Index**: Determines clicked image position
4. **Add Navigation**: Shows prev/next buttons
5. **Keyboard**: Left/right arrows navigate
6. **Touch**: Swipe left/right on mobile
7. **Preload**: May preload adjacent images
8. **Caption Sync**: Updates caption when navigating

## Example

<iframe src="../../examples/modal_image.html" height="400"></iframe>

```HTML
<button type="button" data-modal-image="https://unsplash.it/2000/1000?random&gravity=center" data-caption="This is a caption to my image" class="btn">Show image</button>
```

## Group Example

<iframe src="../../examples/modal_image_group.html" height="400"></iframe>

```HTML
<button data-group="image-gallery" data-modal-image="https://unsplash.it/400/400?random&gravity=center" data-caption="This is the caption of Image 1">
    <span class="sr-only">Show image gallery</span>
    <img src="https://unsplash.it/150/150?random&gravity=center" alt=""/>
</button>
<button data-group="image-gallery" data-modal-image="https://unsplash.it/2000/1000?random&gravity=center" data-caption="This is the caption of Image 2">
    <span class="sr-only">Show image gallery</span>
    <img src="https://unsplash.it/150/150?random&gravity=center" alt=""/>
</button>
<button data-group="image-gallery" data-modal-image="https://unsplash.it/800/400?random&gravity=center">
    <span class="sr-only">Show image gallery</span>
    <img src="https://unsplash.it/150/150?random&gravity=center" alt=""/>
</button>
```

## Responsive Images Example

Add `data-modal-srcset` with a JSON array of sources. Each entry becomes a `<source>` element inside a `<picture>`, so the browser picks the best format and size it supports. `data-modal-image` stays required: it is the fallback `src` and is used to keep track of the position in a gallery.

<iframe src="../../examples/modal_image_srcset.html" height="400"></iframe>

```HTML
<button type="button"
    data-modal-image="/img/photo-1600.jpg"
    data-modal-srcset='[{"type": "image/avif", "srcset": "/img/photo-800.avif 800w, /img/photo-1600.avif 1600w"}, {"type": "image/jpeg", "srcset": "/img/photo-800.jpg 800w, /img/photo-1600.jpg 1600w"}]'
    class="btn">Show image</button>
```

Each source accepts these keys:

| Key      | Required | Description                                                            |
| -------- | -------- | ---------------------------------------------------------------------- |
| `srcset` | Yes      | Image candidates with width (`800w`) or density (`2x`) descriptors     |
| `type`   | No       | MIME type, e.g. `image/avif`. Unsupported types are skipped            |
| `media`  | No       | Media query for art direction, e.g. `(min-width: 768px)`               |
| `sizes`  | No       | Display size hint. Defaults to `100vw`, which suits a fullscreen modal |

Order matters: the browser uses the first source it supports, so list the most efficient format first. Use single quotes around the attribute value so the JSON double quotes don't need escaping, or in Twig use `{{ sources|json_encode|e('html_attr') }}`. Invalid JSON is logged to the console and the modal falls back to `data-modal-image`.

In a gallery, each trigger can have its own `data-modal-srcset`; the sources are swapped when navigating.

## Open Gallery Example

A button with `data-open-gallery` opens the first image of the gallery whose `data-group` matches its value. Handy for a "View all photos" button next to a grid of thumbnails. Buttons added to the page later (e.g. through AJAX) work as well.

<iframe src="../../examples/modal_image_open_gallery.html" height="400"></iframe>

```HTML
<button data-group="product-photos" data-modal-image="/img/photo1.jpg">
    <span class="sr-only">Show image gallery</span>
    <img src="/img/photo1-thumb.jpg" alt=""/>
</button>
<button data-group="product-photos" data-modal-image="/img/photo2.jpg">
    <span class="sr-only">Show image gallery</span>
    <img src="/img/photo2-thumb.jpg" alt=""/>
</button>

<button type="button" data-open-gallery="product-photos" class="btn">View all photos</button>
```

The gallery opener is set up by the image plugin, which only loads when there is at least one `[data-modal-image]` on the page. That's always the case when there is a gallery to open. If no gallery matches the value, a message is logged to the console and nothing happens.

## Data Attributes

### Trigger Attributes

| Attribute           | Type   | Description                                                                          |
| ------------------- | ------ | ------------------------------------------------------------------------------------ |
| `data-modal-image`  | URL    | **Required**. Full-size image URL to display                                         |
| `data-caption`      | String | Optional caption text shown below image                                              |
| `data-group`        | String | Gallery group identifier (images with same group form gallery)                       |
| `data-modal-srcset` | JSON   | Optional array of sources (`type`, `srcset`, `media`, `sizes`) for responsive images |

### Gallery Opener Attributes

| Attribute           | Type   | Description                                                                    |
| ------------------- | ------ | ------------------------------------------------------------------------------ |
| `data-open-gallery` | String | Put on any button. Opens the first image of the gallery with this `data-group` |

### Styling Attributes

The default styling lives in `frontend/css/site/components/modal.css`. Add extra classes on the trigger element; they are **added** to the BEM classes:

| Attribute                  | BEM Class                              | Description                                              |
| -------------------------- | -------------------------------------- | -------------------------------------------------------- |
| `data-picture-style`       | `modal__picture`                       | Picture wrapper styling (`display: contents` by default) |
| `data-image-style`         | `modal__image`                         | Image element styling                                    |
| `data-image-caption-style` | `modal__caption modal__caption--image` | Caption styling                                          |

## JavaScript API

### Programmatic Usage

An example of how to trigger an image dialog with code.

```ts
const modalImageButton = document.getElementById("modalImageButton");
if (modalImageButton) {
  const modal = new Modal(
    modalImageButton,
    {
      src: "https://unsplash.it/2000/1000?random&gravity=center",
      caption: "This is my caption",
      srcset: [
        {
          type: "image/avif",
          srcset: "/img/photo-800.avif 800w, /img/photo-1600.avif 1600w",
        },
      ],
    },
    new ImageModalPlugin("#modalImageButton"),
  );
}
```

or

```ts
const modal = new Modal(
  null,
  {
    src: "https://unsplash.it/2000/1000?random&gravity=center",
    caption: "This is my caption",
  },
  new ImageModalPlugin(""),
);
modal.openPluginModal();
```

## Related Components

- **[Modal (Base)](./modal.md)**: Core modal functionality
- **[Modal AJAX](./modal_ajax.md)**: Load remote content
- **[Modal Confirmation](./modal_confirmation.md)**: Yes/No dialogs
- **[Modal Video](./modal_video.md)**: Video player modals
- **[Masonry](./masonry.md)**: Photo grid layouts
- **[Swiper](./swiper.md)**: Image carousels
