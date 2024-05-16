<?php

return [
    'enabled'       => getenv("CRAFT_ENVIRONMENT") === "production",
    'anonymous'     => true,
    'clientDsn'     => "",
    'excludedCodes' => ['400', '404', '429'],
    'release'       => null,
];