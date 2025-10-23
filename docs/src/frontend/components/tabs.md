# Tabs

An accessible tab system following the WAI-ARIA tabs pattern. Supports keyboard navigation, URL hash synchronization, and custom events. Automatically manages ARIA attributes and focus states for full accessibility compliance.

## Features

- ✅ **ARIA Tabs Pattern**: Complete WAI-ARIA implementation
- ✅ **Keyboard Navigation**: Arrow keys, Home, End support
- ✅ **URL Hash Sync**: Updates browser URL with active tab
- ✅ **Deep Linking**: Open specific tab via URL hash
- ✅ **Custom Events**: `tabs.change` event on tab changes
- ✅ **First Tab Selection**: Configure initially selected tab
- ✅ **ARIA Attributes**: `aria-selected`, `role="tablist"`, `role="tabpanel"`
- ✅ **Focus Management**: Proper focus indicators and trap
- ✅ **Dynamic Content**: Works with AJAX-loaded tabs
- ✅ **Auto-Initialize**: Detects `data-tabs` attribute

## How It Works

### ARIA Pattern

Follows W3C WAI-ARIA tabs specification:

```html
<!-- Tablist (ul) -->
<ul role="tablist" data-tabs>
  <!-- Tab button -->
  <li role="presentation">
    <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1" data-panel="panel1">Tab 1</button>
  </li>
</ul>

<!-- Tab panel (content) -->
<div role="tabpanel" id="panel1" aria-labelledby="tab1">Content</div>
```

### Initialization

1. Finds all elements with `data-tabs` attribute
2. Reads `data-first-tab` for initially selected tab (default: 0)
3. Reads `data-update-hash` for URL synchronization
4. Collects all buttons with `data-panel` attribute
5. Sets up ARIA roles and attributes
6. Selects first tab or tab from URL hash
7. Adds keyboard and click event listeners
8. Hides all panels except active one

## Example

<iframe src="../../examples/tabs.html" height="260"></iframe>

```twig
<ul class="flex flex-wrap mb-6" data-tabs data-first-tab="0" data-update-hash="true">
    <li class="">
        <button type="button" class="w-full px-5 py-3 text-base font-normal text-primary bg-white-50 aria-selected:bg-primary aria-selected:text-white" data-panel="Tab1">
            Tab 1
        </button>
    </li>
    <li class="">
        <button type="button" class="w-full px-5 py-3 text-base font-normal text-primary bg-white-50 aria-selected:bg-primary aria-selected:text-white" data-panel="Tab2">
            Tab 2
        </button>
    </li>
    <li class="">
        <button type="button" class="w-full px-5 py-3 text-base font-normal text-primary bg-white-50 aria-selected:bg-primary aria-selected:text-white" data-panel="Tab3">
            Tab 3
        </button>
    </li>
    <li class="">
        <button type="button" class="w-full px-5 py-3 text-base font-normal text-primary bg-white-50 aria-selected:bg-primary aria-selected:text-white" data-panel="Tab4">
            Tab 4
        </button>
    </li>
</ul>
<div class="hidden " id="Tab1">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima modi velit, ad hic voluptate odio asperiores necessitatibus. Voluptate inventore illo, exercitationem magni quos nesciunt voluptates accusamus veniam nobis excepturi ullam explicabo est, a porro quia consequuntur dicta. Nihil rerum iusto illo necessitatibus, voluptates eos aliquid voluptatibus iste dolores minima placeat!
</div>
<div class="hidden " id="Tab2">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quos consequatur ex praesentium inventore error non fugit excepturi blanditiis ut.
</div>
<div class="hidden " id="Tab3">
    Voluptate inventore illo, exercitationem magni quos nesciunt voluptates accusamus veniam nobis excepturi ullam explicabo est, a porro quia consequuntur dicta. Nihil rerum iusto illo necessitatibus, voluptates eos aliquid voluptatibus iste dolores minima placeat!
</div>
<div class="hidden " id="Tab4">
    Consequuntur quae amet minus ipsa facilis architecto assumenda molestias. Eius ab maxime quis voluptas, excepturi iste sunt cum? Voluptas, ducimus illo eum omnis aspernatur a repudiandae placeat. Praesentium sunt laboriosam possimus minima necessitatibus.
</div>
```

## Data Attributes

| Attribute          | Type      | Default | Description                                              |
| ------------------ | --------- | ------- | -------------------------------------------------------- |
| `data-tabs`        | Boolean   | —       | **Required**. On `<ul>` element to enable tabs component |
| `data-first-tab`   | Number    | `0`     | Zero-based index of initially selected tab               |
| `data-update-hash` | Boolean   | `false` | Updates URL hash with active tab ID                      |
| `data-panel`       | ID string | —       | **Required on buttons**. ID of the content panel to show |

## Styling

### Tailwind Styling

Use `aria-selected:` prefix for selected state:

```html
<button
  data-panel="tab1"
  class="px-4 py-2
         text-gray-600 aria-selected:text-blue-600
         border-b-2 border-transparent aria-selected:border-blue-600
         aria-selected:font-semibold
         hover:bg-gray-50
         transition-colors"
>
  Tab 1
</button>
```

## Events

### tabs.change Event

Dispatched on tablist when active tab changes:

```typescript
const tablist = document.querySelector('[data-tabs]') as HTMLElement;

tablist.addEventListener('tabs.change', (e: CustomEvent) => {
  const { button, panel } = e.detail;

  console.log('Active tab:', button.textContent);
  console.log('Active panel:', panel.id);

  // Analytics
  gtag('event', 'tab_change', {
    tab_name: panel.id,
  });
});
```

### Example Usage

```html
<ul id="productTabs" data-tabs>
  <li><button data-panel="desc">Description</button></li>
  <li><button data-panel="reviews">Reviews</button></li>
</ul>

<script>
  const tabs = document.getElementById('productTabs');

  tabs.addEventListener('tabs.change', (e) => {
    const panelId = e.detail.panel.id;

    if (panelId === 'reviews') {
      // Load reviews dynamically
      loadReviews();
    }
  });
</script>
```

## Accessibility

### ARIA Roles

Component automatically adds:

```html
<!-- Tablist -->
<ul role="tablist" data-tabs>
  <!-- Tab -->
  <li role="presentation">
    <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">Tab 1</button>
  </li>
</ul>

<!-- Panel -->
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">Content</div>
```

### Screen Reader Support

- **Tab role**: Announced as "tab"
- **aria-selected**: "selected" announced for active tab
- **aria-controls**: Links tab to panel
- **aria-labelledby**: Panel labeled by tab
- **Keyboard navigation**: Arrows, Home, End work

## URL's

There is an option to activate a URL change with a hash to the currently selected tab. You can activate this feature with the attribute `data-update-hash`.

It also works the other way around when you go to the page with a hash in the URL that corresponds to the ID of a content block, this tab will be shown.
