<?php

namespace modules\statik\conditions;

use Craft;
use craft\base\conditions\BaseMultiSelectConditionRule;
use craft\base\ElementInterface;
use craft\elements\conditions\ElementConditionRuleInterface;
use craft\elements\db\ElementQueryInterface;
use craft\elements\db\EntryQuery;
use craft\elements\ElementCollection;
use craft\elements\Entry;
use modules\statik\helpers\GridBuilder;

/**
 * Entry condition rule "Column width": the width a content row block (cell) gets on the page, from the row's layout, the
 * block's column and the page (on 2/3 pages every column is 2/3 as wide, see GridBuilder). Use it as a field condition in
 * a cell type's field layout, e.g. to show a field only in full width columns ("is one of: full page width") and another one
 * only in narrower columns ("is not one of: full page width"). Only offered there (see Statik.php).
 *
 * Blocks that are not in a content row have no width, so "is one of" never matches them and "is not one of" always does.
 */
class ColumnWidthConditionRule extends BaseMultiSelectConditionRule implements ElementConditionRuleInterface
{
    /** @var array<string, float|null> width per "rowId-cellId" (a block can be shared by a row and its drafts and revisions), as every field of a block is checked */
    private static array $widths = [];

    /**
     * Sets a cell's width when it is already known (GridBuilder::row() while rendering a row), so it isn't looked up again.
     */
    public static function setWidth(Entry $cell, float $width): void
    {
        if ($cell->id) {
            self::$widths[self::cacheKey($cell)] = $width;
        }
    }

    public function getLabel(): string
    {
        return Craft::t('statik', 'Column width');
    }

    public function getExclusiveQueryParams(): array
    {
        return [];
    }

    /**
     * Every width a column can have on a page: the column widths of all layouts, on normal and 2/3 pages.
     * Keys are the widths in hundredths (stored in project config), labels as in the control panel ("1/2 of the page").
     */
    protected function options(): array
    {
        $widths = [];
        foreach ([false, true] as $narrow) {
            foreach (GridBuilder::allowedLayouts($narrow) as $layout) {
                foreach (GridBuilder::columnWidths($layout, $narrow) as $width) {
                    $widths[self::key($width)] = $width;
                }
            }
        }
        arsort($widths);
        return array_map(fn(float $width) => GridBuilder::formatPageWidth($width), $widths);
    }

    public function modifyQuery(ElementQueryInterface $query): void
    {
        // The width depends on the row and the page, not on anything in the block's own row in the database
    }

    public function matchElement(ElementInterface $element): bool
    {
        $width = $this->width($element);
        return $this->matchValue($width === null ? null : (string)self::key($width));
    }

    /**
     * The block's width on the page, or null when it isn't in a content row.
     */
    private function width(ElementInterface $element): ?float
    {
        if (!$element instanceof Entry || !$element->fieldId) {
            return null;
        }
        // Not cached while editing: the layout or the block's column can change between two checks
        $cache = !Craft::$app->getRequest()->getIsCpRequest() && $element->id;
        if ($cache && array_key_exists(self::cacheKey($element), self::$widths)) {
            return self::$widths[self::cacheKey($element)];
        }

        $width = null;
        $row = $element->getOwner();
        if ($row instanceof Entry && $row->getType()->handle === GridBuilder::ROW_TYPE) {
            $layout = (string)($row->getFieldValue(GridBuilder::LAYOUT_FIELD)?->value ?: 'full');
            $widths = GridBuilder::columnWidths($layout, GridBuilder::isNarrow($row->getOwner()));
            $column = $this->column($row, $element);
            // Blocks beyond the layout's columns render as full rows (see GridBuilder::row())
            $width = $column === null ? null : ($widths[$column] ?? (GridBuilder::isNarrow($row->getOwner()) ? GridBuilder::NARROW_WIDTH : 1));
        }

        if ($cache) {
            self::$widths[self::cacheKey($element)] = $width;
        }
        return $width;
    }

    /**
     * The block's column in the row (0 = left), counting only the blocks that render, like the templates and the validation.
     * The block itself counts even when disabled, so its fields follow the column it is in for the editor.
     */
    private function column(Entry $row, Entry $cell): ?int
    {
        $value = $row->getFieldValue(GridBuilder::CELLS_FIELD);
        $cells = $value instanceof EntryQuery ? (clone $value)->status(null)->all() : ($value instanceof ElementCollection ? $value->all() : []);
        // A block edited in a slideout can be a draft of the block in the row
        $ids = array_filter([$cell->id, $cell->getCanonicalId()]);

        $column = 0;
        foreach ($cells as $other) {
            if (in_array($other->id, $ids, true) || in_array($other->getCanonicalId(), $ids, true)) {
                return $column;
            }
            if ($other->enabled && $other->getEnabledForSite()) {
                $column++;
            }
        }
        return null;
    }

    private static function cacheKey(Entry $cell): string
    {
        return $cell->ownerId . '-' . $cell->id;
    }

    /**
     * A width as an option key: hundredths of the page, e.g. 33 for 1/3.
     */
    private static function key(float $width): int
    {
        return (int)round($width * 100);
    }
}
