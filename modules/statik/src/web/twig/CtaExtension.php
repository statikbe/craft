<?php

namespace modules\statik\web\twig;

use Craft;
use craft\base\ElementInterface;
use craft\elements\db\ElementQueryInterface;
use craft\fields\data\LinkData;
use craft\fields\Link;
use craft\web\View;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 * render_ctas(): renders CTA links with the shared template _site/_snippet/_global/_cta.
 *
 * A CTA field is a Matrix of "Link" entries (`cta` for one link, `ctas` for more), each with a Link field and a "Link
 * Style" field (the classes, see config/cta.php). Also takes a single Link field value.
 */
class CtaExtension extends AbstractExtension
{
    /** Handle of the "Link Style" field on the CTA entries */
    public const STYLE_FIELD = 'ctaFieldLinkLayouts';

    public function getFunctions(): array
    {
        return [
            new TwigFunction('render_ctas', [$this, 'renderCtas'], ['is_safe' => ['html']]),
        ];
    }

    /**
     * @param mixed $ctas The CTA field: a Matrix of Link entries (query or collection), or a Link field value
     * @param array $options [
     *      'linkClass' => <string>(optional) Add extra classes to the individual links
     *      'divWrapper' => <bool>(default false) Should the links be individually wrapped in a div
     *      'divClass' => <string>(optional) the class of the div wrapping the links if divWrapper is true
     *      'showContrast' => <bool>(default false) Add the "inverse" class, for links on a dark background
     * ]
     */
    public function renderCtas(mixed $ctas, array $options = []): string
    {
        $html = '';
        $extraLinkClass = $options['linkClass'] ?? '';

        foreach ($this->links($ctas) as [$link, $style]) {
            $html .= Craft::$app->getView()->renderTemplate(
                '_site/_snippet/_global/_cta',
                [
                    'link' => $link,
                    'classes' => trim($style . ' ' . $extraLinkClass),
                    'options' => $options,
                ],
                View::TEMPLATE_MODE_SITE
            );
        }

        return $html;
    }

    /**
     * The links to render, each with its style classes.
     *
     * @return array<array{0: LinkData, 1: string}>
     */
    private function links(mixed $ctas): array
    {
        if ($ctas instanceof LinkData) {
            return $ctas->getUrl() !== '' ? [[$ctas, '']] : [];
        }

        if ($ctas instanceof ElementQueryInterface) {
            $ctas = $ctas->all();
        }

        $links = [];
        foreach (is_iterable($ctas) ? $ctas : [] as $entry) {
            if (!$entry instanceof ElementInterface) {
                continue;
            }
            $link = $this->linkValue($entry);
            if ($link !== null && $link->getUrl() !== '') {
                $hasStyle = $entry->getFieldLayout()?->getFieldByHandle(self::STYLE_FIELD) !== null;
                $links[] = [$link, $hasStyle ? (string)($entry->getFieldValue(self::STYLE_FIELD) ?? '') : ''];
            }
        }

        return $links;
    }

    /**
     * The value of the CTA entry's Link field, whatever its handle.
     */
    private function linkValue(ElementInterface $entry): ?LinkData
    {
        foreach ($entry->getFieldLayout()?->getCustomFields() ?? [] as $field) {
            if ($field instanceof Link) {
                $value = $entry->getFieldValue($field->handle);
                return $value instanceof LinkData ? $value : null;
            }
        }

        return null;
    }
}
