<?php

namespace modules\statik\assetbundles\gridbuilder;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * Control panel layer for "Grid row" content builder blocks: shows the columns as a grid of the row's layout,
 * with empty columns, adding columns on the left/right and merging columns (see dist/js/GridBuilder.js).
 */
class GridBuilderAsset extends AssetBundle
{
    public function init(): void
    {
        $this->sourcePath = '@modules/statik/assetbundles/gridbuilder/dist';

        $this->depends = [
            CpAsset::class,
        ];

        $this->js = [
            'js/GridBuilder.js',
        ];

        $this->css = [
            'css/GridBuilder.css',
        ];

        parent::init();
    }
}
