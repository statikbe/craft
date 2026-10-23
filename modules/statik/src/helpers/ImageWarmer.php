<?php

namespace modules\statik\helpers;

use Craft;
use craft\db\Query;
use craft\elements\Entry;
use craft\events\InvalidateElementCachesEvent;
use craft\helpers\App;
use craft\helpers\Db;
use craft\helpers\Queue;
use craft\models\Site;
use DateTime;
use modules\statik\jobs\WarmImages;
use verbb\knockknock\helpers\AccessTokenHelper;
use verbb\knockknock\KnockKnock;

/**
 * Image warming: generates a page's image transforms before a visitor needs them.
 *
 * Without it, a page that renders a transform that doesn't exist yet gets a temporary generate-transform URL: the first visitor's
 * browser makes PHP generate it (an AVIF of a large original takes seconds), and {% cache %} won't store the page until every
 * transform exists. With it, a queue job requests the page with a header that makes this one request generate the transforms
 * right away (generateTransformsBeforePageLoad). The page then has the final URLs and is cached.
 *
 * Which pages: the one of a saved entry, and every page that shows a changed element. Craft's element cache tags tell which: while
 * a warm request renders, the module collects the tags the render depends on, as {% cache %} does (every element query adds tags
 * for what it asks, e.g. "the news section", every element used in Twig its ID), and stores them per URL (tables statik_warmpages
 * and statik_warmtags). When an element changes, Craft invalidates its tags (Elements::EVENT_INVALIDATE_CACHES); the pages with
 * one of those tags are warmed again. A new image or focal point is a save of the asset, so the pages that render it follow.
 *
 * Settings: `warmImages` in config/custom.php. All pages at once (after a deploy or an import, and to record them):
 * `craft statik/images/warm`.
 */
class ImageWarmer
{
    /** The request header with the token: a warm request */
    public const HEADER = 'X-Statik-Warm-Images';

    /** The URL the job asked for (behind a proxy the request's own URL can differ), stored with the tags */
    public const URL_HEADER = 'X-Statik-Warm-Url';

    public const PAGES_TABLE = '{{%statik_warmpages}}';
    public const TAGS_TABLE = '{{%statik_warmtags}}';

    /** Queue priority: before Craft's own transform jobs (2048) */
    private const PRIORITY = 1024;

    /** Seconds before a job runs: the save's transaction is committed by then */
    private const DELAY = 5;

    /** Within this many seconds, a URL that was queued isn't queued again by the same process */
    private const DEDUPE_SECONDS = 60;

    /** @var array<string, int> URL => time it was queued */
    private static array $queued = [];

    /** @var string[]|null The tags collected for the warm request's page */
    private static ?array $tags = null;

    private static bool $collecting = false;

    public static function settings(): array
    {
        return array_merge(
            ['enabled' => true, 'timeout' => 300, 'verifySsl' => true],
            (array)(Craft::$app->getConfig()->getCustom()->warmImages ?? []),
        );
    }

    public static function enabled(): bool
    {
        return (bool)self::settings()['enabled'];
    }

    /**
     * Whether the tables that record the warmed pages exist. A fresh install doesn't run content migrations: without
     * `craft up` the tables are missing, and then warming still works but isn't recorded (a warning in the log once).
     */
    public static function tablesExist(): bool
    {
        static $exist = null;
        if ($exist === null) {
            $db = Craft::$app->getDb();
            $exist = $db->tableExists(self::PAGES_TABLE) && $db->tableExists(self::TAGS_TABLE);
            if (!$exist) {
                Craft::warning('Image warming: the tables statik_warmpages and statik_warmtags are missing, so warmed pages aren\'t recorded. Run `craft up` to create them.', 'statik');
            }
        }

        return $exist;
    }

    /**
     * The token in the header, derived from the security key: only this install can make a request generate transforms.
     */
    public static function token(): string
    {
        return hash_hmac('sha256', 'statik-warm-images', Craft::$app->getConfig()->getGeneral()->securityKey);
    }

    /**
     * Whether the current request is a warm request (with a valid token).
     */
    public static function isWarmRequest(): bool
    {
        static $isWarm = null;
        if ($isWarm === null) {
            $request = Craft::$app->getRequest();
            $header = $request->getIsConsoleRequest() ? '' : (string)$request->getHeaders()->get(self::HEADER, '');
            $isWarm = $header !== '' && hash_equals(self::token(), $header);
        }

        return $isWarm;
    }

    // Warm requests
    // =========================================================================

