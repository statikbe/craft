# Dropdown

The dropdown component allows you to toggle visibility of a list of items using a button. Below, you'll find details on how to use the dropdown, including examples and descriptions of its attributes.

## Example

<iframe src="../examples/dropdown.html" height="250"></iframe>

```html
<div data-dropdown>
  <button type="button" data-dropdown-toggle>Toggle the dropdown</button>
  <ul data-dropdown-menu>
    <li>
      <a href="#">Item 1</a>
    </li>
    <li>
      <a href="#">Item 2</a>
    </li>
    <li>
      <a href="#">Item 3</a>
    </li>
  </ul>
</div>
```

## Attributes

Below is a table describing the attributes you can use with the dropdown component. These attributes control the behavior and appearance of the dropdown.

| Attribute              | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `data-dropdown`        | This is the main wrapper attribute that initializes the dropdown component.           |
| `data-dropdown-toggle` | This attribute is placed on the button to toggle the visibility of the dropdown menu. |
| `data-dropdown-menu`   | This is used for the unordered list (`<ul>`) that contains the dropdown menu items.   |
