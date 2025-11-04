# Table Component

A responsive table enhancement that automatically adds `data-label` attributes to table cells, enabling mobile-friendly card-style layouts for CKEditor-generated tables.

## Features

- ✅ **Automatic Mobile Enhancement** - Adds data labels for responsive styling
- ✅ **CKEditor Integration** - Designed for backend-generated tables
- ✅ **Cell Wrapping** - Wraps cell content in div for styling flexibility
- ✅ **Header Extraction** - Automatically uses `<th>` text as labels
- ✅ **Zero Configuration** - Class-based trigger (`.custom-table`)
- ✅ **Backward Compatible** - Works with existing table markup

## Example

### Desktop View

Standard table layout with headers and data cells.

### Mobile View

Card-style layout where each row becomes a card with labels from headers.

## Usage

```twig
<div class="text-editor custom-table">
    {{block.table}}
</div>
```

::: warning CKEditor Tables Only
This component is meant to enhance tables created with CKEditor through the backend. When you have full control over the table through a .twig template, you should add the `data-label` attribute manually in the template.
:::

## How It Works

### Initialization Flow

1. **Component Instantiation** - `new TableComponent()` called on page load
2. **Table Detection** - Queries all `.custom-table table` elements
3. **Table Enhancement** - For each table:
   - Extract header text from `<th>` elements
   - Wrap each `<td>` content in `<div>`
   - Add `data-label` attribute to each `<td>`

### Cell Processing

**Original CKEditor table:**

```html
<div class="custom-table">
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Price</th>
        <th>Stock</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Widget A</td>
        <td>$19.99</td>
        <td>In Stock</td>
      </tr>
      <tr>
        <td>Widget B</td>
        <td>$29.99</td>
        <td>Out of Stock</td>
      </tr>
    </tbody>
  </table>
</div>
```

**After component processing:**

```html
<div class="custom-table">
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Price</th>
        <th>Stock</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Product"><div>Widget A</div></td>
        <td data-label="Price"><div>$19.99</div></td>
        <td data-label="Stock"><div>In Stock</div></td>
      </tr>
      <tr>
        <td data-label="Product"><div>Widget B</div></td>
        <td data-label="Price"><div>$29.99</div></td>
        <td data-label="Stock"><div>Out of Stock</div></td>
      </tr>
    </tbody>
  </table>
</div>
```

::: warning Requires thead
Component requires `<thead>` with `<th>` elements. Without headers, no labels will be added.
:::

**Limitations:**

- Requires `.custom-table` class
- Requires `<thead>` with `<th>` elements
- One-time processing (not dynamic)
- Assumes header count matches cell count
