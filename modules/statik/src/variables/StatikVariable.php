<?php

namespace modules\statik\variables;

use craft\helpers\ElementHelper;
use craft\web\twig\variables\Cp;
use craft\web\twig\variables\Paginate;
use craft\web\View;
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

        echo Craft::$app->view->renderTemplate('_site/_snippet/_global/_paginate', [
            'pageInfo' => $pageInfo,
            'options' => $options,
        ],View::TEMPLATE_MODE_SITE);

        return null;
    }

    public function isBot($userAgent = '/bot|crawl|facebook|google|slurp|spider|mediapartners/i')
    {
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            return $_SERVER['HTTP_USER_AGENT'] && preg_match($userAgent, $_SERVER['HTTP_USER_AGENT']);
        }
        return false;
    }
    public function isIE()
    {
        return $this->isBot("/Trident/i");
    }


    /**
     * Create slugs from titles in contentbuilder for the anchor link
     * @param $string
     * @return string
     */
    public function slugify($string) {
        return ElementHelper::generateSlug($string);
    }

    // public function getIconSpritePath($base){

    //     $matches = glob(CRAFT_BASE_PATH . '/public/icon/sprite.*.svg');
    //     $matches = array_filter($matches);
    //     if(!$matches) {

    //     }
    //     $path = explode("/",$matches[0]);
    //     $file = end($path);
    //     return "/icon/" . $file;
    // }
}
