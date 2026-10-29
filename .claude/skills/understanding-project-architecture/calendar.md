# Calendar

Built after news. Sections: `calendar` (channel, entry type `event`), `calendarCategories` (structure, entry type `category`, shared with the news categories), `calendarOverview` (single, entry type `calendarOverview`, template `_site/pages/calendar/index`; slugs `agenda` / `agenda` / `calendar`). Events use `_site/pages/calendar/entry`.

## Event fields

- Content tab: title, `headerImage`, `intro`, then `eventDates` (Matrix, min 1, max 1, entry type `eventDate`: `startDate` required, `endDate` optional; both date + time, no time zone), `location`, `organisation`, `price` (PlainText, translatable per site), `eventCategory` (Entries → calendarCategories), then `contentBuilder`.
- Related events tab: `relatedEvents` (Entries → calendar, max 3), `relatedFill` (Lightswitch, default on).
- Overview, SEO, Site search tabs as news.

## Upcoming

A date block is upcoming until COALESCE(endDate, startDate) >= now. `modules/statik/src/helpers/Calendar.php` builds that with the fields' `getValueSql()` (from the `eventDate` layout) on `Entry::find()->field('eventDates')->ownerId(<event ids>)`, ordered by the start date SQL. Exposed in Twig via `craft.statik` (`StatikVariable`): `upcomingEventDates(eventsQuery)` (element query of date blocks; the overview paginates it with `.with(['owner'])`), `upcomingEvents(eventsQuery, limit, exclude)` (events by next date, `fixedOrder`), `isUpcomingEvent(event)`, `nextEventDate(event)`.

## Templates

- `pages/calendar/index.twig`: copy of `pages/news/index.twig`; search + category filter narrow an event query, `upcomingEventDates()` turns it into date blocks; one `cards/calendar` per date block (`cardEntry: date.owner, eventDate: date`). Generic filter texts reuse `news.index.*` keys; `calendar.index.noItems`.
- `pages/calendar/entry.twig`: header with a `<dl>` of date / location / price / organisation with icons (`calendar`, `location`, `price`, `organisation` in `frontend/icons`), content builder, share bar (`calendar.entry.shareThisEvent`), related events via `partials/overview` (`option: 'calendar'`, `chosen: entry.relatedEvents.all()`, `dynamicFill: entry.relatedFill`, `relatedBy` = first key of the calendar source's `related`). `{% cache for 1 hour %}` so ended events drop out.
- `cards/calendar.twig`: default card with `showDescription: false`, category labels (as `cards/news`), date (`components/eventDate.twig`) and location; `eventDate` defaults to `craft.statik.nextEventDate(cardEntry)`.
- `partials/overview.twig`: for a source with `fill: 'upcoming'` (the calendar source in `config/overview-sources.php`) chosen events that have ended are dropped and the fill uses `upcomingEvents()` instead of a `postDate` query.

## URLs

Items' uriFormat: `{{craft.entries.section('<overview>').siteId(object.siteId).status(null).one().slug}}/{slug}` (news and calendar); overviews: `{slug}`. `Statik::OVERVIEW_ITEM_SECTIONS` maps overview → item section; on an overview's slug change (after save, not a draft/revision, `isAttributeDirty('slug')`) a `ResaveElements` job resaves its items in that site.

## Dummy content

`ddev craft statik/dummy-content/calendar --count=12 --categories --category-count=6` (`CalendarDummyContent`, texts under `calendar` in `config/dummy-content/content.json`): event 0 has ended, event 1 is ongoing, the others are upcoming (moment / hours / days).
