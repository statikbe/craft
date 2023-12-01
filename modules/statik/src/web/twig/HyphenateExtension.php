<?php

namespace modules\statik\web\twig;

use Craft;
use craft\elements\Asset;
use craft\helpers\ElementHelper;
use Twig\Extension\AbstractExtension;
use Twig\Markup;
use Twig\TwigFilter;
use Vanderlee\Syllable\Syllable;

class HyphenateExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('hyphenate', [$this, 'hyphenate']),
        ];
    }

    public function hyphenate(string|Asset $source, array $attributes = []): Markup
    {
        $minimumWordLength = $attributes['wordLength'] ?? 12;

        $output = Craft::$app->getCache()->getOrSet(
            "hypen-" . substr(ElementHelper::generateSlug($source), 0, 40),
            function () use ($source, $minimumWordLength) {
                $language = strtolower(explode('-', Craft::$app->language)[0]);
                $language = $language === 'en' ? 'en-us' : $language;
                $syllable = new Syllable($language);
                $syllable->getCache()->setPath(Craft::$app->getPath()->getTempPath());
                $syllable->setMinWordLength($minimumWordLength);
                return $syllable->hyphenateText($source);
            });

        return new Markup($output, 'UTF-8');
    }
}
