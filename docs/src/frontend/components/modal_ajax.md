# Modal AJAX

The Modal AJAX plugin extends the base Modal component to load and display remote content via AJAX requests. It supports multi-step forms, internal navigation within the modal, automatic form submission handling, and content refresh on close. This plugin is ideal for loading forms, wizards, or dynamic content without page reloads.

## Features

- ✅ **Remote Content Loading**: Fetch HTML content from any URL
- ✅ **Multi-Step Forms**: Navigate through form steps within the modal
- ✅ **Form Auto-Submit**: Handles form submissions via AJAX
- ✅ **Internal Navigation**: Load new content without closing modal
- ✅ **Loading States**: Shows loader while fetching content
- ✅ **Close on Success**: Automatically close modal after successful form submission
- ✅ **Content Refresh**: Update page content when modal closes
- ✅ **Validation Integration**: Works with form validation
- ✅ **Error Handling**: Graceful error handling for failed requests
- ✅ **Optional Close Button**: Can show/hide close button

## How It Works

### Initial Load Flow

1. **Click Trigger**: User clicks element with `data-modal-ajax`
2. **Create Dialog**: Plugin creates `<dialog>` element
3. **Add Loader**: Inserts loading indicator
4. **Fetch Content**: Makes GET request to specified URL
5. **Display Content**: Injects response into `.ajax-container`
6. **Hide Loader**: Removes loading indicator
7. **Activate Buttons**: Enables close buttons
8. **Setup Forms**: If `data-form-steps`, initializes form handling

### Form Submission Flow

With `data-form-steps` enabled:

1. **Intercept Submit**: Prevents default form submission
2. **Validate**: Checks form validity
3. **Show Loader**: Displays loading state
4. **Clear Content**: Empties current content
5. **Submit via AJAX**: Posts form data to action URL
6. **Handle Response**:
   - If `data-close-modal-on-submit`: Close modal
   - Otherwise: Display new content (next step)
7. **Re-initialize**: Sets up new form for next submission

### Internal Navigation

Elements with `data-modal-ajax-internal`:

1. **Click Handler**: Intercepts click on internal link
2. **Show Loader**: Displays loading state
3. **Fetch Content**: Makes GET request to specified URL
4. **Replace Content**: Updates modal content
5. **Re-initialize**: Sets up forms and buttons again

## Example

<iframe src="../../examples/modal_ajax.html" height="600"></iframe>

> **Note:** The `data-modal-ajax` attribute should be set to a valid relative or absolute URL that returns the content to be loaded in the modal.

```HTML
<button type="button" data-modal-ajax="/callback/ajaxdata" class="btn">Get ajax content</button>
<div data-refresh-on-dialog-close="refreshlist">
    List of items that needs to be refreshed because you've added something through the dialog.
</div>
```

### Some example code of a loaded form

#### Step 1

```HTML
<form method="post" class="p-8" data-validate>
    <input type="hidden" name="action" value="/statik/event-registration">
    <input type="hidden" name="redirect" value="/callback/event-registration/step2">
    <input type="hidden" name="step" value="1">
    <div>... form data</div>
    <div class="flex justify-between mt-8">
        <button type="button" class="btn btn--ghost" data-modal-close>Annuleren</button>
        <button type="submit" class="btn btn--primary btn--ext">Volgende stap</button>
    </div>
</form>
```

#### Step 2

```HTML
<form method="post" class="p-8" data-close-modal-on-submit>
    <input type="hidden" name="action" value="statik/event-registration">
    <input type="hidden" name="step" value="confirm">
    <input type="hidden" name="redirect" value="/overview">
    <div>... form data</div>
    <div class="flex justify-between mt-8 gap-10">
        <button data-modal-ajax-internal="/callback/event-registration/step1" class="btn btn--ghost">
            Vorige stap
        </button>
        <button type="submit" class="btn btn--primary btn--ext">Bevestigen</button>
    </div>
</form>
```

## Server Requirements

### Response Format

The server should return **complete HTML**, not JSON. The HTML will be injected directly into the modal.

**Good** ✅:

```html
<form action="/next-step" method="post">
  <h2>Step Title</h2>
  <input type="text" name="field" />
  <button type="submit">Continue</button>
</form>
```

**Bad** ❌:

