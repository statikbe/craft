# Toggle

This component lets you define a trigger to open up another element.

## Examples

### A simple example

<iframe src="../../examples/toggle_simple.html" height="250"></iframe>

```HTML
<h3 data-toggle="toggleContent">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

### An example with animation

<iframe src="../../examples/toggle_animation.html" height="250"></iframe>

```HTML
<h3 data-toggle="toggleContent" class="cursor-pointer flex justify-between group">This is a simple toggle trigger with animation {{ icon('chevron-down', {class: 'group-aria-expanded:rotate-180 transition duration-300 ease-in-out'}) }}</h3>
<div class="[interpolate-size:allow-keywords] [block-size:0] transition-all transition-discrete duration-300 ease-in-out open:[block-size:auto] overflow-clip" id="toggleContent">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

::: warning
The animation is done with the `block-size` property in modern browsers. For older browsers a javascript fallback is provided. In the future this fallback will be removed, [once all browsers support this feature](https://caniuse.com/?search=interpolate-size).  
:::

### A full example

<iframe src="../../examples/toggle_full.html" height="300"></iframe>

```HTML
<h3 class="flex justify-between group" data-toggle="toggleContent" id="scrollPoint">
    This is a simple toggle trigger with multiple toggle actions and scroll
    <span class="group-aria-expanded:hidden">{{ icon('chevron-down') }}<span class="sr-only">Open</span></span>
    <span class="hidden group-aria-expanded:block">{{ icon('chevron-up') }}<span class="sr-only">Close</span></span>
</h3>
<div class="hidden open:block" id="toggleContent">
    <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
    </p>
    <div>
        <button type="button" class="underline" data-toggle="toggleContent" data-toggle-scroll="#scrollPoint">Close Content</button>
    </div>
</div>
```

### A group example

<iframe src="../../examples/toggle_group.html" height="300"></iframe>

```HTML
<h3 data-toggle="toggleContent1">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent1" data-toggle-group="toggleGroup">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
<h3 data-toggle="toggleContent2">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent2" data-toggle-group="toggleGroup">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
<h3 data-toggle="toggleContent3">This is a simple toggle trigger</h3>
<div class="hidden open:block" id="toggleContent3" data-toggle-group="toggleGroup">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

## Styling

### The Trigger

The trigger gets an attribute `aria-expanded` with values `true` or `false` depending the target element is open or not.  
You can then use Tailwind to style the element accordingly. You can also use this with the `group` class.

#### Example

```HTML
<h3 data-toggle="toggleContent" class="cursor-pointer flex justify-between aria-expanded:bg-light group">
    This is a simple toggle trigger with animation
    {{ icon('chevron-down', {class: 'group-aria-expanded:rotate-180 transition duration-300 ease-in-out'}) }}
</h3>
```

### The Target

The target gets an attribute `open` depending wether the element is open or not.  
You can then use Tailwind to style the element accordingly. You can also use this with the `group` class.

#### Example

```HTML
<div class="hidden open:block" id="toggleContent">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt obcaecati vitae libero ut odio quidem, et neque dolorem fugiat harum maxime similique quos. Tempora eligendi, magnam labore, velit quo natus soluta, aliquam voluptatem tenetur expedita ad architecto quas voluptatum nihil.
</div>
```

## Attributes

### On the trigger

| Attribute            | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| `data-toggle`        | This enables the component. The value is the id of the target element |
| `data-toggle-scroll` | The id of the element where you want to scroll to after a toggle      |

### On the target

| Attribute           | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `data-toggle-group` | Group targets together. When one item in the group opens, the other items close |

## Events

| Attribute | Description                                                          |
| --------- | -------------------------------------------------------------------- |
| `open`    | You can dispatch an `open` event on the target element to open it up |
| `close`   | You can dispatch an `close` event on the target element to close it  |
