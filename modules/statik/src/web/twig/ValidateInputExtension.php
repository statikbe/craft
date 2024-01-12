<?php

namespace modules\statik\web\twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigTest;

class ValidateInputExtension extends AbstractExtension
{
    private const NUMBERS_ONLY_REGEX = '/^[0-9]+$/';
    private const COMMON_QUERY_CHARACTERS_REGEX = "/^[a-zA-Z0-9!?'\"]+$/";

    public function getTests(): array
    {
        return [
            new TwigTest('valid_id', [$this, 'validateIdInput']),
            new TwigTest('valid_query', [$this, 'validateQueryInput']),
        ];
    }

    public function validateIdInput(string $input): bool
    {
        return preg_match(self::NUMBERS_ONLY_REGEX, $input);
    }

    public function validateQueryInput(string $input): bool
    {
        return preg_match(self::COMMON_QUERY_CHARACTERS_REGEX, $input);
    }

}
