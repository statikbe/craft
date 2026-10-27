<?php

namespace modules\statik\services;

use craft\helpers\App;
use craft\helpers\FileHelper;
use craft\services\Path;

class CompliledPath extends Path
{
    public function getCompiledTemplatesPath(bool $create = true): string
    {
        return $this->_compiled('compiled_templates', $create);
    }

    public function getCompiledClassesPath(bool $create = true): string
    {
        return $this->_compiled('compiled_classes', $create);
    }

    private function _compiled(string $dir, bool $create): string
    {
        $base = App::env('CRAFT_COMPILED_PATH');
        if (!$base) {
            return $dir === 'compiled_templates'
                ? parent::getCompiledTemplatesPath($create)
                : parent::getCompiledClassesPath($create);
        }
        $path = FileHelper::normalizePath("$base/$dir");
        if ($create) {
            FileHelper::createDirectory($path);
        }
        return $path;
    }
}
