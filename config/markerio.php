<?php

//$app = Craft::$app;
//$handle  = $app->getSites()->getCurrentSite()->handle;

return [
    'project' => "",
//    'enableWidgetFe' => in_array($handle, ['en']),
    'enableWidgetFe' => true,
    'enableWidgetCp' => true,
    'requireLogin' => false,
    'silent' => false,
    'renderDelay' => 1200,
    'keyboardShortcuts' => false,
    'useNativeScreenshot' => false,
    'extension' => false,
];
