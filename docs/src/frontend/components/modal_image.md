# Modal image

The Modal Image plugin extends the base Modal component to create a lightbox for displaying images. It supports single images, image galleries with navigation, captions, and loading states. Perfect for product images, photo galleries, or any scenario where you need to show images in a modal overlay.

## Features

- ✅ **Lightbox Display**: Full-screen image viewing
- ✅ **Gallery Support**: Navigate through multiple images
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
4. **Load Image**: Creates `<img>` with specified `src`
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

## Data Attributes

### Trigger Attributes

| Attribute          | Type   | Description                                                    |
| ------------------ | ------ | -------------------------------------------------------------- |
| `data-modal-image` | URL    | **Required**. Full-size image URL to display                   |
| `data-caption`     | String | Optional caption text shown below image                        |
| `data-group`       | String | Gallery group identifier (images with same group form gallery) |

### Styling Attributes

Override default CSS classes on trigger element:

| Attribute                  | Default Classes                                                                      | Description           |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------- |
| `data-image-style`         | `modal__image w-full max-h-[calc(100vh-6rem)] max-w-[calc(100vw-6rem)]`              | Image element styling |
| `data-image-caption-style` | `modal__caption p-2 bg-black/50 absolute left-0 right-0 bottom-0 text-sm text-white` | Caption styling       |

## JavaScript API

### Programmatic Usage

An example of how to trigger an image dialog with code.

```ts
const modalImageButton = document.getElementById('modalImageButton');
if (modalImageButton) {
  const modal = new Modal(
    modalImageButton,
    {
      src: 'https://unsplash.it/2000/1000?random&gravity=center',
      caption: 'This is my caption',
    },
    new ImageModalPlugin('#modalImageButton')
  );
}
```

or

```ts
const modal = new Modal(
  null,
  {
    src: 'https://unsplash.it/2000/1000?random&gravity=center',
    caption: 'This is my caption',
  },
  new ImageModalPlugin('')
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
