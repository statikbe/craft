<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\elements\Entry;
use craft\elements\User;
use craft\helpers\Console;
use craft\helpers\Json;
use modules\statik\helpers\dummycontent\DummyContentType;
use modules\statik\helpers\dummycontent\NewsDummyContent;
use yii\console\ExitCode;

/**
 * Dummy content for overview pages and cards: news items now; calendar and knowledge base items once their sections exist (add a
 * DummyContentType subclass, list it in TYPES and add an action).
 *
 *     ddev craft statik/dummy-content/news --count=20 --categories --category-count=6
 *     ddev craft statik/dummy-content/clean news --categories
 *
 * Generated items and categories get a `dummy-` slug: a new run replaces only those (unless --keep), existing content is never
 * touched. Texts come from config/dummy-content/content.json, images from the assets.
 */
class DummyContentController extends Controller
{
    /** @var array<string, class-string<DummyContentType>> The content types, by action */
    private const TYPES = [
        'news' => NewsDummyContent::class,
        // 'calendar' => CalendarDummyContent::class,
        // 'knowledge-base' => KnowledgeBaseDummyContent::class,
    ];

    private const CONTENT_FILE = '@root/config/dummy-content/content.json';

    public $defaultAction = 'index';

    /** @var int How many items to create */
    public int $count = 12;

    /** @var bool Also create dummy categories (else the items get the categories that exist) */
    public bool $categories = false;

    /** @var int How many dummy categories to create, with --categories */
    public int $categoryCount = 6;

    /** @var bool Keep the dummy items (and categories) of an earlier run instead of replacing them */
    public bool $keep = false;

    /** @var bool Only show what would be created or removed */
    public bool $dryRun = false;

    /** @var int Seed for the random choices (images, dates, categories), so a run can be repeated */
    public int $seed = 1;

    public function options($actionID): array
    {
        $options = parent::options($actionID);
        if ($actionID === 'clean') {
            return [...$options, 'categories', 'dryRun'];
        }
        if (isset(self::TYPES[$actionID])) {
            return [...$options, 'count', 'categories', 'categoryCount', 'keep', 'dryRun', 'seed'];
        }
        return $options;
    }

    /**
     * Lists the content types.
     */
    public function actionIndex(): int
    {
        $this->stdout('Content types:' . PHP_EOL);
        foreach (array_keys(self::TYPES) as $key) {
            $type = $this->type($key);
            $this->stdout("  {$key}", Console::FG_GREEN);
            $this->stdout(" — {$type->label()} in \"{$type->sectionHandle()}\"" . ($type->categorySectionHandle() ? ", categories in \"{$type->categorySectionHandle()}\"" : '') . PHP_EOL);
        }
        $this->stdout(PHP_EOL . 'Usage: craft statik/dummy-content/<type> [--count=12] [--categories] [--category-count=6] [--keep] [--dry-run] [--seed=1]' . PHP_EOL);
        $this->stdout('       craft statik/dummy-content/clean <type> [--categories] [--dry-run]' . PHP_EOL);
        return ExitCode::OK;
    }

    /**
     * Creates dummy news items (and with --categories, dummy news categories).
     */
    public function actionNews(): int
    {
        return $this->generate('news');
    }

    /**
     * Removes the dummy items of a content type (and with --categories, its dummy categories).
     */
    public function actionClean(string $type = 'news'): int
    {
        if (!isset(self::TYPES[$type])) {
            $this->stderr("Unknown content type \"{$type}\". Types: " . implode(', ', array_keys(self::TYPES)) . PHP_EOL, Console::FG_RED);
            return ExitCode::USAGE;
        }
        $contentType = $this->type($type);
        $removed = $this->remove($contentType->sectionHandle());
        $this->stdout(($this->dryRun ? 'Would remove ' : 'Removed ') . "{$removed} dummy {$contentType->label()}." . PHP_EOL);
        if ($this->categories && $contentType->categorySectionHandle()) {
            $removed = $this->remove($contentType->categorySectionHandle());
            $this->stdout(($this->dryRun ? 'Would remove ' : 'Removed ') . "{$removed} dummy categories." . PHP_EOL);
        }
        return ExitCode::OK;
    }

