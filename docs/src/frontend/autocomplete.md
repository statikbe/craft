# Autocomplete

This component enhances a select element with the option for a search to filter. And it makes the multiple option more usable.

## Example of a single select

<iframe src="../examples/autocomplete_single.html" height="300"></iframe>

### Code example for a single select

```TWIG
<select name="singleSelect" data-autocomplete class="border-1">
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>
```

## Example of a single select with free type

Free type means that you allow the user to add an option that is not in the list just by typing it.

<iframe src="../examples/autocomplete_freetype.html" height="300"></iframe>

### Code example for a single select

```TWIG
<select name="singleSelect" data-autocomplete free-type class="border-1">
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
</select>
```

## Example of a multi-select

<iframe src="../examples/autocomplete_multi.html" height="300"></iframe>

### Code example for a single select

```TWIG
<select name="multipleSelect" data-autocomplete class="border-1" multiple>
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
    <option value="6">Option 6</option>
    <option value="7">Option 7</option>
</select>
```

## Attributes

Below is a table describing the attributes you can use with the ajax paging component.

| Attribute           | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| `data-autocomplete` | Add this attibute to a standard select to make it an autocomplete             |
| `multiple`          | This is the default attribute to turn a select element into a multiple select |

## Styling

The main classes that you add to the select will be copied to the new element.

If you want to overwrite a specific element in the component with your own tailwind classes, you can do that through the use of the following attributes.
This is a list of all the options you can overwrite with their default values.

| Attribute                                     | Defaults                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-autocomplete-list`                      | `bg-white shadow-xl`                                                                                                                                                                                                                                                                                                                      |
| `data-autocomplete-option`                    | `py-1 px-2 flex items-center justify-between focus:shadow-none focus:outline-none cursor-pointer hover:bg-primary hover:text-primary-contrast hover:after:bg-primary-contrast [&.highlight]:bg-primary [&.highlight]:text-primary-contrast [&.highlight]:after:bg-primary-contrast aria-selected:text-gray-500 aria-selected:after:block` |
| `data-autocomplete-option-after`              | `after:hidden after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/check.svg")]`                                                                                                                                       |
| `data-autocomplete-select`                    | ``                                                                                                                                                                                                                                                                                                                                        |
| `data-autocomplete-select-placeholder`        | `overflow-hidden text-ellipsis whitespace-nowrap opacity-25`                                                                                                                                                                                                                                                                              |
| `data-autocomplete-drop-down-icon`            | `flex items-center px-2 text-black`                                                                                                                                                                                                                                                                                                       |
| `data-autocomplete-drop-down-icon-after`      | `after:block after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-down.svg")]`                                                                                                                                                  |
| `data-autocomplete-selection`                 | `rounded-sm bg-primary text-primary-contrast`                                                                                                                                                                                                                                                                                             |
| `data-autocomplete-selection-text`            | `px-2`                                                                                                                                                                                                                                                                                                                                    |
| `data-autocomplete-selection-close-btn`       | `px-1 border-l-1 border-white cursor-pointer focus:bg-primary-700 hover:bg-primary-700`                                                                                                                                                                                                                                                   |
| `data-autocomplete-selection-close-btn-after` | `after:block after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`                                                                                                                                                         |
| `data-autocomplete-input-wrapper`             | `flex items-center gap-2 flex-wrap p-2 w-[1px] flex-1 [&.has-placeholder]:flex-nowrap`                                                                                                                                                                                                                                                    |

## Custom events

You can listen in the original select for some custom events

| Event                  | Data    |
| ---------------------- | ------- |
| `autocompleteShowMenu` | no data |
| `autocompleteHideMenu` | no data |
