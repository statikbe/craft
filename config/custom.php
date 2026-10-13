<?php

return [
    // Custom settings
    '*' => [
        'maintenanceMode' => false,
        // Slug of the page (in the "pages" section) that holds the Content Builder showcase, see `craft statik/contentbuilder`
        'contentbuilderShowcaseSlug' => 'contentbuilder',
        // Slug of the page (in the "pages" section) that holds the Content row showcase: column types and their combinations
        'gridbuilderShowcaseSlug' => 'gridbuilder',
        // What the copy button of the "Title (Anchor)" fields copies: 'anchor' (#my-title) or 'url' (https://site.be/page#my-title)
        'anchorLinkCopyFormat' => 'anchor',
        'cse' => [
            'nl' => 'test-nl',
            'fr' => 'test-fr',
            'en' => 'test-en'
        ],
    ],
];
