<?php


return [
    'enabled'       => getenv('CRAFT_ENVIRONMENT') === 'production',
    'anonymous'     => true,
    'clientDsn'     => "",
    'excludedCodes' => ['400', '404', '429'],
    'excludedExceptions' => [
        \craft\errors\ImageTransformException::class,
        \yii\web\ForbiddenHttpException::class,
        \craft\errors\AssetDisallowedExtensionException,
        \craft\errors\FsObjectNotFoundException,
        \Imagine\Exception\RuntimeException,
        \craft\errors\ImageException,
    ],
    'release'       => getenv('SENTRY_RELEASE') ?: null,
];

