<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use mikehaertl\shellcommand\Command;
use yii\console\ExitCode;

class SetupController extends Controller
{
    private const DEPLOY_FILES = [
        CRAFT_BASE_PATH . '/deploy.php',
        CRAFT_BASE_PATH . '/hosts.yml',
        CRAFT_BASE_PATH . '/bitbucket-pipelines.yml',
    ];
    private const PROJECT_CODE_PLACEHOLDER = '[PROJECT_CODE_HERE]';

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
        $this->stdout(str_replace("\n", PHP_EOL, $statik), Console::FG_BLUE);

        $this->setSystemName();
        $this->setProjectCode();
        $this->removeAccountFlow();
        $this->setPostmarkKey();
        $this->setRecaptchaKey();
        $this->setupGit();

        $this->stdout("All done! Happy coding!" . PHP_EOL, Console::FG_GREEN);

        return ExitCode::OK;
    }

    // Private Methods

    private function setSystemName(): void
    {
        $newSystemName = $this->prompt('Enter a new system name:');
        if ($newSystemName) {
            if ($this->setEnvVar('SYSTEM_NAME', $newSystemName)) {
                $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
            }
        }
    }

    private function setProjectCode(): void
    {
        $newProjectCode = $this->prompt('Enter a the project code:');
        if ($newProjectCode) {
            // Replace self::PROJECT_CODE_PLACEHOLDER in htaccess-staging and htaccess-production
            $this->replaceInFile(Craft::$app->path->getConfigPath() . '/htaccess-staging', $newProjectCode);
            $this->replaceInFile(Craft::$app->path->getConfigPath() . '/htaccess-production', $newProjectCode);
            foreach (self::DEPLOY_FILES as $deployFile) {
                $this->replaceInFile($deployFile, $newProjectCode);
            }
        }
    }

    private function replaceInFile(string $filePath, string $projectCode): bool
    {
        if (file_exists($filePath)) {
            $fileContents = file_get_contents($filePath);
            $fileContents = str_replace(self::PROJECT_CODE_PLACEHOLDER, strtolower($projectCode), $fileContents);
            file_put_contents($filePath, $fileContents);
        } else {
            $this->stderr("$filePath file not found." . PHP_EOL, Console::FG_RED);
            return false;
        }
        $this->stdout("Updated $filePath with $projectCode!" . PHP_EOL, Console::FG_GREEN);
        return true;
    }

    private function removeAccountFlow(): bool
    {
        if ($this->confirm("Do you want to remove the frontend account flow in Craft?", false)) {
            $accountSectionHandles = ['confirmAccount', 'editPassword', 'editProfile', 'forgotPassword', 'forgotPasswordConfirmation', 'login', 'profile', 'register', 'registrationCompleted', 'setPassword', 'setPasswordConfirmation'];
            $accountSectionHandlesMapped = implode(', ', $accountSectionHandles);
            if ($this->confirm("Are you sure? The next sections will be removed: $accountSectionHandlesMapped", false)) {
                foreach ($accountSectionHandles as $accountSectionHandle) {
                    $accountSection = Craft::$app->getEntries()->getSectionByHandle($accountSectionHandle);
                    if ($accountSection) {
                        $this->stdout("Deleting: $accountSectionHandle" . PHP_EOL, Console::FG_GREY);
                        Craft::$app->getEntries()->deleteSectionById($accountSection->id);
                    }
                }

                $accountsFolder = Craft::$app->path->getSiteTemplatesPath() . '/_site/_account';
                if (is_dir($accountsFolder)) {
                    FileHelper::removeDirectory($accountsFolder);
                    if (!is_dir($accountsFolder)) {
                        $this->stdout("$accountsFolder removed!" . PHP_EOL, Console::FG_GREEN);
                    }
                } else {
                    $this->stderr("$accountsFolder not found." . PHP_EOL, Console::FG_RED);
                    return false;
                }

                if ($this->setEnvVar("PUBLIC_ACCOUNT_FLOW", 0)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
            } else {
                $this->setEnvVar("PUBLIC_ACCOUNT_FLOW", 1);
            }
        } else {
            $this->setEnvVar("PUBLIC_ACCOUNT_FLOW", 1);
        }
        return true;
    }

    /**
     * Prompts the user if Postmark should be used for e-mail transport and asks to enter an API key
     */
    private function setPostmarkKey(): void
    {
        if ($this->confirm("Do you want to use Postmark for email transport?", true)) {
            $key = $this->prompt("> Enter a Postmark API key:");
            if ($key) {
                if ($this->setEnvVar("POSTMARK_API_KEY", $key)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
                $testEmail = $this->prompt("> Enter an email address to use for testing on staging environments:");
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

    /**
     * Prompts the user if recaptcha will be used and asks to enter an API key
     */
    private function setRecaptchaKey(): void
    {
        if ($this->confirm("Do you want to use Recaptcha for spam protection?", true)) {
            $key = $this->prompt("> Enter a recaptcha SITE key:");
            if ($key) {
                if ($this->setEnvVar("RECAPTCHA_SITE_KEY", $key)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
            } else {
                $this->stdout("Key not found, aborting" . PHP_EOL, Console::FG_RED);
            }
            $key = $this->prompt("> Enter a recaptcha SECRET key:");
            if ($key) {
                if ($this->setEnvVar("RECAPTCHA_SECRET_KEY", $key)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
            } else {
                $this->stdout("Key not found, aborting" . PHP_EOL, Console::FG_RED);
            }
        }
    }

    private function setupGit(): void
    {
        if ($this->confirm("Do you want to set up a git repo for this project?", true)) {
            $this->executeShellCommand('git init');
            $remote = $this->prompt("> Add a remote?");
            if ($remote) {
                $this->executeShellCommand("git remote add origin $remote");
                $remotes = $this->executeShellCommand('git remote -v');
                $this->stdout("> Repository initialized with this remote:" . PHP_EOL, Console::FG_GREEN);
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
     */
    private function setEnvVar(string $name, string $value): bool
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
     */
    private function shellCommandExists(string $command): bool
    {
        $result = $this->executeShellCommand('which ' . $command);
        return !empty($result);
    }
}
