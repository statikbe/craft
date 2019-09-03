<?php


namespace modules\statik\services;


use Craft;
use craft\base\Component;

class Revision extends Component
{
    private $version;

    private function setVersion()
    {
        $file = CRAFT_BASE_PATH . '/.revision';

        $this->version = file_exists($file) ? file_get_contents($file) : 'no-version';
    }

    /**
     * @return string
     */
    public function getVersion(): string
    {
        if (!$this->version) {
            $this->setVersion();
        }

        return $this->version;
    }
}