<?php

namespace modules\statik\web\twig;

use Craft;
use craft\elements\Asset;
use craft\helpers\Html;
use craft\helpers\StringHelper;
use Twig\Extension\AbstractExtension;
use Twig\Markup;
use Twig\TwigFunction;
use yii\base\InvalidArgumentException;

class IconExtension extends AbstractExtension
{
    /** @var array<string, string> Icon file path => its SVG */
    private static array $svgs = [];

    public function getFunctions(): array
    {
        return [
            new TwigFunction('icon', [$this, 'iconFunction']),
        ];
    }

    public function iconFunction(string|Asset $source, array $attributes = []): Markup
    {
        // Assume strings are a filename reference, and prepend the path, and append the extension
        if (is_string($source)) {
            $filename = StringHelper::ensureRight($source, '.svg');
            $source = "@webroot/frontend/icons/$filename";
        }

        // Get the SVG contents from our source path or Asset using Craft's svg() function (it reads and sanitizes the file): a file
        // once per request, a page uses the same icons many times
        $key = is_string($source) ? $source : null;
        $svg = $key !== null ? (self::$svgs[$key] ?? null) : null;
        if ($svg === null) {
            $svg = (string)Craft::$app->getView()->renderString("{{ svg(source) }}", [
                'source' => $source,
            ]);
            if ($key !== null) {
                self::$svgs[$key] = $svg;
            }
        }
        try {
            $extraClasses = $attributes['class'] ?? '';
            unset($attributes['class']);
            $output = Html::modifyTagAttributes($svg, [
                'aria-hidden' => 'true',
                'class' => ('icon ' . $extraClasses),
                ...$attributes,
            ]);
        } catch (InvalidArgumentException $e) {
            $output = $svg;
        }

        return new Markup($output, 'UTF-8');
    }
}
