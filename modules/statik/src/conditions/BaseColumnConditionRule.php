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
 * Base for the entry condition rules on the column a content row block (cell) is in: "Column width" (its width on the page) and
 * "Column span" (its share of the row). Use them as field conditions in a cell type's field layout; they're only offered there
 * (see Statik.php).
 *
 * Blocks that are not in a content row have no column, so "is one of" never matches them and "is not one of" always does.
 */
abstract class BaseColumnConditionRule extends BaseMultiSelectConditionRule implements ElementConditionRuleInterface
{
    /**
     * @var array<string, array{fraction: float, width: float}|null> column per "rowId-cellId" (a block can be shared by a row and
     * its drafts and revisions), as every field of a block is checked
     */
    private static array $columns = [];

    /**
     * Sets a cell's column when it is already known (GridBuilder::row() while rendering a row), so it isn't looked up again.
     *
     * @param float $fraction share of the row
     * @param float $width width on the page
     */
    public static function setColumn(Entry $cell, float $fraction, float $width): void
    {
        if ($cell->id) {
            self::$columns[self::cacheKey($cell)] = ['fraction' => $fraction, 'width' => $width];
        }
    }

    /**
     * The value this rule compares, from the block's column.
     *
     * @param array{fraction: float, width: float} $column
     */
    abstract protected function columnValue(array $column): float;

    public function getExclusiveQueryParams(): array
    {
        return [];
    }

    public function modifyQuery(ElementQueryInterface $query): void
    {
        // The column depends on the row and the page, not on anything in the block's own row in the database
    }

    public function matchElement(ElementInterface $element): bool
    {
        $column = $this->column($element);
        return $this->matchValue($column === null ? null : (string)self::key($this->columnValue($column)));
    }

    /**
     * A fraction as an option key: hundredths, e.g. 33 for 1/3 (stored in project config).
     */
    protected static function key(float $fraction): int
    {
        return (int)round($fraction * 100);
    }

    /**
     * The block's column: its share of the row and its width on the page, or null when it isn't in a content row.
     *
     * @return array{fraction: float, width: float}|null
     */
    private function column(ElementInterface $element): ?array
    {
        if (!$element instanceof Entry || !$element->fieldId) {
            return null;
        }
        // Not cached while editing: the layout or the block's column can change between two checks
        $cache = !Craft::$app->getRequest()->getIsCpRequest() && $element->id;
        if ($cache && array_key_exists(self::cacheKey($element), self::$columns)) {
            return self::$columns[self::cacheKey($element)];
        }

        $column = null;
        $row = $element->getOwner();
        if ($row instanceof Entry && $row->getType()->handle === GridBuilder::ROW_TYPE) {
            $layout = (string)($row->getFieldValue(GridBuilder::LAYOUT_FIELD)?->value ?: 'full');
            $index = $this->columnIndex($row, $element);
            if ($index !== null) {
                // Blocks beyond the layout's columns render as full rows (see GridBuilder::row())
                $fraction = (GridBuilder::LAYOUTS[$layout] ?? GridBuilder::LAYOUTS['full'])[$index] ?? 1;
                $column = ['fraction' => $fraction, 'width' => $fraction * GridBuilder::pageWidth($row->getOwner())];
            }
        }

        if ($cache) {
            self::$columns[self::cacheKey($element)] = $column;
        }
        return $column;
    }

    /**
     * The block's column in the row (0 = left), counting only the blocks that render, like the templates and the validation.
     * The block itself counts even when disabled, so its fields follow the column it is in for the editor.
     */
    private function columnIndex(Entry $row, Entry $cell): ?int
    {
        $value = $row->getFieldValue(GridBuilder::CELLS_FIELD);
        $cells = $value instanceof EntryQuery ? (clone $value)->status(null)->all() : ($value instanceof ElementCollection ? $value->all() : []);
        // A block edited in a slideout can be a draft of the block in the row
        $ids = array_filter([$cell->id, $cell->getCanonicalId()]);

        $index = 0;
        foreach ($cells as $other) {
            if (in_array($other->id, $ids, true) || in_array($other->getCanonicalId(), $ids, true)) {
                return $index;
            }
            if ($other->enabled && $other->getEnabledForSite()) {
                $index++;
            }
        }
        return null;
    }

    private static function cacheKey(Entry $cell): string
    {
        return $cell->ownerId . '-' . $cell->id;
    }
}
