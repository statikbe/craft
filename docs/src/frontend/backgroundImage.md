# Background Image

Sometimes you want to load an image with the right resolution and compression and when loaded put it in the background of an element. This component does just that.

I recommend to only use this if a normal image with the use of `.object-cover` is not possible. Some examples are given how to use it with the Craft focal point.

## Examples

<iframe src="../examples/backgroundImage.html" height="400"></iframe>

## Code

```TWIG
{% set image = block.image.collect().first() ? block.image.collect().first() : fallback.image.one() %}
{% set optimizedImage = image.optimizedTextImage %}
{% if optimizedImage|length %}
    <div class="aspect-video" data-bg-image
            style="{% if optimizedImage.colorPalette %}background-color: {{ optimizedImage.colorPalette[0] }};{% endif %} background-position: {% for focalPoint in image.getFocalPoint() %} {{ focalPoint * 100 }}% {% endfor %};">
        <picture>
            {% if craft.imageOptimize.serverSupportsWebP() and image.extension != 'svg' and image.extension != 'gif' and image.extension != 'webp' %}
                <source srcset="{{ optimizedImage.srcsetWebP() }}"
                        sizes="(max-width: 479px) 95vw, (min-width: 480px) and (max-width: 659px) 448px, (min-width: 660px) and (max-width: 819px) 628px, (min-width: 820px) and (max-width: 979px) 378px, (min-width: 980px) and (max-width: 1199px) 458px, (min-width: 1200px) 568px"
                        type="image/webp"/>
            {% endif %}
            <img src="{{ optimizedImage.optimizedImageUrls|length == 0 ? image.getUrl() : optimizedImage.placeholderBox() }}"
                    srcset="{{ optimizedImage.srcset() }}"
                    sizes="(max-width: 479px) 95vw, (min-width: 480px) and (max-width: 659px) 448px, (min-width: 660px) and (max-width: 819px) 628px, (min-width: 820px) and (max-width: 979px) 378px, (min-width: 980px) and (max-width: 1199px) 458px, (min-width: 1200px) 568px"
                    alt="{{ image.alt }}"
                    class="sr-only" loading="lazy"/>
        </picture>
    </div>
{% endif %}
```

## How it works

You add the attribute `data-bg-image`to the wrapper element that needs the image in the background. It will find the image nested within and use this to put in the background once it is loaded.

You can also give the attribute a value of an ID of an image if the image is not nested within the element of need of a background. A small example of this is given below.

```HTML
<div class="text-white bg-center bg-cover hero" data-bg-image="unNestedImage">
    <h1>Content</h1>
    <p>Curabitur blandit tempus porttitor</p>
</div>
<img src="https://unsplash.it/2000/350?random&gravity=center" sizes="100vw" alt="" class="sr-only" id="unNestedImage">
```

## Better alternative

In a lot of cases you don't need an image in the background and you can just use the image with the classes `object-cover` and `object-center`. When the image has a Craft focal point you can not use `object-center`. But you can use the CSS property `object-position`.

An example of what this code would look like.

```TWIG
{% set image = entry.headerImage.one() %}
{% set optimizedImage = image.optimizedContent %}
<picture>
    {% set sizes = "(max-width: 479px) 95vw, (min-width: 480px) and (max-width: 659px) 628px, (min-width: 660px) and (max-width: 819px) 628px, (min-width: 820px) and (max-width: 979px) 788px, (min-width: 980px) and (max-width: 1199px) 948px, (min-width: 1200px) 1168px" %}
    {% if craft.imageOptimize.serverSupportsWebP() and image.extension != 'svg' and image.extension != 'gif' %}
        <source srcset="{{ optimizedImage.srcsetWebP() }}"
                sizes="{{sizes}}"
                type="image/webp"/>
    {% endif %}
    {% if image.extension == 'svg' or image.extension == 'gif' %}
        <img src="{{ image.getUrl() }}"
                width="{{image.width}}" height="{{image.height}}"
                alt="{{ image.alt }}"
                class="w-full object-cover block aspect-video"
                style="object-position: {% for focalPoint in image.getFocalPoint() %} {{ focalPoint * 100 }}% {% endfor %};"
                loading="lazy"/>
    {% else %}
        <img src="{{ optimizedImage.optimizedImageUrls|length == 0 ? image.getUrl() : optimizedImage.placeholderBox() }}"
                srcset="{{ optimizedImage.srcset() }}"
                sizes="{{sizes}}"
                width="{{optimizedImage.placeholderWidth}}" height="{{optimizedImage.placeholderHeight}}"
                alt="{{ image.alt }}"
                class="w-full object-cover block aspect-video"
                style="object-position: {% for focalPoint in image.getFocalPoint() %} {{ focalPoint * 100 }}% {% endfor %};"
                loading="lazy"/>
    {% endif %}
</picture>
```

## Attributes

Below is a table describing the attributes you can use with the load more component.

| Attribute       | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `data-bg-image` | This triggers the component. This can have a value of an ID of an image. |
