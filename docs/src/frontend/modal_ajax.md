# Modal Ajax

This is a plugin for the default modal component. You can trigger a modal with content that is loaded over an ajax call.

## Example

<iframe src="../examples/modal_ajax.html" height="600"></iframe>

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

## Trigger with code

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
