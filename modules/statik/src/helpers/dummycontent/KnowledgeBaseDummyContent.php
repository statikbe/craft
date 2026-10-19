<?php

namespace modules\statik\helpers\dummycontent;

use craft\elements\Entry;

/**
 * Dummy knowledge base items: a title, a date added (the newest first, a few days apart), a header image, an intro, one or two
 * categories and a few content rows (a text with a title, a text without one next to an image, a closing text). Texts come from
 * the "knowledgeBase" key in config/dummy-content/content.json.
 */
class KnowledgeBaseDummyContent extends DummyContentType
{
    public function key(): string
    {
        return 'knowledgeBase';
    }

    public function label(): string
    {
        return 'knowledge base items';
    }

    public function sectionHandle(): string
    {
        return 'knowledgeBase';
    }

    public function categorySectionHandle(): ?string
    {
        return 'knowledgeBaseCategories';
    }

    public function categoryFieldHandle(): ?string
    {
        return 'knowledgeBaseCategory';
    }

    public function fill(Entry $entry, int $index, array $categoryIds): void
    {
        $title = $this->title('titles', $index);
        $entry->title = $title;
        $entry->slug = self::slug($title);
        $entry->postDate = $this->pastDate($index);

        $header = $this->image(true);
        $sections = array_values((array)($this->content['sections'] ?? []));
        $half = max(1, intdiv(count($sections), 2));
        $first = $sections[$index % $half] ?? [];
        $last = $sections[$half + $index % max(1, count($sections) - $half)] ?? $first;
        $image = $this->image(true, array_filter([$header?->id]));
        $text = ['type' => 'cellText', 'fields' => ['text' => $this->pick('followUps', $index) ?? '']];
        $imageCell = ['type' => 'cellImage', 'fields' => ['image' => $image ? [$image->id] : []]];

        $values = [
            'headerImage' => $header ? [$header->id] : [],
            'intro' => $this->pick('intros', $index) ?? '',
            'contentBuilder' => $this->contentRows([
                ['layout' => 'full', 'cells' => [
                    ['type' => 'cellText', 'fields' => ['blockTitle' => $first['heading'] ?? '', 'text' => $first['body'] ?? '']],
                ]],
                ['layout' => 'halves', 'fields' => ['gridAlignment' => 'center'], 'cells' => $index % 2 === 0 ? [$text, $imageCell] : [$imageCell, $text]],
                ['layout' => 'full', 'cells' => [
                    ['type' => 'cellText', 'fields' => ['blockTitle' => $last['heading'] ?? '', 'text' => $last['body'] ?? '']],
                ]],
            ]),
        ];
        if ($categoryIds) {
            shuffle($categoryIds);
            $values[$this->categoryFieldHandle()] = array_slice($categoryIds, 0, mt_rand(1, min(2, count($categoryIds))));
        }
        $entry->setFieldValues($values);
    }
}
