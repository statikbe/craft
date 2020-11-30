<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik\assetbundles\Statik;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class StatikAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->sourcePath = "@modules/statik/assetbundles/Statik/dist";

        $this->depends = [
            CpAsset::class,
        ];

        $this->css = [
            'css/Statik.css',
        ];

        parent::init();
    }
}
