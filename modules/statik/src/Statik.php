<?php

namespace modules\statik;

use Craft;
use craft\console\Application as ConsoleApplication;
use craft\elements\Entry;
use craft\elements\User;
use craft\events\RegisterCpNavItemsEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\SetAssetFilenameEvent;
use craft\events\TemplateEvent;
use craft\events\InvalidateElementCachesEvent;
use craft\services\Elements;
use craft\helpers\Assets;
use craft\helpers\Queue;
use craft\i18n\PhpMessageSource;
use craft\queue\jobs\ResaveElements;
use craft\web\Application;
use craft\web\Response;
use craft\web\twig\variables\Cp;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use modules\statik\assetbundles\Statik\StatikAsset;
use modules\statik\helpers\ContentbuilderShowcase;
use modules\statik\helpers\ImageWarmer;
use modules\statik\services\LanguageService;
use modules\statik\variables\StatikVariable;
use modules\statik\web\twig\CtaExtension;
use modules\statik\web\twig\EmailExtension;
use modules\statik\web\twig\HyphenateExtension;
use modules\statik\web\twig\IconExtension;
use modules\statik\web\twig\ImageExtension;
use modules\statik\web\twig\PaginateExtension;
use modules\statik\web\twig\PhoneExtension;
use modules\statik\web\twig\StatikExtension;
use modules\statik\web\twig\ValidateInputExtension;
use craft\base\conditions\BaseCondition;
use craft\elements\conditions\entries\EntryCondition;
use craft\events\RegisterConditionRulesEvent;
use craft\models\EntryType;
use modules\statik\conditions\PageSectionConditionRule;
use statikbe\trinity\events\DefinePageWidthEvent;
use statikbe\trinity\events\RegisterPageWidthsEvent;
use statikbe\trinity\services\Rows;
use verbb\formie\events\ModifyFieldHtmlTagEvent;
use verbb\formie\events\RegisterFieldsEvent;
use verbb\formie\fields\formfields;
use yii\base\Event;
use yii\base\Module;
use yii\web\HttpException;

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

    /**
     * Overview single => the section of its items. The items' URIs start with the overview's slug in the same site (their
     * uriFormat), so the items are resaved when that slug changes.
     */
    public const OVERVIEW_ITEM_SECTIONS = [
        'newsOverview' => 'news',
        'calendarOverview' => 'calendar',
        'knowledgeBaseOverview' => 'knowledgeBase',
    ];

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
        Event::on(View::class, View::EVENT_REGISTER_CP_TEMPLATE_ROOTS, function(RegisterTemplateRootsEvent $e) {
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

        Event::on(User::class, User::EVENT_BEFORE_AUTHENTICATE, function($event) {
            if (Craft::$app->request->getIsCpRequest() && Craft::$app->config->custom->maintenanceMode) {
                throw new HttpException(503, 'The control panel is temporarily locked for maintenance.');
            }
        });

        Event::on(
            Application::class,
            Application::EVENT_BEFORE_REQUEST,
            function() {
                $request = Craft::$app->getRequest();
                if ($request->getIsCpRequest() && Craft::$app->config->custom->maintenanceMode) {
                    $path = $request->getPathInfo();

                    // INFO: Allow the login page and the action that actually processes login, logout. This way we can show a clear error message to the user.
                    $allowedPaths = [
                        'login',          // GET login page
                        'logout',
                        'actions/users/login', // POST login action
                    ];

                    $path = trim($path, '/');
                    $isAllowed = in_array($path, $allowedPaths, true);

                    if (!$isAllowed) {
                        /** @var Response $response */
                        $response = Craft::$app->getResponse();
                        $response->redirect('/admin/logout');
                        $response->send();
                        exit;
                    }
                }
            }
        );

        // Add in our console commands
        if (Craft::$app instanceof ConsoleApplication) {
            $this->controllerNamespace = 'modules\statik\console\controllers';
        } else {
            $this->controllerNamespace = 'modules\statik\controllers';

            if (!Craft::$app->getRequest()->getIsCpRequest()) {
                // A warm request (ImageWarmer): generates the page's image transforms during the render
                $isWarmRequest = ImageWarmer::isWarmRequest();
                if ($isWarmRequest) {
                    ImageWarmer::prepareWarmRequest();
                    // Record the element cache tags the page depends on
                    Event::on(View::class, View::EVENT_BEFORE_RENDER_PAGE_TEMPLATE, fn() => ImageWarmer::startRecording());
                    Event::on(View::class, View::EVENT_AFTER_RENDER_PAGE_TEMPLATE, fn() => ImageWarmer::stopRecording());
                }

                $languageService = LanguageService::instance();
                $languageService->checkIfUserChangedLanguage();

                Event::on(
                    Application::class,
                    Application::EVENT_BEFORE_REQUEST,
                    function() use ($languageService, $isWarmRequest) {
                        // INFO: this function will check if a redirect is needed and will do nothing if not
                        // A warm request renders the page it asked for
                        if (!$isWarmRequest) {
                            $languageService->redirect();
                        }
                    }
                );
            }
        }

        // Register our variables
        Event::on(CraftVariable::class, CraftVariable::EVENT_INIT, function(Event $event) {
            /** @var CraftVariable $variable */
            $variable = $event->sender;
            $variable->set('statik', StatikVariable::class);
        });

        // Register our Twig extensions
        Craft::$app->view->registerTwigExtension(new IconExtension());
        Craft::$app->view->registerTwigExtension(new ImageExtension());
        Craft::$app->view->registerTwigExtension(new CtaExtension());
        Craft::$app->view->registerTwigExtension(new EmailExtension());
        Craft::$app->view->registerTwigExtension(new ValidateInputExtension());
        Craft::$app->view->registerTwigExtension(new HyphenateExtension());
        Craft::$app->view->registerTwigExtension(new StatikExtension());
        Craft::$app->view->registerTwigExtension(new PaginateExtension());
        Craft::$app->view->registerTwigExtension(new PhoneExtension());

        Event::on(Assets::class, Assets::EVENT_SET_FILENAME, function(SetAssetFilenameEvent $event) {
            $event->extension = mb_strtolower($event->extension);
        });

        if (Craft::$app->getRequest()->getIsCpRequest()) {
            Event::on(View::class, View::EVENT_BEFORE_RENDER_TEMPLATE, function(TemplateEvent $event) {
                Craft::$app->getView()->registerAssetBundle(StatikAsset::class);
            });
        }

        Event::on(\verbb\formie\services\Fields::class, \verbb\formie\services\Fields::EVENT_REGISTER_FIELDS, function(RegisterFieldsEvent $event) {
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

        // Formie multi-select dropdowns use our autocomplete component (frontend/js/components-core/autocomplete.component.ts)
        Event::on(\verbb\formie\fields\Dropdown::class, \verbb\formie\fields\Dropdown::EVENT_MODIFY_HTML_TAG, function(ModifyFieldHtmlTagEvent $event) {
            if ($event->key === 'fieldInput' && $event->tag && $event->field->multi) {
                $event->tag->attributes['data-autocomplete'] = true;
            }
        });

        // clear cache after save for our global site settings
        // TODO: if we have other global sections add them to clear their cache after save.
        Event::on(Entry::class, Entry::EVENT_AFTER_SAVE, function(Event $event) {
            /** @var Entry $entry */
            $entry = $event->sender;
            if ($entry->getSection() !== null) {
                if ($entry->getSection()->handle === 'siteSettings') {
                    Craft::$app->getCache()->delete('layout-fallback-' . $entry->siteId);
                }

                // An overview's slug changed: its items' URIs (overview slug/item slug) follow, in that site
                $itemSection = self::OVERVIEW_ITEM_SECTIONS[$entry->getSection()->handle] ?? null;
                if ($itemSection && !$entry->getIsDraft() && !$entry->getIsRevision() && $entry->isAttributeDirty('slug')) {
                    Queue::push(new ResaveElements([
                        'description' => "Updating the URLs of the {$itemSection} items",
                        'elementType' => Entry::class,
                        'criteria' => ['section' => $itemSection, 'siteId' => $entry->siteId, 'status' => null],
                    ]));
                }
            }
        });

        // Image warming: after a save, a queue job requests the page, so its image transforms are generated before a visitor
        // needs them; and the recorded pages that show a changed element (by Craft's element cache tags, see ImageWarmer)
        Event::on(Entry::class, Entry::EVENT_AFTER_SAVE, function(Event $event) {
            ImageWarmer::queueEntry($event->sender);
        });
        Event::on(Elements::class, Elements::EVENT_INVALIDATE_CACHES, function(InvalidateElementCachesEvent $event) {
            ImageWarmer::queueInvalidated($event);
        });

        // "Page section" condition rule: for field conditions of nested entry types (e.g. a content row cell), the section of the
        // page the entry is on. Not offered elsewhere: it doesn't filter element queries
        Event::on(EntryCondition::class, BaseCondition::EVENT_REGISTER_CONDITION_RULES, function(RegisterConditionRulesEvent $event) {
            $fieldLayouts = $event->sender->getFieldLayouts();
            if (count($fieldLayouts) === 1 && self::isNestedEntryTypeLayout($fieldLayouts[0])) {
                $event->conditionRules[] = PageSectionConditionRule::class;
            }
        });

        // contentbuilder-showcase: the 2/3 and 3/4 content row showcase pages render the content builder narrower than the page
        Event::on(Rows::class, Rows::EVENT_DEFINE_PAGE_WIDTH, function(DefinePageWidthEvent $event) {
            $event->width = ContentbuilderShowcase::pageWidth($event->page) ?? $event->width;
        });
        Event::on(Rows::class, Rows::EVENT_REGISTER_PAGE_WIDTHS, function(RegisterPageWidthsEvent $event) {
            array_push($event->widths, ...array_values(ContentbuilderShowcase::GRID_PAGE_WIDTH_SLUGS));
        });

        Event::on(Cp::class, Cp::EVENT_REGISTER_CP_NAV_ITEMS, function(RegisterCpNavItemsEvent $event) {
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

    /**
     * Whether a field layout is the layout of an entry type that no section uses (an entry type for Matrix fields only).
     */
    private static function isNestedEntryTypeLayout(\craft\models\FieldLayout $fieldLayout): bool
    {
        $entries = Craft::$app->getEntries();
        $entryType = $fieldLayout->provider instanceof EntryType ? $fieldLayout->provider : null;
        if (!$entryType && $fieldLayout->id) {
            foreach ($entries->getAllEntryTypes() as $type) {
                if ($type->fieldLayoutId === $fieldLayout->id) {
                    $entryType = $type;
                    break;
                }
            }
        }
        if (!$entryType) {
            return false;
        }
        foreach ($entries->getAllSections() as $section) {
            foreach ($section->getEntryTypes() as $sectionType) {
                if ($sectionType->id === $entryType->id) {
                    return false;
                }
            }
        }
        return true;
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
