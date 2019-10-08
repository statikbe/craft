<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use yii\console\ExitCode;


class SetupController extends Controller
{

    // Public Methods
    // =========================================================================
    public function actionIndex(): int
    {
        if (!Craft::$app->getConfig()->getGeneral()->securityKey) {
            $this->run('security-key');
            $this->stdout(PHP_EOL);
        }

        if (!$this->interactive) {
            return ExitCode::OK;
        }


        if (!Craft::$app->getIsInstalled()) {
            $this->stdout("Craft isn't installed yet, please do that first." . PHP_EOL, Console::FG_YELLOW);
            return ExitCode::OK;
        }

        $statik = <<<EOD
        
         _______.___________.    ___   .___________.__   __  ___ 
        /       |           |   /   \  |           |  | |  |/  / 
       |   (----`---|  |----`  /  ^  \ `---|  |----|  | |  '  /  
        \   \       |  |      /  /_\  \    |  |    |  | |    <   
    .----)   |      |  |     /  _____  \   |  |    |  | |  .  \  
    |_______/       |__|    /__/     \__\  |__|    |__| |__|\__\ 
    
       A     N  E  W     C  R  A  F  T     P  R  O  J  E  C  T


EOD;

        top:

        $this->stdout(str_replace("\n", PHP_EOL, $statik), Console::FG_RED);

        $this->projectConfigSetting();
        $this->setMandrillKey();
//        $this->seedEntries();

        return ExitCode::OK;
    }

    // Private Methods
    /**
     * Give the use the option to disable Craft's project config if they want to
     */
    private function projectConfigSetting()
    {
        if ($this->confirm("Do you want to disable projectConfig", true)) {
            if ($this->_setEnvVar("PROJECT_CONFIG", 0)) {
                $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
            }
        }
    }


    /**
     * Prompts the user if Mandrill should be used for e-mail transport and asks to enter an API key
     */
    private function setMandrillKey()
    {
        if ($this->confirm("Do you want to use Mandrill for email transport?", true)) {
            $key = $this->prompt("Enter a mandrill key:");
            if ($key) {
                if ($this->_setEnvVar("MANDRILL_KEY", $key)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
            } else {
                $this->stdout("Key not found, aborting" . PHP_EOL, Console::FG_RED);
            }
        }
    }

    /**
     * Sets an environment variable value in the project's .env file.
     *
     * @param $name
     * @param $value
     * @return bool
     */
    private function _setEnvVar($name, $value): bool
    {
        $configService = Craft::$app->getConfig();
        $path = $configService->getDotEnvPath();

        if (!file_exists($path)) {
            if ($this->confirm(PHP_EOL . "A .env file doesn't exist at {$path}. Would you like to create one?", true)) {
                try {
                    FileHelper::writeToFile($path, '');
                } catch (\Throwable $e) {
                    $this->stderr("Unable to create {$path}: {$e->getMessage()}" . PHP_EOL, Console::FG_RED);
                    return false;
                }

                $this->stdout("{$path} created. Note you still need to set up PHP dotenv for its values to take effect." . PHP_EOL, Console::FG_YELLOW);
            } else {
                $this->stdout(PHP_EOL . 'Action aborted.' . PHP_EOL, Console::FG_YELLOW);
                return false;
            }
        }

        try {
            $configService->setDotEnvVar($name, $value);
        } catch (\Throwable $e) {
            $this->stderr("Unable to set {$name} on {$path}: {$e->getMessage()}" . PHP_EOL, Console::FG_RED);
            return false;
        }

        return true;
    }


}
