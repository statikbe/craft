# Video toggle

This component is meant to provide an option to load video embeds only on demand. There will be a placeholder image with a play button. When clicked the video will be loaded and starts to play.

This component gets used in the video and text-video content builder blocks. So you can look there for some concrete examples.

## Examples

### Basic toggle

<iframe src="../examples/videoToggleBasic.html" height="420"></iframe>

```TWIG
<div class="relative bg-gray-200 aspect-video" id="video">
    <div class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        {% set embed = craft.videoparser.parse("https://www.youtube.com/watch?v=r2GZHjFBhp4") %}
        {% if embed %}
        <button type="button" class="px-4 py-2 bg-white rounded"
                data-video-toggle="{{embed.embedSrc}}"
                data-video-toggle-container="#video">
            {{ icon('play-arrow', { class: 'ml-2 text-xl' }) }}  {{ 'Play video'|t }}
        </button>
        {% endif %}
    </div>
</div>
```

### Toggle with growing screen

<iframe src="../examples/videoToggleGrow.html" height="420"></iframe>

```TWIG
<div class="relative h-20 bg-gray-200 transition-all duration-300 ease-in-out" id="video">
    <div class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        {% set embed = craft.videoparser.parse("https://www.youtube.com/watch?v=r2GZHjFBhp4") %}
        {% if embed %}
        <button type="button" class="px-4 py-2 bg-white rounded"
                data-video-toggle="{{embed.embedSrc}}"
                data-video-toggle-container="#video"
                data-video-toggle-aspect-ratio="16:9">
            {{ icon('play-arrow', { class: 'ml-2 text-xl' }) }} {{ 'Play video'|t }}
        </button>
        {% endif %}
    </div>
</div>
```

### Keep the trigger button

<iframe src="../examples/videoToggleVisibleTrigger.html" height="500"></iframe>

```TWIG
<div class="relative h-20 bg-gray-200">
    <div class="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        {% set embed = craft.videoparser.parse("https://www.youtube.com/watch?v=r2GZHjFBhp4") %}
        {% if embed %}
        <button type="button" class="px-4 py-2 bg-white rounded"
                data-video-toggle="{{embed.embedSrc}}"
                data-video-toggle-container="#video"
                data-video-toggle-aspect-ratio="16:9"
                data-video-toggle-hide-trigger="false"
                data-video-toggle-toggle-content='{{ svg("@webroot/frontend/icons/clear.svg")|attr({class: "icon ml-2 text-xl"}) }} {{ "Stop video"|t }}'>
            {{ icon('play-arrow', { class: 'ml-2 text-xl' }) }} {{ 'Play video'|t }}
        </button>
        {% endif %}
    </div>
</div>
<div id="video"></div>
```

| Attribute                             | Description                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `data-video-toggle`                   | This attribute triggers the component and contains url to the video                                                                      |
| `data-video-toggle-container`         | The ID of the element where the video will be loaded                                                                                     |
| `data-video-toggle-aspect-ratio`      | The aspect ratio that the container needs to get when the video is loaded                                                                |
| `data-video-toggle-hide-trigger`      | The trigger button is by default removed when clicked. Putting this attribute to false leaves the button                                 |
| `data-video-toggle-toggle-content`    | The content the trigger button gets when the button is show and the video is shown                                                       |
| `data-video-toggle-show-close-button` | By default, a close button will be shown when the video is loaded. When this attribute is set to false, the close button will be hidden. |
