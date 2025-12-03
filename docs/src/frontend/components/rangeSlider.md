# Range Slider

A component for creating single and double range sliders with synchronized display values, visual progress indicators, and Safari datalist fallback support.

## Features

- ✅ **Single Range Sliders**: Basic sliders with visual progress indication
- ✅ **Double Range Sliders**: Min/max range selection with overlaid sliders
- ✅ **Value Synchronization**: Auto-sync slider values with `data-sync` attribute
- ✅ **Visual Progress**: CSS custom properties for colored progress bars
- ✅ **Safari Datalist Fallback**: Automatically renders datalist options for Safari
- ✅ **Step Validation**: Prevents overlapping values in double ranges
- ✅ **Responsive Styling**: CSS custom properties for theming
- ✅ **Auto-Initialize**: Detects all `input[type="range"]` elements
- ✅ **Dynamic Content Support**: Works with AJAX-loaded content
- ✅ **Accessible**: Proper labels, ARIA attributes, and keyboard support

## How It Works

The component automatically initializes all range inputs on the page and supports both single and double range patterns:

### Naming Convention for Double Ranges

Double range sliders use a naming convention where:

- The "from" slider uses an ID starting with `from` (e.g., `fromPrice`)
- The "to" slider uses an ID starting with `to` (e.g., `toPrice`)
- The component automatically pairs them based on this pattern

### Value Synchronization

The `data-sync` attribute links a slider to a display element (input or span) that shows the current value in real-time.

### Visual Progress Indication

The component uses CSS custom properties to create colored progress bars:

- Single sliders: Progress from start to current value
- Double sliders: Progress between min and max values

### Safari Datalist Fallback

Safari doesn't natively support `<datalist>` for range inputs. The component automatically detects Safari and creates a visual fallback with labeled tick marks.

## Examples

### Basic slider

<iframe src="../../examples/range_slider_base.html" height="90"></iframe>

```HTML
<form action="">
    <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="slider" name="amount" type="range" value="10" min="0" max="100"/>
</form>
```

### Single slider with list

<iframe src="../../examples/range_slider_single.html" height="120"></iframe>

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

<iframe src="../../examples/range_slider_range.html" height="120"></iframe>

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

<iframe src="../../examples/range_slider_sync.html" height="150"></iframe>

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

## CSS Custom Properties

The component uses CSS custom properties for styling:

| Property                     | Description                          | Default            |
| ---------------------------- | ------------------------------------ | ------------------ |
| `--slider-color`             | Background color of the slider track | Browser default    |
| `--slider-progress-color`    | Color of the filled/progress portion | Current text color |
| `--slider-thumb-color`       | Color of the slider thumb            | Browser default    |
| `--slider-thumb-hover-color` | Thumb color on hover                 | Browser default    |

## Styling

### Custom Theme Colors

```html
<input
  type="range"
  class="w-full 
    [--slider-color:theme(colors.gray.100)]
    [--slider-progress-color:theme(colors.blue.500)]
    [--slider-thumb-hover-color:theme(colors.blue.600)]"
/>
```

### Dark Mode Support

```html
<input
  type="range"
  class="w-full 
    [--slider-color:theme(colors.gray.200)]
    dark:[--slider-color:theme(colors.gray.700)]
    [--slider-progress-color:theme(colors.primary.500)]
    dark:[--slider-progress-color:theme(colors.primary.400)]"
/>
```

### Vertical Slider

```html
<input
  type="range"
  class="h-48 w-2 
    [writing-mode:vertical-lr] 
    [direction:rtl]"
  orient="vertical"
/>
```

## Accessibility

### Labels and ARIA

Always provide proper labels for screen readers:

```html
<label for="brightness">Brightness</label>
<input
  id="brightness"
  type="range"
  aria-label="Brightness level"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="50"
/>
```

### Keyboard Support

Native range inputs support keyboard navigation:

- **Arrow Left/Down**: Decrease value
- **Arrow Right/Up**: Increase value
- **Home**: Jump to minimum
- **End**: Jump to maximum
- **Page Up/Down**: Large increment/decrement

## Related Components

- **[Validation](./validation)**: Form validation for range inputs

## Resources

- [MDN: &lt;input type="range"&gt;](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range)
- [MDN: &lt;datalist&gt;](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist)
- [ARIA: slider role](https://www.w3.org/TR/wai-aria-practices-1.1/#slider)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
