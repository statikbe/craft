# Modal

The modal component makes use of the [javascript dialog API](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). The base modal component can only show content from an inline dialog. But there are some extra plugin's to show images, videos, confirmations or ajax content.

## Base dialog

```HTML
<button type="button" data-modal="inline-content">Show inline modal</button>
<dialog id="inline-content" class="">
    <h1>This is my cool modal</h1>
    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusantium exercitationem repudiandae ullam ea debitis delectus pariatur explicabo facilis atque omnis aspernatur, corrupti, cum sunt doloremque? Ut perferendis qui est totam!</p>
    <div>
        <a href="/" class="">CTA</a>
        <button type="button" data-modal-close class="">Close</button>
    </div>
</dialog>
```

## Example

<iframe src="../examples/modal_base.html" height="400"></iframe>

## Trigger with code

To trigger a native dialog component, you can use the native dialog API. An example on how to do it.

```ts
const dialog = document.querySelector('dialog#inline-content') as HTMLDialogElement;
if (dialog) {
  dialog.showModal();
}
```

## Attributes

| Attribute                      | Description                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `data-modal`                   | This attribute triggers the component. the value is the id of the targeted dialog |
| `data-modal-close`             | This can be added to nested buttons to close the modal                            |
| `data-refresh-on-dialog-close` | Can be added to any element, the value is an unique name for the page             |

## Styling

| Attribute                | Defaults                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-close-position`    | `absolute -top-4 -right-4`                                                                                                                                                                                 |
| `data-close-style`       | `modal__close bg-white p-2`                                                                                                                                                                                |
| `data-close-after`       | `after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`         |
| `data-loader-style`      | `modal__loader__wrapper p-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`                                                                                                          |
| `data-next-button-style` | `modal__next-button absolute top-1/2 -translate-y-1/2 left-full -mr-4 bg-white p-2 disabled:hidden`                                                                                                        |
| `data-next-button-after` | `after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-right.svg")]` |
| `data-prev-button-style` | `modal__prev-button absolute top-1/2 -translate-y-1/2 right-full -ml-4 bg-white p-2 disabled:hidden`                                                                                                       |
| `data-prev-button-after` | `after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-left.svg")]`  |
