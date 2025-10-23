# Load More

The Load More component replaces traditional pagination with progressive content loading. It allows users to load additional content pages seamlessly onto the same page, either manually (click to load) or automatically (infinite scroll). This improves user experience by eliminating full page reloads.

## Features

- ✅ **Progressive Loading**: Load content incrementally instead of all at once
- ✅ **Manual Mode**: Click button to load next page
- ✅ **Infinite Scroll**: Automatically load as user scrolls
- ✅ **Intersection Observer**: Modern, performant scroll detection
- ✅ **Custom Events**: Dispatches events on load completion
- ✅ **Loader State**: Shows/hides loading indicator
- ✅ **Auto-Cleanup**: Removes pagination when no more pages
- ✅ **Error Handling**: Graceful fallback on fetch failures
- ✅ **Dynamic Content**: Works with dynamically added load-more containers
- ✅ **SEO-Friendly**: Works with server-rendered paginated URLs

## How It Works

### Initialization

1. **Find Containers**: Locates all `[data-load-more]` elements
2. **Parse Attributes**: Reads pagination, loader, trigger, and scroll mode settings
3. **Validate Elements**: Ensures all required elements exist
4. **Attach Listener**: Adds click listener to trigger button
5. **Initialize Scroll**: If infinite scroll enabled, sets up Intersection Observer

### Manual Load Flow

When user clicks the "Load More" button:

1. **Get URL**: Reads `href` from trigger element (next page URL)
2. **Show Loader**: Hides trigger, shows loader
3. **Fetch Page**: Makes GET request to next page URL
4. **Parse HTML**: Uses DOMParser to extract content from response
5. **Extract Items**: Finds matching `data-load-more` container in response
6. **Append Items**: Adds new items to current page container
7. **Update Trigger**: Updates href to next-next page, or removes pagination if done
8. **Dispatch Events**: Fires `loadmore.loaded` event with new elements
9. **Hide Loader**: Shows trigger again (or removes if finished)

### Infinite Scroll Flow

When infinite scroll is enabled:

1. **Create Observer**: Sets up IntersectionObserver watching pagination element
2. **Monitor Visibility**: Checks when pagination enters viewport (with 10% margin)
3. **Trigger Load**: Automatically calls `loadMore()` when pagination visible
4. **Unobserve**: Temporarily stops observing during load
5. **Re-observe**: Resumes observing after load completes (for next page)
6. **Cleanup**: Stops observing when no more pages available

## Configuration

### Required Elements

- **Wrapper**: Container with `data-load-more` (holds all items)
- **Pagination**: Element with matching ID (contains loader and trigger)
- **Loader**: Loading indicator with matching ID
- **Trigger**: Link to next page with matching ID

### Mode Selection

- **Manual Mode**: `data-load-more-infinite-scroll="false"` or omitted
- **Infinite Scroll**: `data-load-more-infinite-scroll="true"`

## Example

### Live Demo

<iframe src="../../examples/loadmore_page1.html" height="800"></iframe>

## Code Examples

### Manual Load ("Load More" Button)

```HTML
<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3"
    data-load-more="newsCards"
    data-load-more-pagination="pagination"
    data-load-more-loader="paginationLoader"
    data-load-more-trigger="loadMoreTrigger"
    data-load-more-infinite-scroll="false">
    {% for cardEntry in load1Entries %}
        {% include '_site/_snippet/_item/_card' %}
    {% endfor %}
</div>
<div class="flex justify-center mt-8" id="pagination">
    <div class="hidden" id="paginationLoader">
        {% include '_site/_snippet/_item/_loader' %}
        <div class="mt-2 italic opacity-50">{{ "Meer nieuws aan het laden"|t }}</div>
    </div>
    {% if load1PageInfo.nextUrl %}
        <a href="{{ load1PageInfo.nextUrl }}" class="btn btn--ghost" id="loadMoreTrigger">{{ "Bekijk meer nieuws"|t }}</a>
    {% endif %}
</div>
```

**How it works:**

- User clicks "Load More" button
- Loader appears, button hides
- New items are fetched and appended
- Button reappears with updated link (or is removed if no more pages)

### Infinite Scroll

