<?php

namespace modules\statik\web\twig;

use Craft;
use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

/**
 * `tel`: a phone number as typed by an editor ("016 67 19 01", "+32 (0)16 67 19 01", "0032 16 67 19 01") in one form, with
 * libphonenumber:
 *
 *     <a href="tel:{{ phone|tel }}">{{ phone|tel('display') }}</a>
 *
 * - 'link' (default): E.164 for a tel: link, e.g. +3216671901;
 * - 'display': the international notation, e.g. +32 16 67 19 01;
 * - 'national': the notation within the country, e.g. 016 67 19 01.
 *
 * Numbers without a country code are read as numbers of the current site's country (the region of its language, e.g. nl-BE),
 * or of the given region. A number libphonenumber can't read: 'link' keeps only digits and a leading + (and drops a "(0)"),
 * the other formats return it as typed.
 */
class PhoneExtension extends AbstractExtension
{
    /** The country for numbers without a country code when the site's language has no region */
    private const DEFAULT_REGION = 'BE';

    private const FORMATS = [
        'link' => PhoneNumberFormat::E164,
        'display' => PhoneNumberFormat::INTERNATIONAL,
        'national' => PhoneNumberFormat::NATIONAL,
    ];

    public function getFilters(): array
    {
        return [
            new TwigFilter('tel', [$this, 'tel']),
        ];
    }

    public function tel(mixed $number, string $format = 'link', ?string $region = null): string
    {
        $number = trim((string)$number);
        if ($number === '') {
            return '';
        }

        $util = PhoneNumberUtil::getInstance();
        try {
            $parsed = $util->parse($number, $region ?? $this->siteRegion());
            if ($util->isPossibleNumber($parsed)) {
                return $util->format($parsed, self::FORMATS[$format] ?? PhoneNumberFormat::E164);
            }
        } catch (NumberParseException) {
            // Not a number libphonenumber can read: below
        }

        return $format === 'link' ? $this->clean($number) : $number;
    }

    /**
     * The country of the current site: the region of its language (nl-BE → BE).
     */
    private function siteRegion(): string
    {
        $parts = explode('-', Craft::$app->getSites()->getCurrentSite()->language);
        return isset($parts[1]) && strlen($parts[1]) === 2 ? strtoupper($parts[1]) : self::DEFAULT_REGION;
    }

    /**
     * Digits and a leading +, without the "(0)" of "+32 (0)16 …", which would make another number.
     */
    private function clean(string $number): string
    {
        $number = preg_replace('/\(\s*0\s*\)/', '', $number);
        $plus = str_starts_with(ltrim($number), '+') ? '+' : '';
        return $plus . preg_replace('/\D/', '', $number);
    }
}
