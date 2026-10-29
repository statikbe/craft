<?php

namespace modules\statik\helpers;

use Craft;
use craft\base\ElementInterface;
use craft\ckeditor\Field as CkeditorField;
use craft\elements\db\ElementQueryInterface;
use craft\elements\Entry;
use craft\fields\Matrix;
use statikbe\trinity\Trinity;

/**
 * The heading outline of a content builder: the hidden h2 above a content row of cards, and the heading check on save.
 *
 * The headings the templates render:
 * - the page header: the only h1;
 * - a title (blockTitle) of a block or column: an h2, also with "Show title" off (then only screen readers read it, sr-only);
 * - cards: h3 (the Overview, Card, Person and Team columns);
 * - the CKEditor text: the levels the editor picks (h3–h5 in CKEditor extended).
 *
 * A content row whose cards come before any h2 of its own (a title, also a hidden one, or an h2 in the text; in source order)
 * gets a hidden h2 (rowHeading), so its h3 cards don't follow the h1 or an unrelated part of the page: when no h2 came before
 * it on the page, or when the row starts a new part (another background than the row above, or "Spacing above" normal or
 * extra). Its text: the `heading` of the
 * Overview's source in config/overview-sources.php, or rowHeadings in config/custom.php for the other column types; both are
 * translation keys (website_name).
 *
 * The check (custom.php → headingCheck) only looks at the editor's own text: a heading may go at most one level deeper than
 * the heading above it (h2 → h4 skips h3), counting titles (also hidden ones) and the hidden row headings. Everything else is
 * the templates' job.
 */
class Headings
{
    /** Column types (Trinity cell types) whose cards are h3 */
    public const CARD_TYPES = ['overview', 'card', 'person', 'team'];

    /** @var array<string, array{rowHeadings: array<int|string, string>, issues: string[]}> outline per page object and field */
    private static array $outlines = [];

    /**
     * The hidden h2 above this content row, or null when it doesn't need one.
     */
    public static function rowHeading(ElementInterface $page, Entry $row, string $field = 'contentBuilder'): ?string
    {
        $key = spl_object_id($page) . '-' . $field;
        self::$outlines[$key] ??= self::outline($page, $field);
        return self::$outlines[$key]['rowHeadings'][self::rowKey($row)] ?? null;
    }

    /**
     * Whether a block or column shows its title: "Show title" (showTitle) on, or not in its field layout.
     */
    public static function showsTitle(Entry $block): bool
    {
        return self::fieldValue($block, 'showTitle') ?? true;
    }

    /**
     * The heading check when an entry is published (Entry::EVENT_AFTER_VALIDATE, live scenario), for the content builder
     * fields in custom.php → headingCheckFields. headingCheck 'block': an error on the field, the entry isn't saved; 'warn': a
     * warning after saving; false: off. Not for drafts, autosaves, propagation to other sites, resaving or console commands.
     */
    public static function check(Entry $entry): void
    {
        $custom = Craft::$app->getConfig()->getCustom();
        $mode = $custom->headingCheck ?? 'warn';
        if (
            !in_array($mode, ['warn', 'block'], true)
            || $entry->getScenario() !== Entry::SCENARIO_LIVE
            || $entry->propagating
            || $entry->resaving
            || $entry->getIsRevision()
            || Craft::$app->getRequest()->getIsConsoleRequest()
        ) {
            return;
        }

        foreach ($custom->headingCheckFields ?? ['contentBuilder'] as $field) {
            $issues = self::outline($entry, $field)['issues'];
            if (!$issues) {
                continue;
            }
            if ($mode === 'block') {
                foreach ($issues as $issue) {
                    $entry->addError($field, $issue);
                }
            } elseif (!$entry->hasErrors()) {
                Craft::$app->getSession()->setError(Craft::t('site', 'Check the heading levels: {issues}', ['issues' => implode(' ', $issues)]));
            }
        }
    }

