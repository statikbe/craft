<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik\controllers;

use craft\web\Controller;

/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class DefaultController extends Controller
{

    // Protected Properties
    // =========================================================================

    /**
     * @var    bool|array Allows anonymous access to this controller's actions.
     *         The actions must be in 'kebab-case'
     * @access protected
     */
    protected $allowAnonymous = ['index', 'do-something'];

    // Public Methods
    // =========================================================================

    /**
     * @return mixed
     */
    public function actionIndex()
    {
        $result = 'Welcome to the DefaultController actionIndex() method';

        return $result;
    }

    /**
     * @return mixed
     */
    public function actionDoSomething()
    {
        $result = 'Welcome to the DefaultController actionDoSomething() method';

        return $result;
    }
}
