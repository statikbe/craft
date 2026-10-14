<?php

namespace modules\statik\web\hyper;

use craft\base\ElementInterface;
use statikbe\entryanchors\EntryAnchors;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use verbb\hyper\fieldlayoutelements\LinkField;
use verbb\hyper\fields\HyperField;
use verbb\hyper\links\Entry;
use yii\base\Exception;

/**
 * Entry link with an optional anchor to one of the "Title (Anchor)" fields on the linked entry (see the Entry Anchors plugin).
 * The anchor is stored as the slug and appended to the URL as `#slug`.
 */
class EntryAnchor extends Entry
{
    // Static Methods
    // =========================================================================

    public static function displayName(): string
    {
        return \Craft::t('statik', 'Entry (with anchor)');
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
        $variables['anchorOptions'] = EntryAnchors::getInstance()->getAnchors()->options($this->getAnchorEntry());

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
