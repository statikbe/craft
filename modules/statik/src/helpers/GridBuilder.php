<?php

namespace modules\statik\helpers;

use Craft;
use craft\base\Element;
use craft\base\ElementInterface;
use craft\elements\Entry;
use craft\fields\Matrix;
use modules\statik\conditions\ContentRowBlocksConditionRule;

/**
 * Rules for the "Content row" content builder block: a row with a 1–3 column layout (gridLayout) and one
 * cell entry per column (gridCells), from left to right.
 *
 * Widths are fractions of the full page width. On pages where the content builder itself is rendered at 2/3
 * of the page (config/custom.php → contentBuilderGrid.narrowSections / narrowEntryTypes), every cell is 2/3 as wide: layouts with 1/3 columns
 * are not allowed there, and cell types are checked against that effective width.
 *
 * Per-project settings live in config/custom.php → contentBuilderGrid (see config()); the layouts themselves are fixed here,
 * as the templates, CSS and control panel JS are built around them.
 */
class GridBuilder
{
    public const ROW_TYPE = 'gridRow';
    public const LAYOUT_FIELD = 'gridLayout';
    public const CELLS_FIELD = 'gridCells';
    /** Dropdown on every cell type: the column's position while the columns are stacked ('' = auto, '1'–'3') */
    public const MOBILE_ORDER_FIELD = 'mobileOrder';

    /** Layout value => column widths, left to right */
    public const LAYOUTS = [
        'full' => [1],
        'halves' => [1 / 2, 1 / 2],
        'thirds' => [1 / 3, 1 / 3, 1 / 3],
        'thirdTwoThirds' => [1 / 3, 2 / 3],
        'twoThirdsThird' => [2 / 3, 1 / 3],
    ];

    /** Width of the content builder on narrow pages */
    public const NARROW_WIDTH = 2 / 3;

    /** Narrowest effective width a column may have; layouts with narrower columns are not allowed */
    public const MIN_WIDTH = 1 / 3;

    /** Defaults for config/custom.php → contentBuilderGrid */
    private const DEFAULT_CONFIG = [
        'narrowSections' => [],
        'narrowEntryTypes' => [],
        'narrowFromViewport' => 980,
        'minWidthPerType' => [
            'cellCards' => 1 / 2,
            'cellTable' => 1 / 2,
            'cellFaq' => 1 / 2,
            'cellEmbed' => 1 / 2,
            'cellForm' => 1 / 2,
        ],
        'maxWidthPerType' => [],
        'blockedCombinations' => [],
    ];

    /** Margin for comparing fractions (1/2 × 2/3 must count as 1/3) */
    private const EPSILON = 0.01;

    /** Min viewport width => page container width (frontend/css/site/main.css), below the first: 95vw */
    private const CONTAINERS = [480 => 448, 660 => 628, 820 => 788, 980 => 948, 1200 => 1168];

    /** Gap between columns (--spacing-column) */
    private const GAP = 48;

    /**
     * Settings from config/custom.php → contentBuilderGrid, with defaults for the ones a project leaves out:
     *  - narrowSections / narrowEntryTypes: pages where the content builder is 2/3 wide
     *  - narrowFromViewport: from which viewport width those pages show the builder at 2/3 (full width below)
     *  - minWidthPerType: cell type handle => minimum width on the page; other types are allowed from the narrowest column
     *  - maxWidthPerType: cell type handle => maximum width on the page; other types are allowed up to full width
     *  - blockedCombinations: pairs of cell type handles that can't be in the same row, e.g. ['cellQuote', 'cellFaq']
     *    (the same handle twice: at most one of that type per row)
     *
     * @return array{narrowSections: string[], narrowEntryTypes: string[], narrowFromViewport: int, minWidthPerType: array<string, float>, maxWidthPerType: array<string, float>, blockedCombinations: array<array{string, string}>}
     */
    public static function config(): array
    {
        return array_merge(self::DEFAULT_CONFIG, (array)(Craft::$app->getConfig()->custom->contentBuilderGrid ?? []));
    }

    public static function minWidth(string $cellType): float
    {
        return (float)(self::config()['minWidthPerType'][$cellType] ?? 0);
    }

    public static function maxWidth(string $cellType): float
    {
        return (float)(self::config()['maxWidthPerType'][$cellType] ?? 1);
    }

    /**
     * Container width from which a row shows its columns side by side (the @sm / @md container queries in _gridRow.twig):
     * rows with 1/3 columns need more room than rows with halves.
     */
    public static function breakpoint(string $layout): int
    {
        return $layout === 'halves' ? 628 : 788;
    }

