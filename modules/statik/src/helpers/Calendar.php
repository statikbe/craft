<?php

namespace modules\statik\helpers;

use craft\elements\db\EntryQuery;
use craft\elements\Entry;
use craft\helpers\Db;
use DateTime;
use yii\db\Expression;

/**
 * Upcoming events: the calendar section's events have a Matrix field "Dates" (eventDates) with "Date" blocks (eventDate: start
 * date, optional end date). A date block is upcoming until it ends: its end date, or its start date when it has no end (one
 * moment). Craft can't express "end, or else start" with field params, so the condition is SQL on the fields' values.
 *
 * Used by the calendar overview (one card per upcoming date block), the event cards and every overview that shows events
 * (the "Calendar" Overview column, related events), through craft.statik (StatikVariable).
 */
class Calendar
{
    public const SECTION = 'calendar';
    public const DATES_FIELD = 'eventDates';
    public const DATE_TYPE = 'eventDate';

    /**
     * The upcoming date blocks of the given events (an event query, e.g. with a search or category; default all live events),
     * soonest first.
     */
    public static function upcomingDates(?EntryQuery $events = null): EntryQuery
    {
        $query = Entry::find()
            ->field(self::DATES_FIELD)
            ->ownerId(self::eventIds($events) ?: [0]);

        [$start, $end] = self::dateSql();
        if ($start === null) {
            return $query->id([0]);
        }

        return $query
            ->andWhere(new Expression('COALESCE(' . ($end ?? 'NULL') . ", $start) >= :calendarNow", [
                ':calendarNow' => Db::prepareDateForDb(new DateTime()),
            ]))
            ->orderBy([new Expression("$start ASC")]);
    }

    /**
     * The events among the given ones that have an upcoming date, ordered by their next date, at most $limit.
     *
     * @param int[] $exclude event ids to leave out (e.g. the page, the events already shown)
     * @return Entry[]
     */
    public static function upcomingEvents(?EntryQuery $events = null, int $limit = 3, array $exclude = []): array
    {
        $events = ($events ?? Entry::find()->section(self::SECTION))->id(array_merge(['not'], $exclude ?: [0]));
        $ids = [];
        foreach (self::upcomingDates($events)->asArray()->all() as $row) {
            $ownerId = (int)($row['primaryOwnerId'] ?? $row['ownerId'] ?? 0);
            if ($ownerId && !in_array($ownerId, $ids, true)) {
                $ids[] = $ownerId;
                if (count($ids) >= $limit) {
                    break;
                }
            }
        }

        return $ids ? Entry::find()->section(self::SECTION)->id($ids)->fixedOrder()->all() : [];
    }

    /**
     * Whether the event has a date that hasn't ended.
     */
    public static function isUpcoming(Entry $event): bool
    {
        return self::upcomingDates(Entry::find()->section(self::SECTION)->id($event->id))->exists();
    }

    /**
     * The date block to show for an event: its next upcoming one, else its last one (an event that has ended).
     */
    public static function nextDate(Entry $event): ?Entry
    {
        return self::upcomingDates(Entry::find()->section(self::SECTION)->id($event->id))->one()
            ?? Entry::find()->field(self::DATES_FIELD)->ownerId($event->id)->orderBy(['sortOrder' => SORT_DESC])->one();
    }

    /**
     * @return int[]
     */
    private static function eventIds(?EntryQuery $events): array
    {
        return ($events ?? Entry::find()->section(self::SECTION))->ids();
    }

    /**
     * SQL for the start and end date values of a date block (null when the fields aren't on the block's layout).
     *
     * @return array{?string, ?string}
     */
    private static function dateSql(): array
    {
        $layout = \Craft::$app->getEntries()->getEntryTypeByHandle(self::DATE_TYPE)?->getFieldLayout();

        return [
            $layout?->getFieldByHandle('startDate')?->getValueSql(),
            $layout?->getFieldByHandle('endDate')?->getValueSql(),
        ];
    }
}
