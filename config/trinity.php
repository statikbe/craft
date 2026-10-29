<?php

/**
 * Trinity: the "Content row" block in the content builder (rows of 1–3 columns, one cell entry per column).
 * Every setting is optional; see vendor/statikbe/craft-trinity/src/models/Settings.php for all of them and their defaults.
 */

return [
    '*' => [
        // Content builders that are narrower than the page (e.g. next to a sidebar): their width as a fraction of the page,
        // by entry type or section handle, or by the handle of the builder's Matrix field (as in the field layout) for an entry
        // with a second content builder (a second Matrix field with "Content row" entries). A field wins over an entry type, an
        // entry type over its section. Every column in such a builder is that much narrower: layouts with columns under 1/4 of
        // the page can't be used (1/3 columns on a 2/3 page), and column types are checked against their width on the page.
        //     'entryTypes' => ['pageWithSidebar' => 2 / 3, 'pageWithNarrowSidebar' => 3 / 4],
        //     'fields' => ['sidebarBuilder' => 1 / 3],
        'pageWidths' => [
            'entryTypes' => [],
            'sections' => [],
            'fields' => [],
        ],
        // The row's "Spacing above" Button Group: the control panel shows it as a compact control at the top of every row but the
        // first. Its values (auto / close / normal / extra) are applied in contentBuilder/contentBuilder.twig and section.css.
        'rowSpacingField' => 'rowSpacing',
        // "Auto" spacing (contentBuilder/contentBuilder.twig): close for a row without a title (a follow-up of the row above), normal for one with
        // a title. false: auto is always normal. Spacing off altogether: rowSpacingField null as well (and remove the rowSpacing
        // field from the row entry type), every row then gets the normal spacing.
        'autoRowSpacing' => true,
        // The row's background (empty or hidden = section--default, as in contentBuilder/contentBuilder.twig): the spacing control is disabled on a
        // row whose background differs from the row above
        'rowBackgroundField' => 'backgroundColor',
        'rowBackgroundDefault' => 'section--default',
        // Gap between the columns (px) of layouts whose gap differs from columnGap (48, --spacing-column): the thirds have
        // --spacing-column-thirds in contentBuilder/gridRow.twig. Used for image sizes and the breakpoint of that layout.
        'columnGaps' => ['thirds' => 24],
        // From which viewport width those pages show the sidebar (the content builder is full width below it); used for responsive image sizes
        'narrowFromViewport' => 980,
        // Column types (cell entry type handles) that need at least this width of the page; other types are allowed from the narrowest column
        'minWidthPerType' => [
            'cellCard' => 1 / 2,
            'cellTable' => 1 / 2,
            'cellFaq' => 1 / 2,
            'cellEmbed' => 1 / 2,
            'cellForm' => 1 / 2,
            'cellImageGallery' => 1 / 2,
            'cellCallToAction' => 1,
            'cellOverview' => 1 / 2,
            'cellTeam' => 1,
            'cellPartners' => 1 / 2,
            'cellNumbers' => 1 / 2,
        ],
        // Column types that can be at most this width of the page, e.g. 'cellQuote' => 1 / 2; other types are allowed up to full width.
        // A type with a maximum below full can't fill a row on its own.
        'maxWidthPerType' => [
            'cellCard' => 1 / 2,
            'cellPerson' => 1 / 2,
        ],
        // Pairs of column types that can't be in the same row (anywhere in it), one pair per line:
        //     [['cellQuote', 'cellFaq'], ['cellQuote', 'cellTable']]
        // The same type twice, e.g. ['cellQuote', 'cellQuote'], allows at most one of that type per row
        'blockedCombinations' => [
            ['cellPartners', 'cellPartners'],
            ['cellQuote', 'cellFaq'],
        ],
    ],
];
