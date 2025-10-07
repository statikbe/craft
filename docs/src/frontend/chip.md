# Chip

The chip component is basically a dropdown for checkboxes and mostly used in some kind of filter situation.
It handles everything regarding positioning and all best practices for a11y.

This component provides a lot of different options you can configure.

::: warning
This component needs the `data-chip` attribute in order to work. And the first child of this element should be a h1 with the name of the data. This h1 can be hidden with a `.sr-only` if needed.
:::

## Example

<iframe src="../examples/chip.html" height="300"></iframe>

```HTML
<div data-chip="Simple Chip"
    data-chip-show-clear-in-button="true"
    data-chip-show-clear-in-modal="false"
    data-chip-show-close-button="false"
    data-chip-close-on-change="false"
    data-chip-show-bubble="false">
    <h1 class="mb-2 text-lg">Simple Chip</h1>
    <ul class="">
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-1" value="1" class="cursor-pointer">
            <label for="category-1" class="inline-block my-1 cursor-pointer">Category 1</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-2" value="1" class="cursor-pointer">
            <label for="category-2" class="inline-block my-1 cursor-pointer">Category 2</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-3" value="1" class="cursor-pointer">
            <label for="category-3" class="inline-block my-1 cursor-pointer">Category 3</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-4" value="1" class="cursor-pointer">
            <label for="category-4" class="inline-block my-1 cursor-pointer">Category 4</label>
        </li>
    </ul>
</div>
```

## Full Example

<iframe src="../examples/chip_full.html" height="300"></iframe>

```HTML
<div data-chip="Full example"
    data-chip-show-clear-in-button="true"
    data-chip-show-clear-in-modal="true"
    data-chip-modal-clear-label="wissen"
    data-chip-show-close-button="true"
    data-chip-show-bubble="true"
    data-chip-close-on-change="false"
    data-chip-prefix="prefixIcon">
    <div class="mr-2" id="prefixIcon">
        <svg class="icon" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z"></path></svg>
    </div>
    <h1 class="mb-2 text-lg">Full example</h1>
    <ul class="">
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-1" value="1" class="cursor-pointer">
            <label for="category-1" class="inline-block my-1 cursor-pointer">Category 1</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-2" value="1" class="cursor-pointer">
            <label for="category-2" class="inline-block my-1 cursor-pointer">Category 2</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-3" value="1" class="cursor-pointer">
            <label for="category-3" class="inline-block my-1 cursor-pointer">Category 3</label>
        </li>
        <li class="flex items-baseline gap-2">
            <input type="checkbox" name="category[]" id="category-4" value="1" class="cursor-pointer">
            <label for="category-4" class="inline-block my-1 cursor-pointer">Category 4</label>
        </li>
    </ul>
</div>
```

## Attributes

Below is a table describing the attributes you can use with the chip component.

| Attribute                        | Description                                                         |
| -------------------------------- | ------------------------------------------------------------------- |
| `data-chip`                      | Add this attribute to the wrapper element to make it a chip element |
| `data-chip-show-clear-in-button` | This shows a clear button at the end of the element                 |
| `data-chip-show-clear-in-modal`  | This shows a clear button in the right bottom corner of the modal   |
| `data-chip-modal-clear-label`    | This text will be shown in the clear button in the modal            |
| `data-chip-show-close-button`    | This shows a close button in the right top corner of the modal      |
| `data-chip-show-bubble`          | This shows a bubble with the amount of selected options             |
| `data-chip-close-on-change`      | This closes the modal when an option in the modal is changed        |
| `data-chip-prefix`               | This is the ID of a nested element to show before the element       |

## Styling

If you want to override a specific element in the component with your own tailwind classes, you can do that through the use of the following attributes.
This is a list of all the options you can override with their default values.

| Attribute                   | Defaults                                                                                                                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-chip-element`         | `relative`                                                                                                                                                                                                                                             |
| `data-chip-trigger-wrapper` | `chip-trigger-wrapper relative flex`                                                                                                                                                                                                                   |
| `data-chip-trigger`         | `chip-trigger flex items-center after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/chevron-down.svg")] after:shrink-0 after:ml-2` |
| `data-chip-trigger-clear`   | `chip-trigger-clear after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`                                  |
| `data-chip-option-after`    | `chip-option px-2 text-current after:hidden after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/check.svg")]`                      |
| `data-chip-bubble`          | `chip-bubble absolute -top-4 -right-2 h-5 min-w-5 bg-blue-500 text-white rounded-full text-sm leading-0 flex justify-center items-center`                                                                                                              |
| `data-chip-modal`           | `chip-modal fixed top-0 left-0 z-10 p-6 bg-white shadow-sm max-w-max w-[90vw]`                                                                                                                                                                         |
| `data-chip-modal-close`     | `chip-modal-close absolute top-0 right-0 p-2 after:block after:text-black after:shrink-0 after:w-[1em] after:h-[1em] after:mask-center after:mask-no-repeat after:mask-contain after:bg-current after:mask-[url("/frontend/icons/clear.svg")]`         |
| `data-chip-modal-clear`     | `chip-modal-clear flex items-center ml-auto before:mr-2 before:text-black before:shrink-0 before:w-[1em] before:h-[1em] before:mask-center before:mask-no-repeat before:mask-contain before:bg-current before:mask-[url("/frontend/icons/clear.svg")]` |
