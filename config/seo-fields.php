<?php

return [
    "fieldHandle" => "seo",
    "robotsPerSite" => false,
    "sitemapPerSite" => false,
    "notFoundLimit" => 10000,
    "schemaOptions" => [
        get_class(\Spatie\SchemaOrg\Schema::event()) => 'Event'
    ],
];