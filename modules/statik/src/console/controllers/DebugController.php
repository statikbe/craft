<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use yii\console\ExitCode;

class DebugController extends Controller
{
    public function actionIndex(): int
    {
        $this->removeAccountFlow();
        return ExitCode::OK;
    }

    private function removeAccountFlow()
    {

    }
}