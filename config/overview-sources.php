<?php

/**
 * The sources of the Overview column (_grid/_overview.twig), by the value of its "Overview options" field. The one place for:
 *  - field: the Entries field with the editor's choice;
 *  - section, orderBy: where "Dynamically fill" takes the newest entries from;
 *  - card: the card template (_item/_cards/_<card>);
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
    ],
    'news' => [
        'label' => 'news',
        'field' => 'newsEntries',
        'section' => 'news',
        'orderBy' => 'postDate DESC',
        'card' => 'news',
        'relatedField' => 'relatedNews',
        'related' => [
            'category' => ['label' => 'Same category', 'field' => 'newsCategory'],
            // 'type' => ['label' => 'Same type', 'field' => 'newsType'],
            // 'author' => ['label' => 'Same author', 'attribute' => 'authorId'],
        ],
    ],
    'calendar' => [
        'label' => 'calendar items',
        'field' => 'calendarEntries',
        'section' => 'calendar',
        'orderBy' => 'postDate DESC',
        'card' => 'calendar',
        // Once the calendar section exists: 'relatedField' => 'relatedCalendar', 'related' => [...]
    ],
    'knowledgeBase' => [
        'label' => 'knowledge base items',
        'field' => 'knowledgeBaseEntries',
        'section' => 'knowledgeBase',
        'orderBy' => 'postDate DESC',
        'card' => 'knowledgeBase',
        // Once the knowledge base section exists: 'relatedField' => 'relatedKnowledgeBase', 'related' => [...]
    ],
];
