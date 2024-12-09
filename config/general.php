<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 */

$settings = [
    // Global settings
    '*' => [
        'enableGql' => false,
        'defaultWeekStartDay' => 1,
        'defaultTokenDuration' => 'P10D',
        'useEmailAsUsername' => true,
        'enableCsrfProtection' => true,
        'omitScriptNameInUrls' => true,
        'postCpLoginRedirect' => 'entries',
        'maxRevisions' => 10,
        'defaultCpLanguage' => 'en',
        'securityKey' => getenv('SECURITY_KEY'),
        'elevatedSessionDuration' => 360000,
        'verificationCodeDuration' => 'P3W',
        'transformGifs' => false,
        'defaultSearchTermOptions' => array(
            'subLeft' => true,
            'subRight' => true,
        ),
    ],

    // Production environment settings
    'production' => [
        'enableTemplateCaching' => true,
        'backupOnUpdate' => true,
        'allowAdminChanges' => (php_sapi_name() === 'cli'),
        'aliases' => [
            'baseUrl' => getenv('BASE_URL'),
        ],
    ],
    // Staging environment settings
    'staging' => [
        'testToEmailAddress' => getenv("DEBUG_EMAIL"),
        'enableTemplateCaching' => false,
        'backupOnUpdate' => false,
        'allowAdminChanges' => (php_sapi_name() === 'cli'),
        'aliases' => [
            'baseUrl' => getenv('BASE_URL'),
        ],
    ],

    // Dev environment settings
    'dev' => [
        'enableTemplateCaching' => false,
        'backupOnUpdate' => false,
        'devMode' => true,
        'aliases' => [
            'baseUrl' => getenv('BASE_URL'),
        ],
    ],
];

if (getenv('PUBLIC_ACCOUNT_FLOW')) {
    $settings['*']['loginPath'] = [
        'nl' => '/aanmelden',
        'fr' => '/inscrivez-vous',
        'en' => '/login'
    ];

    $settings['*']['setPasswordPath'] = [
        'nl' => '/wachtwoord-vernieuwen',
        'fr' => '/renouveler-mot-de-passe',
        'en' => '/renew-password'
    ];

    $settings['*']['activateAccountSuccessPath'] = [
        'nl' => '/registratie-voltooid',
        'fr' => '/inscription-terminee',
        'en' => '/registration-completed'
    ];

    $settings['*']['setPasswordSuccessPath'] = [
        'nl' => '/wachtwoord-ingesteld',
        'fr' => '/mot-de-passe-ensemble',
        'en' => '/password-set'
    ];
}

return $settings;
