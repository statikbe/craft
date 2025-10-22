# CKEditor

The CKEditor is the default editor used in Craft CMS. This component makes it possible to use it in a frontend form. Using the same editor in the frontend as in the backend makes the data transfer between the two sides easy.

## Example

<iframe src="../../examples/ckeditor.html" height="430"></iframe>

```HTML
<textarea data-ck-editor></textarea>
<textarea data-ck-editor data-ck-editor-style="compact"></textarea>
<textarea data-ck-editor data-ck-editor-toolbar="bold,italic"></textarea>
```

## Attributes

Below is a table describing the attributes you can use with the CKEditor component.

| Attribute                        | Description                                                                                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-ck-editor`                 | This initializes the editor to the textarea                                                                                                                                                                                                                              |
| `data-ck-editor-style="compact"` | This gives a compact set of tools. `['bold', 'italic', 'numberedList', 'bulletedList']`                                                                                                                                                                                  |
| `data-ck-editor-toolbar`         | To this attribute you can give a comma seperated list of all the tools you want to include. You can find [more information on the website](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#basic-toolbar-configuration){:target="\_blank"} |
