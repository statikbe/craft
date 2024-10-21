# Scroll to Anchor

The scroll to anchor component allows you to smoothly scroll to an anchor on the page when a link is clicked. Below, you'll find details on how to use the component, including examples and descriptions of its attributes.

## Example

<iframe src="../examples/smoothScroll.html" height="250"></iframe>

```html
<h2 id="top">
  <a href="#bottom" data-smooth-scroll>Scroll to bottom</a>
</h2>

<p>
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Libero, impedit cupiditate nulla facilis voluptates quisquam
  dicta animi. Aperiam saepe rem architecto vitae ea quis blanditiis reprehenderit optio facilis, labore tenetur
  corrupti nam incidunt eum, ex corporis pariatur iste quisquam fuga laborum ipsum? Quo at, nostrum vero ipsam debitis
  vel animi.
</p>
<p>
  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Libero, impedit cupiditate nulla facilis voluptates quisquam
  dicta animi. Aperiam saepe rem architecto vitae ea quis blanditiis reprehenderit optio facilis, labore tenetur
  corrupti nam incidunt eum, ex corporis pariatur iste quisquam fuga laborum ipsum? Quo at, nostrum vero ipsam debitis
  vel animi.
</p>
...

<h2 id="bottom">
  <a href="#top" data-smooth-scroll data-scroll-duration="2000">Scroll to top</a>
</h2>
```

## Attributes

Below is a table describing the attributes you can use with the scroll to anchor component. These attributes control the behavior of the smooth scrolling.
| Attribute | Description |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `data-smooth-scroll` | This attribute is placed on the link element to enable smooth scrolling. |
| `data-scroll-duration` | This optional attribute sets the duration of the smooth scroll animation in milliseconds. If not provided, it defaults to 400 milliseconds. |
