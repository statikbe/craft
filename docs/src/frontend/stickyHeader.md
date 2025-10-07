# Sticky header

A very basic sticky header you can do with the CSS property `position: sticky`.

[You can read more information about sticky here.](https://developer.mozilla.org/en-US/docs/Web/CSS/position)

## So why this component?

This component adds the extra ability to hide the header when scrolling down but reveal it when scrolling up. For now this can only be done with some javascript magic.

## Example

This is an example of a header that reveals itself on scrolling up.

<iframe src="../examples/stickyHeaderScrollUp.html" height="400"></iframe>

```html
<header
  class="bg-red-500 z-10 sticky -top-40 data-show:top-0 transition-all duration-500 ease-in-out"
  data-sticky-header-reveal
>
  <div class="p-6">This is the header</div>
</header>
<div>Content</div>
```

Notice the `data-show:` prefix. This custom data attribute is dynamically added to the header element by JavaScript when the user scrolls up, and removed when scrolling down. In your CSS, you can use selectors like `[data-show]` or classes prefixed with `data-show:` to apply styles that reveal or hide the header based on its presence, allowing for smooth transitions and interactive behavior.

## Example of shrinking header

This example can be done with 100% CSS in modern browsers. We need the parallax polyfill for older browsers.

<iframe src="../examples/stickyHeaderScrollShrink.html" height="400"></iframe>

```CSS
@keyframes headerAni {
    to{
        height: 60px;
    }
}
header{
    height: 100px;
    animation: headerAni linear both;
    animation-timeline: scroll(block root);
    animation-range: 0px 100px;
}
```

```HTML
<header class="bg-red-500 z-10 sticky top-0 parallax p-3 flex justify-between">
    <a href="{{ siteUrl }}" class="w-20 bg-blue-500 flex items-center justify-center">
        Site logo
    </a>
    <ul class="flex flex-wrap space-x-6 items-center">
        <li class=""><a href="#">item 1</a></li>
        <li class=""><a href="#">item 2</a></li>
        <li class=""><a href="#">item 3</a></li>
        <li class=""><a href="#">item 4</a></li>
        <li class=""><a href="#">item 5</a></li>
    </ul>
</header>
<div>
Content
</div>
```

## Attributes

| Attribute                   | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `data-sticky-header-reveal` | Triggers the javascript code for the scroll up mechanism |
