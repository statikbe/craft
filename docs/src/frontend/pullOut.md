# Pullout

Sometimes you want to pull an element out of the container grid. And you want to do this for different breakpoints. We used to have a javascript component for this. But it turns out that you can all this with just some CSS magic.

So we now have a tailwind css utility you can use.

<a href="../examples/pullout.html" target="_blank">You can view an example here</a>

## Example code

```HTML
<div class="section section--default">
    <div class="container bg-gray-200 py-10">
        <div class="flex flex-wrap">
            <div class="w-full md:w-1/2 pullout pullout--both md:pullout--left-1/2">
                <div class="md:pr-4">
                    <img src="https://unsplash.it/800/600?random" alt="" class="w-full"/>
                </div>
            </div>
            <div class="w-full mt-6 md:w-1/2 md:mt-0 pullout pullout--both md:pullout--right-1/2 [--pullout-amount:100vw] md:[--pullout-amount:30px] lg:[--pullout-amount:130px]">
                <div class="md:pl-4">
                    <img src="https://unsplash.it/800/600?random" alt="" class="w-full"/>
                </div>
            </div>
        </div>
    </div>
</div>
```

The pullout element always needs one direct child. It will be this element that gets pulled out of the pullout element.
All the CSS is applied on the parent element.

The main class you need to apply is `pullout`.

## Class

| Class                      | Description                                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pullout`                  | Class to initialize the pullout                                                                                                                                                                                     |
| `pullout--both`            | This class pulls out an element to the left and the right. this only works for full width elements within the container                                                                                             |
| `pullout--left-1/2`        | This pulls the element to the left. The last part of the class is a fraction. This fraction needs to be the same width as the element. Like in the example is the element w-1/2 so the pullout needs to be for 1/2  |
| `pullout--right-1/2`       | This pulls the element to the right. The last part of the class is a fraction. This fraction needs to be the same width as the element. Like in the example is the element w-1/2 so the pullout needs to be for 1/2 |
| `[--pullout-amount:130px]` | Default the pullout is to the edge of the page. But you can limit that to a maximum value by setting the variable `--pullout-amount`                                                                                |

## Responsiveness

All the classes can be used with default prefixes build into tailwind css like for example `md:pullout--left-1/2`.
