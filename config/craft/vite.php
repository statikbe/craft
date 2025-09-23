<?php

use craft\helpers\App;

$manifestPath = '@webroot/frontend/.vite/manifest.json';
$serverPublic = '/frontend';
$errorEntry = '/tailoff/js/site.ts';

// switch(Craft::$app->getSites()->currentSite->handle){
//     case 'fr' :
//         $manifestPath = '@webroot/frontend-site2/manifest.json';
//         $serverPublic = '/frontend-site2';
//         $errorEntry = '/tailoff/js/site2.ts';
//         break;
// }

return [
    'useDevServer' => (App::env('ENVIRONMENT') === 'dev' || App::env('CRAFT_ENVIRONMENT') === 'dev') && App::env('FRONTEND_DEV'),
    // 'useDevServer' => false,
    'manifestPath' => $manifestPath,
    'devServerPublic' => 'https://localhost:3000',
    'serverPublic' => $serverPublic,
    'errorEntry' => $errorEntry,
    'cacheKeySuffix' => '',
    'devServerInternal' => '',
    'checkDevServer' => false,
    'includeReactRefreshShim' => false,
    'includeModulePreloadShim' => true,
    'criticalPath' => '@webroot/public/criticalcss',
    'criticalSuffix' =>'_critical.min.css',
];