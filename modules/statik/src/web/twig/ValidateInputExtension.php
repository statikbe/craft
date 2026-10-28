<?php

namespace modules\statik\web\twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigTest;

use function is_numeric;

class ValidateInputExtension extends AbstractExtension
{
    // Letters and digits of any language (with their accents), whitespace and the punctuation people type in a search
    // (Jean-Luc, café, "a, b", 50%, C++). Not allowed: characters for markup or code, like < > { } [ ] \ ` $ = | ~ ^ *
    private const COMMON_QUERY_CHARACTERS_REGEX = "/^[\p{L}\p{M}\p{N}\s.,!?@;:'\"’‘“”\-–—&()\/+#%_]+$/u";

    public function getTests(): array
    {
        return [
            new TwigTest('valid_id', [$this, 'validateIdInput']),
            new TwigTest('valid_query', [$this, 'validateQueryInput']),
        ];
    }

    // Validates a string representing an id or an array of strings representing ids
    public function validateIdInput(null|array|string $input): bool
    {
        if ($input === null) {
            return false;
        }

        if (!is_array($input)) {
            return is_numeric($input);
        }

        foreach ($input as $value) {
            if (!$this->validateIdInput($value)) {
                return false;
            }
        }

        return true;
    }

    // Validates that query string or array of query strings only contains valid characters
    public function validateQueryInput(null|array|string $input): bool
    {
        if ($input === null) {
            return false;
        }

        if (!is_array($input)) {
            return preg_match(self::COMMON_QUERY_CHARACTERS_REGEX, $input) === 1;
        }

        foreach ($input as $value) {
            if (!$this->validateQueryInput($value)) {
                return false;
            }
        }

        return true;
    }
}
