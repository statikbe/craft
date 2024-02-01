<?php

namespace modules\statik\widgets;

use Craft;
use craft\base\Widget;

class WelcomeWidget extends Widget
{
    public static function displayName(): string
    {
        return Craft::t('app', 'Welkom!');
    }

    protected static function allowMultipleInstances(): bool
    {
        return false;
    }

    /**
     * @throws \Twig\Error\SyntaxError
     * @throws \yii\base\Exception
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\LoaderError
     */
    public function getBodyHtml(): string
    {
        return "<div>
                    <p>Op <a href='https://help.statik.be'>help.statik.be</a> vind je o.a. video's met uitleg over het CMS</p>
                    <h3>Wat bij support?</h3>
                    <p>Heb je vragen of een probleem mail dan de URL en screenshot naar <a href='mailto:support@statik.be'>support@statik.be</a></p>
                </div>";
    }
}