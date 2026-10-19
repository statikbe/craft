<?php

namespace modules\statik\helpers\dummycontent;

use craft\elements\Entry;

/**
 * Dummy events: a title, a header image, an intro, one category, a location, an organisation, often a price, one date (a
 * moment, a few hours or a few days) and a few content rows. The dates cover the cases the calendar handles: the first event
 * has ended (it isn't listed), the second is ongoing (started yesterday, ends in two days: it is listed), the others follow
 * over the coming weeks. Texts come from the "calendar" key in config/dummy-content/content.json.
 */
class CalendarDummyContent extends DummyContentType
{
    /** Days from today to the start of the previous event (the events follow each other) */
    private int $daysAhead = 0;

    public function key(): string
    {
        return 'calendar';
    }

    public function label(): string
    {
        return 'events';
    }

    public function sectionHandle(): string
    {
        return 'calendar';
    }

    public function categorySectionHandle(): ?string
    {
        return 'calendarCategories';
    }

    public function categoryFieldHandle(): ?string
    {
        return 'eventCategory';
    }

    public function fill(Entry $entry, int $index, array $categoryIds): void
    {
        $title = $this->title('titles', $index);
        $entry->title = $title;
        $entry->slug = self::slug($title);
        $entry->postDate = $this->pastDate($index);

        $header = $this->image(true);
        $sections = array_values((array)($this->content['sections'] ?? []));
        $section = $sections[$index % max(1, count($sections))] ?? [];
        $image = $this->image(true, array_filter([$header?->id]));
        $text = ['type' => 'cellText', 'fields' => ['text' => $this->pick('followUps', $index) ?? '']];
        $imageCell = ['type' => 'cellImage', 'fields' => ['image' => $image ? [$image->id] : []]];

        $values = [
            'headerImage' => $header ? [$header->id] : [],
            'intro' => $this->pick('intros', $index) ?? '',
            'location' => $this->pick('locations', $index) ?? '',
            'organisation' => $this->pick('organisations', $index) ?? '',
            'price' => $this->pick('prices', $index) ?? '',
            'eventDates' => ['new1' => ['type' => 'eventDate', 'enabled' => true, 'fields' => $this->dates($index)]],
            'contentBuilder' => $this->contentRows([
                ['layout' => 'full', 'cells' => [
                    ['type' => 'cellText', 'fields' => ['blockTitle' => $section['heading'] ?? '', 'text' => $section['body'] ?? '']],
                ]],
                ['layout' => 'halves', 'fields' => ['gridAlignment' => 'center'], 'cells' => $index % 2 === 0 ? [$text, $imageCell] : [$imageCell, $text]],
            ]),
        ];
        if ($categoryIds) {
            $values[$this->categoryFieldHandle()] = [$categoryIds[mt_rand(0, count($categoryIds) - 1)]];
        }
        $entry->setFieldValues($values);
    }

    /**
     * The date block of event $index (call once per event, in order): #0 has ended, #1 is ongoing, the others start 2–8 days
     * after the previous one, as a moment (no end), a few hours or a few days.
     *
     * @return array{startDate: \DateTime, endDate: ?\DateTime}
     */
    private function dates(int $index): array
    {
        if ($index === 0) {
            $start = (new \DateTime('-10 days'))->setTime(19, 30);
            return ['startDate' => $start, 'endDate' => (clone $start)->modify('+3 hours')];
        }
        if ($index === 1) {
            return ['startDate' => (new \DateTime('-1 day'))->setTime(10, 0), 'endDate' => (new \DateTime('+2 days'))->setTime(18, 0)];
        }
        $this->daysAhead += mt_rand(2, 8);
        $start = (new \DateTime("+{$this->daysAhead} days"))->setTime([10, 14, 19][mt_rand(0, 2)], [0, 30][mt_rand(0, 1)]);
        $end = match ($index % 3) {
            0 => null,                                       // one moment
            1 => (clone $start)->modify('+' . mt_rand(2, 4) . ' hours'),
            default => (clone $start)->modify('+' . mt_rand(1, 2) . ' days')->setTime(18, 0),
        };
        return ['startDate' => $start, 'endDate' => $end];
    }
}
