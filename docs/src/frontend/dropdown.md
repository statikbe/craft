# Dropdown

The dropdown component allows you to toggle visibility of a list of items using a button. Below, you'll find details on how to use the dropdown, including examples and descriptions of its attributes.

## Example

<iframe src="../examples/dropdown.html" height="250"></iframe>

```html
<button type="button" id="menuTrigger" class="btn cursor-pointer">Toggle the dropdown</button>
<ul data-dropdown data-dropdown-trigger="#menuTrigger" class="hidden p-4 bg-white shadow rounded-lg text-black">
  <li>
    <a href="#" class="block">Item 1</a>
  </li>
  <li>
    <a href="#" class="block">Item 2</a>
  </li>
  <li>
    <a href="#" class="block">Item 3</a>
  </li>
</ul>
```

## Attributes

Below is a table describing the attributes you can use with the dropdown component. These attributes control the behavior and appearance of the dropdown.

| Attribute                 | Default        | Description                                                                                                                                                          |
| ------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-dropdown`           |                | This is the main attribute that initializes the dropdown component.                                                                                                  |
| `data-dropdown-trigger`   |                | This attribute defines the id of the trigger button that wil toggle the dropdown                                                                                     |
| `data-dropdown-placement` | `bottom-start` | This is the default placement of the popup if possible. For all the options read the [popper.js docs](https://popper.js.org/docs/v1/#popperplacements--codeenumcode) |
