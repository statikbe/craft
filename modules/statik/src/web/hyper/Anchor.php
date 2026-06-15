<?php

namespace modules\statik\web\hyper;

use craft\helpers\App;
use craft\validators\UrlValidator;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use verbb\hyper\base\Link;
use verbb\hyper\fieldlayoutelements\LinkField;
use verbb\hyper\fields\HyperField;
use yii\base\Exception;

class Anchor extends Link
{
    // Static Methods
    // =========================================================================

    public static function displayName(): string
    {
        return \Craft::t('hyper', 'Anchor Link');
    }


    // Public Methods
    // =========================================================================

    public function getLinkUrl(): ?string
    {
        return rtrim(\Craft::$app->getSites()->primarySite->baseUrl, '/');
    }

    public ?string $placeholder = null;

    public function getSettingsConfig(): array
    {
        $values = parent::getSettingsConfig();
        $values['placeholder'] = $this->placeholder;

        return $values;
    }

    public function defaultPlaceholder(): ?string
    {
        return rtrim(\Craft::$app->getSites()->primarySite->baseUrl, '/');
    }


    public function validateAnchorLink(string $attribute): void
    {
        $isValid = str_starts_with($this->$attribute, '#');

        if (!$isValid) {
            $this->addError($attribute, 'Anchor links must start with a # symbol.');
        }
    }

    // Protected Methods
    // =========================================================================

    protected function defineRules(): array
    {
        $rules = parent::defineRules();

        $rules[] = [['linkValue'], 'validateAnchorLink'];

        return $rules;
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

        return \Craft::$app->getView()->renderTemplate('statik/_hyper/_anchor/_settings', $variables);
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

        return \Craft::$app->getView()->renderTemplate('statik/_hyper/_anchor/_input', $variables);
    }
}
