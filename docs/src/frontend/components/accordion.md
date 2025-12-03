# Accordion

The accordion component uses the native HTML `<details>` and `<summary>` elements for progressive enhancement. [More information on these elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details).

## Why a Component?

If `<details>` is native HTML, why have a component? This component enhances the default behavior with:

- **Animation fallback** for browsers that don't support [interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size)
- **Accordion groups** where only one item can be open at a time
- **Extra close buttons** within the content area
- **Dynamic content support** for accordions loaded via AJAX

::: info Browser Support
The animation fallback can be removed once all browsers support `interpolate-size: allow-keywords` in their last three versions.
:::

## How It Works

The component automatically initializes on **all** `<details>` elements in your document - no data attribute needed! It:

1. Detects `<details>` elements with the `[interpolate-size:allow-keywords]` class for animation
2. Finds accordion groups via `data-accordion-group` attribute
3. Listens for close buttons with `data-accordion-close` attribute
4. Automatically works with dynamically loaded content

## Example

<iframe src="../../examples/accordion.html" height="400"></iframe>

### Barebone example

```html
<div data-accordion-group>
  <details>
    <summary>This is a simple accordion group</summary>
    <p>
      Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
      proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
      aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
      laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
      occaecat nisi laborum veniam aliquip sit nostrud.
    </p>
  </details>
  <details>
    <summary>This is a simple accordion group</summary>
    <p>
      Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
      proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
      aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
      laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
      occaecat nisi laborum veniam aliquip sit nostrud.
    </p>
  </details>
  <details>
    <summary>This is a simple accordion group</summary>
    <p>
      Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
      proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
      aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
      laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
      occaecat nisi laborum veniam aliquip sit nostrud.
    </p>
  </details>
</div>
```

### Animation Example

```twig
<div class="space-y-4" data-accordion-group>
  <details
    class="[interpolate-size:allow-keywords] details-content:[block-size:0] details-content:transition-all details-content:transition-discrete details-content:duration-300 details-content:ease-in-out open:details-content:[block-size:auto] overflow-clip group"
  >
    <summary class="flex justify-between items-center cursor-pointer p-2 bg-light">
      This is a simple accordion group
      {{ icon('chevron-down', { class: 'text-2xl group-open:rotate-180 transition duration-300 ease-in-out' }) }}
    </summary>
    <p>
      Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
      proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
      aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
      laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
      occaecat nisi laborum veniam aliquip sit nostrud.
    </p>
  </details>
  <details
    class="[interpolate-size:allow-keywords] details-content:[block-size:0] details-content:transition-all details-content:transition-discrete details-content:duration-300 details-content:ease-in-out open:details-content:[block-size:auto] overflow-clip group"
  >
    <summary class="flex justify-between items-center cursor-pointer p-2 bg-light">
      This is a simple accordion group
      {{ icon('chevron-down', { class: 'text-2xl group-open:rotate-180 transition duration-300 ease-in-out' }) }}
    </summary>
    <p>
      Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
      proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
      aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
      laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
      occaecat nisi laborum veniam aliquip sit nostrud.
    </p>
  </details>
  <details
    class="[interpolate-size:allow-keywords] details-content:[block-size:0] details-content:transition-all details-content:transition-discrete details-content:duration-300 details-content:ease-in-out open:details-content:[block-size:auto] overflow-clip group"
  >
    <summary class="flex justify-between items-center cursor-pointer p-2 bg-light">
      This is a simple accordion group
      {{ icon('chevron-down', { class: 'text-2xl group-open:rotate-180 transition duration-300 ease-in-out' }) }}
    </summary>
    <p>
      Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
      proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
      aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
      laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
      occaecat nisi laborum veniam aliquip sit nostrud.
    </p>
  </details>
</div>
```

## Accordion Groups

Create accordion groups where opening one item automatically closes the others (like a traditional accordion pattern).

**Usage:** Wrap multiple `<details>` elements in a container with `data-accordion-group`:

```html
<div data-accordion-group>
  <details>...</details>
  <details>...</details>
  <details>...</details>
</div>
```

When any accordion in the group opens, all others automatically close.

## Extra Close Buttons

For accordions with long content, you can add a close button at the bottom of the panel for easier access.

**Requirements:**

- Must be a `<button>` element (other elements will log an error)
- Requires `data-accordion-close` attribute
- Must be inside the `<details>` element

The component handles both click and keyboard events (Enter/Space) for accessibility.

```twig
<details class="[interpolate-size:allow-keywords] details-content:[block-size:0] details-content:transition-all details-content:transition-discrete details-content:duration-300 details-content:ease-in-out open:details-content:[block-size:auto] overflow-clip group">
    <summary class="flex justify-between items-center cursor-pointer p-2 bg-light">
        This item has a cose button
        {{ icon('chevron-down', { class: 'text-2xl group-open:rotate-180 transition duration-300 ease-in-out' }) }}
    </summary>
    <div>
        <p>Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna occaecat nisi laborum veniam aliquip sit nostrud.</p>
        <button data-accordion-close class="btn">Close this accordion</button>
    </div>
</details>
```

## Dynamic Content

Accordions automatically work with dynamically loaded content (e.g., via AJAX). The component uses `DOMHelper.onDynamicContent()` to:

- Initialize animations on new `<details>` elements
- Set up close button listeners
- Register accordion groups

No manual reinitialization needed - just add the HTML and it works!

## Animation Details

### Modern Browsers

For browsers supporting `interpolate-size`, add the `[interpolate-size:allow-keywords]` class to enable smooth height transitions:

```css
/* Applied via Tailwind arbitrary value */
[interpolate-size:allow-keywords]
```

### Legacy Fallback

For browsers without `interpolate-size` support, the component:

1. Detects missing support via `CSS.supports()`
2. Calculates the accordion's scroll height
3. Applies manual height transitions via inline styles
4. Updates height dynamically on toggle events

This fallback ensures consistent animation across all browsers.

## Accessibility

The native `<details>`/`<summary>` elements provide built-in accessibility:

- ✅ Keyboard navigation (Enter/Space to toggle)
- ✅ Screen reader support (announces expanded/collapsed state)
- ✅ Focus management
- ✅ No ARIA attributes needed

**Close buttons** also support:

- Keyboard activation (Enter/Space)
- Proper event handling for assistive technologies

## Best Practices

::: tip Use Semantic HTML
The `<details>` and `<summary>` elements provide semantic meaning and built-in accessibility. Don't recreate accordion behavior with `<div>` elements.
:::

::: tip Group When Appropriate
Use accordion groups (`data-accordion-group`) when users should focus on one section at a time, like FAQs or settings panels.
:::

::: warning Button Elements Only
Close buttons must be `<button>` elements. Using `<a>` or `<div>` will cause the component to log an error and the feature won't work.
:::

## Troubleshooting

**Animations not working?**

- Ensure the `[interpolate-size:allow-keywords]` class is present
- Check that Tailwind's arbitrary value syntax is configured
- Verify all animation classes are applied correctly

**Group behavior not working?**

- Confirm `data-accordion-group` is on the parent container
- Make sure all `<details>` elements are direct children (or within the container)

**Close button not working?**

- Check the browser console for errors
- Verify it's a `<button>` element (not `<a>` or `<div>`)
- Ensure `data-accordion-close` attribute is present
