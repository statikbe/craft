# Dropdown

The dropdown component allows you to toggle visibility of a list of items using a button. Below, you'll find details on how to use the dropdown, including examples and descriptions of its attributes.

## Example

<iframe src="../examples/dropdown.html" height="250"></iframe>

```html
<button type="button" id="menuTrigger" class="btn cursor-pointer">Toggle the dropdown</button>
<ul data-dropdown data-dropdown-trigger="menuTrigger" class="hidden p-4 bg-white shadow rounded-lg text-black">
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

<iframe src="../examples/dropdown_position.html" height="300"></iframe>

```html
<div>
  <div class="p-4 bg-light" id="positionElement">
    <button type="button" id="menuTrigger" class="btn cursor-pointer mb-6">Toggle the dropdown</button>
  </div>
  <ul
    data-dropdown
    data-dropdown-trigger="menuTrigger"
    data-dropdown-position-element="positionElement"
    class="hidden py-2 bg-white shadow rounded-lg text-black"
  >
    <li>
      <a href="#" class="block hover:bg-light focus:bg-light px-4 py-2">Item 1</a>
    </li>
    <li>
      <a href="#" class="block hover:bg-light focus:bg-light px-4 py-2">Item 2</a>
    </li>
    <li>
      <a href="#" class="block hover:bg-light focus:bg-light px-4 py-2">Item 3</a>
    </li>
  </ul>
</div>
```

## Attributes

Below is a table describing the attributes you can use with the dropdown component. These attributes control the behavior and appearance of the dropdown.

| Attribute                        | Default                | Description                                                                                                                                      |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-dropdown`                  |                        | This is the main attribute that initializes the dropdown component.                                                                              |
| `data-dropdown-trigger`          |                        | This attribute defines the id of the trigger button that will toggle the dropdown                                                                |
| `data-dropdown-placement`        | `bottom-start`         | This is the default placement of the popup if possible. For all the options read the [popper.js docs](https://popper.js.org/docs/v2/placements/) |
| `data-dropdown-position-element` | trigger button element | The element to calculate the positioning from (defaults to the trigger button element)                                                           |
| `data-dropdown-strategy`         | `absolute`             | The positioning strategy                                                                                                                         |
