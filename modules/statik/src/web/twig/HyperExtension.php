<?php

namespace modules\statik\web\twig;

use Craft;
use craft\web\View;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use verbb\hyper\models\LinkCollection;

class HyperExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('render_hyper_links', [$this, 'renderHyperLinks']),
        ];
    }

    /**
     * @param array $options [
     *      'linkClass' => <string>(optional) Add extra classes to the individual links
     *      'divWrapper' => <bool>(default false) Should the links be individually wrapped in a div
     *      'divClass' => <string>(optional) the class of the div wrapping the links if divWrapper is true
     * ]
     */
    public function renderHyperLinks(LinkCollection $cta, array $options = []): string
    {
        $html = '';
        $extraLinkClass = $options['linkClass'] ?? '';

        foreach ($cta as $link) {
            $defaultLinkClass = $link->ctaFieldLinkLayouts ?? '';

            $html .= Craft::$app->view->renderTemplate(
                '_site/_snippet/_global/_hyperCta',
                [
                    'cta' => $link,
                    'classes' => trim($defaultLinkClass . ' ' . $extraLinkClass),
                    'options' => $options,
                ],
                View::TEMPLATE_MODE_SITE);
        }

        return $html;
    }
}