    /**
     * Everything the templates need to render a content row: its layout and, per column, the cell entry,
     * its effective width (fraction of the page), its position while stacked (see mobileOrder()) and responsive
     * image sizes for an image filling the column.
     */
    public static function row(Entry $row): array
    {
        $narrow = self::isNarrow($row->getOwner());
        $layout = (string)($row->getFieldValue(self::LAYOUT_FIELD)?->value ?: 'full');
        $cells = $row->getFieldValue(self::CELLS_FIELD)->eagerly()->all();
        $widths = self::LAYOUTS[$layout] ?? self::LAYOUTS['full'];

        $mobileOrder = self::mobileOrder($cells);
        $columns = [];
        foreach ($cells as $i => $cell) {
            // Extra cells (layout changed without removing them) render as full rows below; validation prevents saving that
            $fraction = $widths[$i] ?? 1;
            $columns[] = [
                'cell' => $cell,
                'fraction' => $fraction,
                'width' => $fraction * ($narrow ? self::NARROW_WIDTH : 1),
                'mobileOrder' => $mobileOrder[$i] ?? null,
            ] + self::imageSizes($layout, $fraction, $narrow);
        }

        return [
            'layout' => $layout,
            'narrow' => $narrow,
            'columns' => $columns,
        ];
    }

    /**
     * Position of every column while the columns are stacked (1 = top), from the "Mobile order" field of each cell:
     * a column with a number gets that position (higher than the number of columns = last; when two columns ask for the
     * same one, the left one gets it and the other the nearest free position after it, else before it), and the
     * "Auto" columns fill the remaining positions from left to right.
     *
     * @param Entry[] $cells
     * @return int[]|null cell index => position, or null when every column is on "Auto" (the stacked order is the source order)
     */
    public static function mobileOrder(array $cells): ?array
    {
        $cells = array_values($cells);
        $count = count($cells);
        $requested = [];
        foreach ($cells as $i => $cell) {
            $value = $cell->getFieldLayout()?->getFieldByHandle(self::MOBILE_ORDER_FIELD)
                ? (int)$cell->getFieldValue(self::MOBILE_ORDER_FIELD)?->value
                : 0;
            if ($value > 0) {
                $requested[$i] = min($value, $count);
            }
        }
        if (!$requested) {
            return null;
        }

        // By requested position; on a tie, left to right (asort() keeps the order of equal values)
        asort($requested);
        $positions = [];
        foreach ($requested as $i => $position) {
            $free = array_diff(range(1, $count), $positions);
            $after = array_filter($free, fn(int $p) => $p >= $position);
            $positions[$i] = $after ? min($after) : max($free);
        }
        $free = array_values(array_diff(range(1, $count), $positions));
        foreach (array_keys($cells) as $i) {
            $positions[$i] ??= array_shift($free);
        }
        ksort($positions);
        return $positions;
    }

    /**
     * `sizes` and `srcsetSizes` for render_image() for an image that fills a column of the given fraction of the row.
     *
     * @return array{sizes: string, srcsetSizes: string[]}
     */
    public static function imageSizes(string $layout, float $fraction, bool $narrow = false): array
    {
        $sizes = ['(max-width: ' . (array_key_first(self::CONTAINERS) - 1) . 'px) 95vw'];
        $srcset = [];
        $viewports = array_keys(self::CONTAINERS);
        foreach ($viewports as $i => $viewport) {
            $builder = self::CONTAINERS[$viewport];
            if ($narrow && $viewport >= self::config()['narrowFromViewport']) {
                $builder = (int)round($builder * self::NARROW_WIDTH);
            }
            $width = $builder >= self::breakpoint($layout)
                ? (int)round($fraction * ($builder + self::GAP) - self::GAP)
                : $builder;

            $next = $viewports[$i + 1] ?? null;
            $sizes[] = "(min-width: {$viewport}px)" . ($next ? ' and (max-width: ' . ($next - 1) . 'px)' : '') . " {$width}px";
            $srcset[] = "{$width}w";
        }

        return [
            'sizes' => implode(', ', $sizes),
            'srcsetSizes' => array_values(array_unique($srcset)),
        ];
    }

    /**
     * Whether the content builder of this element (the page owning the content row) is rendered at 2/3 width.
     */
    public static function isNarrow(?ElementInterface $page): bool
    {
        if (!$page instanceof Entry) {
            return false;
        }
        // contentbuilder-showcase: the 2/3 showcase page generated by `craft statik/contentbuilder`
        if (ContentbuilderShowcase::isNarrowPage($page)) {
            return true;
        }
        $config = self::config();
        return in_array($page->getSection()?->handle, $config['narrowSections'], true)
            || in_array($page->getType()->handle, $config['narrowEntryTypes'], true);
    }

