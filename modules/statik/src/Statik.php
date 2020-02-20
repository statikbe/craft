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
use craft\models\Site;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use modules\statik\assetbundles\statik\StatikAsset;
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
        ]);


        if (
            Craft::$app->isMultiSite &&
            Craft::$app->getRequest()->isSiteRequest
        ) {
            $cookie = Statik::LANGUAGE_COOKIE;
            $hasCookie = isset($_COOKIE[$cookie]) ?? false;

            if (!$hasCookie && !isset($_GET['p'])) {
                $this->detectLanguage();
            } elseif ($hasCookie && !isset($_GET['p'])) {
                $this->redirectLanguage();
            } elseif (Craft::$app->getRequest()->getParam('lang')) {
                $site = Craft::$app->getSites()->getSiteByHandle(Craft::$app->getRequest()->getParam('lang'));
                $this->setLanguageCookie($site);
            } elseif (Craft::$app->request->getFullPath() != "" && isset($_GET['p'])) {
                $site = Craft::$app->getSites()->getCurrentSite();
                $this->setLanguageCookie($site);
            }
        }

    }

    public function redirectLanguage()
    {
        $siteHandle = $_COOKIE[Statik::LANGUAGE_COOKIE];
        $site = Craft::$app->getSites()->getSiteByHandle($siteHandle);
    }

    public function detectLanguage()
    {
        $sites = Craft::$app->getSites()->getAllSites();
        $availableLanguages = [];
        foreach ($sites as $site) {
            $availableLanguages[$site->id] = $site->language;
        }

        $acceptedLanguages = [];
        foreach (explode(",", $_SERVER['HTTP_ACCEPT_LANGUAGE']) as $language) {
            $lang = explode(';', $language);
            $acceptedLanguages[] = $lang[0];
        }

        $matchedLocales = array_intersect($acceptedLanguages, $availableLanguages);
        $sortedSites = [];
        foreach($matchedLocales as $locale) {
            $key = array_keys($availableLanguages, $locale);
            $sortedSites[$key[0]] = $locale;
        }

        if ($sortedSites) {
            $siteId = array_key_first($sortedSites);
            /** @var Site $site */
            $site = Craft::$app->getSites()->getSiteById($siteId);
            $this->setLanguageCookie($site);
            Craft::$app->getResponse()->redirect($site->baseUrl);
            Craft::$app->end();
        }
    }

    public function setLanguageCookie(Site $site)
    {
        $expires = time() + 60 * 60 * 24 * 30;
        setcookie(Statik::LANGUAGE_COOKIE, $site->handle, $expires, "/");
    }
}
