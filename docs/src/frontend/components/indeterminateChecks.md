# Indeterminate Checkboxes

The Indeterminate Checkboxes component manages hierarchical checkbox lists where parent checkboxes control child checkboxes. When a parent is checked, all children are checked; when some (but not all) children are checked, the parent shows an indeterminate state (partial selection).

## Features

- ✅ **Hierarchical Control**: Parent checkboxes control all descendant checkboxes
- ✅ **Indeterminate State**: Visual feedback when some children are checked
- ✅ **Recursive Nesting**: Supports unlimited nesting levels
- ✅ **Auto-Expand**: Checking a parent opens collapsed sublists
- ✅ **Bidirectional Sync**: Changes propagate up and down the tree
- ✅ **Dynamic Content**: Works with dynamically added checkbox lists
- ✅ **Custom Events**: Responds to both 'change' and 'jschange' events
- ✅ **Auto-ID Generation**: Automatically assigns IDs if not present

## How It Works

### Initialization

1. **Find Lists**: Locates all `ul[data-indeterminate]` elements
2. **Assign IDs**: Generates IDs for lists and sublists if missing
3. **Attach Listeners**: Adds change listeners to all checkboxes
4. **Initial State**: Calculates indeterminate states for checked boxes

### State Propagation

#### Checking Down (Parent → Children)

When a parent checkbox is checked or unchecked:

1. **Find Sublist**: Locate the immediate child `<ul>` element
2. **Update All**: Set all descendant checkboxes to parent's state
3. **Clear Indeterminate**: Remove indeterminate state from children
4. **Open Sublists**: Dispatch 'open' event to reveal nested items

#### Checking Up (Children → Parent)

When a child checkbox changes:

1. **Count States**: Count checked, unchecked, and indeterminate siblings
2. **Determine State**:
   - All checked → parent checked
   - All unchecked → parent unchecked
   - Mixed → parent indeterminate
3. **Recursive**: Repeat process for grandparent, great-grandparent, etc.

## State Diagram

```
Parent: ☐ Unchecked → All children unchecked
Parent: ☑ Checked   → All children checked
Parent: ⊟ Indeterminate → Some children checked

User checks parent (☐ → ☑):
  └─ All children become checked (☐ → ☑)

User unchecks child:
  └─ Parent becomes indeterminate (☑ → ⊟)

User checks all children:
  └─ Parent becomes checked (⊟ → ☑)
```

## Example

### Basic Hierarchical List

<iframe src="../../examples/indeterminate_simple.html" height="350"></iframe>

```html
<ul data-indeterminate>
  <li>
    <input type="checkbox" name="category[]" id="p1" />
    <label for="p1" class="cursor-pointer">Checkbox 1</label>
    <ul class="pl-6">
      <li>
        <input type="checkbox" name="category[]" id="p1-1" />
        <label for="p1-1" class="cursor-pointer">Checkbox 1.1</label>
      </li>
      <li>
        <input type="checkbox" name="category[]" id="p1-2" />
        <label for="p1-2" class="cursor-pointer">Checkbox 1.2</label>
      </li>
      <li>
        <input type="checkbox" name="category[]" id="p1-3" />
        <label for="p1-3" class="cursor-pointer">Checkbox 1.3</label>
        <ul class="pl-6">
          <li>
            <input type="checkbox" name="category[]" id="p1-3-1" />
            <label for="p1-3-1" class="cursor-pointer">Checkbox 1.3.1</label>
          </li>
          <li>
            <input type="checkbox" name="category[]" id="p1-3-2" />
            <label for="p1-3-2" class="cursor-pointer">Checkbox 1.3.2</label>
          </li>
          <li>
            <input type="checkbox" name="category[]" id="p1-3-3" />
            <label for="p1-3-3" class="cursor-pointer">Checkbox 1.3.3</label>
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>
    <input type="checkbox" name="category[]" id="p2" />
    <label for="p2" class="cursor-pointer">Checkbox 2</label>
    <ul class="pl-6">
      <li>
        <input type="checkbox" name="category[]" id="p2-1" />
        <label for="p2-1" class="cursor-pointer">Checkbox 2.1</label>
      </li>
      <li>
        <input type="checkbox" name="category[]" id="p2-2" />
        <label for="p2-2" class="cursor-pointer">Checkbox 2.2</label>
      </li>
      <li>
        <input type="checkbox" name="category[]" id="p2-3" />
        <label for="p2-3" class="cursor-pointer">Checkbox 2.3</label>
      </li>
    </ul>
  </li>
</ul>
```

This example demonstrates three nesting levels with automatic state synchronization.

### With Toggle Component

<iframe src="../../examples/indeterminate_toggle.html" height="250"></iframe>

[More about the toggle component](/frontend/toggle)

