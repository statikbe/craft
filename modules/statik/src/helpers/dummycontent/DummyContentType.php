<?php

namespace modules\statik\helpers\dummycontent;

use Craft;
use craft\elements\Asset;
use craft\elements\Entry;
use craft\helpers\StringHelper;
use statikbe\trinity\Trinity;

/**
 * A content type that `craft statik/dummy-content/<type>` can fill with dummy items: news now, calendar and knowledge base items
 * later. A subclass names its section, entry type and (optionally) its category section and field, and fills one item; this class
 * does the rest: content from config/dummy-content/content.json (under key()), images from the assets, content rows for the
 * content builder and the `dummy-` slugs that let the command find, replace and remove its own items.
 */
abstract class DummyContentType
{
    /** Slug prefix of every generated item and category: only entries with it are replaced or removed */
    public const SLUG_PREFIX = 'dummy-';

    /** @var array<string, mixed> This type's part of content.json */
    protected array $content;

    /** @var Asset[]|null Image assets to pick from */
    private ?array $images = null;

    /** Days back from now of the last item's date (see pastDate()) */
    private int $daysBack = 0;

    public function __construct(array $content)
    {
        $this->content = $content;
    }

    /** The command's action and the key in content.json, e.g. 'news' */
    abstract public function key(): string;

    /** Name in the command's output, e.g. 'news items' */
    abstract public function label(): string;

    /** Handle of the section the items go in */
    abstract public function sectionHandle(): string;

    /** Handle of the items' entry type (null: the section's first) */
    public function entryTypeHandle(): ?string
    {
        return null;
    }

    /** Handle of the section with the categories, or null when the type has none */
    public function categorySectionHandle(): ?string
    {
        return null;
    }

    /** Handle of the Entries field on an item that links its categories */
    public function categoryFieldHandle(): ?string
    {
        return null;
    }

    /**
     * Fills one item (title, dates, fields). Called with a new, unsaved entry in the section.
     *
     * @param int $index 0 for the first (newest) item
     * @param int[] $categoryIds the categories to choose from
     */
    abstract public function fill(Entry $entry, int $index, array $categoryIds): void;

    // Helpers for fill()
    // -------------------------------------------------------------------------

    /** Item $index of a list in content.json, cycling through it; null for a missing or empty list */
    protected function pick(string $list, int $index): mixed
    {
        $items = array_values((array)($this->content[$list] ?? []));
        return $items ? $items[$index % count($items)] : null;
    }

    /** A random item of a list in content.json */
    protected function random(string $list): mixed
    {
        $items = array_values((array)($this->content[$list] ?? []));
        return $items ? $items[mt_rand(0, count($items) - 1)] : null;
    }

    /** The title for item $index: the list cycles, later rounds get a number ("… (2)") */
    protected function title(string $list, int $index): string
    {
        $items = array_values((array)($this->content[$list] ?? []));
        if (!$items) {
            return ucfirst($this->key()) . ' ' . ($index + 1);
        }
        $round = intdiv($index, count($items));
        return $items[$index % count($items)] . ($round ? ' (' . ($round + 1) . ')' : '');
    }

    /** A random image asset, or null when there are none; landscape images first when $landscape */
    protected function image(bool $landscape = false): ?Asset
    {
        $this->images ??= Asset::find()->kind(Asset::KIND_IMAGE)->filename(['not', '*.svg'])->all();
        $images = $landscape ? array_values(array_filter($this->images, fn(Asset $asset) => $asset->width > $asset->height)) : [];
        $images = $images ?: $this->images;
        return $images ? $images[mt_rand(0, count($images) - 1)] : null;
    }

    /** A date in the past: a few hours ago for item 0, then 2–9 days before the previous item each (call it once per item, in order) */
    protected function pastDate(int $index): \DateTime
    {
        if ($index === 0) {
            $this->daysBack = 0;
            // Not later today: the item would be pending (not live) until then
            return (new \DateTime())->modify('-' . mt_rand(1, 6) . ' hours');
        }
        $this->daysBack += mt_rand(2, 9);
        return (new \DateTime())->modify("-{$this->daysBack} days")->setTime(mt_rand(8, 17), mt_rand(0, 59));
    }

    /**
     * Content rows for a content builder (Trinity's row entry type and fields), as Matrix field values. Each row is
     * ['layout' => 'full'|'halves'|…, 'background' => …, 'cells' => [['type' => 'cellText', 'fields' => […]], …]].
     */
    protected function contentRows(array $rows): array
    {
        $settings = Trinity::getInstance()->getSettings();
        $value = [];
        foreach (array_values($rows) as $i => $row) {
            $cells = [];
            foreach (array_values($row['cells']) as $j => $cell) {
                $cells['new' . ($j + 1)] = ['type' => $cell['type'], 'enabled' => true, 'fields' => $cell['fields']];
            }
            $fields = [$settings->layoutField => $row['layout'] ?? 'full', $settings->cellsField => $cells];
            if ($settings->rowBackgroundField && isset($row['background'])) {
                $fields[$settings->rowBackgroundField] = $row['background'];
            }
            $value['new' . ($i + 1)] = ['type' => $settings->rowEntryType, 'enabled' => true, 'fields' => $fields];
        }
        return $value;
    }

    /** The slug for a generated entry with this title */
    public static function slug(string $title): string
    {
        return self::SLUG_PREFIX . StringHelper::slugify($title);
    }
}
