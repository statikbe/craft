<?php

namespace modules\statik\helpers\dummycontent;

use Craft;
use craft\elements\Entry;

/**
 * Dummy news items: a title, a publication date (the newest first, a few days apart), a header image, an intro, one or two
 * categories and a few content rows (a text with a title, a text without one next to an image, a quote, a closing text).
 * Texts come from the "news" key in config/dummy-content/content.json.
 */
class NewsDummyContent extends DummyContentType
{
    public function key(): string
    {
        return 'news';
    }

    public function label(): string
    {
        return 'news items';
    }

    public function sectionHandle(): string
    {
        return 'news';
    }

    public function categorySectionHandle(): ?string
    {
        return 'newsCategories';
    }

    public function categoryFieldHandle(): ?string
    {
        return 'newsCategory';
    }

    public function fill(Entry $entry, int $index, array $categoryIds): void
    {
        $title = $this->title('titles', $index);
        $entry->title = $title;
        $entry->slug = self::slug($title);
        $entry->postDate = $this->pastDate($index);

        $header = $this->image(true);
        $values = [
            'headerImage' => $header ? [$header->id] : [],
            'intro' => $this->pick('intros', $index) ?? '',
        ];

        if ($categoryIds && $this->categoryFieldHandle()) {
            shuffle($categoryIds);
            $values[$this->categoryFieldHandle()] = array_slice($categoryIds, 0, mt_rand(1, min(2, count($categoryIds))));
        }

        $values['contentBuilder'] = $this->contentRows($this->rows($index));
        $entry->setFieldValues($values);
    }

    /** The content rows of item $index; the quote only on every other item, so the items don't all look the same */
    private function rows(int $index): array
    {
        $image = $this->image();
        $quote = $this->pick('quotes', $index);
        $rows = [
            ['layout' => 'full', 'cells' => [
                ['type' => 'cellText', 'fields' => ['blockTitle' => $this->pick('headings', $index), 'text' => $this->pick('paragraphs', $index)]],
            ]],
            // No title: a follow-up of the row above (close spacing)
            ['layout' => 'halves', 'cells' => [
                ['type' => 'cellText', 'fields' => ['text' => $this->pick('paragraphs', $index + 1)]],
                ['type' => 'cellImage', 'fields' => ['image' => $image ? [$image->id] : []]],
            ]],
        ];
        if ($quote && $index % 2 === 0) {
            $rows[] = ['layout' => 'full', 'background' => 'section--light', 'cells' => [
                ['type' => 'cellQuote', 'fields' => ['text' => $quote['text'] ?? '', 'writer' => $quote['writer'] ?? '']],
            ]];
        }
        $rows[] = ['layout' => 'full', 'cells' => [
            ['type' => 'cellText', 'fields' => ['blockTitle' => $this->pick('headings', $index + 2), 'text' => $this->pick('paragraphs', $index + 4)]],
        ]];
        return $rows;
    }
}
