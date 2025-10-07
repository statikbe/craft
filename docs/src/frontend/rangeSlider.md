# Range Slider

This component is an extension to the native `input` with type `range` element.

## Examples

### Basic slider

<iframe src="../examples/range_slider_base.html" height="90"></iframe>

```HTML
<form action="">
    <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="slider" name="amount" type="range" value="10" min="0" max="100"/>
</form>
```

### Single slider with list

<iframe src="../examples/range_slider_single.html" height="120"></iframe>

```HTML
<form action="">
    <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="slider" name="amount" type="range" value="10" min="0" max="100" list="values"/>
    <datalist id="values" class="text-sm">
        <option value="0" label="0"></option>
        <option value="5"></option>
        <option value="10"></option>
        <option value="15"></option>
        <option value="20"></option>
        <option value="25" label="25"></option>
        <option value="30"></option>
        <option value="35"></option>
        <option value="40"></option>
        <option value="45"></option>
        <option value="50" label="50"></option>
        <option value="55"></option>
        <option value="60"></option>
        <option value="65"></option>
        <option value="70"></option>
        <option value="75" label="75"></option>
        <option value="80"></option>
        <option value="85"></option>
        <option value="90"></option>
        <option value="95"></option>
        <option value="100" label="100"></option>
    </datalist>
</form>
```

### Double range slider

<iframe src="../examples/range_slider_range.html" height="120"></iframe>

```HTML
<form action="">
    <div class="relative">
        <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="fromSlider" name="amount" type="range" value="10" min="0" step="5" max="100" list="values"/>
        <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="toSlider" name="amount" type="range" value="50" min="0" step="5" max="100" list="values"/>
        <datalist id="values" class="text-sm">
            <option value="0" label="0"></option>
            <option value="25" label="25"></option>
            <option value="50" label="50"></option>
            <option value="75" label="75"></option>
            <option value="100" label="100"></option>
        </datalist>
    </div>
</form>
```

::: warning NOTICE
Notice the extra `div` with the `relative` class. This wrapper is needed for a correct visual representation.
:::

### Double range with synced values

<iframe src="../examples/range_slider_sync.html" height="150"></iframe>

```HTML
<form action="">
    <div class="relative">
        <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="fromSlider" name="amount" type="range" value="10" min="0" max="100" data-sync="minSync" list="values"/>
        <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="toSlider" name="amount" type="range" value="50" min="0" max="100" data-sync="maxSync" list="values"/>
        <datalist id="values" class="text-sm">
            <option value="0" label="0"></option>
            <option value="25" label="25"></option>
            <option value="50" label="50"></option>
            <option value="75" label="75"></option>
            <option value="100" label="100"></option>
        </datalist>
    </div>
    <div class="flex justify-between w-full mt-4">
        <div class="flex">Min: <div id="minSync"></div></div>
        <div class="flex">Max: <div id="maxSync"></div></div>
    </div>
</form>
```

## Setting up a double range

Technically, a double range slider is nothing more than two range sliders that keep track of each other and are layered on top of each other.

::: info Naming convention
In order to work, both inputs need the same ID with the difference of `from` and `to`. Example `fromAmount` and `toAmount`.
:::

## Attributes

We use the default `input[type=range]`, so all the [default settings apply](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range).
Only for the extra sync feature we use a custom attribute.

| Attribute   | Description                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `data-sync` | The ID of the element that gets the value. This can be an arbitrary element like a div, or it can be an input element. |
