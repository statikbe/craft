<?php


namespace modules\statik\fields;

use modules\statik\Statik;
use modules\statik\assetbundles\anchorlinkfield\AnchorLinkFieldAsset;

use Craft;
use craft\base\ElementInterface;
use craft\base\Field;
use yii\db\Schema;
use craft\helpers\Json;


class AnchorLink extends Field
{
    public $someAttribute;

    public static function displayName(): string
    {
        return Craft::t('statik', 'Plain Text - Anchor Link');
    }

    public function rules()
    {
        $rules = parent::rules();
        return $rules;
    }

    public function getContentColumnType(): string
    {
        return Schema::TYPE_STRING;
    }

    public function normalizeValue($value, ElementInterface $element = null)
    {
        return $value;
    }

    public function serializeValue($value, ElementInterface $element = null)
    {
        return parent::serializeValue($value, $element);
    }

    public function getSettingsHtml()
    {
        // Render the settings template
        return Craft::$app->getView()->renderTemplate('statik/_components/fields/AnchorLink_settings', ['field' => $this,]);
    }

    public function getInputHtml($value, ElementInterface $element = null): string
    {
        // Register our asset bundle
        Craft::$app->getView()->registerAssetBundle(AnchorLinkFieldAsset::class);

        // Get our id and namespace
        $id = Craft::$app->getView()->formatInputId($this->handle);
        $namespacedId = Craft::$app->getView()->namespaceInputId($id);

        // Variables to pass down to our field JavaScript to let it namespace properly
        $jsonVars = [
            'id' => $id,
            'name' => $this->handle,
            'namespace' => $namespacedId,
            'url' => $element->url ?? $element->owner->url ?? '',
            'prefix' => Craft::$app->getView()->namespaceInputId(''),
        ];
        $jsonVars = Json::encode($jsonVars);
        Craft::$app->getView()->registerJs("$('#{$namespacedId}-field').StatikAnchorLink(" . $jsonVars . ");");

        // Render the input template
        return Craft::$app->getView()->renderTemplate(
            'statik/_components/fields/AnchorLink_input',
            [
                'name' => $this->handle,
                'value' => $value,
                'field' => $this,
                'id' => $id,
                'namespacedId' => $namespacedId,
            ]
        );
    }
}
