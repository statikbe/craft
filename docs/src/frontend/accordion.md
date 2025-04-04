# Accordion

For the accordion component we use the native `<details>` - `<summary>` construction. [More information on these elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details).

## Why?

Why a component if this is a default HTML element? Well this component enhances the default elements with three extra's.

- Animation fallback for browsers that don't support [interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size)
- The extra ability to group accordions
- The option to add an extra close button to the content

## Example

<iframe src="../examples/accordion.html" height="400"></iframe>

### Barebone example

```html
<div data-accordion-group>
  <details>
    <summary>This is a simple accordion group</summary>
    <div>
      <p>
        Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
        proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
        aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
        laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
        occaecat nisi laborum veniam aliquip sit nostrud.
      </p>
    </div>
  </details>
  <details>
    <summary>This is a simple accordion group</summary>
    <div>
      <p>
        Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
        proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
        aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
        laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
        occaecat nisi laborum veniam aliquip sit nostrud.
      </p>
    </div>
  </details>
  <details>
    <summary>This is a simple accordion group</summary>
    <div>
      <p>
        Mollit aute ex exercitation incididunt deserunt enim labore veniam proident eu. Nostrud ullamco incididunt ex
        proident nulla reprehenderit anim et duis ipsum veniam nostrud aliquip. Do consequat cillum veniam irure eiusmod
        aute occaecat dolor mollit proident consectetur mollit aliqua aliqua occaecat. Amet ad ut non culpa sunt laboris
        laboris tempor dolor dolor. Mollit ut dolor culpa amet. Amet commodo sit velit. Proident ipsum mollit elit magna
        occaecat nisi laborum veniam aliquip sit nostrud.
      </p>
    </div>
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

## Attributes

Below is a table describing the attributes you can use with the dropdown component. These attributes control the behavior and appearance of the dropdown.

| Attribute                 | Default        | Description                                                                                                                                                          |
| ------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-dropdown`           |                | This is the main attribute that initializes the dropdown component.                                                                                                  |
| `data-dropdown-trigger`   |                | This attribute defines the id of the trigger button that wil toggle the dropdown                                                                                     |
| `data-dropdown-placement` | `bottom-start` | This is the default placement of the popup if possible. For all the options read the [popper.js docs](https://popper.js.org/docs/v1/#popperplacements--codeenumcode) |
