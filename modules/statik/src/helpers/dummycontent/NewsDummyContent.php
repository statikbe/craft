<?php

namespace modules\statik\helpers\dummycontent;

use Craft;
use craft\elements\Entry;

/**
 * Dummy news items: a title, a publication date (the newest first, a few days apart), a header image, an intro, one or two
 * categories and a few content rows: a section (heading + text), a longer follow-up text without a heading next to a landscape
 * image (left or right, alternating), a quote on every other item and a closing section. Texts come from the "news" key in
 * config/dummy-content/content.json: "sections" ({heading, body}; the first half opens an item, the second half closes it) and
 * "followUps" (texts long enough to sit next to an image).
 */
class NewsDummyContent extends DummyContentType
{
    /** The header image of the item being filled: not used again in its content rows */
    private ?int $headerId = null;

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
        $this->headerId = $header?->id;
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

    /**
     * The content rows of item $index. The image next to the follow-up text is landscape (a portrait one would tower over it)
     * and switches sides per item; the quote is only on every other item, so the items don't all look the same.
     */
    private function rows(int $index): array
    {
        // The first half of "sections" opens an item, the second half closes it
        $sections = array_values((array)($this->content['sections'] ?? []));
        $half = max(1, intdiv(count($sections), 2));
        $first = $sections[$index % $half] ?? [];
        $last = $sections[$half + $index % max(1, count($sections) - $half)] ?? $first;
        $image = $this->image(true, array_filter([$this->headerId]));
        $text = ['type' => 'cellText', 'fields' => ['text' => $this->pick('followUps', $index) ?? '']];
        $imageCell = ['type' => 'cellImage', 'fields' => ['image' => $image ? [$image->id] : []]];
        $quote = $this->pick('quotes', $index);

        $rows = [
            ['layout' => 'full', 'cells' => [
                ['type' => 'cellText', 'fields' => ['blockTitle' => $first['heading'] ?? '', 'text' => $first['body'] ?? '']],
            ]],
            // No title: a follow-up of the row above (close spacing)
            ['layout' => 'halves', 'fields' => ['gridAlignment' => 'center'], 'cells' => $index % 2 === 0 ? [$text, $imageCell] : [$imageCell, $text]],
        ];
        if ($quote && $index % 2 === 0) {
            $rows[] = ['layout' => 'full', 'background' => 'section--light', 'cells' => [
                ['type' => 'cellQuote', 'fields' => ['text' => $quote['text'] ?? '', 'writer' => $quote['writer'] ?? '']],
            ]];
        }
        $rows[] = ['layout' => 'full', 'cells' => [
            ['type' => 'cellText', 'fields' => ['blockTitle' => $last['heading'] ?? '', 'text' => $last['body'] ?? '']],
        ]];
        return $rows;
    }
}
