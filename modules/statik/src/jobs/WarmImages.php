<?php

namespace modules\statik\jobs;

use Craft;
use craft\queue\BaseJob;
use modules\statik\helpers\ImageWarmer;
use Throwable;

/**
 * Requests one page as a warm request, so its image transforms are generated now instead of by the first visitor
 * (see ImageWarmer); the warm request records the page's cache tags. A failure is logged, not retried: the page still works,
 * its images are then generated as without warming.
 */
class WarmImages extends BaseJob
{
    public string $url = '';

    public int $siteId = 0;

    public function execute($queue): void
    {
        try {
            $status = ImageWarmer::warm($this->url, $this->siteId);
            if ($status !== 200) {
                Craft::warning("Warming the images of $this->url: HTTP $status", 'statik');
            }
        } catch (Throwable $e) {
            Craft::warning("Warming the images of $this->url failed: {$e->getMessage()}", 'statik');
        }
    }

    protected function defaultDescription(): ?string
    {
        return "Generating the images of $this->url";
    }
}
