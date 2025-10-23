# Matrix

The Matrix component enables dynamic addition and removal of form field groups. It's designed for scenarios where users need to add multiple sets of related inputs, such as adding multiple email addresses, phone numbers, or user entries. The component handles field cloning, index management, validation state, and conditional element visibility.

## Features

- **Dynamic Row Addition**: Add identical field groups on demand
- **Template-Based**: Uses HTML `<template>` for clean markup
- **Index Interpolation**: Automatic index replacement in template (${index})
- **Remove Functionality**: Each row can be individually removed
- **Maximum Limit**: Optional cap on number of rows
- **Conditional Visibility**: Show/hide elements based on row count
- **Validation Integration**: Automatically manages required/disabled states
- **Custom Events**: Dispatches events for row additions, removals, and limits
- **Dynamic Content Support**: Works with dynamically added buttons
- **Form Integration**: Generates proper array-notation field names

## Use Cases

- **Multiple Email Addresses**: Contact forms with multiple recipients
- **Team Members**: Add multiple users with name/email/role
- **Phone Numbers**: Multiple contact numbers
- **Address Book**: Multiple addresses (shipping, billing, etc.)
- **Experience Entries**: Resume builder with multiple jobs
- **Product Variants**: E-commerce forms with size/color variations
- **Event Attendees**: Registration for multiple participants
- **Social Links**: Multiple social media profile links

## How It Works

### Initialization

1. **Find Triggers**: Locates all `[data-matrix-add]` buttons
2. **Parse Configuration**: Reads template ID, destination, max, show/hide elements
3. **Validate Elements**: Ensures template and destination exist
4. **Attach Listener**: Adds click listener to trigger button
5. **Setup Dynamic Content**: Watches for new matrix buttons added to DOM

### Row Addition Flow

When user clicks "Add" button:

1. **Check Limit**: Verifies max rows not reached (if configured)
2. **Increment Index**: Gets current index, increments by 1
3. **Process Template**: Replaces all `${index}` placeholders with actual index
4. **Create Row**: Creates wrapper div with `data-matrix-row` attribute
5. **Inject HTML**: Inserts processed template content
6. **Attach Remove Listener**: Binds click handler to remove button
7. **Append Row**: Adds row to destination container
8. **Update State**: Manages button disabled state, visibility of show/hide elements
9. **Dispatch Event**: Fires `matrix.rowAdded` event

### Row Removal Flow

When user clicks a row's "Remove" button:

1. **Remove DOM**: Deletes the row from the DOM
2. **Enable Add Button**: Re-enables the add button (if was at max)
3. **Update Visibility**: Toggles show/hide elements if needed
4. **Update Validation**: Re-enables fields in show/hide elements
5. **Dispatch Event**: Fires `matrix.rowRemoved` event

### Template Processing

The component uses JavaScript template strings:

```javascript
// Template HTML
<input name="email[${index}]" id="email${index}" />

// After processing with index=2
<input name="email[2]" id="email2" />
```

All `${index}` placeholders are replaced with the current index value.

### Conditional Element Management

When rows are added:

- **Show elements**: Get `open` attribute, form fields enabled
- **Hide elements**: Lose `open` attribute, form fields disabled

When all rows are removed, this reverses.

### Validation State Management

For fields in show/hide elements:

```javascript
// When hiding:
- If field has `required`, remove it and add `data-has-required="true"`
- Add `disabled` attribute

// When showing:
- If field has `data-has-required`, restore `required` attribute
- Remove `disabled` attribute
```

This prevents hidden required fields from blocking form submission.

## Example

### Full Form Example

<iframe src="../../examples/matrix.html" height="800"></iframe>

