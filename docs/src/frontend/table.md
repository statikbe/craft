# Table

This component is in contrast to the other components still triggered by a class (.custom-table) instead of a data-attribute, because this feels just right. This component also does very little. The only thing it does is adding a `data-label` attribute to the td-elements of the array.

We do this to make the table responsive.

## Usage

```twig
<div class="text-editor custom-table">
    {{block.table}}
</div>
```

::: warning
This component is meant to enhance tables created with CKEditor through the backend. When we have full control over the table through a .twig template, you have to add the `data-label` attribute in the template.
:::
