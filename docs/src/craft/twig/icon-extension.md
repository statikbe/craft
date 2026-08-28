# Icon Extension

A Twig function for rendering SVG icons with consistent styling, ARIA attributes, and support for both file-based icons and Asset elements.

## Features

- ✅ **File-Based Icons**: Reference icons by filename from `/frontend/icons/`
- ✅ **Asset Support**: Pass Craft Asset elements directly
- ✅ **Auto ARIA Attributes**: Automatically adds `aria-hidden="true"`
- ✅ **Consistent Classes**: Adds `.icon` class to all icons
- ✅ **Custom Attributes**: Pass any HTML attributes
- ✅ **Error Handling**: Gracefully handles invalid SVG markup

## Function Signature

```twig
icon(source, attributes)
```

### Parameters

| Parameter    | Type            | Description                                        |
| ------------ | --------------- | -------------------------------------------------- |
| `source`     | `string\|Asset` | Icon filename (without extension) or Asset element |
| `attributes` | `array`         | Optional HTML attributes to add to the SVG element |

### Returns

`Markup` - Safe HTML markup for the SVG icon

## Basic Usage

### Simple Icon from Filename

```twig
{# Renders /frontend/icons/play-arrow.svg #}
{{ icon('play-arrow') }}

{# Output: #}
<svg aria-hidden="true" class="icon">
  <!-- SVG content -->
</svg>
```

### Icon with Custom Classes

```twig
{{ icon('search', { class: 'w-6 h-6 text-primary' }) }}

{# Output: #}
<svg aria-hidden="true" class="icon w-6 h-6 text-primary">
  <!-- SVG content -->
</svg>
```

### Icon from Asset Element

```twig
{% set iconAsset = entry.customIcon.one() %}
{{ icon(iconAsset, { class: 'icon-large' }) }}
```

## Common Patterns

### Button with Icon

```twig
<button type="button" class="btn">
  {{ icon('play-arrow', { class: 'mr-2' }) }}
  Play Video
</button>
```

### Icon with Screen Reader Text

```twig
<button type="button">
  {{ icon('search', { class: 'w-5 h-5' }) }}
  <span class="sr-only">Search</span>
</button>
```

### Conditional Icon Display

```twig
{% if entry.status == 'live' %}
  {{ icon('check-circle', { class: 'text-green-500' }) }}
{% else %}
  {{ icon('warning', { class: 'text-yellow-500' }) }}
{% endif %}
```

### Icon in Navigation

```twig
<nav>
  {% for item in navigation %}
    <a href="{{ item.url }}">
      {{ icon(item.icon, { class: 'nav-icon' }) }}
      {{ item.title }}
    </a>
  {% endfor %}
</nav>
```

### Icon with Custom Attributes

```twig
{{ icon('info', {
  class: 'tooltip-icon',
  'data-tooltip': 'Additional information',
  role: 'img',
  'aria-label': 'Information icon'
}) }}
```

### Responsive Icon Sizes

```twig
{{ icon('menu', {
  class: 'w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8'
}) }}
```

### Icon in Form Field

```twig
<div class="relative">
  <input type="email" class="pl-10" placeholder="Email">
  <div class="absolute left-3 top-1/2 -translate-y-1/2">
    {{ icon('mail', { class: 'w-4 h-4 text-gray-400' }) }}
  </div>
</div>
```

### Animated Icon

```twig
{{ icon('loading', {
  class: 'animate-spin w-5 h-5'
}) }}
```

## Implementation Details

### File Path Resolution

When you pass a string as the source, the function:

1. Ensures the filename ends with `.svg`
2. Prepends `@webroot/frontend/icons/` to the path
3. Uses Craft's `svg()` function to load the file

```php
if (is_string($source)) {
    $filename = StringHelper::ensureRight($source, '.svg');
    $source = "@webroot/frontend/icons/$filename";
}
```

### HTML Attribute Merging

The function modifies the SVG element to add:

- `aria-hidden="true"` (for accessibility)
- `class="icon"` (base class, merged with custom classes)
- Any custom attributes passed in the `attributes` array

```php
$output = Html::modifyTagAttributes($svg, [
    'aria-hidden' => 'true',
    'class' => ('icon ' . $extraClasses),
    ...$attributes,
]);
```

### Error Handling

If the HTML modification fails (e.g., invalid SVG markup), the function returns the original SVG without modifications:

```php
try {
    $output = Html::modifyTagAttributes($svg, [...]);
} catch (InvalidArgumentException $e) {
    $output = $svg;
}
```

## Icon Organization

### Naming Conventions

- Use **kebab-case** for icon filenames
- Use descriptive names (e.g., `play-arrow` not `play1`)
- Group related icons with prefixes (e.g., `social-facebook`, `social-twitter`)

## Accessibility

### ARIA Hidden

Icons rendered with this function are automatically hidden from screen readers with `aria-hidden="true"`. This is appropriate when:

- Icon is decorative
- Adjacent text provides the same information
- Icon is inside a button/link with text

## Troubleshooting

### Icon Not Appearing

**Problem**: Icon doesn't render.

**Solution**: Verify the SVG file exists:

```bash
# Check file exists
ls frontend/icons/your-icon.svg

# Verify it's valid SVG
cat frontend/icons/your-icon.svg
```

### Icon Too Large/Small

**Problem**: Icon doesn't match desired size.

**Solution**: Remove SVG width/height attributes, use CSS:

```svg
<!-- Remove these from SVG file -->
<svg width="24" height="24" viewBox="0 0 24 24">

<!-- Keep viewBox, remove width/height -->
<svg viewBox="0 0 24 24">
```

Then control size with CSS:

```twig
{{ icon('search', { class: 'w-6 h-6' }) }}
```

### Icon Wrong Color

**Problem**: Icon doesn't inherit color.

**Solution**: Ensure SVG uses `fill="currentColor"`:

```svg
<!-- Update SVG file -->
<svg viewBox="0 0 24 24">
  <path fill="currentColor" d="..."/>
</svg>
```

### Asset Icon Not Working

**Problem**: Asset-based icon fails to render.

**Solution**: Verify Asset is an SVG file:

```twig
{% set iconAsset = entry.customIcon.one() %}
{% if iconAsset and iconAsset.kind == 'image' and iconAsset.extension == 'svg' %}
  {{ icon(iconAsset) }}
{% else %}
  {# Fallback #}
  {{ icon('default-icon') }}
{% endif %}
```