    /**
     * The heading outline of a content builder field on a page: the hidden row headings (by row id) and the heading levels the
     * editor skipped in the text, as messages for the editor.
     *
     * @return array{rowHeadings: array<int|string, string>, issues: string[]}
     */
    public static function outline(ElementInterface $page, string $field = 'contentBuilder'): array
    {
        $result = ['rowHeadings' => [], 'issues' => []];
        if ($page->getFieldLayout()?->getFieldByHandle($field) === null) {
            return $result;
        }
        $blocks = self::all($page->getFieldValue($field));

        $rows = Trinity::getInstance()->getRows();
        $settings = $rows->getSettings();
        $level = 1;
        $seenH2 = false;
        $previousBackground = null;
        $position = 0;

        foreach ($blocks as $block) {
            if (!$block instanceof Entry) {
                continue;
            }
            $position++;
            $isRow = $rows->isRow($block);
            // A content row's columns; an older full-width block is its own "column"
            $cells = $isRow ? self::all($block->getFieldValue($settings->cellsField)) : [$block];

            // A new part of the page: another background than the row above, or more spacing than "close" chosen
            $background = self::background($block);
            $spacing = $settings->rowSpacingField ? (string)(self::fieldValue($block, $settings->rowSpacingField)?->value ?? '') : '';
            $newPart = $position === 1 || $background !== $previousBackground || in_array($spacing, ['normal', 'extra'], true);
            $previousBackground = $background;

            $cellInfo = [];
            foreach ($cells as $cell) {
                $headings = self::textHeadings($cell);
                $hasTitle = self::title($cell) !== '';
                $cellInfo[] = [
                    'cell' => $cell,
                    'type' => $isRow ? $rows->cellType($cell) : $block->getType()->handle,
                    'hasTitle' => $hasTitle,
                    'headings' => $headings,
                ];
            }

            // The hidden h2 for a row whose cards come before any h2 of its own (a title, or an h2 in the text), in source order
            $cardColumn = null;
            foreach ($cellInfo as $info) {
                if ($info['hasTitle'] || in_array(2, array_column($info['headings'], 'level'), true)) {
                    break;
                }
                if (in_array($info['type'], self::CARD_TYPES, true)) {
                    $cardColumn = $info;
                    break;
                }
            }
            if ($isRow && $cardColumn && (!$seenH2 || $newPart) && ($text = self::defaultHeading($cardColumn['cell'], $cardColumn['type']))) {
                $result['rowHeadings'][self::rowKey($block)] = $text;
                $level = 2;
                $seenH2 = true;
            }

            foreach ($cellInfo as $column => $info) {
                if ($info['hasTitle']) {
                    $level = 2;
                    $seenH2 = true;
                }
                foreach ($info['headings'] as $heading) {
                    if ($heading['level'] > $level + 1 || $heading['level'] === 1) {
                        $result['issues'][] = self::issue($position, $isRow ? $column + 1 : null, $info['cell'], $heading, $level);
                    }
                    $level = $heading['level'];
                    $seenH2 = $seenH2 || $level === 2;
                }
                // Cards: h3
                if (in_array($info['type'], self::CARD_TYPES, true) && $level >= 2) {
                    $level = 3;
                }
            }
        }

        return $result;
    }

    /**
     * The headings in the CKEditor fields a block or column shows, in order, also in its nested entries (e.g. the answers of
     * the FAQ column; their titles aren't headings).
     *
     * @return array<array{level: int, text: string}>
     */
    private static function textHeadings(Entry $cell, bool $nested = true): array
    {
        $headings = [];
        $rows = Trinity::getInstance()->getRows();
        foreach ($cell->getFieldLayout()?->getCustomFields() ?? [] as $field) {
            if (!$rows->showsField($cell, $field->handle)) {
                continue;
            }
            if ($field instanceof Matrix && $nested) {
                foreach (self::all($cell->getFieldValue($field->handle)) as $entry) {
                    array_push($headings, ...self::textHeadings($entry, false));
                }
                continue;
            }
            if (!$field instanceof CkeditorField) {
                continue;
            }
            $html = (string)$cell->getFieldValue($field->handle);
            if (preg_match_all('/<h([1-6])\b[^>]*>(.*?)<\/h\1>/is', $html, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $headings[] = [
                        'level' => (int)$match[1],
                        'text' => trim(html_entity_decode(strip_tags($match[2]))),
                    ];
                }
            }
        }
        return $headings;
    }

    /**
     * The title of a block or column (blockTitle, visible or hidden), '' when it has none or its layout hides it.
     */
    private static function title(Entry $cell): string
    {
        if (!Trinity::getInstance()->getRows()->showsField($cell, 'blockTitle')) {
            return '';
        }
        return trim((string)(self::fieldValue($cell, 'blockTitle') ?? ''));
    }

