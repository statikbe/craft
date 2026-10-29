# Generating the showcase

```bash
ddev craft statik/contentbuilder > storage/showcase.log 2>&1
```

The command creates or updates the [showcase pages](./about) under `gridbuilder` in the Pages section. It reads the column
types and their fields from Craft when it runs: the content row's cells field and its entry types. Adding, removing or
changing a column type needs no code change, only a new run.

## Options

| Option              | What it does                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `--dry-run`         | Only print the pages and rows it would make, and the missing content. Changes nothing        |
| `--content=<path>`  | Use another content file (default `config/contentbuilder-showcase/content.json`)             |
| `--refresh-images`  | Download the images again, also those that were imported before                              |

## What it does

1. Reads `config/contentbuilder-showcase/content.json`.
2. Plans the page tree: every column type, every combination of two column types, the Layouts page and the 2/3 and 3/4 pages,
   and prints the plan.
3. Creates the pages that don't exist yet, in the Pages section, with the entry type that has the `contentBuilder` field.
4. Imports the images into the `contentbuilder-showcase` folder of the Public Files volume.
5. Fills every page with content rows, or with cards to its child pages. The content is written to every site.
6. Removes the pages of column types or combinations that no longer exist.
7. Prints warnings (lines starting with `!`), e.g. a column type without content in `content.json`, or rich text with a tag
   its editor doesn't allow. Then it prints the URL of the `gridbuilder` page.

The command stops with an error when the Pages section, the `contentBuilder` Matrix field or the content row entry type
(`rowEntryType` in `config/trinity.php`) is missing.

## Gotchas

::: warning Run it once, with its output in a file
- Send the output to a file and read that afterwards. Never pipe it into `head` or anything else that stops reading early:
  that kills the command halfway, and leaves half-filled pages.
- Never run two at the same time. Both write the same pages, and the database deadlocks.
- A full run takes a while: it saves hundreds of rows. Use `--dry-run` to check the plan first.
:::

## The content file

Everything that gets filled in comes from `config/contentbuilder-showcase/content.json`:

| Key          | What                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `meta`       | The theme of the content, its source site, its language, the date it was updated                                      |
| `gridParent` | Title and intro of the `gridbuilder` page                                                                              |
| `assets`     | The volume and folder the images go into (default `publicFiles`, `contentbuilder-showcase`)                            |
| `images`     | The image pool, by key: a `url` to download or a `file` next to `content.json`, with `alt`, `caption` and `copyright`  |
| `richText`   | Sample bold and italic text, links, headings and list items, used to show every feature of a CKEditor field            |
| `longTitle`  | A very long title, to test titles that wrap over several lines                                                         |
| `fields`     | Content per field handle: the fallback for every column type that has that field                                      |
| `blocks`     | Content per column type handle (`cellText`, `cellQuote`, …), which wins over `fields`; `fixed` pins a variant          |

```json
{
  "fields": {
    "blockTitle": "Plain string",
    "image": ["landscape"],
    "entries": "@showcase"
  },
  "blocks": {
    "cellQuote": {
      "fields": { "text": "…", "authorName": "Jamie Peeters", "authorRole": "Marketing manager" }
    }
  }
}
```

An Entries field takes entry URIs, `"@showcase"` (the column type pages) or `"@section:<handle>"` (entries of a section,
e.g. the team, whose entries have no URI).

Option fields (Position, Width, Background color, lightswitches) aren't content: they are the variants. Pin one with `fixed`
instead of putting it in `fields`.

## Adding a new column type

1. Add the entry type to the content row's cells field, with its template in `templates/_site/contentBuilder/columns/`.
2. Add its content under `blocks` in `content.json`, keyed by the entry type handle. Fields it shares with other column types
   (`blockTitle`, `text`, `image`, …) already have content under `fields`.
3. Run `ddev craft statik/contentbuilder --dry-run` and check that there are no warnings about it.
4. Run the command without `--dry-run` and check its pages under `gridbuilder/<type>`.

## Claude skill

The [`updating-contentbuilder-showcase`](../claude/skills) skill fills or refreshes `content.json` (content scraped from a
client's site, or invented for a theme, or translated), checks it and runs the command.

## Source

- `modules/statik/src/console/controllers/ContentbuilderController.php`
- `modules/statik/src/helpers/ContentbuilderShowcase.php`
- `config/contentbuilder-showcase/content.json`
