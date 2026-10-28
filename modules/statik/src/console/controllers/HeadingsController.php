<?php

namespace modules\statik\console\controllers;

use Craft;
use craft\console\Controller;
use craft\elements\Entry;
use craft\helpers\Console;
use modules\statik\helpers\Headings;
use yii\console\ExitCode;

/**
 * Lists the published entries whose content builder text skips a heading level: the same check as on save
 * (config/custom.php → headingCheck, modules/statik/src/helpers/Headings.php). Run it before switching headingCheck from
 * 'warn' to 'block', so editors aren't blocked by old content.
 *
 * Usage:
 *   ddev craft statik/headings              Every section, every site
 *   ddev craft statik/headings --section=pages
 */
class HeadingsController extends Controller
{
    public $defaultAction = 'index';

    /** @var string|null Only this section (handle) */
    public ?string $section = null;

    public function options($actionID): array
    {
        return array_merge(parent::options($actionID), ['section']);
    }

    public function actionIndex(): int
    {
        $fields = Craft::$app->getConfig()->getCustom()->headingCheckFields ?? ['contentBuilder'];
        // Pages in a section (not the nested entries)
        $query = Entry::find()->section('*')->site('*')->status(null)->drafts(false)->revisions(false);
        if ($this->section) {
            $query->section($this->section);
        }

        $checked = 0;
        $failing = 0;
        foreach ($query->each() as $entry) {
            /** @var Entry $entry */
            $layout = $entry->getFieldLayout();
            $builders = array_filter($fields, fn(string $field) => $layout?->getFieldByHandle($field) !== null);
            if (!$builders) {
                continue;
            }
            $checked++;
            $issues = [];
            foreach ($builders as $field) {
                $issues = array_merge($issues, Headings::outline($entry, $field)['issues']);
            }
            if (!$issues) {
                continue;
            }
            $failing++;
            $this->stdout(sprintf("%s (%s, %s)\n", $entry->title, $entry->getSite()->handle, $entry->getCpEditUrl()), Console::FG_YELLOW);
            foreach ($issues as $issue) {
                $this->stdout("  - $issue\n");
            }
        }

        $this->stdout(sprintf("\n%d entries checked, %d with heading issues.\n", $checked, $failing), $failing ? Console::FG_RED : Console::FG_GREEN);
        return ExitCode::OK;
    }
}
