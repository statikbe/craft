# Swiper slider

This component is a wrapper for the [slider component named swiper](https://swiperjs.com/swiper-api).

## Example

<iframe src="../examples/swiper.html" height="500"></iframe>

```TWIG
<div class="!-mx-2 swiper swiper-overflow">
    <div class="flex justify-end gap-12 py-5 pr-2">
        <button type="button" class="swiper-button-prev disabled:opacity-50">
            {{ icon('chevron-left', { class: 'text-primary text-4xl' }) }}
            <span class="sr-only">{{"Vorige"|t}}</span>
        </button>
        <button type="button" class="swiper-button-next disabled:opacity-50">
            {{ icon('chevron-right', { class: 'text-primary text-4xl' }) }}
            <span class="sr-only">{{"Volgende"|t}}</span>
        </button>
    </div>
    <div class="swiper-wrapper">
        {% set images = ["https://unsplash.it/400/400?random&gravity=center", "https://unsplash.it/401/401?random&gravity=center", "https://unsplash.it/402/402?random&gravity=center", "https://unsplash.it/403/403?random&gravity=center", "https://unsplash.it/404/404?random&gravity=center", "https://unsplash.it/405/405?random&gravity=center", "https://unsplash.it/406/406?random&gravity=center", "https://unsplash.it/407/407?random&gravity=center", "https://unsplash.it/408/408?random&gravity=center"] %}
        {% for image in images %}
            <div class="xs:!w-1/2 md:!w-1/3 px-2 swiper-slide">
                <img
                src="{{image}}" alt="" class="block aspect-square object-cover object-center"/>
            </div>
        {% endfor %}
    </div>
</div>
```
