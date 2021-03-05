<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use mikehaertl\shellcommand\Command;
use studioespresso\seeder\Seeder;
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

        $this->stdout(str_replace("\n", PHP_EOL, $statik), Console::FG_BLUE);

        $this->setSystemName();
        $this->setPostemarkKey();
        $this->setupGit();

        $this->stdout("All done! Happy coding!" . PHP_EOL, Console::FG_GREEN);

        return ExitCode::OK;
    }

    // Private Methods

    private function setSystemName()
    {
        $newSystemName = $this->prompt('Enter a new system name:');
        if ($newSystemName) {
            if ($this->setEnvVar('SYSTEM_NAME', $newSystemName)) {
                $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
            }
        }
    }

    /**
     * Prompts the user if Mandrill should be used for e-mail transport and asks to enter an API key
     */
    private function setPostemarkKey()
    {
        if ($this->confirm("Do you want to use Postmark for email transport?", true)) {
            $key = $this->prompt("> Enter a Postmark API key:");
            if ($key) {
                if ($this->setEnvVar("POSTMARK_API_KEY", $key)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
                $testEmail = $this->prompt("> Enter an emailaddress to use for testing on staging environments:");
                if ($testEmail) {
                    if ($this->setEnvVar("DEBUG_EMAIL", $testEmail)) {
                        $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                    }
                }
            } else {
                $this->stdout("Key not found, aborting" . PHP_EOL, Console::FG_RED);
            }
        }
    }
    
    private function setupGit()
    {
        if ($this->confirm("Do you want to set up a git repo for this project?", true)) {
            $this->executeShellCommand('git init');
            $remote = $this->prompt("> Add a remote?");
            if ($remote) {
                $this->executeShellCommand("git remote add origin $remote");
                $remotes = $this->executeShellCommand('git remote -v');
                $this->stdout("> Repository initialized with this remote:" . PHP_EOL, COnsole::FG_GREEN);
                $this->stdout($remotes . PHP_EOL, Console::FG_GREEN);
            }
            if ($this->shellCommandExists('git-flow')) {
                if ($this->confirm("Do you want to initialize git-flow?", true)) {
                    $this->executeShellCommand('git-flow init -d');
                }
            }
        }
    }

    /**
     * Sets an environment variable value in the project's .env file.
     * @param $name
     * @param $value
     * @return bool
     */
    private function setEnvVar($name, $value): bool
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

    /**
     * Execute a shell command
     * @param string $command
     * @return string
     */
    private function executeShellCommand(string $command): string
    {
        // Create the shell command
        $shellCommand = new Command();
        $shellCommand->setCommand($command);
        // If we don't have proc_open, maybe we've got exec
        if (!function_exists('proc_open') && function_exists('exec')) {
            $shellCommand->useExec = true;
        }
        // Return the result of the command's output or error
        if ($shellCommand->execute()) {
            $result = $shellCommand->getOutput();
        } else {
            $result = $shellCommand->getError();
        }
        return $result;
    }

    /**
     * Return whether a shell command exists ir not
     * @param string $command
     * @return bool
     */
    private function shellCommandExists(string $command): bool
    {
        $result = $this->executeShellCommand('which ' . $command);
        return !empty($result);
    }

}
