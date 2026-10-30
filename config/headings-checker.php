<?php

/**
 * Headings Checker (statikbe/craft-headings-checker): the heading order of the content builder, checked when an entry is
 * published, shown in the entry sidebar and listed in the Heading issues dashboard widget. See the plugin's README for every
 * setting.
 *
 * What the templates render: the page header's h1 (the hero's title on the home page), a column's title as an h2 (also with
 * "Show title" off, then for screen readers only), and the cards of the Overview, Card, Person and Team columns as h3. A row of
 * cards without an h2 before them gets a hidden h2 (contentBuilder/gridRow.twig).
 */

use craft\elements\Entry;

return [
    // 'block': a heading that skips a level stops the entry from being published, shown on the row and column. On a project
    // with existing content, run `ddev craft headings-checker/check` first and use 'warn' until the old pages are fixed.
    'mode' => 'block',
    'fields' => ['contentBuilder'],
    'pageTitle' => ['hero.heading'],
    'titleFields' => ['blockTitle'],
    // No textFields: the page's own rich text fields (intro, overviewDescription) only have bold and italic, no headings
    'showTitleField' => 'showTitle',
    'cardTypes' => ['cellOverview', 'cellCard', 'cellPerson', 'cellTeam'],
    // The hidden h2 above a row of cards (translation keys, website_name). The Overview column takes the `heading` of its
    // source in config/overview-sources.php.
    'rowHeadings' => [
        'cellOverview' => function(Entry $cell): ?string {
            $sources = Craft::$app->getConfig()->getConfigFromFile('overview-sources');
            $option = $cell->getFieldLayout()?->getFieldByHandle('overviewOptions')
                ? (string)($cell->getFieldValue('overviewOptions')?->value ?? '')
                : '';
            $key = ($sources[$option ?: 'entries'] ?? $sources['entries'] ?? [])['heading'] ?? null;
            return $key ? Craft::t('website_name', $key) : null;
        },
        'cellCard' => 'contentBuilder.rowHeading.cards',
        'cellPerson' => 'contentBuilder.rowHeading.person',
        'cellTeam' => 'contentBuilder.rowHeading.team',
    ],
    'rowHeadingCategory' => 'website_name',
    'outline' => true,
    'levelBadges' => true,
];
