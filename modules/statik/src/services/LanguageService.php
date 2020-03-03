<?php

namespace modules\statik\services;

use Craft;
use craft\base\Component;
use craft\models\Site;
use modules\statik\Statik;

class LanguageService extends Component
{

    /**
     * Here we'll determine if (and where to) the user should be redirected based on
     * - where they enter the site
     * - if they already have a lanugage cooie
     * - which language their browser is set to
     * - which languages we have in the site
     * @throws \craft\errors\SiteNotFoundException
     * @throws \yii\base\ExitException
     */
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

    /**
     * This function will get the site we need to redirect to base on the Statik::LANGUAGE_COOKIE cookie
     */
    public function redirectLanguage()
    {
        $siteHandle = $_COOKIE[Statik::LANGUAGE_COOKIE];
        $site = Craft::$app->getSites()->getSiteByHandle($siteHandle);
        $this->redirectToSite($site);
    }

    /**
     * This funcion only runs when the user enters the site on the root and doesn't have a cookie yet
     * It will look at the language available in the current install, and the languages accepted by the browser.
     * - If a match can be made, we'll set the Statik::LANGUAGE_COOKIE cookie to that site handle and redirect the user
     * - If no match can be made, we'll redirect to the primary site and set a cookie for that site.
     *
     * @throws \yii\base\ExitException
     */
    public function detectLanguage()
    {
        $sites = Craft::$app->getSites()->getAllSites();
        $availableLanguages = [];
        foreach ($sites as $site) {
            $availableLanguages[$site->language] = (int)$site->id;
            $language = explode('-', $site->language);
            $availableLanguages[$language[0]] = (int)$site->id;
        }

        $acceptedLanguages = [];
        foreach (explode(",", $_SERVER['HTTP_ACCEPT_LANGUAGE']) as $language) {
            $lang = explode(';', $language);
            $acceptedLanguages[] = $lang[0];
        }

        $matchedLocales = array_intersect($acceptedLanguages, array_keys($availableLanguages));
        $sortedSites = [];

        foreach($matchedLocales as $locale) {
            $sortedSites[$locale] = $availableLanguages[$locale];
        }

        if ($sortedSites) {
            $siteId = reset($sortedSites);
            /** @var Site $site */
            $site = Craft::$app->getSites()->getSiteById($siteId);
            $this->setLanguageCookie($site);
            $this->redirectToSite($site);
        }
    }

    /**
     * This function will redirect the user to the site's baseUrl
     * @param $site
     * @throws \yii\base\ExitException
     */
    public function redirectToSite($site)
    {
        Craft::$app->getResponse()->redirect($site->baseUrl);
        Craft::$app->end();
    }


    /**
     * The function will set the Statik::LANGUAGE_COOKIE cookie to the handle of the site that is passed to it
     * @param Site $site
     */
    public function setLanguageCookie(Site $site)
    {
        $handle = $site->handle;
        Craft::debug("Setting langague cookie to $handle", 'Statik');
        $expires = time() + 60 * 60 * 24 * 30;
        setcookie(Statik::LANGUAGE_COOKIE, $handle, $expires, "/");
    }

}