<?php

namespace modules\statik\web\twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigTest;

use function is_numeric;

class ValidateInputExtension extends AbstractExtension
{
    private const COMMON_QUERY_CHARACTERS_REGEX = "/^[a-zA-Z0-9.!?@;:éÉèÈêÊàÀëËïÏ\s'\"]+$/";

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
            return preg_match(self::COMMON_QUERY_CHARACTERS_REGEX, $input);
        }

        foreach ($input as $value) {
            if (!$this->validateQueryInput($value)) {
                return false;
            }
        }

        return true;
    }
}
