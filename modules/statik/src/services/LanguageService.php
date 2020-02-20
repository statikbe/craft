<?php

namespace modules\statik\services;

use Craft;
use craft\base\Component;
use craft\models\Site;
use modules\statik\Statik;

class LanguageService extends Component
{

    public function redirect()
    {
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
        foreach ($matchedLocales as $locale) {
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