<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik\assetbundles\cookie;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class CookieAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->sourcePath = "@modules/statik/assetbundles/cookie/dist";

        $this->depends = [
            CpAsset::class,
        ];

        $this->js = [
            'js/Cookie.js',
        ];

        $this->css = [
            'css/Cookie.css',
        ];

        parent::init();
    }
}
