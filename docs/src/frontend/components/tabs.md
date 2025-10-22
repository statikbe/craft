# Tabs

This component makes it possible to have a tab-system to hide certain content behind a tab.

## Example

<iframe src="../../examples/tabs.html" height="260"></iframe>

```TWIG
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

## URL's

There is an option to activate a URL change with a hash to the currently selected tab. You can activate this feature with the attribute `data-update-hash`.

It also works the other way around when you go to the page with a hash in the URL that corresponds to the ID of a content block, this tab will be shown.

## Attributes

| Attribute          | Description                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-tabs`        | This triggers the component on a form element                                                                                                 |
| `data-first-tab`   | With this attribute you can select the selected tab on load. The default value is `0`. It's also a zero based index                           |
| `data-update-hash` | When this attribute is set to true the URL will reflect the selected tab with a hash                                                          |
| `data-panel`       | This attribute needs to be added to the buttons in the tablist. The value of these attributes are the IDs of the corresponding content blocks |

## Events

| Event         | Element          | Description                                                              |
| ------------- | ---------------- | ------------------------------------------------------------------------ |
| `tabs.change` | The tablist (UL) | This event is triggered on a tab change. It returns the activated button |
