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
            Craft::debug('No language cookie found and on root, settings language cookie & redirecting', 'Statik');
            $this->detectLanguage();
        } elseif ($hasCookie && !isset($_GET['p'])) {
            Craft::debug('Cookie found and on root, redirecting', 'Statik');
            $this->redirectLanguage();
        } elseif (Craft::$app->getRequest()->getParam('lang')) {
            $site = Craft::$app->getSites()->getSiteByHandle(Craft::$app->getRequest()->getParam('lang'));
            Craft::debug('User clicking language nav, changing language cookie', 'Statik');
            $this->setLanguageCookie($site);
        } elseif (Craft::$app->request->getFullPath() != "" && isset($_GET['p'])) {
            $site = Craft::$app->getSites()->getCurrentSite();
            $handle = $site->handle;
            Craft::debug("Not on homepage, updating language cookie for site $handle", 'Statik');
            $this->setLanguageCookie($site);
        }
    }


    public function redirectLanguage()
    {
        $siteHandle = $_COOKIE[Statik::LANGUAGE_COOKIE];
        $site = Craft::$app->getSites()->getSiteByHandle($siteHandle);
        $this->redirectToSite($site);
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
            $this->redirectToSite($site);
        }
    }

    public function redirectToSite($site)
    {
        Craft::$app->getResponse()->redirect($site->baseUrl);
        Craft::$app->end();
    }

    public function setLanguageCookie(Site $site)
    {
        $handle = $site->handle;
        Craft::debug("Setting langague cookie to $handle", 'Statik');
        $expires = time() + 60 * 60 * 24 * 30;
        setcookie(Statik::LANGUAGE_COOKIE, $handle, $expires, "/");
    }

}