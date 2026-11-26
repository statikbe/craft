# Old content builder blocks (legacy)

Before content rows, the `contentBuilder` Matrix field offered full-width **blocks**, one entry type each. The field now only
offers the Content row (`gridRow`, see `./content-row.md`). The base install no longer has the old entry types (`config/project/entryTypes/`),
their templates (`contentBuilder/blocks/<handle>.twig`) or their `contentBuilder.blocks.*` translations: `contentBuilder.twig` only
includes `gridRow.twig`. Use this page to recognise old blocks (e.g. in a project from before
content rows, or in old content); build new things as column types.

| Old block (handle) | CP name | Replaced by (column types in a content row) |
| --- | --- | --- |
| `callToAction` | Call to action | `cellCallToAction` (full rows only) |
| `faq` | FAQ | `cellFaq` |
| `form` | Form | `cellForm` |
| `image` | Image | `cellImage`, or `cellImageGallery` for several images |
| `overview` | Overview | `cellOverview` |
| `quote` | Quote | `cellQuote` |
| `textColumns` | Text columns | a row with 2 or 3 `cellText` columns |
| `textEmbed` | Text + embed | `cellText` + `cellEmbed` |
| `textImage` | Text (+ image) | `cellText` + `cellImage` |
| `textTable` | Text + table | `cellText` + `cellTable` (a CKEditor table) |
| `textVideo` | Text + video | `cellText` + `cellVideo` |
| `video` | Video | `cellVideo` |

Older names you may meet in projects: `customTable` (now `textTable`), `textTwoColumns` (now `textColumns`), `embed` (entry
type, now `textEmbed`). Links in old blocks used Hyper (`verbb/hyper`, removed); they are now Link entries rendered with
`render_ctas()`.

For an old block's fields in an older project, read its field layout in `config/project/entryTypes/<handle>--*.yaml` there (handles
as used in Twig, e.g. `block.text`) and the field definitions in `config/project/fields/`; or in this repo's Git history.
