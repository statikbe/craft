# Image Extension

Two Twig functions for responsive images: `render_image()` renders an image asset as a `<picture>` with AVIF and a srcset, and
`preload_image_transforms()` loads the transforms of a whole set of images in one query.

## render_image()

```twig
{{ render_image(image, options) }}
```

| Parameter | Type    | Description                  |
| --------- | ------- | ---------------------------- |
| `image`   | `Asset` | The image asset to render    |
| `options` | `array` | Optional, see the table below |

It renders `templates/_site/_snippet/_global/_image.twig` with `image` and `options`, and returns the HTML (marked as safe, no
`|raw` needed). The template works on a copy of the asset, so the transform it sets doesn't change the same image elsewhere
on the page.

### Options

| Option             | Type             | Default                              | Description |
| ------------------ | ---------------- | ------------------------------------ | ----------- |
| `sizes`            | `string`         | `'100vw'`                            | The `sizes` attribute: how wide the image is shown per viewport |
| `srcsetSizes`      | `array`          | `['480w', '660w', '820w', '1200w']`  | The widths of the srcset, smallest first; `x` sizes (`['1x', '2x']`) work too |
| `density`          | `int`            | `2`                                  | Adds every width × 2 (up to × `density`) for high-density screens. `1` turns it off; ignored for `x` sizes |
| `aspectRatio`      | `string`         | `''`                                 | E.g. `'16/9'`: the transforms are cropped to this ratio, and the `<picture>` and `<img>` get `aspect-ratio` and `object-cover` |
| `applyAspectRatio` | `bool`           | `true`                               | `false`: crop the transforms to the ratio, but leave the `aspect-ratio` style off (the CSS sets the size) |
| `mode`             | `string`         | `'crop'`                             | The transform mode: `crop`, `fit`, `letterbox` |
| `imageQuality`     | `int`            | `80`                                 | Quality of the JPEG/PNG/WebP transforms |
| `generateAvif`     | `bool`           | `true`                               | Adds an AVIF `<source>` when the server supports AVIF |
| `avifQuality`      | `int`            | `75`                                 | Quality of the AVIF transforms |
| `showPreview`      | `bool`           | `true`                               | A blurred 120px version as the background of the `<picture>` while the image loads (not for PNG) |
| `pictureClass`     | `string`         | `'w-full block bg-cover bg-center'`  | Classes of the `<picture>`; replaces the default |
| `imageClass`       | `string`         | `'w-full block'`                     | Classes of the `<img>`; replaces the default |
| `imageStyle`       | `string`         | `''`                                 | Inline style of the `<img>` (e.g. an `object-position`), used when no aspect ratio style is set |
| `alt`              | `string`         | the asset's `alt`, else `''`         | The alt text |
| `id`               | `string`         | none                                 | The `id` of the `<img>` |
| `loading`          | `string`         | `'lazy'`                             | `'eager'` for the image a visitor sees first (the hero) |
| `fetchPriority`    | `string`         | none                                 | `'high'` together with `loading: 'eager'` |

Pass `srcsetSizes` as an array. A comma-separated string from a macro needs `|split(',')`, as the page header does.

### SVG and GIF

SVG and GIF images aren't transformed: they get a plain `<picture>` with an `<img>` of the original file, with the classes,
`aspectRatio`, `alt`, `loading` and `fetchPriority` options.

### Usage

A column of the content builder: Trinity gives the column's `sizes` and `srcsetSizes` (`templates/_site/_snippet/_content/_grid/_image.twig`):

```twig
{{ render_image(image, {
    sizes: column.sizes,
    srcsetSizes: column.srcsetSizes,
    pictureClass: "w-full block",
}) }}
```

A card image in 16:9 (`templates/_site/_snippet/_item/_cards/_default.twig`):

```twig
{{ render_image(overviewImage, {
    sizes: sizes,
    aspectRatio: '16/9',
    srcsetSizes: srcsetSizes,
    pictureClass: 'rounded-card-image w-full overflow-clip block before:rounded-card-image before:overflow-clip',
}) }}
```

The hero image, at the top of the page (`templates/_site/_snippet/_content/_pageHeader.twig`):

```twig
{{ render_image(headerImage, {
    showPreview: false,
    loading: 'eager',
    fetchPriority: 'high',
    imageClass: 'block w-full h-full object-cover',
    sizes: containedSizes,
    srcsetSizes: imageSizes.srcsetSizes(containedSizes)|split(','),
}) }}
```

An icon on a card, scaled to fit instead of cropped:

```twig
{{ render_image(cardImage, {
    mode: 'fit',
    showPreview: false,
    imageClass: 'block w-full h-full object-contain object-left',
}) }}
```

For the `sizes` of an item in a grid (a gallery image, a card), use the macros in `templates/_site/_snippet/_macros/_imageSizes.twig`;
see [Partials and macros](../templates/partials).

## preload_image_transforms()

```twig
{% do preload_image_transforms(image, options) %}
```

Without it, Craft looks up every transform of an image on its own: the preview, the `src` and every srcset width, per format,
about 17 queries per image. This function loads them in one query, for this image and the other images of the query it came
from (a gallery's images, the images of a card grid loaded with `eagerly()`), up to 200. Those then need no queries of their
own when they're rendered with the same options.

`_image.twig` calls it for every image, so `render_image()` already does this; you don't need to call it yourself. Call it only
when you render images with the same options in your own template, without `render_image()`.

It builds the transforms the way `_image.twig` does. A transform that doesn't match exactly is looked up on its own, as without
preloading. It skips `x` srcset sizes, a height in a mode other than `crop`, SVGs, GIFs and images without a width and height.

## Image Resizer

The [Image Resizer](https://github.com/verbb/image-resizer) plugin resizes images when they're uploaded, to at most 3500 × 3500
pixels (`config/image-resizer.php`), so the transforms start from a reasonable original. The transforms themselves are Craft's
own image transforms.

## Source

- `modules/statik/src/web/twig/ImageExtension.php`
- `templates/_site/_snippet/_global/_image.twig`
