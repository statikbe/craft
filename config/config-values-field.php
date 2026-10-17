<?php

// "Related items" of the Overview column: a dataset per source with relations in config/overview-sources.php, e.g.
// "Related news" => ['off' => 'Off', 'category' => 'Same category']
$relatedDataSets = [];
foreach (require __DIR__ . '/overview-sources.php' as $source) {
    if (!empty($source['related'])) {
        $relatedDataSets['Related ' . $source['label']] = ['off' => 'Off'] + array_map(fn(array $relation) => $relation['label'], $source['related']);
    }
}

return [
    'data' => $relatedDataSets + [
        /* This array is used to globally determine the background color option that are available in the contentBuilder field. */
        'Background colors' => [
 			'section--default' => 'none',      // Special: shows striped pattern
            'section--light' => ['#f5f5f5'],
        ],
        'CTA styles' => [
            'btn btn--primary' => 'Primary',
            'btn btn--primary btn--ext' => 'Primary >',
            'btn btn--secondary' => 'Secondary',
            'btn btn--secondary btn--ext' => 'Secondary >',
            'btn btn--ghost' => 'Ghost',
            'btn btn--ghost btn--ext' => 'Ghost >',
            'link' => 'Link',
            'link link--ext' => 'Link >',
        ],
        'Image grid options' => [
            'path' => '@webroot/image-grid/',
            'shapes' => [
                'stacked' => 'stacked',
                'grid' => 'grid',
                'columnRow' => 'columnRow',
                'rowColumn' => 'rowColumn',
            ],
        ],
    ]
];
