<?php

namespace modules\statik\web\twig;

use Craft;
use craft\elements\Asset;
use craft\web\View;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Twig\Markup;

class ImageExtension extends AbstractExtension
{
    /** At most this many images (from the same query) get their transforms loaded in one go */
    private const MAX_PRELOAD = 200;

    /** @var array<string, true> Images whose transforms were loaded, by "assetId:signature of the transforms" */
    private static array $preloaded = [];

    public function getFunctions(): array
    {
        return [
            new TwigFunction('render_image', [$this, 'renderImages'], ['is_safe' => ['html']]),
            new TwigFunction('preload_image_transforms', [$this, 'preloadTransforms']),
        ];
    }

    /**
     * Renders an image asset with the specified options.
     *
     * @param Asset $image The image asset to render
     * @param array{
     *     generateAvif?: bool,
     *     avifQuality?: int,
     *     imageQuality?: int,
     *     srcsetSizes?: string|array,
     *     sizes?: string,
     *     aspectRatio?: string,
     *     pictureClass?: string,
     *     imageClass?: string,
     *     showPreview?: bool
     *     density?: int
     * } $options Optional array of rendering options
     * @return Markup The rendered image HTML markup
     */
    public function renderImages(Asset $image, array $options = []): Markup
    {
        $html = Craft::$app->view->renderTemplate(
            '_site/_snippet/_global/_image',
            [
                'image' => $image,
                'options' => $options,
            ],
            View::TEMPLATE_MODE_SITE);

        return new Markup($html, 'UTF-8');
    }

    /**
     * Loads the transform indexes that _global/_image.twig will use (the preview, src and every srcset width, per format) in one
     * query, for this image and the other images of the query it came from (a gallery's images, the images of a card grid
     * loaded with eagerly()). Those don't need a query of their own when they're rendered with the same options; without it,
     * Craft looks up every transform on its own (about 17 queries per image).
     *
     * The transforms are built the way _image.twig and Asset::getUrlsBySize() build them. One that doesn't match exactly is
     * looked up on its own, as without preloading. Not for 'x' srcset sizes, nor for a height in a non-crop mode (getSrcset()
     * then takes the height from the fitted image).
     *
     * @param array $options The render_image() options
     */
    public function preloadTransforms(Asset $image, array $options = []): void
    {
        $transforms = $this->transforms($options);
        $signature = md5(serialize($transforms));
        if (isset(self::$preloaded["$image->id:$signature"])) {
            return;
        }

        $siblings = array_filter(
            array_slice($image->elementQueryResult ?? [], 0, self::MAX_PRELOAD),
            fn($sibling) => $sibling instanceof Asset && !isset(self::$preloaded["$sibling->id:$signature"]),
        );
        $assets = [$image->id => $image];
        foreach ($siblings as $sibling) {
            $assets[$sibling->id] ??= $sibling;
        }
        $assets = array_filter($assets, fn(Asset $asset) => $asset->kind === Asset::KIND_IMAGE
            && !in_array(strtolower($asset->getExtension()), ['svg', 'gif'], true)
            && $asset->width && $asset->height);

        if (!$assets) {
            return;
        }
        $list = $transforms;
        if ($options['showPreview'] ?? true) {
            foreach ($assets as $asset) {
                $list[] = $this->previewTransform($asset);
            }
        }
        Craft::$app->getImageTransforms()->eagerLoadTransforms(array_values($assets), array_values(array_unique($list, SORT_REGULAR)));

        foreach ($assets as $asset) {
            self::$preloaded["$asset->id:$signature"] = true;
        }
    }

    /**
     * The transforms of _image.twig for these options: per format the base transform (src) and one per srcset width.
     */
    private function transforms(array $options): array
    {
        $images = Craft::$app->getImages();
        $mode = $options['mode'] ?? 'crop';
        $srcsetSizes = $options['srcsetSizes'] ?? ['480w', '660w', '820w', '1200w'];
        if (is_string($srcsetSizes)) {
            $srcsetSizes = array_map('trim', explode(',', $srcsetSizes));
        }
        $srcsetSizes = array_values($srcsetSizes);
        if (!$srcsetSizes) {
            return [];
        }
        $usesX = str_contains((string)end($srcsetSizes), 'x');

        // As _image.twig: the aspect ratio gives the largest size (before the density sizes are added) a height
        $aspectRatioOptions = [];
        $aspectRatio = $options['aspectRatio'] ?? '';
        if ($aspectRatio && !$usesX) {
            $parts = explode('/', $aspectRatio);
            $largestWidth = (float)rtrim((string)end($srcsetSizes), 'w');
            $aspectRatioOptions = ['width' => (int)$largestWidth, 'height' => (int)(($largestWidth / (float)$parts[0]) * (float)$parts[1])];
        }

        $density = (int)($options['density'] ?? 2);
        if ($density > 1 && !$usesX) {
            for ($i = 2; $i <= $density; $i++) {
                $srcsetSizes = array_merge($srcsetSizes, array_map(fn($size) => ((float)rtrim($size, 'w') * $i) . 'w', $srcsetSizes));
            }
        }

        $formats = [['quality' => $options['imageQuality'] ?? 80]];
        if ($images->getSupportsAvif() && ($options['generateAvif'] ?? true)) {
            $formats[] = ['format' => 'avif', 'quality' => $options['avifQuality'] ?? 75];
        }

        $transforms = [];
        foreach ($formats as $format) {
            $base = $format + ['mode' => $mode] + $aspectRatioOptions;
            $transforms[] = $base;
            if ($usesX || (isset($aspectRatioOptions['height']) && $mode !== 'crop')) {
                continue;
            }
            foreach ($srcsetSizes as $size) {
                $width = (int)rtrim($size, 'w');
                $transform = ['width' => $width] + $base;
                if (isset($aspectRatioOptions['height'])) {
                    $transform['height'] = (int)ceil($aspectRatioOptions['height'] * $width / $aspectRatioOptions['width']);
                }
                $transforms[] = $transform;
            }
        }

        return $transforms;
    }

    /**
     * The blurred preview of _image.twig: 120px on the longest side.
     */
    private function previewTransform(Asset $asset): array
    {
        if ($asset->width > $asset->height) {
            return ['width' => 120, 'height' => (int)floor(($asset->height / $asset->width) * 120), 'mode' => 'crop'];
        }
        return ['width' => (int)floor(($asset->width / $asset->height) * 120), 'height' => 120, 'mode' => 'crop'];
    }
}
