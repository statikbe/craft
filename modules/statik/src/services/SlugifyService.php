<?php

namespace modules\statik\services;

use Craft;
use craft\base\Component;
use modules\statik\Statik;

class SlugifyService extends Component
{
    public function createSlug($string = null)
    {
        $string = html_entity_decode($string, ENT_QUOTES, 'UTF-8');
        // replace non letter or digits by -
        $string = preg_replace('~[^\\pL\d.]+~u', '-', $string);

        // trim
        $string = trim($string, '-');
        setlocale(LC_CTYPE, 'en_GB.utf8');
        // transliterate
        if (function_exists('iconv')) {
            $string = iconv('utf-8', 'us-ascii//TRANSLIT', $string);
        }

        // lowercase
        $string = strtolower($string);

        // remove unwanted characters
        $string = preg_replace('~[^-\w.]+~', '', $string);

        if (empty($string)) {
            return '';
        }

        $string = str_replace(".", "_", $string);

        return $string;
    }
}