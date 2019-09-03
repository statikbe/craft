<?php
/**
 * Control Panel Body Classes plugin for Craft CMS
 *
 * Adds special classes to the Control Panel's <body> tag.
 *
 * @author    Double Secret Agency
 * @link      https://www.doublesecretagency.com/
 * @copyright Copyright (c) 2015 Double Secret Agency
 */

namespace modules\statik\services;

use Craft;
use craft\base\Component;

use yii\web\IdentityInterface;

/**
 * Class BodyClasses
 * @since 2.0.0
 */
class BodyClasses extends Component
{

    /** @var array  $bodyClasses  Collection of classes to be applied. */
    public $bodyClasses = [];


    public function classCurrentSiteGroup()
    {
        //$siteGroup = Craft::$app->sites->getCurrentSite()->id;
        //$this->_addClass('site-group', $siteGroup);
    }

    // ======================================================================== //

    /**
     * Append body class to master array.
     *
     * @param string  $prefix  Prefix to show the class purpose.
     * @param string  $class   Non-prefixed class.
     *
     * @return void
     */
    private function _addClass($prefix, $class)
    {
        $this->bodyClasses[] = $prefix.'-'.$class;
    }

}