```html
<ul data-indeterminate>
  <li>
    <div class="flex justify-between">
      <div class="flex justify-between">
        <input type="checkbox" name="category[]" id="p1" />
        <label for="p1" class="cursor-pointer">Checkbox 1</label>
      </div>
      <button type="button" data-toggle="subMenu1">toggle</button>
    </div>
    <ul class="pl-6 hidden open:block" id="subMenu1">
      <li>
        <input type="checkbox" name="category[]" id="p1-1" />
        <label for="p1-1" class="cursor-pointer">Checkbox 1.1</label>
      </li>
      <li>
        <input type="checkbox" name="category[]" id="p1-2" />
        <label for="p1-2" class="cursor-pointer">Checkbox 1.2</label>
      </li>
      <li>
        <div class="flex justify-between">
          <div>
            <input type="checkbox" name="category[]" id="p1-3" />
            <label for="p1-3" class="cursor-pointer">Checkbox 1.3</label>
          </div>
          <button type="button" data-toggle="subMenu2">toggle</button>
        </div>
        <ul class="pl-6 hidden open:block" id="subMenu2">
          <li>
            <input type="checkbox" name="category[]" id="p1-3-1" />
            <label for="p1-3-1" class="cursor-pointer">Checkbox 1.3.1</label>
          </li>
          <li>
            <input type="checkbox" name="category[]" id="p1-3-2" />
            <label for="p1-3-2" class="cursor-pointer">Checkbox 1.3.2</label>
          </li>
          <li>
            <input type="checkbox" name="category[]" id="p1-3-3" />
            <label for="p1-3-3" class="cursor-pointer">Checkbox 1.3.3</label>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

This example combines indeterminate checkboxes with the Toggle component for collapsible sections. Checking a parent automatically opens sublists.

## Markup Requirements

### Container Structure

```html
<ul data-indeterminate>
  <!-- Root level items -->
</ul>
```

The `data-indeterminate` attribute must be on the root `<ul>` element.

### List Item Structure

Each list item should follow this pattern:

```html
<li>
  <!-- Checkbox and label (siblings or wrapped) -->
  <input type="checkbox" name="category[]" id="item1" />
  <label for="item1">Item 1</label>

  <!-- Optional nested list -->
  <ul class="pl-6">
    <li>
      <input type="checkbox" name="category[]" id="item1-1" />
      <label for="item1-1">Item 1.1</label>
    </li>
  </ul>
</li>
```

### ID Requirements

- **Optional**: IDs are automatically generated if missing
- **Generated Format**: `jsIndeterminateList{index}` for main lists, `jsIndeterminateSubList{mainIndex}-{subIndex}` for sublists
- **Custom IDs**: You can provide your own IDs; they will be preserved

## Attributes

| Attribute            | Element   | Description                                    |
| -------------------- | --------- | ---------------------------------------------- |
| `data-indeterminate` | `<ul>`    | Required on root list to trigger the component |
| `id`                 | `<ul>`    | Optional; auto-generated if missing            |
| `id`                 | `<input>` | Optional but recommended for label association |
| `name`               | `<input>` | Recommended for form submission                |
| `type="checkbox"`    | `<input>` | Required to identify checkboxes                |

## Dynamic Content Support

The component automatically integrates with DOMHelper for dynamic content.

## Event System

### Listening to Events

The component responds to two events:

```javascript
const checkbox = document.querySelector('#myCheckbox');

// Standard change event
checkbox.addEventListener('change', (e) => {
  console.log('Checkbox changed:', e.target.checked);
});

// Custom jschange event (for programmatic changes)
checkbox.addEventListener('jschange', (e) => {
  console.log('Programmatic change:', e.target.checked);
});
```

### Programmatic Changes

To trigger indeterminate logic programmatically:

```javascript
const checkbox = document.querySelector('#myCheckbox');

// Change the state
checkbox.checked = true;

// Dispatch custom event to trigger indeterminate logic
checkbox.dispatchEvent(new CustomEvent('jschange'));
```

This is useful when changing checkbox states via JavaScript (e.g., from an API response).

### Auto-Expand on Check

When a parent checkbox is checked, sublists dispatch an 'open' event:

```javascript
// Listen for auto-expand events
sublist.addEventListener('open', () => {
  sublist.classList.remove('hidden');
  sublist.classList.add('open');
});
```

This integrates with the Toggle component or custom collapse/expand logic.

## Styling the Indeterminate State

### CSS for Indeterminate

```css
/* Style indeterminate checkboxes */
input[type='checkbox']:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Custom indeterminate icon */
input[type='checkbox']:indeterminate::before {
  content: '';
  display: block;
  width: 10px;
  height: 2px;
  background: white;
  margin: auto;
}
```

### Tailwind CSS

Use arbitrary variants (Tailwind v3.1+):

```html
<input type="checkbox" class="indeterminate:bg-blue-500 indeterminate:border-blue-500" />
```

### Visual Feedback

Differentiate states clearly:

```css
input[type='checkbox'] {
  /* Unchecked */
  background: white;
  border: 2px solid #d1d5db;
}

input[type='checkbox']:checked {
  /* Checked */
  background: #3b82f6;
  border: 2px solid #3b82f6;
}

input[type='checkbox']:indeterminate {
  /* Indeterminate */
  background: #93c5fd; /* Lighter blue */
  border: 2px solid #3b82f6;
}
```

## Accessibility

### Semantic HTML

Use proper list structure and label associations:

```html
<ul data-indeterminate role="tree">
  <li role="treeitem">
    <input type="checkbox" id="parent1" aria-controls="children1" />
    <label for="parent1">Parent Item</label>
    <ul role="group" id="children1">
      <li role="treeitem">
        <input type="checkbox" id="child1" />
        <label for="child1">Child Item</label>
      </li>
    </ul>
  </li>
</ul>
```

### Keyboard Navigation

Ensure checkboxes are keyboard accessible:

```css
input[type='checkbox']:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Screen Reader Support

The indeterminate state is announced by screen readers:

```html
<!-- Screen reader announces "checked" -->
<input type="checkbox" checked />

<!-- Screen reader announces "mixed" or "partially checked" -->
<input type="checkbox" indeterminate />
```

No additional ARIA is needed for the indeterminate state itself.
