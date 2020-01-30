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
        $this->setProjectCode();
        $this->projectConfigSetting();
        $this->setPostemarkKey();
        $this->addStatikWebpack();
        $this->addPlaceholderImages();
        $this->seedEntries();
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

    private function setProjectCode()
    {
        $projectCode = $this->prompt('Enter a project code:');
        if ($projectCode) {
            if ($this->setEnvVar('PROJECT_CODE', $projectCode)) {
                $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
            }
        }
    }

    /**
     * Give the use the option to disable Craft's project config if they want to
     */
    private
    function projectConfigSetting()
    {
        if ($this->confirm("Do you want to disable projectConfig", true)) {
            if ($this->setEnvVar("PROJECT_CONFIG", 0)) {
                $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
            }
        }
    }

    /**
     * Prompts the user if Mandrill should be used for e-mail transport and asks to enter an API key
     */
    private
    function setPostemarkKey()
    {
        if ($this->confirm("Do you want to use Postmark for email transport?", true)) {
            $key = $this->prompt("> Enter a Postmark API key:");
            if ($key) {
                if ($this->setEnvVar("POSTMARK_API_KEY", $key)) {
                    $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                }
                $testEmail = $this->prompt("> Enter an emailaddress to use for testing on staging environments:");
                if($testEmail) {
                    if ($this->setEnvVar("DEBUG_EMAIL", $testEmail)) {
                        $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
                    }
                }
            } else {
                $this->stdout("Key not found, aborting" . PHP_EOL, Console::FG_RED);
            }
        }
    }

    private
    function addStatikWebpack()
    {
        if ($this->confirm("Do you want to use statikbe/webpack for your frontend build?", true)) {
            $url = "https://github.com/statikbe/webpack/archive/master.zip";
            $zipFile = "./webpack.zip";

            $zip_resource = fopen($zipFile, "w");

            $ch_start = curl_init();
            curl_setopt($ch_start, CURLOPT_URL, $url);
            curl_setopt($ch_start, CURLOPT_FAILONERROR, true);
            curl_setopt($ch_start, CURLOPT_HEADER, 0);
            curl_setopt($ch_start, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch_start, CURLOPT_AUTOREFERER, true);
            curl_setopt($ch_start, CURLOPT_BINARYTRANSFER, true);
            curl_setopt($ch_start, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch_start, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch_start, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch_start, CURLOPT_FILE, $zip_resource);
            $page = curl_exec($ch_start);
            if (!$page) {
                echo "Error :- " . curl_error($ch_start);
            }
            curl_close($ch_start);

            $zip = new \ZipArchive;
            if ($zip->open($zipFile) != "true") {
                $this->stdout("Oops, something went wrong" . PHP_EOL, Console::FG_RED);
            }

            $files = [
                'webpack-master/package.json',
                'webpack-master/webpack.mix.js',
                'webpack-master/yarn.lock',
                'webpack-master/.eslintrc'
            ];
            $zip->extractTo('.', $files);
            $zip->close();

            $this->stdout("Files downloaded, moving them now..." . PHP_EOL, Console::FG_GREEN);
            foreach ($files as $path) {
                $file = explode('/', $path);
                rename($path, $file[1]);
            }
            unlink('webpack.zip');
            rmdir('webpack-master');

            $this->stdout("Files moved & cleaned up" . PHP_EOL, Console::FG_GREEN);

            if ($this->confirm("Run yarn install now?", true)) {
                if ($this->shellCommandExists("yarn")) {
                    if ($this->executeShellCommand("yarn install")) {
                        $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);

                    }
                } else {
                    $this->stdout("Yarn not found" . PHP_EOL, Console::FG_RED);
                }
            }
        };
    }

    private function addPlaceholderImages()
    {
        if ($this->confirm('Do you want to add placeholder images?', true)) {
            $this->executeShellCommand('mkdir public/files/test');
            $this->executeShellCommand('mv -v placeholders/* public/files/test ');
            $this->executeShellCommand('rm -rf placeholders');
            $this->executeShellCommand('./craft index-assets/all');
            $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
        }
    }

    private function seedEntries()
    {
        if ($this->confirm("Do you want to add dummy content?", true)) {
            $channels = Craft::$app->getSections()->getSectionsByType('channel');
            foreach ($channels as $channel) {
                $count = $this->prompt("How many entries do you want to seed in $channel->name?");
                $this->stdout("Seeding $count entries in $channel->name" . PHP_EOL, Console::FG_YELLOW);
                Seeder::$plugin->entries->generate($channel->id, Craft::$app->getSites()->getPrimarySite()->id, $count);
            }
            $this->stdout("Done!" . PHP_EOL, Console::FG_GREEN);
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
