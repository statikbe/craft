<?php
/**
 * Statik module for Craft CMS 3.x
 *
 * Paste some cool functions here
 *
 * @link      https://www.statik.be
 * @copyright Copyright (c) 2018 Statik
 */

namespace modules\statik;

use Craft;
use craft\console\Application as ConsoleApplication;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\TemplateEvent;
use craft\i18n\PhpMessageSource;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use modules\statik\assetbundles\statik\StatikAsset;
use modules\statik\services\BodyClasses;
use modules\statik\services\Revision;
use modules\statik\services\StatikService;
use modules\statik\services\StatikService as StatikServiceService;
use modules\statik\variables\StatikVariable;
use yii\base\Event;
use yii\base\Module;

/**
 * Class Statik
 *
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 *
 * @property  StatikServiceService $statikService
 */
class Statik extends Module
{
    // Static Properties
    // =========================================================================

    /**
     * @var Statik
     */
    public static $instance;

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function __construct($id, $parent = null, array $config = [])
    {
        Craft::setAlias('@modules/statik', $this->getBasePath());

        // Translation category
        $i18n = Craft::$app->getI18n();
        /** @noinspection UnSafeIsSetOverArrayInspection */
        if (!isset($i18n->translations[$id]) && !isset($i18n->translations[$id.'*'])) {
            $i18n->translations[$id] = [
                'class' => PhpMessageSource::class,
                'sourceLanguage' => 'en-US',
                'basePath' => '@modules/statik/translations',
                'forceTranslation' => true,
                'allowOverrides' => true,
            ];
        }

        // Base template directory
        Event::on(View::class, View::EVENT_REGISTER_CP_TEMPLATE_ROOTS, function (RegisterTemplateRootsEvent $e) {
            if (is_dir($baseDir = $this->getBasePath().DIRECTORY_SEPARATOR.'templates')) {
                $e->roots[$this->id] = $baseDir;
            }
        });

        // Set this as the global instance of this module class
        static::setInstance($this);

        parent::__construct($id, $parent, $config);
    }

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        self::$instance = $this;

        // Add in our console commands
        if (Craft::$app instanceof ConsoleApplication) {

            $this->controllerNamespace = 'modules\statik\console\controllers';
        } else {
            $this->controllerNamespace = 'modules\statik\controllers';

        }

        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                /** @var CraftVariable $variable */
                $variable = $event->sender;
                $variable->set('statik', StatikVariable::class);
            }
        );

        if (Craft::$app->getRequest()->getIsCpRequest()) {
            Event::on(
                View::class,
                View::EVENT_BEFORE_RENDER_TEMPLATE,
                function (TemplateEvent $event) {
                    Craft::$app->getView()->registerAssetBundle(StatikAsset::class);
                }
            );
        }

        $this->setComponents([
            'revision' => Revision::class,
            'bodyClasses' => BodyClasses::class
        ]);

        if (Craft::$app->getRequest()->getIsCpRequest()) {
            Craft::$app->getView()->hook('cp.layouts.base', function(array &$context) {

                // Load class services
                $c = Statik::$instance->bodyClasses;
                $c->classCurrentSiteGroup();

                // If any body classes have been set, apply them
                if (!empty($c->bodyClasses)) {
                    $allClasses = implode(' ', $c->bodyClasses);
                    $context['bodyClass'] .= " $allClasses";
                }

            });
        }
    }
}
