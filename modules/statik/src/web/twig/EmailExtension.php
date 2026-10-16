<?php

namespace modules\statik\web\twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

/**
 * `obfuscate_emails`: hides the email addresses in HTML from harvesters that don't run JavaScript, without inline scripts or
 * eval() (so it works with a strict Content Security Policy). frontend/js/components-core/email.component.ts puts them back.
 *
 *     {% apply obfuscate_emails %}…{% endapply %}
 *
 * - `<a href="mailto:…">`: the href moves to `data-mailto` (encoded); the component sets it back;
 * - an address in the text: a `<span data-email>` (encoded) with the part before the @ and, in a `<noscript>`, the rest as
 *   ` [at] statik [dot] be`; the component replaces it with the address. Outside a link it also becomes a mailto link.
 *
 * With JavaScript the reader sees `info` until the component has run (a browser with JavaScript doesn't show `<noscript>`), so
 * never the `[at]`/`[dot]` form; without JavaScript `info [at] statik [dot] be`, and no link. Addresses in other attributes (form values,
 * data attributes) and in script, style and textarea are left alone. Applying it twice changes nothing.
 */
class EmailExtension extends AbstractExtension
{
    private const EMAIL = '[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}';

    /** Elements whose content isn't text to show */
    private const SKIP = ['script', 'style', 'textarea', 'title', 'noscript', 'template'];

    public function getFilters(): array
    {
        return [
            new TwigFilter('obfuscate_emails', [$this, 'obfuscateEmails'], ['is_safe' => ['html']]),
        ];
    }

    public function obfuscateEmails(mixed $html): string
    {
        $html = (string)$html;
        if (!str_contains($html, '@')) {
            return $html;
        }

        // Tags (and comments) and the text between them
        $parts = preg_split('/(<!--.*?-->|<[^>]*>)/s', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
        $skip = null;
        $linkDepth = 0;

        foreach ($parts as $i => $part) {
            if ($part === '') {
                continue;
            }

            if ($part[0] === '<') {
                if ($skip !== null) {
                    if (preg_match('#^</' . $skip . '\b#i', $part)) {
                        $skip = null;
                    }
                } elseif (preg_match('#^<(' . implode('|', self::SKIP) . ')\b#i', $part, $match) && !str_ends_with($part, '/>')) {
                    $skip = strtolower($match[1]);
                } elseif (preg_match('#^<a\b#i', $part)) {
                    $linkDepth++;
                    $parts[$i] = $this->obfuscateMailto($part);
                } elseif (preg_match('#^</a\b#i', $part)) {
                    $linkDepth = max(0, $linkDepth - 1);
                }
                continue;
            }

            if ($skip !== null) {
                continue;
            }

            $parts[$i] = preg_replace_callback('/' . self::EMAIL . '/', function(array $match) use ($linkDepth) {
                $address = $this->readable($match[0]);
                // Inside a link only the text; outside one it becomes a mailto link
                return $linkDepth > 0
                    ? $address
                    : '<a data-mailto="' . $this->encode('mailto:' . $match[0]) . '">' . $address . '</a>';
            }, $part);
        }

        return implode('', $parts);
    }

    /**
     * An `<a>` opening tag: a mailto href becomes `data-mailto`.
     */
    private function obfuscateMailto(string $tag): string
    {
        return preg_replace_callback(
            '/\shref\s*=\s*(["\'])\s*(mailto:[^"\']*)\1/i',
            fn(array $match) => ' data-mailto="' . $this->encode(html_entity_decode($match[2], ENT_QUOTES | ENT_HTML5)) . '"',
            $tag,
        );
    }

    /**
     * The address in a span that the component fills with the address: the part before the @, and the rest in a noscript as
     * readable text (" [at] statik [dot] be") for readers without JavaScript.
     */
    private function readable(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2);
        $rest = ' [at] ' . str_replace('.', ' [dot] ', $domain);
        return '<span data-email="' . $this->encode($email) . '">' . htmlspecialchars($local, ENT_QUOTES)
            . '<noscript>' . htmlspecialchars($rest, ENT_QUOTES) . '</noscript></span>';
    }

    /**
     * Base64 of the reversed text, so a plain base64 decode doesn't give the address (email.component.ts reverses it back).
     */
    private function encode(string $value): string
    {
        return base64_encode(implode('', array_reverse(mb_str_split($value))));
    }
}