    /**
     * For a warm request: transforms are generated during the render instead of getting a temporary URL, without a time limit.
     */
    public static function prepareWarmRequest(): void
    {
        Craft::$app->getConfig()->getGeneral()->generateTransformsBeforePageLoad = true;
        App::maxPowerCaptain();
    }

    /**
     * Before the page template renders: collect the element cache tags of everything it renders (a {% cache %} inside adds its
     * own tags when it's a hit).
     */
    public static function startRecording(): void
    {
        if (self::$collecting || self::$tags !== null) {
            return;
        }
        Craft::$app->getElements()->startCollectingCacheInfo();
        self::$collecting = true;
    }

    /**
     * After the page template rendered (Craft renders it while sending the response, after EVENT_AFTER_REQUEST): store the
     * page's tags, only for a page that rendered (200).
     */
    public static function stopRecording(): void
    {
        if (!self::$collecting) {
            return;
        }
        self::$collecting = false;
        [$dependency] = Craft::$app->getElements()->stopCollectingCacheInfo();
        self::$tags = $dependency?->tags ?? [];

        if (Craft::$app->getResponse()->getStatusCode() !== 200) {
            return;
        }
        $request = Craft::$app->getRequest();
        $url = (string)$request->getHeaders()->get(self::URL_HEADER, '') ?: $request->getAbsoluteUrl();
        self::savePage($url, Craft::$app->getSites()->getCurrentSite()->id, self::matchableTags(self::$tags));
    }

    /**
     * @param string[] $tags
     */
    private static function savePage(string $url, int $siteId, array $tags): void
    {
        if (!self::tablesExist()) {
            return;
        }
        $db = Craft::$app->getDb();
        $hash = md5($url);
        $now = Db::prepareDateForDb(new DateTime());
        $pageId = (new Query())->select(['id'])->from(self::PAGES_TABLE)->where(['urlHash' => $hash])->scalar();

        $transaction = $db->beginTransaction();
        try {
            if ($pageId) {
                Db::update(self::PAGES_TABLE, ['siteId' => $siteId, 'dateWarmed' => $now], ['id' => $pageId]);
                Db::delete(self::TAGS_TABLE, ['pageId' => $pageId]);
            } else {
                Db::insert(self::PAGES_TABLE, ['url' => $url, 'urlHash' => $hash, 'siteId' => $siteId, 'dateWarmed' => $now]);
                $pageId = (int)$db->getLastInsertID();
            }
            if ($tags) {
                Db::batchInsert(self::TAGS_TABLE, ['pageId', 'tag'], array_map(fn($tag) => [$pageId, $tag], $tags));
            }
            $transaction->commit();
        } catch (\Throwable $e) {
            $transaction->rollBack();
            Craft::warning("Storing the warmed page $url failed: {$e->getMessage()}", 'statik');
        }
    }

    /**
     * Forgets a page (it's gone: 404 or 410).
     */
    public static function forgetPage(string $url): void
    {
        if (!self::tablesExist()) {
            return;
        }
        Db::delete(self::PAGES_TABLE, ['urlHash' => md5($url)]);
    }

    /**
     * The tags that can pick out pages. Left out: the ones every page or every change has, which would warm the whole site:
     * "element" (all caches cleared), "element::<type>" (every query of a type), "element::<type>::*" (a query without a section
     * or type, invalidated by every save of that type, drafts too), "element::<type>::field:<id>" (see isMatchable()) and the
     * draft and revision tags (a draft isn't on a page).
     *
     * @param string[] $tags
     * @return string[]
     */
    private static function matchableTags(array $tags): array
    {
        return array_values(array_unique(array_filter($tags, fn(string $tag) => self::isMatchable($tag))));
    }

    private static function isMatchable(string $tag): bool
    {
        $parts = explode('::', $tag);
        if ($parts[0] !== 'element' || strlen($tag) > 255) {
            return false;
        }
        // element::123: one element
        if (count($parts) === 2) {
            return ctype_digit($parts[1]);
        }
        // element::<type>::<what>: a section, entry type, volume, owner, …; not the type's wildcard, drafts or revisions. Nor a
        // field: the nested entries of a Matrix field (a content builder) are on every page, and a query of them also has the
        // owner's element::<id>, which picks out the page.
        $what = implode('::', array_slice($parts, 2));

        return count($parts) > 2 && !in_array($what, ['*', 'drafts', 'revisions'], true) && !str_starts_with($what, 'field:');
    }

    // Queueing
    // =========================================================================