```HTML
<div class=""
    data-load-more="newsCardsInfinite"
    data-load-more-pagination="paginationInfinite"
    data-load-more-loader="paginationLoaderInfinite"
    data-load-more-trigger="loadMoreTriggerInfinite"
    data-load-more-infinite-scroll="true">
    {% for cardEntry in load2Entries %}
        {% include '_site/_snippet/_item/_card' %}
    {% endfor %}
</div>
<div class="flex justify-center mt-8" id="paginationInfinite">
    <div class="hidden" id="paginationLoaderInfinite">
        {% include '_site/_snippet/_item/_loader' %}
        <div class="mt-2 italic opacity-50">{{ "Meer nieuws aan het laden"|t }}</div>
    </div>
    {% if load2PageInfo.nextUrl %}
        <a href="{{ load2PageInfo.nextUrl }}" class="btn btn--ghost" id="loadMoreTriggerInfinite">{{ "Bekijk meer nieuws"|t }}</a>
    {% endif %}
</div>
```

**How it works:**

- As user scrolls near pagination element (within 10% margin)
- Loading triggers automatically
- New content appears seamlessly
- Process repeats until no more pages

## Attributes

| Attribute                        | Required | Description                                                                                                 |
| -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `data-load-more`                 | Yes      | Wrapper element for items; value must be unique per page to avoid conflicts (e.g., "newsCards", "products") |
| `data-load-more-pagination`      | Yes      | ID of the pagination container element                                                                      |
| `data-load-more-loader`          | Yes      | ID of the loader element that shows while loading                                                           |
| `data-load-more-trigger`         | Yes      | ID of the link/button that triggers next page load                                                          |
| `data-load-more-infinite-scroll` | No       | Set to `"true"` for automatic loading, `"false"` or omit for manual button click                            |

## Dynamic Content Support

The component integrates with DOMHelper for dynamically added load-more containers.

## Event System

The component dispatches custom events you can listen to:

### loadmore.loaded

Fired after new content is successfully loaded and appended:

```javascript
const wrapper = document.querySelector('[data-load-more="newsCards"]');

wrapper.addEventListener('loadmore.loaded', (e) => {
  console.log('New items loaded:', e.detail.elements);

  // e.detail.elements is an array of the newly added DOM elements
  e.detail.elements.forEach((element) => {
    // Initialize components on new elements
    // e.g., lazy load images, attach event listeners
  });
});
```

**Use cases:**

- Initialize components on newly loaded items (carousels, tooltips, etc.)
- Track analytics events
- Update counters or badges
- Trigger animations

### loadmore.finished

Fired when there are no more pages to load:

```javascript
wrapper.addEventListener('loadmore.finished', () => {
  console.log('All content loaded!');

  // Show "End of results" message
  const endMessage = document.createElement('p');
  endMessage.textContent = "You've reached the end!";
  wrapper.after(endMessage);
});
```

**Use cases:**

- Show "End of results" message
- Enable "Back to top" button
- Track completion analytics
- Hide pagination container

## Best Practices

### Unique IDs Per Page

Each load-more instance needs unique IDs:

```html
<!-- ✅ Good: Unique IDs -->
<div
  data-load-more="newsCards"
  data-load-more-pagination="newsPagination"
  data-load-more-loader="newsLoader"
  data-load-more-trigger="newsLoadMore"
>
  <!-- ❌ Bad: Reused IDs (if multiple instances) -->
  <div
    data-load-more="items"
    data-load-more-pagination="pagination"
    data-load-more-loader="loader"
    data-load-more-trigger="trigger"
  ></div>
</div>
```

### Server-Side Pagination

Ensure your backend supports paginated responses:

```twig
{# Craft CMS example #}
{% paginate craft.entries.section('news').limit(12) as pageInfo, entries %}

<div data-load-more="newsCards" ...>
  {% for entry in entries %}
    {# Render entry #}
  {% endfor %}
</div>

{% if pageInfo.nextUrl %}
  <a href="{{ pageInfo.nextUrl }}" id="loadMoreTrigger">Load More</a>
{% endif %}
```

### Progressive Enhancement

The trigger link works without JavaScript:

```html
<!-- Without JS: Normal pagination link -->
<!-- With JS: Hijacked for AJAX loading -->
<a href="/next-page" id="loadMoreTrigger">Load More</a>
```

If JavaScript fails, users can still click through pages normally.

### Performance: Limit Items Per Page

Don't load too many items at once.
Loading 100 items per page defeats the purpose and causes performance issues.

## Accessibility

### Keyboard Navigation

Ensure the trigger button is keyboard accessible:

```html
<button id="loadMoreTrigger" class="btn" type="button">Load More</button>
```

Or if using a link:

```html
<a href="/next-page" id="loadMoreTrigger" class="btn" role="button"> Load More </a>
```
