<?php

namespace modules\statik\conditions;

use Craft;
use modules\statik\helpers\GridBuilder;

/**
 * Entry condition rule "Column span": the share of its row a content row block (cell) takes, from the row's layout and the
 * block's column, the same on every page (a block that fills its row is "full row" on a 2/3 page too). E.g. "is one of: full row"
 * for a field only when the block has the row to itself, "is not one of: full row" for the reverse. For conditions about the
 * room a field gets on the page, use "Column width".
 */
class ColumnSpanConditionRule extends BaseColumnConditionRule
{
    public function getLabel(): string
    {
        return Craft::t('statik', 'Column span');
    }

    /**
     * Every share of the row a column can have in the layouts (GridBuilder::LAYOUTS): full row, 2/3, 1/2, 1/3 of the row.
     */
    protected function options(): array
    {
        $fractions = [];
        foreach (GridBuilder::LAYOUTS as $layoutFractions) {
            foreach ($layoutFractions as $fraction) {
                $fractions[self::key($fraction)] = $fraction;
            }
        }
        arsort($fractions);
        return array_map(fn(float $fraction) => $fraction >= 1
            ? Craft::t('statik', 'full row')
            : Craft::t('statik', '{width} of the row', ['width' => GridBuilder::formatWidth($fraction)]), $fractions);
    }

    protected function columnValue(array $column): float
    {
        return $column['fraction'];
    }
}
