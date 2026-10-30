# craft.statik variable

The Statik module registers `craft.statik` (`modules/statik/src/variables/StatikVariable.php`): helpers for the calendar's
upcoming events, and for the content builder showcase.

## Upcoming events

The events of the Calendar section (`calendar`) have a Matrix field "Dates" (`eventDates`) with "Date" entries (`eventDate`): a
start date (`startDate`) and an optional end date (`endDate`). A date is upcoming until it ends: its end date, or its start date
when it has no end date. Craft can't express "end date, or else start date" with field parameters, so these helpers do it in
SQL (`modules/statik/src/helpers/Calendar.php`).

| Method                                       | Returns       | Description |
| -------------------------------------------- | ------------- | ----------- |
| `upcomingEventDates(events = null)`          | `EntryQuery`  | The upcoming date entries of the given events (default: all events), soonest first |
| `upcomingEvents(events = null, limit = 3, exclude = [])` | `Entry[]` | The events that have an upcoming date, ordered by their next date, at most `limit` |
| `isUpcomingEvent(event)`                     | `bool`        | Whether the event has a date that hasn't ended |
| `nextEventDate(event)`                       | `Entry\|null` | The date to show for an event: its next upcoming one, else its last one (an event that has ended) |

`events` is an entry query of events, e.g. with a search or a category; `exclude` is a list of event ids to leave out (the
page itself, the events already shown).

### upcomingEventDates()

The calendar overview shows one card per upcoming date, not per event: an event with three dates gets three cards. It's an
element query, so it can be paginated (`templates/_site/pages/calendar/index.twig`):

```twig
{% set events = craft.entries.section('calendar') %}
{% if searchQuery %}
    {% set events = events.search(searchQuery) %}
{% endif %}

{# The date entries with their event in one query (the owner eager-loaded) #}
{% set dates = craft.statik.upcomingEventDates(events).with(['owner']) %}
{% paginate dates.limit(9) as pageInfo, eventDates %}

{% for eventDate in eventDates %}
    {% include '_site/components/cards/calendar.twig' with { cardEntry: eventDate.owner, eventDate: eventDate } %}
{% endfor %}
```

### upcomingEvents()

The Overview column with the Calendar source fills itself with the soonest upcoming events
(`templates/_site/components/partials/overview.twig`):

```twig
{% set cards = cards|merge(craft.statik.upcomingEvents(craft.entries({ section: 'calendar' }), limit - cards|length, exclude)) %}
```

### isUpcomingEvent()

The events an editor chose in an Overview column are only shown while they're upcoming:

```twig
{% set cards = chosen|filter(c => craft.statik.isUpcomingEvent(c)) %}
```

### nextEventDate()

The event card shows the date it gets, or else the event's next date (`templates/_site/components/cards/calendar.twig`):

```twig
{% set eventDate = eventDate ?? (cardEntry ? craft.statik.nextEventDate(cardEntry) : null) %}
{% if eventDate %}
    {{ eventDate.startDate|date('short') }}
{% endif %}
```

The section, field and entry type handles are constants in `Calendar.php` (`SECTION`, `DATES_FIELD`, `DATE_TYPE`): change them
there when a project renames them.

## Headings

`rowHeading()` and `showsTitle()` moved to the Headings Checker plugin: `craft.headingsChecker.rowHeading(entry, block)`
and `craft.headingsChecker.showsTitle(block)`. See [Heading order](../content/headings).

## Showcase helpers

Used by the content builder templates on the pages of the [content builder showcase](../showcase/about):

| Method                                 | Returns        | Description |
| -------------------------------------- | -------------- | ----------- |
| `contentbuilderShowcaseLabel(block)`   | `string`       | Describes the variation a block or row is in, for the label above it on a showcase page |
| `isContentbuilderShowcasePage(page)`   | `bool`         | Whether the page belongs to the showcase |
| `showcasePageWidth(page)`              | `float\|null`  | The width (2/3 or 3/4) of a showcase page that renders the content builder narrower than the page; `null` on other pages |

## Source

- `modules/statik/src/variables/StatikVariable.php`
- `modules/statik/src/helpers/Calendar.php`
- `modules/statik/src/helpers/ContentbuilderShowcase.php`