    /**
     * Effective column widths (fractions of the page width) of a layout on a normal or narrow page.
     *
     * @return float[]
     */
    public static function columnWidths(string $layout, bool $narrow = false): array
    {
        $factor = $narrow ? self::NARROW_WIDTH : 1;
        return array_map(fn(float $width) => $width * $factor, self::LAYOUTS[$layout] ?? self::LAYOUTS['full']);
    }

    /**
     * Layouts that can be used on a normal or narrow page.
     *
     * @return string[]
     */
    public static function allowedLayouts(bool $narrow = false): array
    {
        return array_keys(array_filter(
            self::LAYOUTS,
            fn(array $widths, string $layout) => min(self::columnWidths($layout, $narrow)) >= self::MIN_WIDTH - self::EPSILON,
            ARRAY_FILTER_USE_BOTH,
        ));
    }

    /**
     * Whether two cell types can be in the same row (config blockedCombinations, in either order).
     */
    public static function isCombinationAllowed(string $a, string $b): bool
    {
        foreach (self::blockedCombinations() as [$x, $y]) {
            if (($x === $a && $y === $b) || ($x === $b && $y === $a)) {
                return false;
            }
        }
        return true;
    }

    /**
     * The blockedCombinations setting as a list of pairs. A single pair without the outer brackets
     * (['cellQuote', 'cellFaq'] instead of [['cellQuote', 'cellFaq']]) also works; other entries are skipped with a warning.
     *
     * @return array<array{string, string}>
     */
    public static function blockedCombinations(): array
    {
        $setting = array_values((array)self::config()['blockedCombinations']);
        if (count($setting) === 2 && is_string($setting[0]) && is_string($setting[1])) {
            $setting = [$setting];
        }

        $pairs = [];
        foreach ($setting as $pair) {
            $pair = is_array($pair) ? array_values($pair) : [];
            if (count($pair) === 2 && is_string($pair[0]) && is_string($pair[1])) {
                $pairs[] = $pair;
            } else {
                Craft::warning('contentBuilderGrid.blockedCombinations: every entry must be a pair of cell type handles, e.g. [\'cellQuote\', \'cellFaq\'].', __METHOD__);
            }
        }
        return $pairs;
    }

    /**
     * Whether all these cell types (the cells of one row) can be in the same row.
     *
     * @param string[] $cellTypes
     */
    public static function areCombinationsAllowed(array $cellTypes): bool
    {
        $cellTypes = array_values($cellTypes);
        foreach ($cellTypes as $i => $a) {
            foreach (array_slice($cellTypes, $i + 1) as $b) {
                if (!self::isCombinationAllowed($a, $b)) {
                    return false;
                }
            }
        }
        return true;
    }

    public static function isTypeAllowed(string $cellType, float $width): bool
    {
        return $width >= self::minWidth($cellType) - self::EPSILON
            && $width <= self::maxWidth($cellType) + self::EPSILON;
    }

    /**
     * Width as a readable fraction: 1/3, 1/2, 2/3, 4/9 …
     */
    public static function formatWidth(float $width): string
    {
        foreach ([1, 2, 3, 4, 6, 9] as $denominator) {
            $numerator = $width * $denominator;
            if (abs($numerator - round($numerator)) < self::EPSILON) {
                return round($numerator) == $denominator ? 'full' : round($numerator) . '/' . $denominator;
            }
        }
        return (string)round($width, 2);
    }

    /**
     * Width of a column on the page, for editors: "1/2 of the page", "full page width".
     */
    public static function formatPageWidth(float $width): string
    {
        $fraction = self::formatWidth($width);
        return $fraction === 'full'
            ? Craft::t('statik', 'full page width')
            : Craft::t('statik', '{width} of the page', ['width' => $fraction]);
    }

