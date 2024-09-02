<?php

return [
    '*' => [
        'enabled' => false,
        'enableCpProtection' => false,
        'loginPath' => 'restricted-access',
//        'template' => '_knock-knock.twig',
        'siteSettings' => [],
        'checkInvalidLogins' => false,
        'invalidLoginWindowDuration' => '3600',
        'maxInvalidLogins' => 10,
        // 'allowIps' => ['81.82.199.174', '127.0.0.1'],
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
        'enabled' => true,
        'password' => getenv('SITE_PASSWORD'),
    ]
];