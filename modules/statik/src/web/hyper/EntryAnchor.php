<?php

namespace modules\statik\web\hyper;

use craft\base\ElementInterface;
use craft\elements\Entry as EntryElement;
use craft\fields\Matrix;
use craft\helpers\ElementHelper;
use modules\statik\fields\AnchorLink;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use verbb\hyper\fieldlayoutelements\LinkField;
use verbb\hyper\fields\HyperField;
use verbb\hyper\links\Entry;
use yii\base\Exception;

/**
 * Entry link with an optional anchor to one of the "Title (Anchor)" fields on the linked entry.
 * The anchor is stored as the slug and appended to the URL as `#slug`.
 */
class EntryAnchor extends Entry
{
    // Constants
    // =========================================================================

    // How deep to look into nested entries (content builder → FAQ items, ...)
    private const MAX_DEPTH = 3;


    // Static Methods
    // =========================================================================

    public static function displayName(): string
    {
        return \Craft::t('statik', 'Entry (with anchor)');
    }

    /**
     * Collect all anchor titles on an entry, in the order they appear on the page.
     *
     * @return array<array{label: string, value: string}>
     */
    public static function getAnchorOptions(?ElementInterface $entry): array
    {
        if (!$entry instanceof EntryElement) {
            return [];
        }

        $options = [];
        self::collectAnchors($entry, $options, 0);

        return array_values($options);
    }

    private static function collectAnchors(ElementInterface $element, array &$options, int $depth): void
    {
        foreach ($element->getFieldLayout()?->getCustomFields() ?? [] as $field) {
            if ($field instanceof AnchorLink) {
                $title = trim((string)$element->getFieldValue($field->handle));

                if ($title !== '') {
                    // Same slug as the `|slugify` filter used for the id's in the templates
                    $slug = ElementHelper::generateSlug($title);
                    $options[$slug] ??= ['label' => $title, 'value' => $slug];
                }
            } elseif ($field instanceof Matrix && $depth < self::MAX_DEPTH) {
                foreach ($element->getFieldValue($field->handle)->all() as $nestedEntry) {
                    self::collectAnchors($nestedEntry, $options, $depth + 1);
                }
            }
        }
    }


    // Properties
    // =========================================================================

    public ?string $anchor = null;


    // Public Methods
    // =========================================================================

    public function getInputConfig(): array
    {
        $values = parent::getInputConfig();
        $values['anchor'] = $this->anchor;

        return $values;
    }

    public function getSerializedValues(): array
    {
        $values = parent::getSerializedValues();

        if ($this->anchor) {
            $values['anchor'] = $this->anchor;
        }

        return $values;
    }

    public function getUrlSuffix(): ?string
    {
        $suffix = parent::getUrlSuffix();

        if ($this->anchor) {
            $suffix .= '#' . $this->anchor;
        }

        return $suffix;
    }

    /**
     * @throws SyntaxError
     * @throws Exception
     * @throws RuntimeError
     * @throws LoaderError
     */
    public function getSettingsHtml(): ?string
    {
        $variables = $this->getSettingsHtmlVariables();

        return \Craft::$app->getView()->renderTemplate('hyper/links/entry/settings', $variables);
    }

    /**
     * @throws SyntaxError
     * @throws Exception
     * @throws RuntimeError
     * @throws LoaderError
     */
    public function getInputHtml(LinkField $layoutField, HyperField $field): ?string
    {
        $variables = $this->getInputHtmlVariables($layoutField, $field);
        $variables['anchorOptions'] = self::getAnchorOptions($this->getAnchorEntry());

        return \Craft::$app->getView()->renderTemplate('statik/_hyper/_entryAnchor/_input', $variables);
    }

    /**
     * The linked entry, regardless of its status (same as the element select in the CP).
     */
    public function getAnchorEntry(): ?ElementInterface
    {
        return $this->getElements()[0] ?? null;
    }


    // Protected Methods
    // =========================================================================

    protected function defineRules(): array
    {
        $rules = parent::defineRules();

        $rules[] = [['anchor'], 'safe'];

        return $rules;
    }
}
