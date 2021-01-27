<?php

namespace modules\statik\assetbundles\anchorlinkfield;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;


class AnchorLinkFieldAsset extends AssetBundle
{

    public function init()
    {
        // define the path that your publishable resources live
        $this->sourcePath = "@modules/statik/assetbundles/anchorlinkfield/dist";

        // define the dependencies
        $this->depends = [
            CpAsset::class,
        ];

        // define the relative path to CSS/JS files that should be registered with the page
        // when this asset bundle is registered
        $this->js = [
            'js/AnchorLink.js',
        ];

        $this->css = [
            'css/AnchorLink.css',
        ];

        parent::init();
    }
}