```HTML
<form action="" data-validate>
    <div>
        <div>
            <div class="form__field">
                <label class="form__label" for="name">Name</label>
                <input class="form__input" type="text" id="name" name="name[0]" value="" required>
            </div>
            <div class="form__field">
                <label class="form__label" for="email">E-mailaddress</label>
                <input class="form__input" type="email" id="email" name="email[0]" value="" required>
            </div>
        </div>
    </div>
    <div id="matrixWrapper"></div>
    <div class="hidden open:block form__field mt-10" id="showWhenExtraBlocks" data-validate-wrapper>
        <label class="flex" >
            <input class="mt-1 mr-2" type="checkbox" value="1" disabled="disabled" data-has-required="true"/>
            We like you to check this checkbox if you add input fields
        </label>
    </div>
    <div class="hidden open:block form__field mt-10" id="hideWhenExtraBlocks" open data-validate-wrapper>
        <label class="flex">
            <input class="mt-1 mr-2" type="checkbox" value="1" required/>
            This option can be hidden when there are multiple input fields
        </label>
    </div>
    <div class="mt-10">
        <button type="button" class="btn disabled:opacity-30"
            data-matrix-add="extraRow"
            data-matrix-destination="matrixWrapper"
            data-matrix-show="showWhenExtraBlocks"
            data-matrix-hide="hideWhenExtraBlocks"
            data-matrix-max="3">Add inputs</button>
        <button type="submit" class="btn btn--primary">Send form</button>
    </div>
</form>
<template id="extraRow">
    <div class="relative mt-10">
        <div class="form__field">
            <label class="form__label" for="name${index}">Name</label>
            <input class="form__input" type="text" id="name${index}" name="name[${index}]" value="" required>
        </div>
        <div class="form__field">
            <label class="form__label" for="email${index}">E-mailaddress</label>
            <input class="form__input" type="email" id="email${index}" name="email[${index}]" value="" required>
        </div>
        <div class="absolute top-0 right-0 mt-1 mr-2">
            <button type="button" data-remove-row>
                Remove row
            </button>
        </div>
    </div>
</template>
```

This example demonstrates:

- First row (index 0) in the static HTML
- Additional rows (index 1, 2, 3) added dynamically via template
- Maximum of 3 additional rows (4 total including static row)
- Conditional checkbox that shows when extra rows are added
- Remove button on each dynamic row

## Configuration

All settings are provided via data attributes on the trigger button. The `data-matrix-add` attribute is required to trigger the component. All attribute values should reference element IDs.

## Attributes

| Attribute                 | Description                                                                                | Required |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| `data-matrix-add`         | ID of the `<template>` element containing the row HTML                                     | Yes      |
| `data-matrix-destination` | ID of the element where new rows will be appended                                          | Yes      |
| `data-matrix-show`        | Comma-separated list of element IDs to show when rows are added                            | No       |
| `data-matrix-hide`        | Comma-separated list of element IDs to hide when rows are added                            | No       |
| `data-matrix-max`         | Maximum number of additional rows allowed; omit for unlimited                              | No       |
| `data-matrix-index`       | Starting index for the first dynamic row (default: 0, increments to 1 for first added row) | No       |

### Attribute Details

#### data-matrix-show / data-matrix-hide

These attributes accept comma-separated ID lists:

```html
<!-- Single element -->
data-matrix-show="termsCheckbox"

<!-- Multiple elements -->
data-matrix-show="termsCheckbox,privacyNotice,disclaimerText"
```

Elements receive/lose the `open` attribute for CSS toggling:

```css
.hidden {
  display: none;
}

.hidden.open\:block[open] {
  display: block;
}
```

#### data-matrix-index

Controls the starting index. Default is 0, so first added row gets index 1:

```html
<!-- Default: First row gets index 1 -->
<button data-matrix-add="template" data-matrix-destination="wrapper">Add</button>

<!-- Custom: First row gets index 6 (e.g., 5 static rows exist) -->
<button data-matrix-add="template" data-matrix-destination="wrapper" data-matrix-index="5">Add</button>
```

The index increments automatically with each added row.

## Template Structure

### Basic Template

```html
<template id="rowTemplate">
  <div class="row">
    <input type="text" name="field[${index}]" id="field${index}" />
    <button type="button" data-remove-row>Remove</button>
  </div>
</template>
```

### Template Requirements

