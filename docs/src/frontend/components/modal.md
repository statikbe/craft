# Modal

The Modal component provides a modern, accessible dialog system using the native HTML `<dialog>` element. It includes a base modal for inline content and a plugin architecture for specialized use cases like images, videos, AJAX content, and confirmations. The component handles focus management, keyboard navigation, backdrop clicks, and responsive styling.

## Features

- ✅ **Native Dialog API**: Built on standard HTML `<dialog>` element
- ✅ **Inline Content**: Show content from existing dialog elements
- ✅ **Plugin Architecture**: Extensible system for images, videos, AJAX, confirmations
- ✅ **Auto Close Button**: Automatically adds styled close button
- ✅ **Gallery Navigation**: Next/prev buttons for grouped modals (images/videos)
- ✅ **Keyboard Support**: ESC to close, arrow keys for gallery navigation
- ✅ **Touch Gestures**: Swipe to navigate galleries on mobile
- ✅ **Auto Refresh**: Optionally refresh page content when modal closes
- ✅ **Focus Management**: Proper focus trapping and restoration
- ✅ **Backdrop Click**: Click outside modal to close (native behavior)
- ✅ **Customizable Styling**: Override button and loader styles via data attributes
- ✅ **Dynamic Content**: Works with dynamically added triggers

## How It Works

### Base Modal Flow

1. **Button Click**: User clicks trigger with `data-modal="dialogId"`
2. **Find Dialog**: Component locates `<dialog id="dialogId">`
3. **Add Close Button**: Injects styled close button if not present
4. **Activate Close Buttons**: Enables `[data-modal-close]` buttons
5. **Show Modal**: Calls `dialog.showModal()` (native API)
6. **Focus Management**: Browser handles focus trapping automatically
7. **Close**: ESC key or close button calls `dialog.close()`

### Plugin System

Plugins extend modal functionality for specific content types:

- **Modal Image**: Opens images in lightbox with zoom and galleries
- **Modal Video**: Embeds YouTube/Vimeo videos
- **Modal AJAX**: Fetches and displays remote content
- **Modal Confirmation**: Yes/No confirmation dialogs

Each plugin:

1. Registers a selector (e.g., `[data-modal-image]`)
2. Intercepts clicks on matching elements
3. Creates/modifies dialog content dynamically
4. Handles plugin-specific logic (video embeds, image loading, etc.)

### Gallery Navigation

For grouped modals (images/videos with `data-group`):

1. **Group Detection**: Finds all triggers with same `data-group` value
2. **Add Navigation**: Creates prev/next buttons
3. **Keyboard**: Arrow keys navigate
4. **Touch**: Swipe gestures navigate
5. **Wrap-Around**: Disabled at first/last items

### Auto Refresh on Close

Elements with `data-refresh-on-dialog-close`:

1. **Close Event**: Dialog fires 'close' event
2. **Fetch Page**: Makes AJAX request to current URL
3. **Parse Response**: Finds matching `data-refresh-on-dialog-close` elements
4. **Update Content**: Replaces innerHTML if content changed

## Base Dialog

### Basic Example

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

**How it works:**

- Click the button to open the dialog
- Dialog appears with backdrop (native browser behavior)
- Close button inside dialog closes it
- ESC key also closes (native behavior)
- Click outside modal closes it (native behavior)

### Live Demo

<iframe src="../../examples/modal_base.html" height="400"></iframe>

## Programmatic Trigger

To open a dialog programmatically using the native Dialog API:

```typescript
const dialog = document.querySelector('dialog#inline-content') as HTMLDialogElement;
if (dialog) {
  dialog.showModal(); // Opens as modal (with backdrop)
  // or
  dialog.show(); // Opens as non-modal (no backdrop)
}
```

To close:

```typescript
dialog.close();
```

To pass a return value:

```typescript
dialog.close('confirmed'); // Returns 'confirmed'
console.log(dialog.returnValue); // 'confirmed'
```

## Attributes

### Trigger Attributes

| Attribute    | Description                                                 | Required |
| ------------ | ----------------------------------------------------------- | -------- |
| `data-modal` | ID of the target `<dialog>` element                         | Yes      |
| `data-group` | Group name for gallery navigation (multiple related modals) | No       |

### Dialog Attributes

