<?php

namespace modules\statik\controllers;

use Craft;
use craft\web\Controller;
use modules\statik\services\SlugifyService;


class SlugifyController extends Controller
{
    protected $allowAnonymous = ['create-slug-from-string'];

    public function actionCreateSlugFromString()
    {
        $string = Craft::$app->request->getParam('string');
        return SlugifyService::instance()->createSlug($string);
    }
}
