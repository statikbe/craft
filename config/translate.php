<?php

/**
 * Translate plugin (statikbe/craft-translate).
 *
 * The files in translations/ are in git and hold every key with its default translation. What editors change in the control
 * panel (Translations) is stored in the database (table translate_overrides), only the keys that differ from the default, on
 * top of the files. A deploy brings new keys and changed defaults, and never overwrites an editor's translation.
 */

return [
    'storeInDatabase' => true,
];
