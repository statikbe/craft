<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\helpers\Console;
use craft\helpers\FileHelper;
use yii\console\ExitCode;

/**
 * Checks the front-end translation keys against the files in translations/ (in git):
 *
 *     ddev craft statik/translations/check
 *     ddev craft statik/translations/check --unused
 *
 * - Missing: a key used in a template or the module (`'…'|t('website_name')`, `Craft::t('website_name', '…')`) without a
 *   translation for a site language. Exits with 1, so CI can run it.
 * - With --unused: keys in the files that no template, module or config file mentions any more (a key built in Twig, like
 *   `('overview.heading.' ~ source)|t`, counts as used when its full text is somewhere, e.g. in config/overview-sources.php).
 *
 * What editors changed in the control panel is in the database (Translate plugin) and isn't checked here.
 */
class TranslationsController extends Controller
{
    public $defaultAction = 'check';

    /** @var string The translation category */
    public string $category = 'website_name';

    /** @var bool Also list the keys that nothing uses any more */
    public bool $unused = false;

    public function options($actionID): array
    {
        return array_merge(parent::options($actionID), ['category', 'unused']);
    }

    public function actionCheck(): int
    {
        $used = $this->usedKeys();
        $missing = 0;

        foreach ($this->languages() as $language) {
            $messages = $this->messages($language);
            foreach ($used as $key => $file) {
                if (!isset($messages[$key]) || $messages[$key] === '') {
                    $this->stdout("Missing in $language: $key ($file)" . PHP_EOL, Console::FG_RED);
                    $missing++;
                }
            }
        }

        if ($this->unused) {
            $haystack = $this->sources();
            $keys = [];
            foreach ($this->languages() as $language) {
                $keys += $this->messages($language);
            }
            $count = 0;
            foreach (array_keys($keys) as $key) {
                if (!isset($used[$key]) && !str_contains($haystack, "'$key'") && !str_contains($haystack, "\"$key\"")) {
                    $this->stdout("Not used: $key" . PHP_EOL, Console::FG_YELLOW);
                    $count++;
                }
            }
            $this->stdout("$count key(s) not used." . PHP_EOL);
        }

        $this->stdout(sprintf('%d key(s) used, %d missing translation(s) in %s.', count($used), $missing, implode(', ', $this->languages())) . PHP_EOL, $missing ? Console::FG_RED : Console::FG_GREEN);

        return $missing ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }

    /**
     * The site languages.
     *
     * @return string[]
     */
    private function languages(): array
    {
        $languages = array_map(fn($site) => $site->language, Craft::$app->getSites()->getAllSites());
        $languages = array_values(array_unique($languages));
        sort($languages);
        return $languages;
    }

    /**
     * The translations a language gets from the files: the generic language (en) first, then the language itself (en-BE),
     * as Craft loads them.
     *
     * @return array<string, string>
     */
    private function messages(string $language): array
    {
        $base = Craft::$app->getPath()->getSiteTranslationsPath();
        $messages = [];
        foreach (array_unique([substr($language, 0, 2), $language]) as $folder) {
            $file = "$base/$folder/{$this->category}.php";
            if (is_file($file)) {
                $messages = array_merge($messages, (array)require $file);
            }
        }
        return $messages;
    }

    /**
     * The keys used literally in the templates and the module, with the first file that uses each.
     *
     * @return array<string, string>
     */
    private function usedKeys(): array
    {
        $category = preg_quote($this->category, '/');
        $patterns = [
            // 'key'|t('website_name') and "key"|t("website_name")
            '/([\'"])((?:(?!\1).)+?)\1\s*\|\s*t\(\s*[\'"]' . $category . '[\'"]/',
            // Craft::t('website_name', 'key')
            '/Craft::t\(\s*[\'"]' . $category . '[\'"]\s*,\s*([\'"])((?:(?!\1).)+?)\1/',
        ];

        $used = [];
        foreach ($this->files(['templates', 'modules']) as $file) {
            if ($file === __FILE__) {
                continue;
            }
            $contents = (string)file_get_contents($file);
            foreach ($patterns as $pattern) {
                if (preg_match_all($pattern, $contents, $matches)) {
                    foreach ($matches[2] as $key) {
                        $used[$key] ??= substr($file, strlen(CRAFT_BASE_PATH) + 1);
                    }
                }
            }
        }
        ksort($used);
        return $used;
    }

    /**
     * Everything that can mention a key: templates, the module and the config files.
     */
    private function sources(): string
    {
        $text = '';
        foreach ($this->files(['templates', 'modules', 'config']) as $file) {
            $text .= file_get_contents($file) . "\n";
        }
        return $text;
    }

    /**
     * @param string[] $folders
     * @return string[]
     */
    private function files(array $folders): array
    {
        $files = [];
        foreach ($folders as $folder) {
            $path = CRAFT_BASE_PATH . '/' . $folder;
            if (is_dir($path)) {
                $files = array_merge($files, FileHelper::findFiles($path, [
                    'only' => ['*.twig', '*.html', '*.php'],
                    'except' => ['project/', 'vendor/'],
                ]));
            }
        }
        return $files;
    }
}
