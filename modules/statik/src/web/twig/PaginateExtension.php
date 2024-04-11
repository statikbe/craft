<?php

namespace modules\statik\web\twig;

use Craft;
use craft\web\twig\variables\Paginate;
use craft\web\View;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class PaginateExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('render_pagination', [$this, 'paginate']),
        ];
    }

    /**
     * Render pagination template with options
     * @param array $options to pass to the template
     * @throws \Twig\Error\LoaderError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\SyntaxError
     * @throws \yii\base\Exception
     */
    public function paginate(Paginate $pageInfo, array $options = []): string
    {
        if (!$pageInfo->total) {
            return '';
        }

        return Craft::$app->view->renderTemplate('_site/_snippet/_global/_paginate', [
            'pageInfo' => $pageInfo,
            'options' => $options,
        ], View::TEMPLATE_MODE_SITE);
    }
}
