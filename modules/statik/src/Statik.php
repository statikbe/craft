<?php

namespace modules\statik;

use Craft;
use craft\base\Element;
use craft\console\Application as ConsoleApplication;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterCpNavItemsEvent;
use craft\events\RegisterElementExportersEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\SetAssetFilenameEvent;
use craft\events\TemplateEvent;
use craft\helpers\Assets;
use craft\i18n\PhpMessageSource;
use craft\services\Fields;
use craft\web\twig\variables\Cp;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use modules\statik\assetbundles\Statik\StatikAsset;
use modules\statik\exporters\FormieXlsxExporter;
use modules\statik\fields\AnchorLink;
use modules\statik\services\LanguageService;
use modules\statik\variables\StatikVariable;
use modules\statik\web\twig\HyperExtension;
use modules\statik\web\twig\HyphenateExtension;
use modules\statik\web\twig\IconExtension;
use modules\statik\web\twig\PaginateExtension;
use modules\statik\web\twig\StatikExtension;
use modules\statik\web\twig\ValidateInputExtension;
use verbb\formie\elements\Submission;
use verbb\formie\events\RegisterFieldsEvent;
use verbb\formie\fields\formfields;
use yii\base\Event;
use yii\base\Module;

/**
 * Class Statik
 *
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 *
 */
class Statik extends Module
{
    // Static Properties
    // =========================================================================

    /**
     * @var Self
     */
    public static $instance;

    public const LANGUAGE_COOKIE = '__language';

    // Public Methods
    // =========================================================================

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

    public function init(): void
    {
        parent::init();
        self::$instance = $this;


        // Add in our console commands
        if (Craft::$app instanceof ConsoleApplication) {
            $this->controllerNamespace = 'modules\statik\console\controllers';
        } else {
            $this->controllerNamespace = 'modules\statik\controllers';
        }

        // Register our variables
        Event::on(CraftVariable::class, CraftVariable::EVENT_INIT, function (Event $event) {
            /** @var CraftVariable $variable */
            $variable = $event->sender;
            $variable->set('statik', StatikVariable::class);
        });

        // Register our Twig extensions
        Craft::$app->view->registerTwigExtension(new IconExtension());
        Craft::$app->view->registerTwigExtension(new HyperExtension());
        Craft::$app->view->registerTwigExtension(new ValidateInputExtension());
        Craft::$app->view->registerTwigExtension(new HyphenateExtension());
        Craft::$app->view->registerTwigExtension(new StatikExtension());
        Craft::$app->view->registerTwigExtension(new PaginateExtension());

        Event::on(Assets::class, Assets::EVENT_SET_FILENAME, function (SetAssetFilenameEvent $event) {
            $event->extension = mb_strtolower($event->extension);
        });

        if (Craft::$app->getRequest()->getIsCpRequest()) {
            Event::on(View::class, View::EVENT_BEFORE_RENDER_TEMPLATE, function (TemplateEvent $event) {
                Craft::$app->getView()->registerAssetBundle(StatikAsset::class);
            });
        }


        if (Craft::$app->getPlugins()->isPluginEnabled('formie')) {

            // Register our fields
            Event::on(Fields::class, Fields::EVENT_REGISTER_FIELD_TYPES, function (RegisterComponentTypesEvent $event) {
                $event->types[] = AnchorLink::class;
            });

            Event::on(\verbb\formie\services\Fields::class, \verbb\formie\services\Fields::EVENT_REGISTER_FIELDS, function (RegisterFieldsEvent $event) {
                $excludedFields = [
                    formfields\Address::class,
                    formfields\Group::class,
                    formfields\Section::class,
                    formfields\Repeater::class,
                    formfields\Tags::class,
                    formfields\Users::class,
                ];

                foreach ($event->fields as $key => $field) {
                    if (in_array($field, $excludedFields)) {
                        unset($event->fields[$key]);
                    }
                }

                // Reset indexes
                $event->fields = array_values($event->fields);
            });

            Event::on(
                Submission::class,
                Element::EVENT_REGISTER_EXPORTERS,
                function (RegisterElementExportersEvent $event) {
                    $event->exporters[] = FormieXlsxExporter::class;
                }
            );
        }

        Event::on(Cp::class, Cp::EVENT_REGISTER_CP_NAV_ITEMS, function (RegisterCpNavItemsEvent $event) {
            if (Craft::$app->getConfig()->getGeneral()->allowAdminChanges) {
                $event->navItems[] = [
                    'url' => 'settings/fields',
                    'label' => 'Fields',
                    'icon' => '@appicons/field.svg',
                ];
                $event->navItems[] = [
                    'url' => 'settings/entry-types',
                    'label' => 'Entry types',
                    'icon' => '@appicons/files.svg',
                ];
                $event->navItems[] = [
                    'url' => 'settings/sections',
                    'label' => 'Sections',
                    'icon' => '@appicons/newspaper.svg',
                ];
            }
        });

        $this->setComponents([
            'language' => LanguageService::class,
        ]);

        $this->setHttpHeaders();
    }

    private function setHttpHeaders(): void
    {
        if (!Craft::$app->getRequest()->isConsoleRequest) {
            //Craft::$app->getResponse()->headers->add('Strict-Transport-Security', "max-age=31536000; includeSubDomains; preload");
            Craft::$app->getResponse()->headers->add('X-Frame-Options', 'SAMEORIGIN');
            Craft::$app->getResponse()->headers->add('X-XSS-Protection', '1; mode=block'); // Already deprecated
            Craft::$app->getResponse()->headers->add('X-Content-Type-Options', 'nosniff'); // Already deprecated
        }
    }
}
