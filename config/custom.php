<?php

return [
    // Custom settings
    '*' => [
        'maintenanceMode' => false,
        // Slug of the page (in the "pages" section) that holds the Content row showcase: column types and their combinations
        'gridbuilderShowcaseSlug' => 'gridbuilder',
        'cse' => [
            'nl' => 'test-nl',
            'fr' => 'test-fr',
            'en' => 'test-en'
        ],
        // Heading levels in the content builder text (modules/statik/src/helpers/Headings.php), checked when an entry is
        // published: 'warn' (a warning after saving), 'block' (an error, the entry isn't saved) or false (off). List the
        // entries that fail today with `ddev craft statik/headings` before switching to 'block'.
        'headingCheck' => 'warn',
        // The content builder fields (Matrix handles) the check looks at
        'headingCheckFields' => ['contentBuilder'],
        // The hidden h2 above a content row of cards without a title, per column type (translation keys, website_name).
        // The Overview column takes the `heading` of its source in config/overview-sources.php.
        'rowHeadings' => [
            'card' => 'contentBuilder.rowHeading.cards',
            'person' => 'contentBuilder.rowHeading.person',
            'team' => 'contentBuilder.rowHeading.team',
        ],
    ],
];
