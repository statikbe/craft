<?php

namespace modules\statik\web\twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;
use Twig\TwigTest;
use craft\elements\Entry;
use craft\helpers\ElementHelper;

class StatikExtension extends AbstractExtension
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
        'setPasswordConfirmation',
    ];


    public function getFilters(): array
    {
        return [
            new TwigFilter('slugify', [$this, 'slugify']),
        ];
    }

    public function getTests(): array
    {
        return [
            new TwigTest('isBot', [$this, 'isBot']),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('shouldPageBeIndexed', [$this, 'shouldPageBeIndexed']),
        ];
    }


    public function isBot(string $userAgent = '/bot|crawl|facebook|google|slurp|spider|mediapartners/i'): bool
    {
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            return $_SERVER['HTTP_USER_AGENT'] && preg_match($userAgent, $_SERVER['HTTP_USER_AGENT']);
        }
        return false;
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
}
