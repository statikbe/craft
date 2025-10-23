# Ajax Paging

The Ajax Paging component enables pagination without full page reloads, essential when you have multiple paginated sections on a single page. It fetches new content via AJAX and updates only the relevant sections, preserving the state of other components.

## Use Cases

- **Single pagination** - Not strictly necessary; standard page reload works fine
- **Multiple paginations** - Required to prevent conflicts between different paginated sections
- **Enhanced UX** - Provides smoother transitions without full page refresh
- **Preserved state** - Maintains user interactions in other parts of the page

## Example

<iframe src="../../examples/ajaxpaging_page1.html" height="800" title="Ajax Paging Example"></iframe>
<p class="iframe-caption">This example demonstrates how Ajax Paging works with multiple components on a single page.</p>

### Code example

```twig
{% set news1 = craft.entries.section('news').orderBy('postDate DESC') %}
{% paginate news1.limit(3) as pageInfoNews, news1 %}
<div class="section section--default">
    <div class="container" data-ajax-paging id="news1">
        <h2>News 1</h2>
        <div class="hidden" data-ajax-paging-loader tabindex="-1">
            <div class="flex justify-center py-20">
                {% include '_site/_snippet/_item/_loader' %}
            </div>
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3" data-ajax-paging-content>
            {% for cardEntry in news1 %}
                {% include '_site/_snippet/_item/_card' %}
            {% endfor %}
        </div>
        <div class="flex justify-center mt-10" data-ajax-paging-links>
            {{ render_pagination(pageInfoNews) | raw }}
        </div>
    </div>
</div>

{% set news2 = craft.entries.section('news').orderBy('postDate DESC') %}
{% paginate news2.limit(2) as pageInfoNews2, news2 %}
<div class="section section--default">
    <div class="container" data-ajax-paging id="news2">
        <h2>News 2</h2>
        <div class="hidden" data-ajax-paging-loader tabindex="-1">
            <div class="flex justify-center py-20">
                {% include '_site/_snippet/_item/_loader' %}
            </div>
        </div>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2" data-ajax-paging-content>
            {% for cardEntry in news2 %}
                {% include '_site/_snippet/_item/_card' %}
            {% endfor %}
        </div>
        <div class="flex justify-center mt-10" data-ajax-paging-links>
            {{ render_pagination(pageInfoNews2) | raw }}
        </div>
    </div>
</div>
```

## Implementation Details

### URL Requirements

The component only processes anchor (`<a>`) elements within the links block. Links must:

- Have a valid `href` attribute
- Not use `javascript:void(0);` (these are ignored)
- Be actual anchor elements (not buttons styled as links)

### Response Structure

The AJAX response must contain the same structure as the original page. The component:

1. Parses the full HTML response
2. Finds the element with matching `id` (e.g., `#news1`)
3. Extracts `[data-ajax-paging-content]` and `[data-ajax-paging-links]` from within that element
4. Updates only those sections

**Important:** Your Craft template must output the same HTML structure on paginated URLs.

### Loading Indicator

The optional loader element:

- Starts with the `hidden` class (Tailwind CSS)
- Class is removed when loading starts
- Class is added back when loading completes or fails
- Should include `tabindex="-1"` for accessibility (prevents focus during transitions)

## Best Practices

::: tip Unique IDs
Always use unique, descriptive IDs for each paging instance. Good: `#news-listing`, `#product-grid`. Bad: `#paging1`, `#section`.
:::

::: tip Server-Side Rendering
Ensure your server returns complete HTML structure on paginated URLs. Test by visiting pagination links directly in the browser.
:::

::: tip Loading States
Always include a loading indicator to provide user feedback during AJAX requests, especially on slower connections.
:::

::: warning Click Event Delegation
The component uses event delegation on the links container. Don't dynamically replace the entire `[data-ajax-paging-links]` element from outside code - only update its innerHTML.
:::

## Accessibility

The component maintains good accessibility practices:

- **Semantic HTML** - Uses native anchor elements for navigation
- **Keyboard Navigation** - All links remain keyboard accessible
- **Loading States** - Loader has `tabindex="-1"` to prevent focus
- **Error Recovery** - Failed requests don't break the interface

Consider adding:

- ARIA live regions for screen reader announcements
- Visual focus indicators on pagination links
- Skip links to jump between paginated sections

## Troubleshooting

**Pagination not working?**

- Check browser console for errors
- Verify the wrapper has an `id` attribute
- Ensure all required attributes are present
- Test that pagination URLs work when visited directly

**Content not updating?**

- Verify the AJAX response contains an element with matching `id`
- Check that response has `[data-ajax-paging-content]` and `[data-ajax-paging-links]`
- Inspect Network tab in browser DevTools to see the response

**Loader not showing?**

- Confirm the loader element exists
- Check it has the `hidden` class initially
- Verify Tailwind CSS or equivalent styling is loaded

**Wrong content appearing?**

- Ensure IDs are unique across the page
- Check that your backend isn't returning cached content
- Verify pagination parameters are correctly included in URLs

## Required Attributes

The Ajax Paging component requires specific data attributes to function properly:

| Attribute                  | Required | Description                                                                                                                     |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `data-ajax-paging`         | ✅ Yes   | Wrapper element. **Must have a unique `id` attribute** for each paging instance                                                 |
| `data-ajax-paging-content` | ✅ Yes   | Container for paginated content that will be replaced with new content                                                          |
| `data-ajax-paging-links`   | ✅ Yes   | Container for pagination links (prev/next/page numbers). Content is cleared during loading and replaced with new links          |
| `data-ajax-paging-loader`  | ❌ No    | Optional loading indicator. If present, the component removes the `hidden` class during loading and adds it back when complete. |

::: danger Required ID Attribute
The wrapper element with `data-ajax-paging` **must** have an `id` attribute. The component will throw an error if it's missing.
:::

## How It Works

1. **Initialization** - Component finds all `[data-ajax-paging]` elements and validates required attributes
2. **Click Detection** - Listens for clicks on anchor elements within `[data-ajax-paging-links]`
3. **Loading State** - Clears content and links, shows loader (if present)
4. **Fetch Content** - Makes AJAX request to the clicked link's URL
5. **Parse Response** - Extracts content and links from the response using the container's `id`
6. **Update DOM** - Replaces content and links with new data
7. **Hide Loader** - Removes loading indicator

## Error Handling

The component includes comprehensive error handling:

**Missing ID Attribute:**

```
Error: AjaxPaging: The paging element must have an id.
```

**Missing Content Block:**

```
Error: AjaxPaging: The paging element must need an element with attribute data-ajax-paging-content
```

**Missing Links Block:**

```
Error: AjaxPaging: The paging element must need an element with attribute data-ajax-paging-links
```

**Failed Requests:**

- Logs HTTP status codes and error messages to console
- Hides loading indicator to prevent stuck UI
- Preserves existing content if fetch fails

**Missing Data in Response:**

- Validates the response contains the expected container ID
- Checks for required content and links elements
- Logs clear error messages for debugging
