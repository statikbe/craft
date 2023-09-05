<?php

namespace modules\statik\variables;

use Craft;
use craft\web\View;
use craft\helpers\ElementHelper;
use craft\web\twig\variables\Paginate;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class StatikVariable
{
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

    public function isBot(string $userAgent = '/bot|crawl|facebook|google|slurp|spider|mediapartners/i'): bool
    {
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            return $_SERVER['HTTP_USER_AGENT'] && preg_match($userAgent, $_SERVER['HTTP_USER_AGENT']);
        }
        return false;
    }

    /**
     * Create slugs from titles in contentbuilder for the anchor link
     * @param $string
     * @return string
     */
    public function slugify(string $string): string
    {
        return ElementHelper::generateSlug($string);
    }
}
