<?php

/**
 * Entry Anchors: anchor titles for blocks, and an anchor dropdown on Link fields.
 * See https://github.com/statikbe/craft-entry-anchors
 */
return [
    // What the copy button of an Anchor Link field copies: 'url' (page URL + #slug) or 'anchor' (only #slug)
    'copyFormat' => 'url',
    // How deep to look into nested entries for anchors (content builder → row → cell → FAQ items, ...)
    'maxDepth' => 3,
    // Handles of the Matrix fields to look into for anchors (the handle in the field layout), null for every Matrix field
    'fields' => null,
];
