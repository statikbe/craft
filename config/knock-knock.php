<?php

return [
    '*' => [
        'enabled' => false,
        'enableCpProtection' => false,
        'loginPath' => 'restricted-access',
//        'template' => '',
        'siteSettings' => [],
        'checkInvalidLogins' => false,
        'invalidLoginWindowDuration' => '3600',
        'maxInvalidLogins' => 10,
        'allowIps' => [],
        'denyIps' => [],
        'useRemoteIp' => false,
        'protectedUrls' => [],
        'unprotectedUrls' => [],
    ],
    'production' => [
        'enabled' => true,
        'password' => getenv('SITE_PASSWORD'),
    ],
    'staging' => [
        'enabled' => true,
        'password' => getenv('SITE_PASSWORD'),

    ],
    'dev' => [
        'enabled' => false,
        'password' => getenv('SITE_PASSWORD'),
    ]
];