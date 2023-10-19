<?php

namespace modules\statik\variables;

use Craft;
use craft\elements\Entry;
use craft\helpers\ElementHelper;
use craft\web\twig\variables\Paginate;
use craft\web\View;
use Vanderlee\Syllable\Syllable;
use verbb\hyper\models\LinkCollection;


/**
 * @author    Statik
 * @package   Statik
 * @since     1.0.0
 */
class StatikVariable
{
    private const SECTIONS_NO_INDEX_NO_FOLLOW = [
        'searchResults',
        'systemOffline',
        'confirmAccount',
        'editPassword',
        'editProfile',
        'forgotPassword',
        'forgotPasswordConfirmation',
        'pageNotFound',
        'registrationCompleted',
        'setPassword',
        'setPasswordConfirmation'
    ];

    /**
     * Render pagination template with options
     * @param array $options to pass to the template
     * @throws \Twig\Error\LoaderError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\SyntaxError
     * @throws \yii\base\Exception
     */
    public function paginate(Paginate $pageInfo, array $options = []): string
    {
        if (!$pageInfo->total) {
            return '';
        }

        return Craft::$app->view->renderTemplate('_site/_snippet/_global/_paginate', [
            'pageInfo' => $pageInfo,
            'options' => $options,
        ], View::TEMPLATE_MODE_SITE);
    }

    /**
     * @param array $options [
     *      'linkClass' => <string>(optional) Add extra classes to the individual links
     *      'divWrapper' => <bool>(default false) Should the links be individually wrapped in a div
     *      'divClass' => <string>(optional) the class of the div wrapping the links if divWrapper is true
     * ]
     */
    public function getLinks(LinkCollection $cta, array $options = []): string
    {
        $html = '';
        $extraLinkClass = $options['linkClass'] ?? '';

        foreach($cta as $link) {
            $defaultLinkClass = $link->ctaFieldLinkLayouts ?? '';

            $html .= Craft::$app->view->renderTemplate(
                '_site/_snippet/_global/_hyperCta',
                [
                    'cta' => $link,
                    'classes' => trim($defaultLinkClass . ' ' . $extraLinkClass),
                    'options' => $options,
                ],
                View::TEMPLATE_MODE_SITE);
        }

        return $html;
    }

    public function isBot(string $userAgent = '/bot|crawl|facebook|google|slurp|spider|mediapartners/i'): bool
    {
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            return $_SERVER['HTTP_USER_AGENT'] && preg_match($userAgent, $_SERVER['HTTP_USER_AGENT']);
        }
        return false;
    }

    public function shouldPageBeIndexed(string $url, Entry $entry): bool
    {
        if (in_array($entry->section->handle, self::SECTIONS_NO_INDEX_NO_FOLLOW, true)) {
            return false;
        }

        if (preg_match('/\w{6}\.(?:local|staging|live)\.statik.be/', $url)) {
            return false;
        }

        return true;
    }

    /**
     * Create slugs from titles in contentbuilder for the anchor link
     * @param $string
     * @return string
     */
    public function slugify(string $string): string
    {
        return ElementHelper::generateSlug($string);
    }

    public function hyphenate($string, $minimumWordLength = 12): string
    {
        $language = strtolower(explode('-', Craft::$app->language)[0]);
        $language = $language === 'en' ? 'en-us' : $language;
        $syllable = new Syllable($language);
        $syllable->getCache()->setPath(Craft::$app->getPath()->getTempPath());
        $syllable->setMinWordLength($minimumWordLength);
        return $syllable->hyphenateText($string);
    }
}
