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

    // Local (development) environment
    'dev' => [
        'components' => [
            'mailer' => function() {
                // Get the stored email settings
                $settings = Craft::$app->systemSettings->getEmailSettings();
                // Override the transport adapter class
                $settings->transportType = \craft\mail\transportadapters\Smtp::class;
                // Override the transport adapter settings
                $settings->transportSettings = [
                    'host' => '127.0.0.1',
                    'port' => '1025',
                    'useAuthentication' => false,
                ];
                return craft\helpers\MailerHelper::createMailer($settings);
            }
        ]
    ],
];