    /**
     * Settings for the control panel layer on the "Columns" field of a content row (GridBuilder.js): which layouts can be
     * used, how wide the content builder is on this page, the minimum and maximum width per cell type and the cell types
     * each type can't share a row with (by entry type id).
     */
    public static function cpConfig(?ElementInterface $row): array
    {
        $narrow = $row instanceof Entry && self::isNarrow($row->getOwner());
        $minWidthPerType = [];
        $maxWidthPerType = [];
        $blockedCombinations = [];
        $cellsField = Craft::$app->getFields()->getFieldByHandle(self::CELLS_FIELD);
        $entryTypes = $cellsField instanceof Matrix ? $cellsField->getEntryTypes() : [];
        foreach ($entryTypes as $entryType) {
            $minWidthPerType[$entryType->id] = self::minWidth($entryType->handle);
            $maxWidthPerType[$entryType->id] = self::maxWidth($entryType->handle);
            foreach ($entryTypes as $other) {
                if (!self::isCombinationAllowed($entryType->handle, $other->handle)) {
                    $blockedCombinations[$entryType->id][] = $other->id;
                }
            }
        }

        return [
            'layouts' => self::LAYOUTS,
            'allowedLayouts' => self::allowedLayouts($narrow),
            'contextWidth' => $narrow ? self::NARROW_WIDTH : 1,
            'minWidthPerType' => $minWidthPerType,
            'maxWidthPerType' => $maxWidthPerType,
            'blockedCombinations' => $blockedCombinations,
            'hasBlockConditions' => self::hasBlockConditions(),
        ];
    }

    /**
     * Whether a field in the content row's layout is shown or hidden by the "Content row blocks" condition rule:
     * the control panel then re-checks the field conditions when the blocks in a row change (GridBuilder.js).
     */
    public static function hasBlockConditions(): bool
    {
        $rowType = Craft::$app->getEntries()->getEntryTypeByHandle(self::ROW_TYPE);
        foreach ($rowType?->getFieldLayout()->getCustomFieldElements() ?? [] as $layoutElement) {
            foreach ($layoutElement->getElementCondition()?->getConditionRules() ?? [] as $rule) {
                if ($rule instanceof ContentRowBlocksConditionRule) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Validates a content row: allowed layout, number of cells matches the layout, and every cell type fits its column.
     * Only for live saves, so drafts and autosaves can be incomplete.
     */
    public static function validateRow(Entry $row): void
    {
        if ($row->getType()->handle !== self::ROW_TYPE || $row->getScenario() !== Element::SCENARIO_LIVE) {
            return;
        }

        $narrow = self::isNarrow($row->getOwner());
        $layout = (string)($row->getFieldValue(self::LAYOUT_FIELD)?->value ?: 'full');

        if (!in_array($layout, self::allowedLayouts($narrow), true)) {
            $row->addError(self::LAYOUT_FIELD, Craft::t('statik', 'This layout has columns that are too narrow for this page, choose a layout without 1/3 columns.'));
            return;
        }

        // Disabled cells don't render, so they don't count as a column
        $cells = array_values(array_filter(
            $row->getFieldValue(self::CELLS_FIELD)->all(),
            fn(Entry $cell) => $cell->enabled && $cell->getEnabledForSite(),
        ));
        $widths = self::columnWidths($layout, $narrow);

        if (count($cells) !== count($widths)) {
            $row->addError(self::CELLS_FIELD, Craft::t('statik', 'This layout has {columns, plural, =1{1 column} other{# columns}}, but there {cells, plural, =1{is 1 block} other{are # blocks}}. Add or remove blocks, or choose another layout.', [
                'columns' => count($widths),
                'cells' => count($cells),
            ]));
            return;
        }

        foreach ($cells as $i => $cell) {
            $type = $cell->getType();
            if (!self::isTypeAllowed($type->handle, $widths[$i])) {
                $params = [
                    'type' => Craft::t('site', $type->name),
                    'column' => $i + 1,
                    'width' => self::formatPageWidth($widths[$i]),
                    'minWidth' => self::formatWidth(self::minWidth($type->handle)),
                    'maxWidth' => self::formatWidth(self::maxWidth($type->handle)),
                ];
                $row->addError(self::CELLS_FIELD, $widths[$i] < self::minWidth($type->handle)
                    ? Craft::t('statik', '“{type}” does not fit in column {column} ({width}), it needs at least {minWidth}. Choose a wider layout or another block.', $params)
                    : Craft::t('statik', '“{type}” is too wide in column {column} ({width}), it can be at most {maxWidth}. Choose a layout with narrower columns or another block.', $params));
            }
        }

        foreach ($cells as $i => $cell) {
            foreach (array_slice($cells, $i + 1) as $other) {
                if (!self::isCombinationAllowed($cell->getType()->handle, $other->getType()->handle)) {
                    $row->addError(self::CELLS_FIELD, Craft::t('statik', '“{type}” and “{other}” can’t be in the same row. Choose another block.', [
                        'type' => Craft::t('site', $cell->getType()->name),
                        'other' => Craft::t('site', $other->getType()->name),
                    ]));
                }
            }
        }
    }
}
