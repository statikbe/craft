# CKEditor

The CKEditor component integrates [CKEditor 5 Classic](https://ckeditor.com/ckeditor-5/) into frontend forms, providing a rich text editing experience that matches Craft CMS's backend editor. This ensures consistent formatting and seamless data transfer between frontend submissions and backend content management.

## Features

- ✅ **CKEditor 5 Classic** - Modern, feature-rich WYSIWYG editor
- ✅ **Dynamic Import** - Loads CKEditor only when needed
- ✅ **Customizable Toolbar** - Configure tools via data attributes
- ✅ **Preset Styles** - Quick "compact" configuration for simple use cases
- ✅ **Real-time Sync** - Updates textarea content on every change

## Use Cases

- **Frontend Forms** - User-generated content with formatting

## Example

<iframe src="../../examples/ckeditor.html" height="430"></iframe>

```HTML
<textarea data-ck-editor></textarea>
<textarea data-ck-editor data-ck-editor-style="compact"></textarea>
<textarea data-ck-editor data-ck-editor-toolbar="bold,italic"></textarea>
```

## Required Attributes

| Attribute        | Required | Description                                                                        |
| ---------------- | -------- | ---------------------------------------------------------------------------------- |
| `data-ck-editor` | ✅ Yes   | Marks the `<textarea>` for CKEditor initialization. Must be on a textarea element. |

## Configuration Attributes

Customize the editor toolbar and behavior:

| Attribute                | Description                                                                                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-ck-editor-style`   | Preset toolbar style. Currently supports `"compact"` which provides: `['bold', 'italic', 'numberedList', 'bulletedList']`                                                                                                                       |
| `data-ck-editor-toolbar` | Custom comma-separated list of toolbar items (e.g., `"bold,italic,link"`). Overrides default and style presets. See [CKEditor toolbar docs](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html) for available tools. |

::: warning Element Type Requirement
This component **only works on `<textarea>` elements**. CKEditor replaces the textarea with its rich text interface.
:::

## How It Works

1. **Dynamic Import** - Component uses `async import()` to load CKEditor 5 Classic
2. **Element Detection** - Finds all `[data-ck-editor]` elements
3. **Toolbar Configuration:**
   - Default: `['heading', 'bold', 'italic', 'insertImage', 'link']`
   - Compact style: `['bold', 'italic', 'numberedList', 'bulletedList']`
   - Custom: Uses comma-separated list from `data-ck-editor-toolbar`
4. **Editor Creation** - Initializes CKEditor on each textarea
5. **Change Tracking** - Listens for content changes
6. **Real-time Sync** - Updates original textarea's `innerHTML` on every change

## Toolbar Configurations

### Default Toolbar

When no attributes are specified:

```html
<textarea data-ck-editor></textarea>
```

**Tools:** `heading`, `bold`, `italic`, `insertImage`, `link`

**Best for:** Standard rich text with headings and links

### Compact Toolbar

For simple formatting needs:

```html
<textarea data-ck-editor data-ck-editor-style="compact"></textarea>
```

**Tools:** `bold`, `italic`, `numberedList`, `bulletedList`

**Best for:** Comments, simple text with basic formatting

### Custom Toolbar

Specify exactly which tools to include:

```html
<textarea
  data-ck-editor
  data-ck-editor-toolbar="bold,italic,underline,strikethrough,link,bulletedList,numberedList"
></textarea>
```

**Note:** Custom toolbar overrides both default and style presets.

## Available Toolbar Items

CKEditor 5 Classic supports these toolbar items:

**Text Formatting:**

- `bold`, `italic`, `underline`, `strikethrough`
- `code`, `subscript`, `superscript`

**Headings:**

- `heading` (dropdown with H1-H6 and paragraph)

**Links & Media:**

- `link`, `insertImage`, `mediaEmbed`
- `blockQuote`, `codeBlock`

**Lists:**

- `bulletedList`, `numberedList`
- `todoList` (requires plugin)

**Tables:**

- `insertTable` (requires plugin)

**Alignment:**

- `alignment` (requires plugin)

**Others:**

- `undo`, `redo`
- `fontColor`, `fontBackgroundColor` (requires plugins)
- `fontSize`, `fontFamily` (requires plugins)

::: tip Plugin Requirements
Some features require additional CKEditor plugins not included in the Classic build. The component uses the standard Classic build with default plugins.
:::

## Form Integration

### Basic Form Example

```html
<form action="/submit" method="POST">
  <label for="content">Description</label>
  <textarea id="content" name="content" data-ck-editor>
    Enter your content here...
  </textarea>

  <button type="submit">Submit</button>
</form>
```

On submission:

- `content` field contains HTML from CKEditor
- Server receives formatted content
- No additional JavaScript needed

### Initial Content

Set initial content in the textarea:

```html
<textarea data-ck-editor name="content">
  <h2>Welcome</h2>
  <p>This is the <strong>initial</strong> content.</p>
</textarea>
```

CKEditor will render and allow editing of this content.

### Reading Content via JavaScript

```javascript
// CKEditor syncs to the original textarea
const textarea = document.querySelector('[data-ck-editor]');
const content = textarea.innerHTML; // or textarea.value

console.log(content); // HTML from CKEditor
```

## Accessibility

CKEditor 5 includes comprehensive accessibility features:

- ✅ **Keyboard Navigation** - Full keyboard control
- ✅ **Screen Reader Support** - ARIA labels and announcements
- ✅ **Focus Management** - Proper focus handling in toolbar and content
- ✅ **High Contrast** - Works with high contrast modes
- ✅ **Semantic HTML** - Generates proper heading hierarchy

**Keyboard shortcuts:**

- `Ctrl+B` / `Cmd+B` - Bold
- `Ctrl+I` / `Cmd+I` - Italic
- `Ctrl+K` / `Cmd+K` - Insert link
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo

See [CKEditor Accessibility](https://ckeditor.com/docs/ckeditor5/latest/features/accessibility.html) for full details.

## Styling

CKEditor includes default styles. To customize:

### Content Styles

Style the editable content area:

```css
.ck-content {
  font-family: inherit;
  font-size: 1rem;
  min-height: 200px;
}

.ck-content h1 {
  font-size: 2rem;
}
.ck-content h2 {
  font-size: 1.5rem;
}
.ck-content p {
  margin-bottom: 1rem;
}
```

### Toolbar Styles

Customize toolbar appearance:

```css
.ck-toolbar {
  background: #f8f9fa !important;
  border: 1px solid #dee2e6 !important;
}

.ck-button {
  color: #495057 !important;
}
```

::: tip Theme Integration
Match CKEditor styles to your site's design system for a consistent user experience.
:::

## Best Practices

::: tip Start Simple
Use the compact toolbar for user-generated content to prevent complex formatting that breaks your design.
:::

::: tip Sanitize Output
Always sanitize CKEditor output server-side before storing in your database. Never trust user input.

```php
// Example with HTMLPurifier
$clean = $purifier->purify($_POST['content']);
```

:::

::: tip Consistent Styling
Ensure frontend and backend use same heading levels and formatting to avoid confusion when content moves between them.
:::

## Troubleshooting

**Editor not initializing?**

- Check console for errors
- Verify `@ckeditor/ckeditor5-build-classic` is installed
- Ensure element is a `<textarea>` (not div or input)
- Check that data attribute is `data-ck-editor` (with hyphen)

**Toolbar items not showing?**

- Verify toolbar item names are correct (case-sensitive)
- Check that required plugins are included in Classic build
- Some features need additional plugins not in the default build
- Check CKEditor console warnings for missing plugins

**Content not submitting with form?**

- Component automatically syncs to textarea on change
- Verify textarea has a `name` attribute
- Check that form is actually submitting (not prevented by JS)

**Image upload failing?**

- Check upload endpoint URL is correct
- Verify server endpoint returns proper JSON format
- Check network tab for error responses
- Ensure server has proper CORS headers if needed

**Content looks different after saving?**

- Server may be stripping HTML tags
- Check content sanitization settings
- Verify database field type (TEXT, not VARCHAR)
- Check that HTML is being decoded properly

**Multiple editors not working?**

- Component initializes all `[data-ck-editor]` elements
- Each editor instance is independent
- Check console for initialization errors
- Ensure textareas have unique names/IDs

## Advanced: Custom Configuration

To add custom CKEditor configuration, modify the component:

```typescript
ClassicEditor.default.create(editor, {
  licenseKey: 'GPL',
  toolbar: toolbar,
  // Add custom config:
  language: 'en',
  wordCount: {
    onUpdate: (stats) => {
      console.log(`Characters: ${stats.characters}`);
    },
  },
  // ... more config
});
```

See [CKEditor Configuration](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/configuration.html) for all options.

## Related Resources

- **[CKEditor 5 Documentation](https://ckeditor.com/docs/ckeditor5/)** - Official docs
- **[Classic Editor Guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/legacy-getting-started/quick-start-other.html#classic-editor)** - Setup guide
- **[Toolbar Configuration](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html)** - Toolbar options
