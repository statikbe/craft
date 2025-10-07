# Confirmation Modal

This is a plugin for the default modal component. This triggers a simple confirmation with a question and a yes/no response option. When clicked yes a callback is triggered.

## Example

<iframe src="../examples/modal_confirmation.html" height="400"></iframe>

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

## Trigger with code

An example of how to trigger a confirmation dialog with code.

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

or

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

## Attributes

| Attribute                 | Description                            |
| ------------------------- | -------------------------------------- |
| `data-modal-confirmation` | This attribute triggers the component. |
| `data-question`           | The question asked in the dialog       |
| `data-ok`                 | The text of the affirmation action     |
| `data-cancel`             | The text of the decline action         |

## Styling

| Attribute                   | Default                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| `data-confirmation-content` | `modal__confirmation-content p-6 [&_h1]:text-xl`                         |
| `data-confirmation-actions` | `modal__confirmation-actions mt-4 flex justify-between gap-10 pb-6 px-6` |
| `data-confirmation-cancel`  | `modal__confirmation__cancel-btn btn btn--ghost`                         |
| `data-confirmation-ok`      | `modal__confirmation__ok-btn btn btn--primary`                           |