    /**
     * After an entry is saved: its own page, also when it isn't recorded yet (a new entry). The pages that show it follow from the
     * invalidated tags. Only the live, canonical entry in a site where it has a URL; not while it's resaved in bulk.
     */
    public static function queueEntry(Entry $entry): void
    {
        if (
            !self::enabled() ||
            self::isWarmRequest() ||
            $entry->getIsDraft() ||
            $entry->getIsRevision() ||
            $entry->resaving ||
            $entry->getStatus() !== Entry::STATUS_LIVE
        ) {
            return;
        }
        $url = $entry->getUrl();
        if ($url) {
            self::queueUrl($url, $entry->siteId);
        }
    }

    /**
     * Elements::EVENT_INVALIDATE_CACHES: the recorded pages that have one of the invalidated tags.
     */
    public static function queueInvalidated(InvalidateElementCachesEvent $event): void
    {
        // Not for what a warm request itself saves, nor for a bulk resave (craft statik/images/warm is for that)
        if (!self::enabled() || self::isWarmRequest() || ($event->element->resaving ?? false) || !self::tablesExist()) {
            return;
        }
        $tags = array_values(array_filter($event->tags, fn(string $tag) => self::isMatchable($tag)));
        if (!$tags) {
            return;
        }
        $pages = (new Query())
            ->select(['p.url', 'p.siteId'])
            ->distinct()
            ->from(['p' => self::PAGES_TABLE])
            ->innerJoin(['t' => self::TAGS_TABLE], '[[t.pageId]] = [[p.id]]')
            ->where(['t.tag' => $tags])
            ->all();
        foreach ($pages as $page) {
            self::queueUrl($page['url'], (int)$page['siteId']);
        }
    }

    /**
     * Pushes a job for a URL, once per process within DEDUPE_SECONDS (a save in three sites, or of a page with its content rows,
     * invalidates the same pages several times).
     */
    public static function queueUrl(string $url, int $siteId): void
    {
        $now = time();
        if (isset(self::$queued[$url]) && $now - self::$queued[$url] < self::DEDUPE_SECONDS) {
            return;
        }
        self::$queued[$url] = $now;
        // The time to run: the request's timeout plus some margin
        Queue::push(new WarmImages(['url' => $url, 'siteId' => $siteId]), self::PRIORITY, self::DELAY, (int)self::settings()['timeout'] + 60);
    }

    // Requesting
    // =========================================================================

    /**
     * Requests a page as a warm request. Returns the HTTP status (200 when the page was rendered); a page that's gone is forgotten.
     */
    public static function warm(string $url, int $siteId): int
    {
        $settings = self::settings();
        // A URL made before the site's aliases were set (a script that doesn't run a request) still has @baseUrl
        $url = Craft::getAlias($url);
        $sites = Craft::$app->getSites();
        $site = $sites->getSiteById($siteId) ?? $sites->getPrimarySite();

        $headers = [
            self::HEADER => self::token(),
            self::URL_HEADER => $url,
            // As a visitor of that language (the language redirect on the home page reads it)
            'Accept-Language' => $site->language,
            'User-Agent' => 'Statik image warmer',
        ];
        $cookie = self::siteAccessCookie($site);
        if ($cookie) {
            $headers['Cookie'] = $cookie;
        }

        $response = Craft::createGuzzleClient()->get($url, [
            'headers' => $headers,
            'timeout' => (int)$settings['timeout'],
            'allow_redirects' => false,
            'http_errors' => false,
            'verify' => (bool)$settings['verifySsl'],
        ]);
        $status = $response->getStatusCode();
        if (in_array($status, [404, 410], true)) {
            self::forgetPage($url);
        }

        return $status;
    }

    /**
     * The access cookie of Knock Knock (the site password on staging and production) for that site, signed as Craft signs its
     * cookies, so the warm request isn't sent to the password page. Null when the site isn't protected.
     */
    private static function siteAccessCookie(Site $site): ?string
    {
        if (!class_exists(KnockKnock::class) || !KnockKnock::$plugin) {
            return null;
        }
        $sites = Craft::$app->getSites();
        $currentSite = $sites->getCurrentSite();
        // The settings and the cookie are per site
        $sites->setCurrentSite($site);
        try {
            $settings = KnockKnock::$plugin->getSettings();
            $password = $settings->getPassword();
            if (!$settings->getEnabled() || $password === '') {
                return null;
            }
            $name = AccessTokenHelper::getCookieName();
            $token = AccessTokenHelper::create($password, $settings->getCookieDuration());
        } finally {
            $sites->setCurrentSite($currentSite);
        }
        $value = Craft::$app->getSecurity()->hashData(serialize([$name, $token]), Craft::$app->getConfig()->getGeneral()->securityKey);

        return $name . '=' . rawurlencode($value);
    }
}
