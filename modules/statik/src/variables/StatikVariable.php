<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik\variables;

use craft\web\twig\variables\Cp;
use craft\web\View;
use modules\statik\assetbundles\cookie\CookieAsset;
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

    public function cookieRender() {
        Craft::$app->view->setTemplateMode( 'cp' );

        echo Craft::$app->view->renderTemplate('statik/_cookie/_banner');
        echo Craft::$app->view->renderTemplate('statik/_cookie/_modal');

        $js = Craft::$app->assetManager->getPublishedUrl('@modules/statik/assetbundles/cookie/dist/js', true, 'Cookie.js');
        Craft::$app->view->registerJsFile($js);

        $css = Craft::$app->assetManager->getPublishedUrl('@modules/statik/assetbundles/cookie/dist/css', true, 'Cookie.css');
        Craft::$app->view->registerCssFile($css);
    }

    // Render pagination template with options
    public function paginate($pageInfo, array $options = [])
    {
        Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);
        echo Craft::$app->view->renderTemplate('statik/_paginate/_render', [
            'pageInfo' => $pageInfo,
            'options' => $options,
        ]);

        Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);
    }

}
