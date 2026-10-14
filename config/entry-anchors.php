<?php

/**
 * Entry Anchors: anchor titles for blocks, and an anchor dropdown on Link fields.
 * See https://github.com/statikbe/craft-entry-anchors
 */
return [
    // What the copy button of the "Title (Anchor)" fields copies: 'anchor' (#my-title) or 'url' (https://site.be/page#my-title)
    'copyFormat' => 'anchor',
    // Matrix fields with anchors (handles as in the field layout): content builder → content row → cells,
    // the columns of the "Text columns" block and the FAQ questions
    'fields' => ['contentBuilder', 'gridCells', 'textColumnBlocks', 'faqBlock'],
];
