<?php

return [
    // Custom settings
    '*' => [
        'maintenanceMode' => false,
        // Slug of the page (in the "pages" section) that holds the Content Builder showcase, see `craft statik/contentbuilder`
        'contentbuilderShowcaseSlug' => 'contentbuilder',
        // What the copy button of the "Title (Anchor)" fields copies: 'anchor' (#my-title) or 'url' (https://site.be/page#my-title)
        'anchorLinkCopyFormat' => 'anchor',
        // Pages where the content builder is rendered at 2/3 of the page width (e.g. next to a sidebar), by section or entry type handle.
        // Grid rows on these pages can't use layouts with 1/3 columns, and cell types are checked against their effective width (see modules/statik/src/helpers/GridBuilder.php)
        'contentBuilderNarrow' => [
            'sections' => [],
            'entryTypes' => [],
        ],
        'cse' => [
            'nl' => 'test-nl',
            'fr' => 'test-fr',
            'en' => 'test-en'
        ],
    ],
];