1. **Root Element**: Template should have a single root element
2. **${index} Placeholder**: Use `${index}` wherever index interpolation is needed
3. **Remove Button**: Include element with `data-remove-row` attribute
4. **Unique IDs**: Use `${index}` in ID attributes for uniqueness
5. **Array Names**: Use `name[${index}]` for proper form array submission

### Advanced Template

```html
<template id="teamMemberTemplate">
  <div class="team-member-row border p-4 mt-4 relative">
    <!-- Multiple fields -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="member-name-${index}">Name</label>
        <input type="text" id="member-name-${index}" name="members[${index}][name]" required />
      </div>
      <div>
        <label for="member-email-${index}">Email</label>
        <input type="email" id="member-email-${index}" name="members[${index}][email]" required />
      </div>
      <div>
        <label for="member-role-${index}">Role</label>
        <select id="member-role-${index}" name="members[${index}][role]">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <div>
        <label for="member-phone-${index}">Phone</label>
        <input type="tel" id="member-phone-${index}" name="members[${index}][phone]" />
      </div>
    </div>

    <!-- Remove button -->
    <button type="button" data-remove-row class="absolute top-2 right-2 btn btn-sm btn-danger">Remove Member</button>
  </div>
</template>
```

This creates nested array structure:

```php
// Resulting POST data
[
  'members' => [
    0 => ['name' => 'John', 'email' => 'john@example.com', 'role' => 'admin', 'phone' => '...'],
    1 => ['name' => 'Jane', 'email' => 'jane@example.com', 'role' => 'editor', 'phone' => '...'],
    // ...
  ]
]
```

## Common Patterns

### Multiple Email Addresses

```html
<form>
  <div>
    <label>Primary Email</label>
    <input type="email" name="emails[0]" required />
  </div>

  <div id="emailsWrapper"></div>

  <button type="button" data-matrix-add="emailTemplate" data-matrix-destination="emailsWrapper">
    Add Another Email
  </button>
</form>

<template id="emailTemplate">
  <div class="mt-4">
    <label for="email-${index}">Additional Email</label>
    <input type="email" id="email-${index}" name="emails[${index}]" />
    <button type="button" data-remove-row>Remove</button>
  </div>
</template>
```

### Phone Numbers with Type

```html
<template id="phoneTemplate">
  <div class="phone-row">
    <select name="phones[${index}][type]">
      <option value="mobile">Mobile</option>
      <option value="home">Home</option>
      <option value="work">Work</option>
    </select>
    <input type="tel" name="phones[${index}][number]" placeholder="+1 234 567 8900" />
    <button type="button" data-remove-row>×</button>
  </div>
</template>
```

### File Upload Fields

```html
<template id="fileTemplate">
  <div class="file-upload-row">
    <label for="file-${index}">File ${index}</label>
    <input type="file" id="file-${index}" name="files[${index}]" accept="image/*,.pdf" />
    <input type="text" name="file_descriptions[${index}]" placeholder="Description" />
    <button type="button" data-remove-row>Remove</button>
  </div>
</template>
```

### Experience/Resume Builder

```html
<template id="experienceTemplate">
  <div class="experience-entry border-b pb-4 mb-4">
    <h4>Experience ${index}</h4>
    <input type="text" name="experience[${index}][company]" placeholder="Company" required />
    <input type="text" name="experience[${index}][position]" placeholder="Position" required />
    <input type="date" name="experience[${index}][start_date]" />
    <input type="date" name="experience[${index}][end_date]" />
    <textarea name="experience[${index}][description]" placeholder="Description"></textarea>
    <button type="button" data-remove-row>Remove</button>
  </div>
</template>
```

## Events

The component dispatches custom events from the trigger button. You can listen for these to integrate with other components or track analytics.

| Event                   | Description                             | Detail Properties                            |
| ----------------------- | --------------------------------------- | -------------------------------------------- |
| `matrix.rowAdded`       | Fired when a row is successfully added  | `index` (number), `rowElement` (HTMLElement) |
| `matrix.rowRemoved`     | Fired when a row is removed             | `index` (number), `rowElement` (HTMLElement) |
| `matrix.showElement`    | Fired when an element is shown          | `element` (HTMLElement)                      |
| `matrix.hideElement`    | Fired when an element is hidden         | `element` (HTMLElement)                      |
| `matrix.maxRowsReached` | Fired when maximum row limit is reached | `maxRows` (number), `currentRows` (number)   |

