# Modal image

This is a plugin for the default modal component. You can trigger a modal with an image or a carrousel of images.

## Example

<iframe src="../examples/modal_image.html" height="600"></iframe>

```HTML
<button type="button" data-modal-image="https://unsplash.it/2000/1000?random&gravity=center" data-caption="This is a caption to my image" class="btn">Show image</button>
```

## Trigger with code

An example of how to trigger an ajax dialog with code.

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

## Attributes

| Attribute          | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `data-modal-image` | This attribute triggers the component. the value is the url of the image |
| `data-caption`     | This is an optional caption for the image                                |
| `data-group`       | All triggers with the same group value will form a carrousel             |

## Styling

The styling is done in the template itself. But you get an extra wrapper class around the content if needed.

| Attribute                  | Default                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `data-image-style`         | `modal__image w-full max-h-[calc(100vh-6rem)] max-w-[calc(100vw-6rem)]`              |
| `data-image-caption-style` | `modal__caption p-2 bg-black/50 absolute left-0 right-0 bottom-0 text-sm text-white` |