    private function generate(string $key): int
    {
        $type = $this->type($key);
        $entries = Craft::$app->getEntries();
        $section = $entries->getSectionByHandle($type->sectionHandle());
        $entryType = $section ? ($type->entryTypeHandle() ? $entries->getEntryTypeByHandle($type->entryTypeHandle()) : ($section->getEntryTypes()[0] ?? null)) : null;
        if (!$section || !$entryType) {
            $this->stderr("Section \"{$type->sectionHandle()}\" or its entry type doesn't exist." . PHP_EOL, Console::FG_RED);
            return ExitCode::CONFIG;
        }
        if ($this->count < 1) {
            $this->stderr('--count must be at least 1.' . PHP_EOL, Console::FG_RED);
            return ExitCode::USAGE;
        }
        mt_srand($this->seed);
        $author = User::find()->admin()->status(null)->one();

        // Earlier dummy content of this type
        if (!$this->keep) {
            $removed = $this->remove($section->handle);
            $this->stdout(($this->dryRun ? 'Would remove ' : 'Removed ') . "{$removed} earlier dummy {$type->label()}." . PHP_EOL);
            if ($this->categories && $type->categorySectionHandle()) {
                $removed = $this->remove($type->categorySectionHandle());
                $this->stdout(($this->dryRun ? 'Would remove ' : 'Removed ') . "{$removed} earlier dummy categories." . PHP_EOL);
            }
        }

        $categoryIds = $type->categorySectionHandle() ? $this->categories($type, $author) : [];
        if ($type->categorySectionHandle() && !$categoryIds && !$this->dryRun) {
            $this->stdout('No categories to link (add --categories to create some).' . PHP_EOL, Console::FG_YELLOW);
        }

        $site = Craft::$app->getSites()->getPrimarySite();
        // With --keep, continue after the dummy items that are already there, so the titles differ
        $offset = $this->keep ? Entry::find()->section($section->handle)->slug(DummyContentType::SLUG_PREFIX . '*')->status(null)->count() : 0;
        $created = 0;
        for ($i = $offset; $i < $offset + $this->count; $i++) {
            $entry = new Entry([
                'sectionId' => $section->id,
                'typeId' => $entryType->id,
                'siteId' => $site->id,
                'authorId' => $author?->id,
            ]);
            $type->fill($entry, $i, $categoryIds);
            $this->enableOnAllSites($entry);
            if ($this->dryRun) {
                $this->stdout('  ' . $entry->postDate->format('Y-m-d') . '  ' . $entry->title . PHP_EOL);
                continue;
            }
            if (Craft::$app->getElements()->saveElement($entry)) {
                $created++;
                $this->stdout('  ' . $entry->postDate->format('Y-m-d') . '  ' . $entry->title . PHP_EOL);
            } else {
                $this->stderr("  Couldn't save \"{$entry->title}\": " . implode(' ', $entry->getFirstErrors()) . PHP_EOL, Console::FG_RED);
            }
        }

        $this->stdout(($this->dryRun ? "Would create {$this->count} " : "Created {$created} ") . "dummy {$type->label()}" . ($categoryIds ? ' in ' . count($categoryIds) . ' categories' : '') . '.' . PHP_EOL, Console::FG_GREEN);
        return $created === $this->count || $this->dryRun ? ExitCode::OK : ExitCode::UNSPECIFIED_ERROR;
    }

    /**
     * The categories to link: new dummy categories with --categories, else the ones in the category section.
     *
     * @return int[]
     */
    private function categories(DummyContentType $type, ?User $author): array
    {
        $entries = Craft::$app->getEntries();
        $section = $entries->getSectionByHandle($type->categorySectionHandle());
        if (!$section) {
            $this->stdout("Category section \"{$type->categorySectionHandle()}\" doesn't exist: no categories." . PHP_EOL, Console::FG_YELLOW);
            return [];
        }
        if (!$this->categories) {
            return Entry::find()->section($section->handle)->ids();
        }

        $titles = array_values((array)(self::content()[$type->key()]['categories'] ?? []));
        $ids = [];
        for ($i = 0; $i < $this->categoryCount; $i++) {
            $round = $titles ? intdiv($i, count($titles)) : $i;
            $title = ($titles ? $titles[$i % count($titles)] : 'Category') . ($round ? ' (' . ($round + 1) . ')' : '');
            if ($this->dryRun) {
                $this->stdout("  category: {$title}" . PHP_EOL);
                continue;
            }
            $category = new Entry([
                'sectionId' => $section->id,
                'typeId' => $section->getEntryTypes()[0]->id,
                'siteId' => Craft::$app->getSites()->getPrimarySite()->id,
                'authorId' => $author?->id,
                'title' => $title,
                'slug' => DummyContentType::slug($title),
            ]);
            $this->enableOnAllSites($category);
            if (Craft::$app->getElements()->saveElement($category)) {
                $ids[] = $category->id;
            } else {
                $this->stderr("  Couldn't save category \"{$title}\": " . implode(' ', $category->getFirstErrors()) . PHP_EOL, Console::FG_RED);
            }
        }
        if (!$this->dryRun) {
            $this->stdout('Created ' . count($ids) . ' dummy categories.' . PHP_EOL);
        }
        return $ids;
    }

    /** Enabled on every site the section has: sections can be disabled by default on the other sites */
    private function enableOnAllSites(Entry $entry): void
    {
        $siteIds = array_map(fn($settings) => $settings->siteId, $entry->getSection()->getSiteSettings());
        $entry->setEnabledForSite(array_fill_keys($siteIds, true));
    }

    /** Removes (permanently) the entries with a dummy- slug in a section; returns how many */
    private function remove(string $sectionHandle): int
    {
        $entries = Entry::find()->section($sectionHandle)->slug(DummyContentType::SLUG_PREFIX . '*')->status(null)->site('*')->unique()->all();
        if (!$this->dryRun) {
            foreach ($entries as $entry) {
                Craft::$app->getElements()->deleteElement($entry, true);
            }
        }
        return count($entries);
    }

    private function type(string $key): DummyContentType
    {
        $class = self::TYPES[$key];
        $type = new $class([]);
        return new $class((array)(self::content()[$type->key()] ?? []));
    }

    private static function content(): array
    {
        static $content = null;
        if ($content === null) {
            $path = Craft::getAlias(self::CONTENT_FILE);
            $content = is_file($path) ? (Json::decodeIfJson(file_get_contents($path)) ?: []) : [];
        }
        return $content;
    }
}