```json
{
  "html": "<form>...</form>",
  "success": true
}
```

### Multi-Step Form Flow

For `data-form-steps`, each step should:

1. **Return a `<form>`** with:

   - `action` attribute pointing to next step URL
   - `method="post"`
   - Submit button

2. **Process POST** on server:

   - Validate submitted data
   - Save to session/database
   - Return next step HTML or success message

3. **Final step**:
   - Return success HTML (no form)
   - Modal auto-closes if `data-close-modal-on-submit` is present on the form

### Refresh Target

When using `data-refresh-on-dialog-close`, the server endpoint should support GET requests that return the updated HTML fragment:

```html
<!-- Trigger -->
<button data-modal-ajax="/cart/item/123/edit" data-refresh-on-dialog-close="#cart-items">Edit</button>

<!-- Target to refresh -->
<div id="cart-items">
  <!-- Current cart items -->
</div>
```

When modal closes, plugin fetches `GET /cart/items` (derived from `#cart-items` ID) and replaces the element's content.

## Related Components

- **[Modal (Base)](./modal.md)**: Core modal functionality
- **[Modal Confirmation](./modal_confirmation.md)**: Yes/No confirmation dialogs
- **[Modal Image](./modal_image.md)**: Image lightbox
- **[Modal Video](./modal_video.md)**: Video player modals

## Data Attributes

### Trigger Attributes

| Attribute                      | Type     | Description                                  |
| ------------------------------ | -------- | -------------------------------------------- |
| `data-modal-ajax`              | URL      | **Required**. URL to fetch content from      |
| `data-form-steps`              | Boolean  | Enable multi-step form handling              |
| `data-close-modal-on-submit`   | Boolean  | Close modal after successful form submission |
| `data-refresh-on-dialog-close` | Selector | Refresh element(s) when modal closes         |
| `data-hide-close-button`       | Boolean  | Hide the default close button                |

### Internal Navigation

| Attribute                  | Type | Description                          |
| -------------------------- | ---- | ------------------------------------ |
| `data-modal-ajax-internal` | URL  | Navigate to new content within modal |

Use this on links/buttons **inside** the modal to load new content without closing.

## JavaScript API

### Programmatic Usage

An example of how to trigger an ajax dialog with code.

```ts
const modalConfirmationButton = document.getElementById('modalConfirmationButton');
if (modalConfirmationButton) {
  const modal = new Modal(
    modalConfirmationButton,
    {
      src: '/callback/ajaxdata',
      showCloseBtn: true,
    },
    new AjaxModalPlugin('#modalConfirmationButton')
  );
}
```

or

```ts
const modal = new Modal(
  null,
  {
    src: '/',
    showCloseBtn: true,
  },
  new AjaxModalPlugin('')
);
modal.openPluginModal();
```

### Form Steps Usage

```typescript
// The plugin automatically handles forms when data-form-steps is present
// No manual initialization needed

// But you can check for errors:
const modal = document.querySelector('[data-modal-plugin="ajax"]');
modal?.addEventListener('error', (event) => {
  console.error('AJAX modal error:', event.detail);
});
```

## Attributes

| Attribute                      | Description                                                                                                                                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-modal-ajax`              | This attribute triggers the component. the value is the url you want to load                                                                                                                                                           |
| `data-modal-close`             | This can be added to nested buttons to close the modal                                                                                                                                                                                 |
| `data-form-steps`              | When you have a form in the loaded page that has to post to a next page.                                                                                                                                                               |
| `data-close-modal-on-submit`   | Can be added to a form; when the form is successfully submitted, the modal will automatically close.                                                                                                                                   |
| `data-modal-ajax-internal`     | Used on elements inside the modal to trigger loading new content via AJAX; the value should be a valid URL to fetch and replace the modal content.                                                                                     |
| `data-refresh-on-dialog-close` | Can be added to any element; when the modal dialog is closed, all elements with the same unique name as the value of this attribute will be refreshed. The value should be a unique identifier used to target elements for refreshing. |

## Styling

The styling is handled in your template, but when modal content is loaded via AJAX, it is automatically wrapped in a container with the `ajax-container` class.  
You can use this class to apply custom styles specifically to content loaded dynamically in the modal.

| Ajax wrapper     |
| ---------------- |
| `ajax-container` |
