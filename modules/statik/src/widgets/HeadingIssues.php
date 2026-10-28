<?php

namespace modules\statik\widgets;

use Craft;
use craft\base\Widget;
use modules\statik\helpers\Headings;

/**
 * Dashboard widget: the pages whose content builder text skips a heading level (the same check as on save, see
 * modules/statik/src/helpers/Headings.php), with a link to edit each page. The list is cached and updated when a page is
 * saved or deleted.
 */
class HeadingIssues extends Widget
{
    /** @var int Pages shown, the rest is counted */
    public int $limit = 25;

    public static function displayName(): string
    {
        return Craft::t('site', 'Heading issues');
    }

    public static function icon(): ?string
    {
        return 'heading';
    }

    public function getTitle(): ?string
    {
        return Craft::t('site', 'Heading issues');
    }

    protected function defineRules(): array
    {
        $rules = parent::defineRules();
        $rules[] = [['limit'], 'integer', 'min' => 1];
        return $rules;
    }

    public function getSettingsHtml(): ?string
    {
        return Craft::$app->getView()->renderTemplate('statik/_widgets/headingIssues/settings', ['widget' => $this]);
    }

    public function getBodyHtml(): ?string
    {
        $sites = Craft::$app->getSites();
        $items = array_values(Headings::report());
        usort($items, fn(array $a, array $b) => [$a['title'], $a['siteId']] <=> [$b['title'], $b['siteId']]);
        foreach ($items as &$item) {
            $item['site'] = $sites->getSiteById($item['siteId'], true)?->getName() ?? '';
        }
        unset($item);

        return Craft::$app->getView()->renderTemplate('statik/_widgets/headingIssues/body', [
            'items' => array_slice($items, 0, $this->limit),
            'total' => count($items),
            'multiSite' => Craft::$app->getIsMultiSite(),
        ]);
    }
}
