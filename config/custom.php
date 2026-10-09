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
        // "Content row" content builder block, see modules/statik/src/helpers/GridBuilder.php. Widths are fractions of the page width.
        'contentBuilderGrid' => [
            // Pages where the content builder is rendered at 2/3 of the page width (e.g. next to a sidebar), by section or entry type handle.
            // Content rows on these pages can't use layouts with 1/3 columns, and column types are checked against their width on the page.
            'narrowSections' => [],
            'narrowEntryTypes' => ['pageWithSidebar'],
            // From which viewport width those pages show the sidebar (the content builder is full width below it); used for responsive image sizes
            'narrowFromViewport' => 980,
            // Column types (cell entry type handles) that need at least this width of the page; other types are allowed from the narrowest column
            'minWidthPerType' => [
                'cellCards' => 1 / 2,
                'cellTable' => 1 / 2,
                'cellFaq' => 1 / 2,
                'cellEmbed' => 1 / 2,
                'cellForm' => 1 / 2,
            ],
            // Column types that can be at most this width of the page, e.g. 'cellQuote' => 1 / 2; other types are allowed up to full width.
            // A type with a maximum below full can't fill a row on its own.
            'maxWidthPerType' => [],
            // Pairs of column types that can't be in the same row (anywhere in it), one pair per line:
            //     [['cellQuote', 'cellFaq'], ['cellQuote', 'cellTable']]
            // The same type twice, e.g. ['cellQuote', 'cellQuote'], allows at most one of that type per row
            'blockedCombinations' => ['cellQuote', 'cellFaq'],
        ],
        'cse' => [
            'nl' => 'test-nl',
            'fr' => 'test-fr',
            'en' => 'test-en'
        ],
    ],
];
