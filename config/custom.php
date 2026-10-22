<?php

return [
    // Custom settings
    '*' => [
        'maintenanceMode' => false,
        // Slug of the page (in the "pages" section) that holds the Content row showcase: column types and their combinations
        'gridbuilderShowcaseSlug' => 'gridbuilder',
        // Image warming (modules/statik/src/helpers/ImageWarmer.php): after an entry is saved, a queue job requests its page so
        // its image transforms are generated before a visitor needs them. timeout: seconds for one page (its AVIF versions of
        // large originals); verifySsl: off for the self-signed certificate of DDEV.
        'warmImages' => [
            'enabled' => true,
            'timeout' => 300,
            'verifySsl' => \craft\helpers\App::env('CRAFT_ENVIRONMENT') !== 'dev',
        ],
        'cse' => [
            'nl' => 'test-nl',
            'fr' => 'test-fr',
            'en' => 'test-en'
        ],
    ],
];
