<?php

namespace modules\statik\controllers;

use Craft;
use craft\helpers\ElementHelper;
use craft\web\Controller;

class SlugifyController extends Controller
{
    protected int|bool|array $allowAnonymous = ['create-slug-from-string'];

    public function actionCreateSlugFromString(): string
    {
        $string = Craft::$app->request->getParam('string');
        return ElementHelper::generateSlug($string);
    }
}
