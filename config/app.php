<?php
/**
 * Yii Application Config
 *
 * Edit this file at your own risk!
 *
 * The array returned by this file will get merged with
 * vendor/craftcms/cms/src/config/app/main.php and [web|console].php, when
 * Craft's bootstrap script is defining the configuration for the entire
 * application.
 *
 * You can define custom modules and system components, and even override the
 * built-in system components.
 */

use craft\helpers\App;
use craft\mail\transportadapters\Smtp;
use Psr\Log\LogLevel;
use craft\log\MonologTarget;

return [

    // All environments
    '*' => [
        'modules' => [
            'statik' => [
                'class' => \modules\statik\Statik::class,
            ],
        ],
        'components' => [
            'log' => [
                'monologTargetConfig' => [
                    'logContext' => false,
                ],
                'targets' => [
                    'statik' => [
                        'class' => MonologTarget::class,
                        'name' => 'statik',
                        'extractExceptionTrace' => !App::devMode(),
                        'allowLineBreaks' => App::devMode(),
                        'level' => App::devMode() ? LogLevel::DEBUG : LogLevel::INFO,
                        'categories' => ['statik', 'STATIK', 'Statik'],
                        'logContext' => App::devMode(),
                    ],
                ],
            ],
        ],
        'bootstrap' => ['statik'],
    ],


    'production' => [
        'components' => [
            'mailer' => function () {
                $settings = App::mailSettings();
                $settings->transportType = \craftcms\postmark\Adapter::class;
                $settings->transportSettings = [
                    'token' => getenv("POSTMARK_API_KEY"),
                ];
                return Craft::createObject(App::mailerConfig($settings));
            },
            'db' => function() {
                $config = craft\helpers\App::dbConfig();
                // Enable profiling for the debug toolbar
                $config['enableProfiling'] = App::parseBooleanEnv('$DB_PROFILING') ?: false;
                return Craft::createObject($config);
            },
        ],
    ],

    'staging' => [
        'components' => [
            'mailer' => function () {
                $settings = App::mailSettings();
                $settings->transportType = \craftcms\postmark\Adapter::class;
                $settings->transportSettings = [
                    'token' => getenv("POSTMARK_API_KEY"),
                ];
                return Craft::createObject(App::mailerConfig($settings));
            },
        ],
    ],

    'dev' => [
        'components' => [
            'mailer' => function () {
                $settings = App::mailSettings();
                $settings->transportType = Smtp::class;
                $settings->transportSettings = [
                    'host' => '127.0.0.1',
                    'port' => '1025',
                    'useAuthentication' => false,
                ];
                return Craft::createObject(App::mailerConfig($settings));
            }
        ]
    ],
];
