<?php

/**
 * The sources of the Overview column (contentBuilder/columns/overview.twig), by the value of its "Overview options" field. The one place for:
 *  - field: the Entries field with the editor's choice;
 *  - section, orderBy: where "Dynamically fill" takes the newest entries from; or fill 'upcoming' (events): the soonest
 *    upcoming instead, and chosen events that have ended are left out;
 *  - card: the card template (components/cards/<card>);
 *  - heading: the hidden h2 (sr-only, a translation key in website_name) above an Overview column without a title, so its h3
 *    cards don't follow the page title directly (rowHeadings in config/headings-checker.php). A title in the column, or in a
 *    column before it in the row, replaces it;
 *  - filterLayout: the filter on the overview page of that section (e.g. pages/news/index.twig): 'top' (search and categories in a
 *    bar above the results, cards in 3 columns; for a few filters) or 'side' (filters in a column on the left, cards in 2
 *    columns; for many filters or long lists). Default 'top';
 *  - relatedField, related: on a page in that section (e.g. a news item), the Config Values field for "Related items" and what
 *    each of its options means. config/config-values-field.php builds the field's options from `related` ("Off" + the labels):
 *      - field: entries that share an entry in that field with the page (e.g. a category);
 *      - attribute: entries with the same value of that attribute as the page (e.g. authorId).
 *
 * Adding a relation (e.g. the news author): one line under `related`. The keys are stored in the content: change a label freely,
 * not a key. A new source with relations also needs its Config Values field (relatedField, dataset "Related <label>") in the
 * Overview column, with the conditions of relatedNews (its option, "Dynamically fill" on, Page section = its section).
 */

return [
    'entries' => [
        'label' => 'entries',
        'field' => 'entries',
        'card' => 'default',
        'heading' => 'overview.heading.entries',
    ],
    'news' => [
        'label' => 'news',
        'field' => 'newsEntries',
        'section' => 'news',
        'orderBy' => 'postDate DESC',
        'card' => 'news',
        'heading' => 'overview.heading.news',
        'filterLayout' => 'top',
        'relatedField' => 'relatedNews',
        'related' => [
            'category' => ['label' => 'Same category', 'field' => 'newsCategory'],
            // 'type' => ['label' => 'Same type', 'field' => 'newsType'],
            // 'author' => ['label' => 'Same author', 'attribute' => 'authorId'],
        ],
    ],
    'calendar' => [
        'label' => 'events',
        'field' => 'calendarEntries',
        'section' => 'calendar',
        // Only events that haven't ended (end date, or start date without one), the soonest first; chosen events that have
        // ended are left out (modules/statik/src/helpers/Calendar.php)
        'fill' => 'upcoming',
        'card' => 'calendar',
        'heading' => 'overview.heading.calendar',
        'filterLayout' => 'top',
        // Related events on an event (pages/calendar/entry.twig). For an Overview column with related events, add a Config Values
        // field 'relatedCalendar' as for news and 'relatedField' => 'relatedCalendar' here.
        'related' => [
            'category' => ['label' => 'Same category', 'field' => 'eventCategory'],
        ],
    ],
    'knowledgeBase' => [
        'label' => 'knowledge base items',
        'field' => 'knowledgeBaseEntries',
        'section' => 'knowledgeBase',
        'orderBy' => 'postDate DESC',
        'card' => 'knowledgeBase',
        'heading' => 'overview.heading.knowledgeBase',
        'filterLayout' => 'top',
        // Related items on an item (pages/knowledgeBase/entry.twig). For an Overview column with related items, add a Config Values
        // field 'relatedKnowledgeBase' as for news and 'relatedField' => 'relatedKnowledgeBase' here.
        'related' => [
            'category' => ['label' => 'Same category', 'field' => 'knowledgeBaseCategory'],
        ],
    ],
];
