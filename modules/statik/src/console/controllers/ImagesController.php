<?php

namespace modules\statik\console\controllers;

use craft\console\Controller;
use craft\elements\Entry;
use craft\helpers\Console;
use modules\statik\helpers\ImageWarmer;
use yii\console\ExitCode;

/**
 * Generates the image transforms of pages before visitors need them (see ImageWarmer), e.g. after a deploy, an import or a new
 * image size:
 *
 *     ddev craft statik/images/warm
 *     ddev craft statik/images/warm --site=nl --section=news
 *     ddev craft statik/images/warm --queue
 *
 * Every live entry with a URL, per site. By default one page after the other, here; with --queue as queue jobs. Every warmed page
 * is recorded with the element cache tags it depends on, so later changes warm it again (see ImageWarmer).
 */
class ImagesController extends Controller
{
    /** @var string|null A site handle; default every site */
    public ?string $site = null;

    /** @var string|null A section handle; default every section */
    public ?string $section = null;

    /** @var bool Push a queue job per page instead of warming them here */
    public bool $queue = false;

    public function options($actionID): array
    {
        return array_merge(parent::options($actionID), ['site', 'section', 'queue']);
    }

    public function actionWarm(): int
    {
        $query = Entry::find()
            ->site($this->site ?? '*')
            ->status(Entry::STATUS_LIVE)
            ->uri(':notempty:');
        if ($this->section) {
            $query->section($this->section);
        }

        $pages = [];
        foreach ($query->each() as $entry) {
            /** @var Entry $entry */
            $url = $entry->getUrl();
            if ($url) {
                $pages[$url] = $entry->siteId;
            }
        }
        if (!$pages) {
            $this->stdout("No pages found.\n");
            return ExitCode::OK;
        }

        if ($this->queue) {
            foreach ($pages as $url => $siteId) {
                ImageWarmer::queueUrl($url, $siteId);
            }
            $this->stdout(count($pages) . " pages queued.\n", Console::FG_GREEN);
            return ExitCode::OK;
        }

        $failed = 0;
        $skipped = 0;
        $total = count($pages);
        $i = 0;
        foreach ($pages as $url => $siteId) {
            $i++;
            $start = microtime(true);
            try {
                $status = ImageWarmer::warm($url, $siteId);
            } catch (\Throwable $e) {
                $status = $e->getMessage();
            }
            $seconds = round(microtime(true) - $start, 1);
            if ($status === 200) {
                $this->stdout("[$i/$total] $url ({$seconds}s)\n");
            } elseif (is_int($status) && $status >= 300 && $status < 400) {
                // A page for logged-in users (profile, …) redirects an anonymous request to the login: nothing to warm
                $skipped++;
                $this->stdout("[$i/$total] $url: skipped, redirects ($status)\n", Console::FG_GREY);
            } else {
                $failed++;
                $this->stderr("[$i/$total] $url: $status\n", Console::FG_RED);
            }
        }

        $this->stdout(($total - $failed - $skipped) . " of $total pages warmed" . ($skipped ? ", $skipped skipped" : '') . ".\n", $failed ? Console::FG_YELLOW : Console::FG_GREEN);
        return $failed ? ExitCode::UNSPECIFIED_ERROR : ExitCode::OK;
    }
}
