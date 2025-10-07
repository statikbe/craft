# Modal video

This is a plugin for the default modal component. You can trigger a modal with a YouTube video or a carousel of videos.

## Example

<iframe src="../examples/modal_video.html" height="400"></iframe>

```HTML
<button type="button" data-modal-video="https://www.youtube.com/watch?v=aAkMkVFwAoo&list=RDaAkMkVFwAoo" data-caption="This is a caption for the video" class="btn">Show video</button>
```

## Group Example

<iframe src="../examples/modal_video_group.html" height="400"></iframe>

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

## Trigger with code

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

## Attributes

| Attribute          | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `data-modal-video` | This attribute triggers the component. the value is the url of the video |
| `data-caption`     | This is an optional caption for the video                                |
| `data-group`       | All triggers with the same group value will form a carrousel             |

## Styling

The styling is done in the template itself. Additionally, the video content is wrapped in a `.modal__video-wrapper` class, which you can target for custom styling or layout adjustments as needed.

| Attribute                  | Default                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `data-video-style`         | `modal__video w-screen max-w-[calc(100vw-6rem)] aspect-video` |
| `data-video-caption-style` | `modal__caption p-2 bg-black text-sm text-white`              |
