<?php

namespace modules\statik\web\twig;

use craft\elements\Entry;
use craft\helpers\ElementHelper;
use Jaybizzle\CrawlerDetect\CrawlerDetect;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;
use Twig\TwigFilter;
use Twig\TwigFunction;

class StatikExtension extends AbstractExtension implements GlobalsInterface
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

    private CrawlerDetect $crawlerDetect;

    public function __construct()
    {
        $this->crawlerDetect = new CrawlerDetect();
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('slugify', [$this, 'slugify']),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('shouldPageBeIndexed', [$this, 'shouldPageBeIndexed']),
        ];
    }

    public function getGlobals(): array
    {
        return [
            'isBot' => $this->crawlerDetect->isCrawler(),
        ];
    }

    /**
     * remove all non-alphanumeric characters and replace spaces with dashes
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
