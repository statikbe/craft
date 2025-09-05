# Parallax

We used to have some javascript code to make this effect possible. But then CSS entered the room and made it possible to do it native in CSS.

For now only a [select set of browsers](https://caniuse.com/?search=animation-timeline) has this feature. [So for now we polyfill it with this javascript polyfill](https://github.com/flackr/scroll-timeline).

[Check this website for more information on animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)

## Example

<iframe src="../examples/parallax.html" height="400"></iframe>

## Code

You need to give an element a class of `parallax`to trigger the component.

```CSS
@keyframes progressbar {
    from {
        width: 0%;
    }
    to {
        width: 100%;
    }
}
@keyframes changeColor{
    0% {
        color: #000000;
    }
    20% {
        color: #FF0000;
    }
    80%{
        color: #00FF00;
    }
    100%{
        color: #000000;
    }
}
#progress.parallax {
    position: fixed;
    top: 0;
    left: 0;
    width: 50%;
    height: 10px;
    background-color: #6664CF;
    animation: progressbar linear both;
    animation-timeline: scroll();
}
.change-color{
    animation: changeColor linear both;
    animation-timeline: view(block 20% 20%);
}
```

```HTML
<div class="parallax" id="progress"></div>
<p>Aliqua excepteur dolor ipsum in eiusmod.</p>
<p>Pariatur cillum cillum nisi occaecat</p>
<p>Consequat magna sint irure ex enim</p>
<p class="change-color parallax">Reprehenderit sunt veniam aliquip commodo.</p>
<p>Exercitation dolore minim tempor quis mollit</p>
<p>Laboris quis ut aliquip nulla fugiat</p>
```
