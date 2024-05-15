<?php

use nystudio107\imageoptimize\imagetransforms\CraftImageTransform;

return [
    '*' => [
        'transformClass' => CraftImageTransform::class,
        'imageTransformTypeSettings' => [],
        'automaticallyResaveImageVariants' => true,
        'generateTransformsBeforePageLoad' => true,
        'generatePlaceholders' => true,
        'capSilhouetteSvgSize' => true,
        'createColorPalette' => true,
        'createPlaceholderSilhouettes' => false,
        'lowerQualityRetinaImageVariants' => true,
        'allowUpScaledImageVariants' => true,
        'autoSharpenScaledImages' => true,
        'sharpenScaledImagePercentage' => 50,
        'assetVolumeSubFolders' => true,
        'defaultImageTransformTypes' => [],
        'defaultAspectRatios' => [
            ['x' => 16, 'y' => 9],
            ['x' => 8, 'y' => 5],
            ['x' => 4, 'y' => 3],
            ['x' => 5, 'y' => 4],
            ['x' => 1, 'y' => 1],
            ['x' => 9, 'y' => 16],
            ['x' => 5, 'y' => 8],
            ['x' => 3, 'y' => 4],
            ['x' => 4, 'y' => 5],
        ],
        'defaultVariants' => [
            [
                'width' => 1200,
                'useAspectRatio' => true,
                'aspectRatioX' => 16.0,
                'aspectRatioY' => 9.0,
                'retinaSizes' => ['1'],
                'quality' => 82,
                'format' => 'jpg',
            ],
        ],
        'activeImageProcessors'      => [
            'jpg' => [
                'jpegoptim',
            ],
            'png' => [
                'optipng',
            ],
            'svg' => [
                'svgo',
            ],
            'gif' => [
                'gifsicle',
            ],
        ],
        'activeImageVariantCreators' => [
            'jpg' => [
                'cwebp',
            ],
            'png' => [
                'cwebp',
            ],
        ],
        'imageProcessors'            => [
            // jpeg optimizers
            'jpegoptim' => [
                'commandPath'           => '/usr/bin/jpegoptim',
                'commandOptions'        => '-s',
                'commandOutputFileFlag' => '',
            ],
            'mozjpeg'   => [
                'commandPath'           => '/usr/bin/mozjpeg',
                'commandOptions'        => '-optimize -copy none',
                'commandOutputFileFlag' => '-outfile',
            ],
            'jpegtran'  => [
                'commandPath'           => '/usr/bin/jpegtran',
                'commandOptions'        => '-optimize -copy none',
                'commandOutputFileFlag' => '',
            ],
            // png optimizers
            'optipng'   => [
                'commandPath'           => '/usr/bin/optipng',
                'commandOptions'        => '-o3 -strip all',
                'commandOutputFileFlag' => '',
            ],
            'pngcrush'  => [
                'commandPath'           => '/usr/bin/pngcrush',
                'commandOptions'        => '-brute -ow',
                'commandOutputFileFlag' => '',
            ],
            'pngquant'  => [
                'commandPath'           => '/usr/bin/pngquant',
                'commandOptions'        => '--strip--skip -if-larger',
                'commandOutputFileFlag' => '',
            ],
            // svg optimizers
            'svgo'      => [
                'commandPath'           => '/usr/bin/svgo',
                'commandOptions'        => '',
                'commandOutputFileFlag' => '',
            ],
            // gif optimizers
            'gifsicle'  => [
                'commandPath'           => '/usr/bin/gifsicle',
                'commandOptions'        => '-O3 -k 256',
                'commandOutputFileFlag' => '',
            ],
        ],

        'imageVariantCreators' => [
            // webp variant creator
            'cwebp' => [
                'commandPath'           => '/usr/bin/cwebp',
                'commandOptions'        => '-jpeg_like -af',
                'commandOutputFileFlag' => '-o',
                'commandQualityFlag'    => '-q',
                'imageVariantExtension' => 'webp',
            ],
        ],
    ],
    'production' => [
        // Preset image processors
        'imageProcessors'            => [
            // jpeg optimizers
            'jpegoptim' => [
                'commandPath'           => '/usr/local/bin/jpegoptim',
                'commandOptions'        => '-s',
                'commandOutputFileFlag' => '',
            ],
            // png optimizers
            'optipng'   => [
                'commandPath'           => '/usr/local/bin/optipng',
                'commandOptions'        => '-o3 -strip all',
                'commandOutputFileFlag' => '',
            ],

        ],
    ],
    'dev' => [
        // Preset image processors
        'imageProcessors'            => [
            // jpeg optimizers
            'jpegoptim' => [
                'commandPath'           => '/usr/local/bin/jpegoptim',
                'commandOptions'        => '-s',
                'commandOutputFileFlag' => '',
            ],
            // png optimizers
            'optipng'   => [
                'commandPath'           => '/usr/local/bin/optipng',
                'commandOptions'        => '-o3 -strip all',
                'commandOutputFileFlag' => '',
            ],

        ],

        'imageVariantCreators' => [
            // webp variant creator
            'cwebp' => [
                'commandPath'           => '/usr/local/bin/cwebp',
                'commandOptions'        => '-jpeg_like -af',
                'commandOutputFileFlag' => '-o',
                'commandQualityFlag'    => '-q',
                'imageVariantExtension' => 'webp',
            ],
        ],
    ]

];
