# Flyout

This is the component that contains the logic for the mobile menu.
This is not just a toggle mechanism, but it also traps the the keyboard for accessibility purposes.

## Example

<iframe src="../examples/flyout.html" height="350"></iframe>

```HTML
<div class="flex justify-end">
    <button type="button" class="text-3xl md:hidden ie-hidden print:hidden" data-flyout="flyout">
        <span class="">Menu</span>
    </button>
</div>

<div class="invisible fixed top-0 right-0 bottom-0 w-full z-50 overflow-x-hidden overflow-y-auto bg-white max-w-flyout"
    id="flyout"
    data-flyout-inactive-class="transition-transform duration-200 ease-in-out translate-x-full"
    data-flyout-active-class="transition-transform duration-200 ease-in-out translate-x-0"
    data-flyout-body-active-class="h-screen overflow-hidden">
	<div class="container">
		<div class="absolute top-0 right-0 mt-4 mr-4">
			<button type="button" class="text-2xl cursor-pointer" tabindex="0" data-flyout-close="flyout">
				<span class="">Close menu</span>
			</button>
		</div>
		<div class="mt-12">
			Flyout content here
		</div>
	</div>
</div>
<button type="button"
    class="fixed block inset-0 z-40 cursor-pointer bg-pitch-black/50 transitions duration-300 ease-in-out"
    data-flyout-close="flyout"
    data-flyout-close-inactive-class="opacity-0 pointer-events-none"
    data-flyout-close-active-class="opacity-100">
    <span class="sr-only">Close flyout</span>
</button>
```

The attribute used to make this work (`data-flyout`) is on the button that triggers the flyout. The value is the id of the element that is the flyout.

### The flyout element

This needs an unique id.

Some additional attributes for this element are:

| Attribute                       | Description                                                                |
| ------------------------------- | -------------------------------------------------------------------------- |
| `data-flyout-inactive-class`    | Extra classes that are added when the flyout is not active                 |
| `data-flyout-active-class`      | Extra classes that are added when the flyout is active                     |
| `data-flyout-body-active-class` | Extra classes that are added to the body element when the flyout is active |

### The close button

You can have more than one close button for the same flyout. The button is liked to the flyout by the attribute `data-flyout-close` with as value the id of the flyout.

::: tip
The overlay behind the flyout in the example is also just a button.
:::

Optional attributes to control styling

| Attribute                          | Description                                                |
| ---------------------------------- | ---------------------------------------------------------- |
| `data-flyout-close-inactive-class` | Extra classes that are added when the flyout is not active |
| `data-flyout-close-active-class`   | Extra classes that are added when the flyout is active     |