### Event Usage Examples

#### Track Analytics

```javascript
const addButton = document.querySelector('[data-matrix-add]');

addButton.addEventListener('matrix.rowAdded', (e) => {
  console.log(`Row ${e.detail.index} added`);
  // Track in analytics
  gtag('event', 'matrix_row_added', {
    index: e.detail.index,
  });
});

addButton.addEventListener('matrix.maxRowsReached', (e) => {
  console.log(`Max ${e.detail.maxRows} rows reached`);
});
```

#### Initialize Components on New Rows

```javascript
addButton.addEventListener('matrix.rowAdded', (e) => {
  const newRow = e.detail.rowElement;

  // Initialize datepicker on new row's date inputs
  const dateInputs = newRow.querySelectorAll('input[type="date"]');
  dateInputs.forEach((input) => {
    // Initialize your datepicker
    new Datepicker(input);
  });

  // Initialize tooltips
  const tooltips = newRow.querySelectorAll('[data-tooltip]');
  tooltips.forEach((el) => {
    new Tooltip(el);
  });
});
```

#### Show Notification

```javascript
addButton.addEventListener('matrix.maxRowsReached', () => {
  alert('Maximum number of entries reached');
});

addButton.addEventListener('matrix.rowRemoved', (e) => {
  console.log(`Row ${e.detail.index} removed`);
});
```

#### Update Counter

```javascript
const counter = document.getElementById('rowCounter');
let rowCount = 0;

addButton.addEventListener('matrix.rowAdded', () => {
  rowCount++;
  counter.textContent = `${rowCount} additional entries`;
});

addButton.addEventListener('matrix.rowRemoved', () => {
  rowCount--;
  counter.textContent = rowCount > 0 ? `${rowCount} additional entries` : '';
});
```

## Dynamic Content Support

The component integrates with DOMHelper for dynamically added matrix buttons:

```javascript
// After adding new matrix button
const container = document.querySelector('.dynamic-content');
container.innerHTML = `
  <button data-matrix-add="template" 
          data-matrix-destination="wrapper">
    Add Row
  </button>
`;

// Component automatically initializes via DOMHelper
```

## Best Practices

### Start with Index 0 in Static HTML

```html
<!-- First row (static) uses index 0 -->
<input name="items[0]" />

<!-- Dynamic rows start at index 1 -->
<button data-matrix-add="template" data-matrix-destination="wrapper">Add</button>

<template id="template">
  <input name="items[${index}]" />
</template>
```

This ensures clean, sequential indexing: 0, 1, 2, 3...

### Always Include Remove Button

```html
<template id="template">
  <div>
    <!-- Your fields -->

    <!-- REQUIRED: Remove button -->
    <button type="button" data-remove-row>Remove</button>
  </div>
</template>
```

Without a remove button, users can't delete unwanted rows.

### Use Meaningful Max Limits

```html
<!-- Reasonable limit for most use cases -->
<button data-matrix-add="template" data-matrix-destination="wrapper" data-matrix-max="10">Add</button>
```

Don't allow unlimited rows—it can cause performance and UX issues.

### Provide Visual Feedback

```html
<button
  data-matrix-add="template"
  data-matrix-destination="wrapper"
  data-matrix-max="5"
  class="btn disabled:opacity-50 disabled:cursor-not-allowed"
>
  Add Row
</button>
```

The button automatically gets `disabled` at max rows. Style it appropriately.

### Nested Array Structure for Related Data

```html
<!-- ✅ Good: Nested structure -->
<input name="members[${index}][name]" />
<input name="members[${index}][email]" />

<!-- ❌ Bad: Flat structure (harder to process) -->
<input name="member_name_${index}" />
<input name="member_email_${index}" />
```

Backend can easily loop through `members` array with nested structure.