    /**
     * The hidden heading's text for a column of cards: the Overview's source (overview-sources.php → heading), or the column
     * type (custom.php → rowHeadings). Null when none is configured.
     */
    private static function defaultHeading(Entry $cell, string $type): ?string
    {
        $key = null;
        if ($type === 'overview') {
            $sources = Craft::$app->getConfig()->getConfigFromFile('overview-sources');
            $option = (string)(self::fieldValue($cell, 'overviewOptions')?->value ?? '') ?: 'entries';
            $key = ($sources[$option] ?? $sources['entries'] ?? [])['heading'] ?? null;
        } else {
            $key = (Craft::$app->getConfig()->getCustom()->rowHeadings ?? [])[$type] ?? null;
        }
        return $key ? Craft::t('website_name', $key) : null;
    }

    /**
     * The row's background as the templates use it (contentBuilder/contentBuilder.twig): the background field's value, or the default when
     * it's empty, hidden or not in the layout.
     */
    private static function background(Entry $block): string
    {
        $rows = Trinity::getInstance()->getRows();
        $settings = $rows->getSettings();
        $field = $settings->rowBackgroundField;
        if (!$field || $block->getFieldLayout()?->getFieldByHandle($field) === null) {
            return '';
        }
        $value = $rows->showsField($block, $field) ? (string)$block->getFieldValue($field) : '';
        return $value !== '' ? $value : (string)$settings->rowBackgroundDefault;
    }

    /**
     * @param array{level: int, text: string} $heading
     */
    private static function issue(int $row, ?int $column, Entry $cell, array $heading, int $level): string
    {
        $where = $column !== null
            ? Craft::t('site', 'Row {row}, column {column} ({type})', ['row' => $row, 'column' => $column, 'type' => Craft::t('site', $cell->getType()->name)])
            : Craft::t('site', 'Block {row} ({type})', ['row' => $row, 'type' => Craft::t('site', $cell->getType()->name)]);

        if ($heading['level'] === 1) {
            $problem = Craft::t('site', 'the heading “{text}” is an H1, but the page title is the only H1.', ['text' => $heading['text']]);
        } elseif ($level === 1 && $cell->getFieldLayout()?->getFieldByHandle('blockTitle') !== null) {
            $problem = Craft::t('site', 'the heading “{text}” is an H{level}, but there is no H2 above it. Give this column a title (switch off “Show title” to only show it to screen readers).', ['text' => $heading['text'], 'level' => $heading['level']]);
        } elseif ($level === 1) {
            $problem = Craft::t('site', 'the heading “{text}” is an H{level}, but there is no H2 above it. Add a title above it, e.g. in a column before it (switch off “Show title” to only show it to screen readers).', ['text' => $heading['text'], 'level' => $heading['level']]);
        } else {
            $problem = Craft::t('site', 'the heading “{text}” is an H{level}, but the heading above it is an H{above}. Make it an H{next}.', ['text' => $heading['text'], 'level' => $heading['level'], 'above' => $level, 'next' => $level + 1]);
        }
        return $where . ': ' . $problem;
    }

    /**
     * A field's value, or null when the field isn't in the element's layout.
     */
    private static function fieldValue(Entry $element, string $handle): mixed
    {
        if ($element->getFieldLayout()?->getFieldByHandle($handle) === null) {
            return null;
        }
        return $element->getFieldValue($handle);
    }

    /**
     * The enabled entries of a Matrix value: an array, an eager-loaded collection, or a query; a query's cached result first
     * (the entries as edited, while validating a save), as Craft's Matrix field does.
     *
     * @return Entry[]
     */
    private static function all(mixed $value): array
    {
        if ($value instanceof ElementQueryInterface) {
            $cached = $value->getCachedResult();
            // Disabled entries aren't rendered
            return $cached !== null
                ? array_values(array_filter($cached, fn($e) => $e->enabled && $e->getEnabledForSite()))
                : (clone $value)->all();
        }
        if ($value === null) {
            return [];
        }
        return is_array($value) ? $value : (method_exists($value, 'all') ? $value->all() : iterator_to_array($value));
    }

    private static function rowKey(Entry $row): int|string
    {
        return $row->id ?? spl_object_id($row);
    }

    /** Cache key of the report; raise the version when the outline rules change, so the report is rebuilt */
    private const REPORT_CACHE_KEY = 'statik.headings.report.v1';

