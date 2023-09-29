<?php

namespace modules\statik\variables;

use Craft;
use craft\elements\Entry;
use craft\web\View;
use craft\helpers\ElementHelper;
use craft\web\twig\variables\Paginate;
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
     *      'divClass' => <string>(optional) the class of the div wrapping the links
     *      'linkClass' => <string>(optional) Add extra classes to the individual links
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
}
