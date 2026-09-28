<?php

namespace modules\statik\controllers;

use Craft;
use craft\elements\Entry;
use craft\web\Controller;
use modules\statik\web\hyper\EntryAnchor;
use yii\web\Response;

class EntryAnchorsController extends Controller
{
    public function beforeAction($action): bool
    {
        $this->requireCpRequest();

        return parent::beforeAction($action);
    }

    /**
     * Returns the anchor options (Title (Anchor) fields) of an entry for the "Entry (with anchor)" Hyper link type.
     */
    public function actionList(): Response
    {
        $entryId = $this->request->getRequiredParam('entryId');
        $siteId = $this->request->getParam('siteId') ?: null;

        $entry = Entry::find()
            ->id($entryId)
            ->siteId($siteId)
            ->status(null)
            ->one();

        if ($entry && !Craft::$app->getElements()->canView($entry)) {
            $entry = null;
        }

        return $this->asJson([
            'options' => EntryAnchor::getAnchorOptions($entry),
        ]);
    }
}
