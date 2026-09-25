<?php

return [
    '*' => [
        'enabled' => false,
        'enableCpProtection' => false,
        'loginPath' => 'restricted-access',
        'template' => '_knock-knock.twig',
        'siteSettings' => [],
        'checkInvalidLogins' => false,
        'invalidLoginWindowDuration' => '3600',
        'maxInvalidLogins' => 10,
        'allowIps' => ['82.143.70.25', '127.0.0.1'],
        'denyIps' => [],
        'useRemoteIp' => true,
        'protectedUrls' => [],
        'unprotectedUrls' => ['/frontend/img/site/logo.png'],
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

