<?php

namespace modules\statik\variables;

use craft\web\twig\variables\Cp;
use craft\web\twig\variables\Paginate;
use craft\web\View;
use modules\statik\services\SlugifyService;
use modules\statik\Statik;

use Craft;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class StatikVariable
{
    public function revision(): string
    {
        return Statik::getInstance()->revision->getVersion();
    }

    /**
     * Render pagination template with options
     * @param Paginate $pageInfo
     * @param array $options
     * @return null
     * @throws \Twig\Error\LoaderError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\SyntaxError
     * @throws \yii\base\Exception
     */
    public function paginate(Paginate $pageInfo, array $options = [])
    {
        if (!$pageInfo->total) {
            return false;
        }

        Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);
        echo Craft::$app->view->renderTemplate('statik/_paginate/_render', [
            'pageInfo' => $pageInfo,
            'options' => $options,
        ]);

        Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);
        return null;
    }

    public function isBot($userAgent = '/bot|crawl|facebook|google|slurp|spider|mediapartners/i')
    {
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            if ($_SERVER['HTTP_USER_AGENT'] &&
                preg_match($userAgent, $_SERVER['HTTP_USER_AGENT'])) {
                return true;
            }
            return false;
        }
        return false;
    }

    // create slugs from titles in contentbuilder for the anchor link
    public function slugify($string) {
        return SlugifyService::instance()->createSlug($string);
    }
}
