# Heading order

Screen readers and search engines read a page by its headings, so the levels may not skip one (an h2 followed by an h4). The
templates take care of the levels they render; editors only pick levels in their own text. A check on publishing, a console
command and a dashboard widget catch the levels an editor skips.

## The levels on a page

| Heading                                                    | Level  |
| ---------------------------------------------------------- | ------ |
| The page header title                                      | h1, the only one |
| The title of a column (Text, Numbers, Call to action, FAQ, Overview, Team, Partners) | h2 |
| Cards: the Overview, Card, Person and Team columns         | h3     |
| Headings in a CKEditor text                                | what the editor picks: h3–h5 in *CKEditor extended* |
| The filter on the news, calendar and knowledge base overview pages | h2 (a hidden one above the search) |

The Text column's text uses *CKEditor extended*, so an editor can start the text with an h3 under the column's h2 title.
In the editor, every heading shows its level in a small badge in front of it (H3, H4, …), so the editor sees which level they
picked. The badges are only in the control panel (`frontend/css/site/ckeditor.css`).

## Show title

The column types with a title have a **Show title** switch next to it (`showTitle`, on by default). Off, the title is still in
the page as a heading, but only screen readers read it (`sr-only`). Use it when the design has no visible title but the
content below needs one: the title still has to describe that content.

- A hidden title without text or links renders without its wrapper, so it takes no space.
- A hidden title doesn't count for *Spacing above* → *Auto*: the row stays close to the row above.
- In templates: `craft.statik.showsTitle(cell)`, and `hideTitle` on `components/partials/textColumn.twig` and `components/partials/overview.twig`.

The FAQ column has a title of its own now (with Show title); its answers start at h3.

## A hidden h2 above a row of cards

A content row whose cards come before any title would put its h3 cards straight under the h1, or under the h2 of an unrelated
part of the page. Such a row gets a hidden h2 (`sr-only`) above it:

- when no h2 came before it on the page, or
- when the row starts a new part of the page: another background than the row above, or *Spacing above* set to normal or
  extra.

A title in the column of the cards or in a column before it, also a hidden one, or an h2 in a text before the cards, replaces
the hidden h2.

The text of the hidden h2 is a translation key in `website_name`:

| Column            | Key                                                | English          |
| ----------------- | -------------------------------------------------- | ---------------- |
| Overview          | `heading` of its source in `config/overview-sources.php`: `overview.heading.news`, `.calendar`, `.knowledgeBase`, `.entries` | News, Upcoming events, Knowledge base, Overview |
| Card              | `rowHeadings.card` in `config/custom.php`: `contentBuilder.rowHeading.cards` | Highlights |
| Person            | `contentBuilder.rowHeading.person`                 | Contact          |
| Team              | `contentBuilder.rowHeading.team`                   | Team             |

`contentBuilder/gridRow.twig` renders it with `craft.statik.rowHeading(entry, block)`.

## The check on publishing

When an editor publishes an entry, the module checks the headings in the content builder text: a heading may go at most one
level deeper than the heading above it, counting the titles (also hidden ones) and the hidden row headings. An h1 in the text
is always wrong. Each message names the row, the column and the heading, and says how to fix it:

> Row 3, column 1 (Text): the heading “Opening hours” is an H4, but the heading above it is an H2. Make it an H3.

A heading without any h2 above it gets the advice to give the column a title (and switch off *Show title* when it shouldn't
be visible).

Set the check in `config/custom.php`:

| Key                  | Default              | What                                                                                       |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `headingCheck`       | `'block'`            | `'block'`: the entry isn't saved, with an error on the row and column; `'warn'`: the entry is saved, with a warning; `false`: off |
| `headingCheckFields` | `['contentBuilder']` | The content builder fields (Matrix handles) the check looks at                            |

With `'block'`, the control panel shows where each problem is, as it does for Craft's own errors: the message is in the
error list at the top, the row's label turns red with a warning icon, and so does the card of the column with the heading. A
block that isn't a content row gets the message on its text field.

The check skips drafts, autosaves, propagation to other sites, resaving and console commands.

On a project with existing content, list the entries that fail today and use `'warn'` until they're fixed, so editors aren't
blocked by old content:

```bash
ddev craft statik/headings                    # every section, every site
ddev craft statik/headings --section=pages
```

## Heading issues widget

The **Heading issues** dashboard widget lists the pages with heading issues, with a link to edit each one and the issues
under a toggle. Its setting *Number of pages* (default 25) limits the list; the other pages are only counted.

The list is kept in the cache. Saving or deleting a page updates it (once per page, at the end of the request), and
`ddev craft statik/headings` without `--section` rebuilds it. When the cache is empty, the widget builds it in full.

## Source

- `modules/statik/src/helpers/Headings.php`
- `modules/statik/src/widgets/HeadingIssues.php`, `modules/statik/src/templates/_widgets/headingIssues/`
- `modules/statik/src/console/controllers/HeadingsController.php`
- `templates/_site/contentBuilder/gridRow.twig`
- `config/custom.php`, `config/overview-sources.php`