    /**
     * The heading issues of a page (every content builder field in custom.php → headingCheckFields), or null when it has no
     * content builder.
     *
     * @return string[]|null
     */
    public static function issues(Entry $entry): ?array
    {
        $layout = $entry->getFieldLayout();
        $fields = array_filter(
            Craft::$app->getConfig()->getCustom()->headingCheckFields ?? ['contentBuilder'],
            fn(string $field) => $layout?->getFieldByHandle($field) !== null,
        );
        if (!$fields) {
            return null;
        }
        $issues = [];
        foreach ($fields as $field) {
            $issues = array_merge($issues, self::outline($entry, $field)['issues']);
        }
        return $issues;
    }

    /**
     * The pages (in a section, every site, also disabled ones) with heading issues, for the Heading issues dashboard widget:
     * [entryId-siteId => [entryId, siteId, title, url, issues]]. Kept in the cache and updated when a page is saved or
     * deleted (refresh(), forget()); built in full when the cache is empty (or by `ddev craft statik/headings`).
     *
     * @return array<string, array{entryId: int, siteId: int, title: string, url: string, issues: string[]}>
     */
    public static function report(bool $rebuild = false): array
    {
        $cache = Craft::$app->getCache();
        $report = $rebuild ? false : $cache->get(self::REPORT_CACHE_KEY);
        if (is_array($report)) {
            return $report;
        }

        $report = [];
        $query = Entry::find()->section('*')->site('*')->status(null)->drafts(false)->revisions(false);
        foreach ($query->each() as $entry) {
            /** @var Entry $entry */
            if ($issues = self::issues($entry)) {
                $report[self::reportKey($entry)] = self::reportItem($entry, $issues);
            }
        }
        $cache->set(self::REPORT_CACHE_KEY, $report, 0);
        return $report;
    }

    /** @var array<string, array{0: int, 1: int}> pages to update in the report at the end of the request */
    private static array $pending = [];

    /**
     * Updates the report for a saved entry: a page, or the page a saved row or column is on. Only when the report is in the
     * cache (otherwise it's built in full when the widget needs it). Once per page, at the end of the request, so saving a
     * page with all its rows and columns checks it once, as saved.
     */
    public static function refresh(Entry $entry): void
    {
        if ($entry->getIsDraft() || $entry->getIsRevision() || !$entry->getIsCanonical()) {
            return;
        }
        // A nested entry (a row or column): the page it's on
        $page = $entry;
        for ($i = 0; $page->getSection() === null && $i < 5; $i++) {
            $owner = $page->getPrimaryOwner();
            if (!$owner instanceof Entry || $owner->getIsDraft() || $owner->getIsRevision()) {
                return;
            }
            $page = $owner;
        }
        if ($page->getSection() === null) {
            return;
        }

        if (!self::$pending) {
            Craft::$app->onAfterRequest(fn() => self::refreshPending());
        }
        self::$pending[self::reportKey($page)] = [(int)$page->id, (int)$page->siteId];
    }

    private static function refreshPending(): void
    {
        $pending = self::$pending;
        self::$pending = [];
        $cache = Craft::$app->getCache();
        $report = $cache->get(self::REPORT_CACHE_KEY);
        if (!is_array($report)) {
            return;
        }
        foreach ($pending as $key => [$id, $siteId]) {
            $page = Entry::find()->id($id)->siteId($siteId)->status(null)->one();
            $issues = $page ? self::issues($page) : null;
            if ($issues) {
                $report[$key] = self::reportItem($page, $issues);
            } else {
                unset($report[$key]);
            }
        }
        $cache->set(self::REPORT_CACHE_KEY, $report, 0);
    }

    /**
     * Removes a deleted page from the report.
     */
    public static function forget(Entry $entry): void
    {
        $cache = Craft::$app->getCache();
        $report = $cache->get(self::REPORT_CACHE_KEY);
        if (!is_array($report) || !isset($report[self::reportKey($entry)])) {
            return;
        }
        // Deleting removes the entry in every site
        $report = array_filter($report, fn(array $item) => $item['entryId'] !== $entry->id);
        $cache->set(self::REPORT_CACHE_KEY, $report, 0);
    }

    private static function reportKey(Entry $entry): string
    {
        return $entry->id . '-' . $entry->siteId;
    }

    /**
     * @param string[] $issues
     * @return array{entryId: int, siteId: int, title: string, url: string, issues: string[]}
     */
    private static function reportItem(Entry $entry, array $issues): array
    {
        return [
            'entryId' => (int)$entry->id,
            'siteId' => (int)$entry->siteId,
            'title' => (string)$entry->title,
            'url' => (string)$entry->getCpEditUrl(),
            'issues' => $issues,
        ];
    }
}
