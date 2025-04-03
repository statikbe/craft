<?php


return [
    'enabled'       => getenv('CRAFT_ENVIRONMENT') === 'production',
    'anonymous'     => true,
    'clientDsn'     => "",
    'excludedCodes' => ['400', '404', '429'],
    'excludedExceptions' => [
        \craft\errors\ImageTransformException::class,
        \yii\web\ForbiddenHttpException::class,
    ],
    'release'       => getenv('SENTRY_RELEASE') ?: null,
];

