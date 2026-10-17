<?php

namespace modules\statik\conditions;

use Craft;
use craft\base\conditions\BaseMultiSelectConditionRule;
use craft\base\ElementInterface;
use craft\base\NestedElementInterface;
use craft\elements\conditions\ElementConditionRuleInterface;
use craft\elements\db\ElementQueryInterface;
use craft\elements\Entry;

/**
 * Entry condition rule "Page section": the section of the page a nested entry is on, its top owner (a cell → its row → the
 * page). Use it as a field condition in the layout of a nested entry type, e.g. to show the Overview column's "Related items"
 * only on news items. A nested entry that isn't on a page yet counts as having no section.
 *
 * Offered only for field conditions of nested entry types (Statik::init()): it doesn't filter element queries.
 */
class PageSectionConditionRule extends BaseMultiSelectConditionRule implements ElementConditionRuleInterface
{
    /** How many owners up to look for the page (content builder → row → cell → …) */
    private const MAX_DEPTH = 5;

    public function getLabel(): string
    {
        return Craft::t('site', 'Page section');
    }

    public function getExclusiveQueryParams(): array
    {
        return [];
    }

    /**
     * The sections, by UID.
     */
    protected function options(): array
    {
        $options = [];
        foreach (Craft::$app->getEntries()->getAllSections() as $section) {
            $options[$section->uid] = Craft::t('site', $section->name);
        }
        return $options;
    }

    public function modifyQuery(ElementQueryInterface $query): void
    {
        // Only for field conditions (see the class comment)
    }

    public function matchElement(ElementInterface $element): bool
    {
        return $this->matchValue(self::page($element)?->getSection()?->uid);
    }

    /**
     * The page a nested entry is on: its top owner that is an entry in a section, or null.
     */
    public static function page(ElementInterface $element): ?Entry
    {
        for ($i = 0; $i < self::MAX_DEPTH && $element; $i++) {
            if ($element instanceof Entry && $element->getSection()) {
                return $element;
            }
            $element = $element instanceof NestedElementInterface ? $element->getOwner() : null;
        }
        return null;
    }
}