## Form Submission

### Processing Matrix Data (PHP)

```php
// Nested array structure
foreach ($_POST['members'] as $index => $member) {
  $name = $member['name'];
  $email = $member['email'];
  $role = $member['role'];

  // Save to database
  createMember($name, $email, $role);
}
```

### Processing Simple Arrays

```php
// Simple array structure
foreach ($_POST['emails'] as $email) {
  // Each email is a string
  saveEmail($email);
}
```

### JavaScript Form Handling

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  // Convert to object
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  console.log(data);
  // {
  //   "members[0][name]": "John",
  //   "members[0][email]": "john@example.com",
  //   "members[1][name]": "Jane",
  //   "members[1][email]": "jane@example.com"
  // }
});
```

## Validation Integration

### Required Fields in Dynamic Rows

```html
<template id="template">
  <div>
    <input name="field[${index}]" required />
    <button type="button" data-remove-row>Remove</button>
  </div>
</template>
```

Each added row's required fields are validated independently.

### Conditional Required Fields

Use `data-matrix-show` and `data-matrix-hide` for conditional validation:

```html
<!-- Hidden by default, required when shown -->
<div id="agreeTerms" class="hidden open:block">
  <input type="checkbox" required disabled data-has-required="true" />
  I agree to terms (required if adding multiple entries)
</div>

<button data-matrix-add="template" data-matrix-destination="wrapper" data-matrix-show="agreeTerms">Add Row</button>
```

When rows are added:

1. `agreeTerms` gets `open` attribute
2. Checkbox gets `required` attribute (from `data-has-required`)
3. Checkbox loses `disabled` attribute

### Form Validation Component Integration

Works seamlessly with the Validation component:

```javascript
const form = document.querySelector('[data-validate]');

// After adding rows, validation automatically picks up new fields
addButton.addEventListener('matrix.rowAdded', (e) => {
  // New fields are automatically validated
  // No additional initialization needed
});
```

## Accessibility

### Semantic Remove Buttons

```html
<button type="button" data-remove-row aria-label="Remove entry ${index}">
  <span aria-hidden="true">×</span>
  <span class="sr-only">Remove entry ${index}</span>
