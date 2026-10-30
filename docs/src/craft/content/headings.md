# Heading order

Screen readers and search engines read a page by its headings, so the levels may not skip one (an h2 followed by an h4). The
templates take care of the levels they render; editors only pick levels in their own text.

The [Headings Checker](https://github.com/statikbe/craft-headings-checker) plugin checks that order: it blocks publishing a
page whose headings skip a level and marks the row and column, shows the page's heading outline in the entry sidebar, lists
the pages with issues in a dashboard widget, puts level badges in the CKEditor fields, and has a console command. Its README
explains every feature and setting. This page describes how the base install uses it.

## The levels on a page

| Heading                                                    | Level  |
| ---------------------------------------------------------- | ------ |
| The page header title (the hero's title on the home page)  | h1, the only one |
| The title of a column (Text, Numbers, Call to action, FAQ, Overview, Team, Partners) | h2 |
| Cards: the Overview, Card, Person and Team columns         | h3     |
| Headings in a CKEditor text                                | what the editor picks: h3–h5 in *CKEditor extended* |
| The filter on the news, calendar and knowledge base overview pages | h2 (a hidden one above the search) |

The page is read as one outline: the page title, text fields before the builder (`textFields`, none in the base install),
then each builder field in order. Cards right under the h1, without an h2 above them, are an issue.

The Text column's text uses *CKEditor extended*, so an editor can start the text with an h3 under the column's h2 title.

## Show title

The column types with a title have a **Show title** switch next to it (`showTitle`, on by default). Off, the title is still in
the page as a heading, but only screen readers read it (`sr-only`). Use it when the design has no visible title but the
content below needs one: the title still has to describe that content.

- A hidden title without text or links renders without its wrapper, so it takes no space.
- A hidden title doesn't count for *Spacing above* → *Auto*: the row stays close to the row above.
- In templates: `craft.headingsChecker.showsTitle(cell)`, and `hideTitle` on `components/partials/textColumn.twig` and
  `components/partials/overview.twig`.

The FAQ column has a title of its own (with Show title); its answers start at h3.

## A hidden h2 above a row of cards

A content row whose cards come before any title would put its h3 cards straight under the h1, or under the h2 of an unrelated
part of the page. Such a row gets a hidden h2 (`sr-only`) above it when no h2 came before it on the page, or when the row
starts a new part of the page (another background than the row above, or *Spacing above* set to normal or extra). A title in
the column of the cards or in a column before it, also a hidden one, or an h2 in a text before the cards, replaces it.

`contentBuilder/gridRow.twig` renders it with `craft.headingsChecker.rowHeading(entry, block)`. The texts are translation keys
in `website_name`, set in `rowHeadings` in `config/headings-checker.php`:

| Column   | Key                                                        | English          |
| -------- | ---------------------------------------------------------- | ---------------- |
| Overview | the `heading` of its source in `config/overview-sources.php`: `overview.heading.news`, `.calendar`, `.knowledgeBase`, `.entries` | News, Upcoming events, Knowledge base, Overview |
| Card     | `contentBuilder.rowHeading.cards`                          | Highlights       |
| Person   | `contentBuilder.rowHeading.person`                         | Contact          |
| Team     | `contentBuilder.rowHeading.team`                           | Team             |

## The base install's settings

`config/headings-checker.php`:

| Setting          | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| `mode`           | `'block'`: a page whose headings skip a level isn't published; the row and the column's card turn red |
| `fields`         | `['contentBuilder']`                                      |
| `pageTitle`      | `['hero.heading']`, else the entry title                  |
| `titleFields`    | `['blockTitle']`                                          |
| `showTitleField` | `'showTitle'`                                             |
| `cardTypes`      | `cellOverview`, `cellCard`, `cellPerson`, `cellTeam`      |
| `rowHeadings`    | see above; the Overview through a function that reads `overview-sources.php` |
| `outline`, `levelBadges` | `true`                                            |

## The widget

**Heading issues** on the dashboard lists the pages with issues, per site, only those the user may edit. The list is stored
per page and updated on every save, delete or restore. After installing, updating or changing a setting, a queue job builds
it again; until it has run, the widget shows "Building the list…". After a deploy, make sure the queue runs.

## Checking existing content

On a project with existing content, list the pages that fail today before using `'block'`, and use `'warn'` until they're
fixed, so editors aren't blocked by old content:

```bash
ddev craft headings-checker/check
ddev craft headings-checker/check --section=pages
```

`check` exits with 1 when a page has issues.

## Source

- `config/headings-checker.php`
- `templates/_site/contentBuilder/gridRow.twig`
- [statikbe/craft-headings-checker](https://github.com/statikbe/craft-headings-checker)
