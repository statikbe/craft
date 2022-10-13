<?php

use craft\helpers\App;

return [
    'useDevServer' => App::env('ENVIRONMENT') === 'dev' || App::env('CRAFT_ENVIRONMENT') === 'dev',
    'manifestPath' => '@webroot/frontend/manifest.json',
    'devServerPublic' => 'https://localhost:3000',
    'serverPublic' => App::env('PRIMARY_SITE_URL') . '/frontend',
    'errorEntry' => '/tailoff/js/site.ts',
    'cacheKeySuffix' => '',
    'devServerInternal' => '',
    'checkDevServer' => false,
    'includeReactRefreshShim' => false,
    'includeModulePreloadShim' => true,
    'criticalPath' => '@webroot/public/criticalcss',
    'criticalSuffix' =>'_critical.min.css',
];