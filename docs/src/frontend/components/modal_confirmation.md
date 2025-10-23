# Modal Confirmation

The Modal Confirmation plugin extends the base Modal component to create yes/no confirmation dialogs. It's perfect for confirming destructive actions, navigation to external links, or any decision that requires user confirmation. The plugin supports custom callbacks and automatic link navigation.

## Features

- ✅ **Simple Confirmation Pattern**: Question with Yes/No buttons
- ✅ **Custom Text**: Customize question, OK, and Cancel button text
- ✅ **Callback Support**: Execute custom JavaScript on confirmation
- ✅ **Link Navigation**: Automatically navigate when confirming links
- ✅ **Form Support**: Can confirm form submissions
- ✅ **Keyboard Navigation**: ESC to cancel, Enter to confirm
- ✅ **Customizable Styling**: Control button and content appearance
- ✅ **Programmatic API**: Trigger confirmations from JavaScript
- ✅ **Auto-Close**: Closes automatically after action
- ✅ **Accessible**: Proper ARIA labels and focus management

## How It Works

### Link Confirmation Flow

1. **Click Link**: User clicks element with `data-modal-confirmation`
2. **Prevent Default**: Plugin intercepts the click
3. **Create Dialog**: Builds confirmation modal with question
4. **Wait for Response**: User clicks OK or Cancel
5. **Execute Action**:
   - **OK**: Navigate to `href` or execute callback
   - **Cancel**: Close modal, no action
6. **Clean Up**: Remove modal from DOM

### Callback Flow

For programmatic usage:

1. **Create Instance**: Instantiate `ConfirmationModalPlugin`
2. **Open Modal**: Call `openPluginModal()` with options
3. **Show Question**: Display custom question and buttons
4. **Wait for Response**: User makes choice
5. **Execute Callback**: Run provided function if OK clicked
6. **Clean Up**: Close and remove modal

## HTML Structure

### External Link Confirmation

```html
<a
  href="https://external-site.com"
  data-modal-confirmation
  data-question="Are you sure you want to leave this site?"
  data-ok="Yes, continue"
  data-cancel="Stay here"
>
  Visit External Site
</a>
```

### Delete Action

```html
<button
  type="button"
  data-modal-confirmation
  data-question="Are you sure you want to delete this item? This action cannot be undone."
  data-ok="Delete"
  data-cancel="Keep it"
  data-callback="deleteItem"
>
  Delete Item
</button>
```

### Form Submit Confirmation

```html
<form action="/reset-password" method="post">
  <button
    type="submit"
    data-modal-confirmation
    data-question="Reset your password? You'll need to check your email."
    data-ok="Send Reset Email"
    data-cancel="Cancel"
  >
    Reset Password
  </button>
</form>
```

### Simple Yes/No

```html
<button data-modal-confirmation data-question="Do you want to continue?" data-ok="Yes" data-cancel="No">
  Continue
</button>
```

## Example

<iframe src="../../examples/modal_confirmation.html" height="400"></iframe>

```html
<a
  class="link link--ext js-modal-confirmation"
  href="https://www.statik.be"
  data-modal-confirmation
  data-question="Are you sure you want to navigate to the Statik website?"
  data-ok="Hell Yeah"
  data-cancel="No"
>
  Go to the Statik website
</a>
```

## Data Attributes

### Trigger Attributes

| Attribute                 | Type          | Description                                  |
| ------------------------- | ------------- | -------------------------------------------- |
| `data-modal-confirmation` | Boolean       | **Required**. Activates confirmation plugin  |
| `data-question`           | String        | **Required**. Question to ask user           |
| `data-ok`                 | String        | Text for confirmation button (default: "OK") |
| `data-cancel`             | String        | Text for cancel button (default: "Cancel")   |
| `data-callback`           | Function name | JavaScript function to call on OK            |

### Styling Attributes

Override default CSS classes:

| Attribute                   | Default Classes                                                          | Description              |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------ |
| `data-confirmation-content` | `modal__confirmation-content p-6 [&_h1]:text-xl`                         | Content wrapper styling  |
| `data-confirmation-actions` | `modal__confirmation-actions mt-4 flex justify-between gap-10 pb-6 px-6` | Button container styling |
| `data-confirmation-cancel`  | `modal__confirmation__cancel-btn btn btn--ghost`                         | Cancel button styling    |
| `data-confirmation-ok`      | `modal__confirmation__ok-btn btn btn--primary`                           | OK button styling        |

## JavaScript API

### Programmatic Confirmation

```typescript
const modalConfirmationButton = document.getElementById('modalConfirmationButton');
if (modalConfirmationButton) {
  const modal = new Modal(
    modalConfirmationButton,
    {
      question: 'This is my question',
      cancel: 'My cancel text',
      ok: 'My OK text',
      callback: () => {
        console.log('This is my JS callback');
      },
    },
    new ConfirmationModalPlugin('#modalConfirmationButton')
  );
}
```

### Without Trigger Element

```ts
const modal = new Modal(
  null,
  {
    question: 'This is my question',
    cancel: 'My cancel text',
    ok: 'My OK text',
    callback: () => {
      console.log('This is my JS callback');
    },
  },
  new ConfirmationModalPlugin('')
);
modal.openPluginModal();
```

## Accessibility

### Keyboard Navigation

- **ESC**: Closes modal (same as Cancel)
- **Enter**: Confirms action (same as OK)
- **Tab**: Cycles between Cancel and OK buttons
- **Focus trap**: Can't tab outside modal

### ARIA Labels

Add descriptive labels:

```html
<button
  data-modal-confirmation
  data-question="Delete item?"
  data-ok="Delete"
  data-cancel="Cancel"
  aria-label="Delete item with confirmation"
>
  Delete
</button>
```

### Screen Reader Support

The plugin automatically:

- Sets `role="dialog"` on modal
- Adds `aria-modal="true"`
- Moves focus to OK button when opened
- Announces question via heading

## Related Components

- **[Modal (Base)](./modal.md)**: Core modal functionality
- **[Modal AJAX](./modal_ajax.md)**: Load remote content in modal
- **[Modal Image](./modal_image.md)**: Image lightbox
- **[Modal Video](./modal_video.md)**: Video player modals
