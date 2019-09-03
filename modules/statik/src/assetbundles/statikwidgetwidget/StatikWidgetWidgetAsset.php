<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik\assetbundles\statikwidgetwidget;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class StatikWidgetWidgetAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->sourcePath = "@modules/statik/assetbundles/statikwidgetwidget/dist";

        $this->depends = [
            CpAsset::class,
        ];

        $this->js = [
            'js/StatikWidget.js',
        ];

        $this->css = [
            'css/StatikWidget.css',
        ];

        parent::init();
    }
}
