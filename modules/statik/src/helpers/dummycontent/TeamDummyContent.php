<?php

namespace modules\statik\helpers\dummycontent;

use craft\elements\Entry;
use craft\helpers\StringHelper;

/**
 * Dummy people for the team section: first and last name (the title follows from them), mostly a photo, a job title, an email
 * address (on example.com) and sometimes a phone number, so the person card shows every combination. Names and the rest come
 * from the "team" key in config/dummy-content/content.json. People have no URL; the dummy- slug only marks them for cleanup.
 */
class TeamDummyContent extends DummyContentType
{
    public function key(): string
    {
        return 'team';
    }

    public function label(): string
    {
        return 'people';
    }

    public function sectionHandle(): string
    {
        return 'team';
    }

    public function fill(Entry $entry, int $index, array $categoryIds): void
    {
        [$firstName, $lastName] = $this->pick('people', $index) ?? ['First', 'Last'];
        $entry->slug = self::slug("$firstName $lastName");
        $entry->postDate = $this->pastDate($index);

        // Every fourth person without a photo, so the card's initials show up
        $photo = $index % 4 === 3 ? null : $this->image();
        $domain = $this->content['emailDomain'] ?? 'example.com';
        $entry->setFieldValues([
            'firstName' => $firstName,
            'lastName' => $lastName,
            'photo' => $photo ? [$photo->id] : [],
            'jobTitle' => $this->pick('jobTitles', $index) ?? '',
            'email' => $index % 5 === 4 ? '' : StringHelper::toKebabCase($firstName) . '.' . StringHelper::toKebabCase($lastName) . '@' . $domain,
            'phoneNumber' => $this->pick('phones', $index) ?? '',
        ]);
    }
}
