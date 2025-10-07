# Video Background

This component handles video playback for youtube and vimeo in the background of an element.

## Example youtube

<iframe src="../examples/videoBackgroundYoutube.html" height="330"></iframe>

```twig
{% set embed = craft.videoparser.parse(block.video) %}
<div class="p-12" id="videoWrapper">
    <div data-youtube-id="{{embed.id}}" data-video-bg="videoWrapper" data-video-controls="videoControls"></div>
    <div class="text-white">
        <h3>This is a youtube video in the background</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
    </div>
    <div class="flex justify-end">
        <button type="button" class="text-white text-3xl group" id="videoControls">
        {{ icon('play', { class: 'hidden group-data-paused:block' }) }}
        <span class="sr-only hidden group-data-paused:block">Play Video</span>
        {{ icon('pause', { class: 'hidden group-data-playing:block' }) }}
        <span class="sr-only hidden group-data-playing:block">Pause Video</span>
        </button>
    </div>
</div>
```

## Example vimeo

<iframe src="../examples/videoBackgroundVimeo.html" height="330"></iframe>

```twig
{% set embed = craft.videoparser.parse(block.video) %}
<div class="p-12" id="videoWrapperVimeo">
    <div data-vimeo-id="{{embed.id}}" data-video-bg="videoWrapperVimeo" data-video-controls="videoControlsVimeo"></div>
    <div class="text-white">
        <h3>This is a Vimeo video in the background</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis iste perspiciatis, incidunt vero non nobis possimus sapiente autem sed itaque aut vel, eius cum quo veritatis dolores, necessitatibus aliquid assumenda id hic soluta nihil unde? Labore eveniet voluptas cumque quam.</p>
    </div>
    <div class="flex justify-end">
        <button type="button" class="text-white text-3xl group" id="videoControlsVimeo">
        {{ icon('play', { class: 'hidden group-data-paused:block' }) }}
        <span class="sr-only hidden group-data-paused:block">Play Video</span>
        {{ icon('pause', { class: 'hidden group-data-playing:block' }) }}
        <span class="sr-only hidden group-data-playing:block">Pause Video</span>
        </button>
    </div>
</div>
```

## Toggle button

The video controls button gets two different attributes depending on the state: `data-paused` and `data-playing`.

## Attributes

| Attribute             | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `data-video-bg`       | This attribute triggers the component and contains the id of the wrapper   |
| `data-video-controls` | The ID of the button that controls the video. This is a required attribute |