| Attribute                      | Description                                                |
| ------------------------------ | ---------------------------------------------------------- |
| `data-refresh-on-dialog-close` | Unique identifier for content to refresh when modal closes |
| `data-modal-close`             | Add to buttons inside dialog to make them close the modal  |

### Styling Attributes

Override default CSS classes by adding these to the **trigger button**:

| Attribute                | Default Value                                                                                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-close-position`    | `absolute -top-4 -right-4`                                                                                                                                                                                 |
| `data-close-style`       | `modal__close bg-white p-2`                                                                                                                                                                                |
| `data-close-after`       | `after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`         |
| `data-loader-style`      | `modal__loader__wrapper p-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`                                                                                                          |
| `data-next-button-style` | `modal__next-button absolute top-1/2 -translate-y-1/2 left-full -mr-4 bg-white p-2 disabled:hidden`                                                                                                        |
| `data-next-button-after` | `after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-right.svg")]` |
| `data-prev-button-style` | `modal__prev-button absolute top-1/2 -translate-y-1/2 right-full -ml-4 bg-white p-2 disabled:hidden`                                                                                                       |
| `data-prev-button-after` | `after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-left.svg")]`  |

## Common Patterns

### Simple Content Modal

```html
<button type="button" data-modal="terms">View Terms & Conditions</button>

<dialog id="terms" class="max-w-2xl p-8 rounded-lg">
  <h2 class="text-2xl font-bold mb-4">Terms & Conditions</h2>
  <div class="prose">
    <p>Lorem ipsum dolor sit amet...</p>
  </div>
</dialog>
```

### Form in Modal

```html
<button type="button" data-modal="contact-form">Contact Us</button>

<dialog id="contact-form" class="max-w-md p-8 rounded-lg">
  <h2 class="text-xl font-bold mb-4">Contact Form</h2>
  <form action="/contact" method="POST">
    <div class="mb-4">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required class="w-full" />
    </div>
    <div class="mb-4">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required class="w-full" />
    </div>
    <div class="mb-4">
      <label for="message">Message</label>
      <textarea id="message" name="message" required class="w-full"></textarea>
    </div>
    <div class="flex gap-2">
      <button type="submit" class="btn btn-primary">Send</button>
      <button type="button" data-modal-close class="btn">Cancel</button>
    </div>
  </form>
</dialog>
```

### Multiple Close Buttons

```html
<dialog id="announcement">
  <h2>Important Announcement</h2>
  <p>We'll be undergoing maintenance on Saturday.</p>

  <!-- Multiple close buttons work -->
  <button data-modal-close class="btn-primary">Got it</button>
  <button data-modal-close class="btn-secondary">Remind me later</button>
</dialog>
```

### Auto-Refresh Content

```html
<!-- Cart button -->
<button type="button" data-modal="add-to-cart">Add to Cart</button>

<!-- Cart count refreshes when modal closes -->
<div data-refresh-on-dialog-close="cartCount">Cart: <span>0 items</span></div>

<dialog id="add-to-cart">
  <p>Item added to cart!</p>
  <button data-modal-close>Continue Shopping</button>
</dialog>
```

When the modal closes, the component:

1. Fetches the current page via AJAX
2. Finds elements with matching `data-refresh-on-dialog-close` value
3. Updates their content if changed

### Custom Styling

```html
<!-- Override close button position and style -->
<button
  type="button"
  data-modal="custom"
  data-close-position="absolute top-2 right-2"
  data-close-style="bg-red-500 text-white rounded-full p-3 hover:bg-red-600"
>
  Open Custom Modal
</button>

<dialog id="custom">
  <h2>Custom styled close button</h2>
  <p>Notice the close button position and color</p>
</dialog>
```

## Gallery Navigation

For image or video galleries, use `data-group`:

```html
<!-- Gallery of 3 images -->
<button data-modal-image="/img/photo1.jpg" data-group="gallery1">Photo 1</button>
<button data-modal-image="/img/photo2.jpg" data-group="gallery1">Photo 2</button>
<button data-modal-image="/img/photo3.jpg" data-group="gallery1">Photo 3</button>
```

Features:

- **Next/Prev Buttons**: Automatically added
- **Keyboard Navigation**: Arrow keys move between items
- **Touch Gestures**: Swipe to navigate on mobile
- **Auto-Focus**: Prev button gets focus at last item, next button at first

