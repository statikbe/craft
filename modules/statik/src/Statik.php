<?php

namespace modules\statik;

use Craft;
use craft\console\Application as ConsoleApplication;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\SetAssetFilenameEvent;
use craft\events\TemplateEvent;
use craft\helpers\Assets;
use craft\i18n\PhpMessageSource;
use craft\services\Fields;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use modules\statik\assetbundles\Statik\StatikAsset;
use modules\statik\fields\AnchorLink;
use modules\statik\services\LanguageService;
use modules\statik\services\Revision;
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
 * @property LanguageService language
 * @property Revision revision
 *
 */
class Statik extends Module
{
    // Static Properties
    // =========================================================================

    /**
     * @var Statik
     */
    public static $instance;

    const LANGUAGE_COOKIE = '__language';

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
        if (!isset($i18n->translations[$id]) && !isset($i18n->translations[$id . '*'])) {
            $i18n->translations[$id] = [
                'class' => PhpMessageSource::class,
                'sourceLanguage' => 'nl-BE',
                'basePath' => '@modules/statik/translations',
                'forceTranslation' => true,
                'allowOverrides' => true,
            ];
        }

        // Base template directory
        Event::on(View::class, View::EVENT_REGISTER_CP_TEMPLATE_ROOTS, function (RegisterTemplateRootsEvent $e) {
            if (is_dir($baseDir = $this->getBasePath() . DIRECTORY_SEPARATOR . 'templates')) {
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

        Event::on(CraftVariable::class, CraftVariable::EVENT_INIT, function (Event $event) {
            /** @var CraftVariable $variable */
            $variable = $event->sender;
            $variable->set('statik', StatikVariable::class);
        });

        Event::on(Assets::class, Assets::EVENT_SET_FILENAME, function (SetAssetFilenameEvent $event) {
            $event->extension = mb_strtolower($event->extension);
        });

        if (Craft::$app->getRequest()->getIsCpRequest()) {
            Event::on(View::class, View::EVENT_BEFORE_RENDER_TEMPLATE, function (TemplateEvent $event) {
                Craft::$app->getView()->registerAssetBundle(StatikAsset::class);
            });
        }

        // Register our fields
        Event::on(Fields::class, Fields::EVENT_REGISTER_FIELD_TYPES, function (RegisterComponentTypesEvent $event) {
            $event->types[] = AnchorLink::class;
        });

        $this->setComponents([
            'revision' => Revision::class,
            'language' => LanguageService::class,
        ]);

        $headers = getallheaders();

        if (
            Craft::$app->isMultiSite
            && Craft::$app->getRequest()->isSiteRequest
            && strpos($headers['Accept'], "/html")
        ) {
            try {
                Statik::getInstance()->language->redirect();
            } catch (\Exception $e) {
                Craft::error("Error redirecting to language: {$e->getMessage()}", __CLASS__);
            }
        }
    }
}