</button>
```

### Focus Management

After adding a row, focus the first input:

```javascript
addButton.addEventListener('matrix.rowAdded', (e) => {
  const firstInput = e.detail.rowElement.querySelector('input, select, textarea');
  if (firstInput) {
    firstInput.focus();
  }
});
```

### Screen Reader Announcements

```javascript
addButton.addEventListener('matrix.rowAdded', (e) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Row ${e.detail.index} added`;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
});
```

### Keyboard Navigation

Ensure remove buttons are keyboard accessible:

```css
button[data-remove-row]:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

## Performance Considerations

### Limit Maximum Rows

```html
<!-- ✅ Good: Reasonable limit -->
<button data-matrix-max="20">Add</button>

<!-- ❌ Bad: No limit (could add hundreds) -->
<button>Add</button>
```

Large numbers of rows can cause:

- Slow DOM manipulation
- Difficult UX (too much scrolling)
- Large form payloads

### Template Complexity

Keep templates simple. Complex templates with many nested elements slow down cloning:

```html
<!-- ✅ Good: Simple, focused template -->
<template id="simple">
  <div>
    <input name="field[${index}]" />
    <button type="button" data-remove-row>×</button>
  </div>
</template>

<!-- ⚠️ Acceptable but slower with many rows -->
<template id="complex">
  <div class="grid grid-cols-3 gap-4 p-4 border rounded">
    <!-- 10+ fields with complex markup -->
  </div>
</template>
```

## Troubleshooting

### Template Not Found

**Problem**: Console error "One or more elements are missing"  
**Cause**: Template ID doesn't exist  
**Solution**: Verify `data-matrix-add` value matches template ID:

```html
<!-- ✅ Correct -->
<button data-matrix-add="myTemplate"></button>
<template id="myTemplate">...</template>

<!-- ❌ Incorrect: ID mismatch -->
<button data-matrix-add="myTemplate"></button>
<template id="differentName">...</template>
```

### Rows Not Appearing

**Problem**: Click button but no rows appear  
**Cause**: Destination element not found  
**Solution**: Check `data-matrix-destination` matches destination ID:

```html
<button data-matrix-destination="wrapper"></button>
<div id="wrapper"></div>
<!-- Must exist -->
```

### Remove Button Not Working

**Problem**: Remove buttons don't delete rows  
**Cause**: Missing `data-remove-row` attribute  
**Solution**: Add attribute to remove buttons:

```html
<template>
  <div>
    <!-- ✅ Correct -->
    <button type="button" data-remove-row>Remove</button>

    <!-- ❌ Wrong -->
    <button type="button">Remove</button>
  </div>
</template>
```

### Index Not Interpolating

**Problem**: Template shows literal `${index}` instead of numbers  
**Cause**: Template syntax error or formatter issue  
**Solution**: Use exact syntax:

```html
<!-- ✅ Correct -->
name="field[${index}]"

<!-- ❌ Wrong -->
name="field[{index}]" name="field[$index]"
```

### Show/Hide Not Working

**Problem**: Elements don't show/hide when rows added  
**Cause**: Missing CSS for `open` attribute  
**Solution**: Add CSS:

```css
.hidden {
  display: none;
}

.hidden[open] {
  display: block;
}

/* Or with Tailwind */
.hidden.open\:block[open] {
  display: block;
}
```

### Button Not Disabling at Max

**Problem**: Can add more rows than max setting  
**Cause**: `data-matrix-max` value not parsed  
**Solution**: Ensure value is a number:

```html
<!-- ✅ Correct -->
<button data-matrix-max="5">Add</button>

<!-- ❌ Wrong -->
<button data-matrix-max="five">Add</button>
```

## Technical Details

### Template Processing

Uses `Formatter.evaluateJSTemplate()`:

```typescript
const templateContent = Formatter.evaluateJSTemplate(this.template.innerHTML, { index: addIndex });
```

This replaces all `${index}` with the actual index value.

### Row Wrapper

Each added row gets a wrapper:

```html
<div data-matrix-row="1">
  <!-- Template content with index=1 -->
</div>
```

The `data-matrix-row` attribute stores the index for tracking.

### Validation State Management

```typescript
// When hiding element:
if (input.hasAttribute('required')) {
  input.removeAttribute('required');
  input.setAttribute('data-has-required', 'true');
}
input.setAttribute('disabled', 'disabled');

// When showing element:
if (input.hasAttribute('data-has-required')) {
  input.setAttribute('required', 'required');
  input.removeAttribute('data-has-required');
}
input.removeAttribute('disabled');
```

This ensures hidden fields don't block form submission.

## Browser Compatibility

- **Template Element**: All modern browsers (IE with polyfill)
- **Template Literals**: Transpiled by build process
- **Custom Events**: All browsers (IE 9+ with polyfill)
- **MutationObserver**: IE 11+ (used by DOMHelper)

## Related Components

- **Form Validation**: Validates dynamic matrix fields
- **Toggle**: Can be used to show/hide matrix sections
- **Modal**: Can contain matrix forms
- **Formie**: Craft CMS form builder (has similar repeater functionality)

## Advanced: Nested Matrix

For complex scenarios, you can nest matrices:

```html
<template id="outerTemplate">
  <div>
    <h3>Group ${index}</h3>
    <div id="innerWrapper-${index}"></div>
    <button type="button" data-matrix-add="innerTemplate" data-matrix-destination="innerWrapper-${index}">
      Add Item to Group ${index}
    </button>
    <button type="button" data-remove-row>Remove Group</button>
  </div>
</template>

<template id="innerTemplate">
  <div>
    <input name="groups[${outerIndex}][items][${index}]" />
    <button type="button" data-remove-row>Remove Item</button>
  </div>
</template>
```

**Note**: This requires custom JavaScript to pass the outer index context.

This component provides a robust solution for dynamic form field management with excellent user experience and developer flexibility.