See [Modal Image](/frontend/components/modal_image) for full image gallery documentation.

## Accessibility

### Native Dialog Benefits

The native `<dialog>` element provides automatic accessibility:

- **Focus Trapping**: Focus stays within modal
- **ESC Key**: Closes modal (can be prevented)
- **Inert Background**: Content behind modal is inert (non-interactive)
- **ARIA**: Proper `role="dialog"` and `aria-modal="true"` automatically applied

### Screen Readers

```html
<dialog id="announcement" aria-labelledby="announcement-title">
  <h2 id="announcement-title">Important Announcement</h2>
  <p>Content here...</p>
</dialog>
```

Or use `aria-label`:

```html
<dialog id="contact" aria-label="Contact form">
  <form>...</form>
</dialog>
```

### Close Button Labels

The auto-generated close button includes screen reader text:

```html
<button type="button" class="modal__close ...">
  <span class="sr-only">Close</span>
</button>
```

Text is loaded from i18n files (`s-modal-{lang}.json`).

### Keyboard Support

Built-in keyboard support:

- **ESC**: Closes modal
- **Tab**: Cycles through focusable elements
- **Arrow Keys**: Navigate galleries (if grouped)
- **Enter/Space**: Activate buttons

## Best Practices

### Always Provide Close Method

```html
<dialog id="myModal">
  <p>Content...</p>

  <!-- ✅ Good: Multiple ways to close -->
  <button data-modal-close>Close</button>
  <!-- ESC key also works -->
  <!-- Click backdrop also works -->

  <!-- ❌ Bad: No explicit close button (ESC still works, but not obvious) -->
</dialog>
```

### Size Modals Appropriately

```html
<!-- Small modal -->
<dialog id="small" class="max-w-sm p-6 rounded">...</dialog>

<!-- Medium modal (default) -->
<dialog id="medium" class="max-w-2xl p-8 rounded">...</dialog>

<!-- Large modal -->
<dialog id="large" class="max-w-6xl p-10 rounded">...</dialog>

<!-- Full-screen modal -->
<dialog id="fullscreen" class="w-screen h-screen max-w-none">...</dialog>
```

### Handle Long Content

```html
<dialog class="max-w-2xl max-h-[90vh] overflow-auto rounded">
  <div class="p-8">
    <!-- Long content scrolls within modal -->
    <p>Very long content...</p>
  </div>
</dialog>
```

## Related Components

- [**Modal Image**](/frontend/components/modal_image): Image lightbox with zoom and galleries
- [**Modal Video**](/frontend/components/modal_video): YouTube/Vimeo video embeds
- [**Modal AJAX**](/frontend/components/modal_ajax): Load remote content in modals
- [**Modal Confirmation**](/frontend/components/modal_confirmation): Yes/No confirmation dialogs

## Plugin Development

To create a custom modal plugin:

```typescript
import { ModalPlugin } from './plugin.interface';
import { Modal } from '../modal.component';

export class CustomModalPlugin implements ModalPlugin {
  constructor(private selector: string) {}

  getTriggerSelector(): string {
    return this.selector;
  }

  getOptions(): Object {
    return {
      // Plugin-specific options
    };
  }

  openModalClick(modalInstance: Modal): void {
    // Custom logic to create/modify dialog
    const dialog = document.createElement('dialog');
    dialog.id = 'custom-modal';
    dialog.innerHTML = '<p>Custom content</p>';
    document.body.appendChild(dialog);

    modalInstance.dialog = dialog;
    modalInstance.addCloseButton();
    modalInstance.activateCloseButtons();
  }

  gotoNextAction(): void {
    // For gallery plugins
  }

  gotoPrevAction(): void {
    // For gallery plugins
  }
}
```

Register the plugin:

```javascript
new ModalComponent({
  plugins: [{ selector: '[data-custom-modal]', module: CustomModalPlugin }],
});
```

## Additional Resources

- [MDN: Dialog Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [Dialog Polyfill](https://github.com/GoogleChrome/dialog-polyfill)
- [ARIA Authoring Practices: Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

This base modal component provides a solid foundation for all dialog needs, with extensibility through the plugin system for specialized content types.
