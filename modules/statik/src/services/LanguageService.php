<?php

namespace modules\statik\services;

use Craft;
use craft\base\Component;
use craft\models\Site;
use modules\statik\Statik;

class LanguageService extends Component
{
    public function getLanguageCookie(): string|null
    {
        $cookieValue = Craft::$app->getRequest()->getCookies()->getValue(Statik::LANGUAGE_COOKIE);
        return $cookieValue;
    }

    public function checkIfUserChangedLanguage(): void
    {
        /** @var \craft\web\Request $request */
        $request = Craft::$app->getRequest();
        $queryParams = $request->queryParams;

        if (!isset($queryParams['lang'])) {
            return;
        }

        $siteHandle = $queryParams['lang'];
        $site = Craft::$app->getSites()->getSiteByHandle($siteHandle);

        if ($site === null) {
            return;
        }

        $this->setLanguageCookie($site);
    }

    public function redirect(): void
    {
        /** @var \craft\web\Request $request */
        $request = Craft::$app->getRequest();
        $cookie = $this->getLanguageCookie();
        $hasCookie = $cookie !== null;

        //INFO: Only redirect GET requests to the homepage
        if (!$request->getIsGet() || $request->getPathInfo() !== '') {
            return;
        }

        // INFO: Only force a language when user is coming from an external source
        $referrer = $request->getReferrer();
        if ($referrer && !$this->isExternalReferrer($referrer)) {
            return;
        }

        // INFO: Check if the user has visited the site before
        if ($hasCookie) {
            $site = Craft::$app->getSites()->getSiteByHandle($cookie);
            $currentSite = Craft::$app->getSites()->getCurrentSite();

            if ($site) {
                if ($site->id === $currentSite->id) {
                    return;
                } else {
                    $this->redirectToSite($site);
                }
            }
        }

        $this->detectLanguage();
    }

    /**
     * This funcion only runs when the user enters the site on the root and doesn't have a cookie yet
     * It will look at the language available in the current install, and the languages accepted by the browser.
     * - If a match can be made, we'll set the Statik::LANGUAGE_COOKIE cookie to that site handle and redirect the user
     * - If no match can be made, we'll redirect to the primary site and set a cookie for that site.
     *
     * @throws \yii\base\ExitException
     */
    private function detectLanguage(): void
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

        foreach ($matchedLocales as $locale) {
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
    private function redirectToSite($site): void
    {
        Craft::$app->getResponse()->redirect($site->baseUrl);
        Craft::$app->end();
    }


    /**
     * The function will set the Statik::LANGUAGE_COOKIE cookie to the handle of the site that is passed to it
     * @param Site $site
     */
    private function setLanguageCookie(Site $site): void
    {
        $handle = $site->handle;
        Craft::debug("Setting langague cookie to $handle", 'Statik');
        $expires = time() + 60 * 60 * 24 * 30;

        Craft::$app->getResponse()->getCookies()->add(new \yii\web\Cookie([
            'name' => Statik::LANGUAGE_COOKIE,
            'value' => $handle,
            'expire' => $expires,
            'path' => '/',
        ]));
    }

    private function isExternalReferrer(string $referrer): bool
    {
        $refHost = parse_url($referrer, PHP_URL_HOST);
        $siteHost = parse_url(getenv('BASE_URL'));

        return $refHost && $refHost !== $siteHost;
    }
}
