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

return [

    // All environments
    '*' => [
        'modules' => [
            'statik' => [
                'class' => \modules\statik\Statik::class,
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
