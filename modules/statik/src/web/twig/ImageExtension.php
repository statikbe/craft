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
    public function getFunctions(): array
    {
        return [
            new TwigFunction('render_image', [$this, 'renderImages'], ['is_safe' => ['html']]),
        ];
    }

    /**
     * Renders an image asset with the specified options.
     *
     * @param Asset $image The image asset to render
     * @param array{
     *     generateAvif?: bool,
     *     avifQuality?: int,
     *     generateWebP?: bool,
     *     webpQuality?: int,
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
}
