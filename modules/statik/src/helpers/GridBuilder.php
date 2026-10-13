<?php

namespace modules\statik\helpers;

use craft\base\ElementInterface;
use craft\elements\Entry;
use statikbe\trinity\layout\Layout;
use statikbe\trinity\Trinity;

/**
 * @deprecated The content row rules moved to the Trinity plugin (statikbe/craft-trinity, config/trinity.php). This facade only
 * keeps the content builder showcase generator working until it calls the plugin directly; don't use it in new code.
 */
class GridBuilder
{
    public const ROW_TYPE = 'gridRow';
    public const LAYOUT_FIELD = 'gridLayout';
    public const CELLS_FIELD = 'gridCells';
    public const MOBILE_ORDER_FIELD = 'mobileOrder';
    public const LAYOUTS = Layout::LAYOUTS;

    private static function layouts(): Layout
    {
        return Trinity::getInstance()->getLayouts();
    }

    public static function row(Entry $row): array
    {
        return Trinity::getInstance()->getRows()->row($row);
    }

    public static function pageWidth(?ElementInterface $page): float
    {
        return Trinity::getInstance()->getRows()->pageWidth($page);
    }

    /**
     * @param Entry[] $cells
     * @return int[]|null
     */
    public static function mobileOrder(array $cells): ?array
    {
        return self::layouts()->mobileOrder(array_map(
            fn(Entry $cell) => $cell->getFieldLayout()?->getFieldByHandle(self::MOBILE_ORDER_FIELD)
                ? (int)$cell->getFieldValue(self::MOBILE_ORDER_FIELD)?->value
                : 0,
            array_values($cells),
        ));
    }

    public static function breakpoint(string $layout): int
    {
        return self::layouts()->breakpoint($layout);
    }

    /**
     * @return float[]
     */
    public static function columnWidths(string $layout, float $pageWidth = 1): array
    {
        return self::layouts()->columnWidths($layout, $pageWidth);
    }

    /**
     * @return string[]
     */
    public static function allowedLayouts(float $pageWidth = 1): array
    {
        return self::layouts()->allowedLayouts($pageWidth);
    }

    public static function isTypeAllowed(string $cellType, float $width): bool
    {
        return self::layouts()->isTypeAllowed($cellType, $width);
    }

    public static function isCombinationAllowed(string $a, string $b): bool
    {
        return self::layouts()->isCombinationAllowed($a, $b);
    }

    /**
     * @param string[] $cellTypes
     */
    public static function areCombinationsAllowed(array $cellTypes): bool
    {
        return self::layouts()->areCombinationsAllowed($cellTypes);
    }

    public static function formatWidth(float $width): string
    {
        return self::layouts()->formatWidth($width);
    }
}
