<?php

/**
 * Trinity: the "Content row" block in the content builder (rows of 1–3 columns, one cell entry per column).
 * Every setting is optional; see vendor/statikbe/craft-trinity/src/models/Settings.php for all of them and their defaults.
 */

return [
    '*' => [
        // Pages where the content builder is narrower than the page (e.g. next to a sidebar): its width as a fraction of the page,
        // by entry type or section handle (an entry type wins over its section). Every column on these pages is that much narrower:
        // layouts with columns under 1/4 of the page can't be used (1/3 columns on a 2/3 page), and column types are checked against their width on the page.
        //     'entryTypes' => ['pageWithSidebar' => 2 / 3, 'pageWithNarrowSidebar' => 3 / 4],
        'pageWidths' => [
            'entryTypes' => ['pageWithSidebar' => 2 / 3],
            'sections' => [],
        ],
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
];
