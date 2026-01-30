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

<iframe src="../../examples/ckeditor.html" height="580"></iframe>

### Basic Usage

```html
<textarea data-ck-editor></textarea>
<textarea data-ck-editor data-ck-editor-style="compact"></textarea>
<textarea data-ck-editor data-ck-editor-toolbar="bold,italic"></textarea>
```

### With Word Count and Character Limit

```html
<form action="">
  <textarea
    name="message"
    rows="8"
    class="form__input"
    data-ck-editor
    data-ck-editor-link-open-new-tab="false"
    data-ck-editor-link-nofollow
    data-ck-editor-toolbar="bulletedList,link"
    data-ck-editor-wordcount="wordcount"
    data-ck-editor-limit="1000"
  >
    {{ activity is defined ? activity.accessibilityDescription : '' }}
  </textarea>
  <div class="flex justify-between mt-1">
    <div class="mt-1 text-xs italic opacity-30">{{ "Maximum 1000 characters"|t }}</div>
    <div id="wordcount" class="mt-1 text-xs italic opacity-75" data-template="wordcount-template"></div>
    <template id="wordcount-template"> {{ 'Character count: '|t }}${characters}/${limit} </template>
  </div>
</form>
```

## Required Attributes

| Attribute        | Required | Description                                                                        |
| ---------------- | -------- | ---------------------------------------------------------------------------------- |
| `data-ck-editor` | ✅ Yes   | Marks the `<textarea>` for CKEditor initialization. Must be on a textarea element. |

## Configuration Attributes

Customize the editor toolbar and behavior:

| Attribute                          | Description                                                                                                                                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-ck-editor-style`             | Preset toolbar style. Currently supports `"compact"` which provides: `['bold', 'italic', 'numberedList', 'bulletedList']`                                                                                                                       |
| `data-ck-editor-toolbar`           | Custom comma-separated list of toolbar items (e.g., `"bold,italic,link"`). Overrides default and style presets. See [CKEditor toolbar docs](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html) for available tools. |
| `data-ck-editor-link-open-new-tab` | Controls whether links open in new tab. Set to `"false"` to disable (links open in same tab). Default: `true` (links open with `target="_blank" rel="noopener noreferrer"`).                                                                    |
| `data-ck-editor-link-nofollow`     | Adds `rel="nofollow"` to all links automatically. Use for user-generated content to prevent SEO link juice transfer.                                                                                                                            |
| `data-ck-editor-wordcount`         | ID of element where word/character count should be displayed. Use with `data-template` attribute on the target element.                                                                                                                         |
| `data-ck-editor-limit`             | Maximum character limit (excludes HTML tags). When exceeded, prevents further input. Use with `data-ck-editor-wordcount` to show current count.                                                                                                 |

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

## Link Configuration

### Default Link Behavior

By default, all links in CKEditor:

- Open in new tab (`target="_blank"`)
- Include security attributes (`rel="noopener noreferrer"`)
- Use `https://` as default protocol

### Disable New Tab

Force links to open in the same tab:

```html
<textarea data-ck-editor data-ck-editor-link-open-new-tab="false"></textarea>
```

**Result:** Links have no `target` attribute, open in current tab.

### Add Nofollow

Add `rel="nofollow"` to all links (useful for user-generated content):

```html
<textarea data-ck-editor data-ck-editor-link-nofollow></textarea>
```

**Result:** Links include `rel="nofollow"` attribute.

### Combined Link Options

```html
<textarea data-ck-editor data-ck-editor-link-open-new-tab="false" data-ck-editor-link-nofollow></textarea>
```

**Result:**

- Links open in same tab (no `target="_blank"`)
- Links have `rel="nofollow"`

::: tip SEO Considerations
Use `data-ck-editor-link-nofollow` on user-generated content to prevent spam links from affecting your site's SEO.
:::

## Word Count & Character Limit

### Word Count Display

Show real-time character/word count:

```html
<textarea data-ck-editor data-ck-editor-wordcount="wordCountElement"></textarea>

<div id="wordCountElement" data-template="wordCountTemplate"></div>

<template id="wordCountTemplate"> Words: ${words} | Characters: ${characters} </template>
```

**Available template variables:**

- `${words}` - Number of words (space-separated, HTML stripped)
- `${characters}` - Number of characters (HTML stripped)
- `${limit}` - Character limit (if `data-ck-editor-limit` is set)

### Character Limit

Prevent users from exceeding a character limit:

```html
<textarea data-ck-editor data-ck-editor-wordcount="wordCountElement" data-ck-editor-limit="1000"></textarea>

<div id="wordCountElement" data-template="template"></div>
<template id="template"> ${characters}/${limit} characters </template>
```

**Behavior:**

- Counts characters **excluding HTML tags**
- When limit is reached, prevents further typing
- User must delete content to continue
- Limit is soft (user can paste beyond limit, but then cannot type)

### Complete Example with Limit

```html
<form>
  <label for="description">Description (max 500 characters)</label>
  <textarea
    id="description"
    name="description"
    data-ck-editor
    data-ck-editor-toolbar="bold,italic,bulletedList,link"
    data-ck-editor-link-nofollow
    data-ck-editor-wordcount="descriptionCount"
    data-ck-editor-limit="500"
  ></textarea>

  <div class="flex justify-between mt-2">
    <span class="text-sm text-gray-500">Maximum 500 characters</span>
    <div id="descriptionCount" data-template="countTemplate" class="text-sm"></div>
  </div>

  <template id="countTemplate">
    <span class="${characters > limit ? 'text-red-600' : 'text-gray-600'}"> ${characters}/${limit} </span>
  </template>
</form>
```

**How it works:**

1. User types in editor
2. Component strips HTML tags from content
3. Counts characters in plain text
4. Updates template with current count
5. If at limit, reverts new changes
6. Template can conditionally style based on count

::: tip Character Counting
The character limit counts **plain text only** (HTML tags excluded). This ensures users can't circumvent limits by adding formatting.
:::

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
const textarea = document.querySelector("[data-ck-editor]");
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

::: tip Use Character Limits
For fields with database column size limits, always set `data-ck-editor-limit` to prevent truncation errors.
:::

::: tip User-Generated Content
For public-facing forms, use:

- `data-ck-editor-link-nofollow` to prevent SEO manipulation
- `data-ck-editor-toolbar` with minimal tools (bold, italic, lists)
- Character limits to prevent abuse
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
  licenseKey: "GPL",
  toolbar: toolbar,
  // Add custom config:
  language: "en",
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
