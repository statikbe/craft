# Knowledge base

A placeholder for a knowledge base / projects / publications, built after news (handles stay `knowledgeBase`; projects rename labels and slugs). Sections: `knowledgeBase` (channel, entry type `knowledgeBaseItem`), `knowledgeBaseCategories` (structure, entry type `category`), `knowledgeBaseOverview` (single, entry type `knowledgeBaseOverview`, template `_site/_knowledgeBase/_index`; slugs `kennisbank` / `base-de-connaissances` / `knowledge-base`). Items use `_site/_knowledgeBase/_entry`.

## Item fields

The news layout with `knowledgeBaseCategory` (Entries → knowledgeBaseCategories) instead of `newsCategory`; tab "Related items": `relatedKnowledgeBaseItems` (Entries → knowledgeBase, max 3) and `relatedFill` (the calendar's lightswitch, label/instructions overridden in this layout).

## Templates

- `_knowledgeBase/_index.twig`: copy of `_news/_index.twig` (section, categories, `overview-sources` key `knowledgeBase`, card `_knowledgeBase`); newest first by `postDate`.
- `_knowledgeBase/_entry.twig`: copy of `_news/_entry.twig` without the date; share bar `knowledgeBase.entry.shareThisItem`; related via `_partials/_overview` (`option: 'knowledgeBase'`, `chosen: entry.relatedKnowledgeBaseItems.all()`, `dynamicFill: entry.relatedFill`, `relatedBy` = first key of the source's `related`).
- `_cards/_knowledgeBase.twig`: default card (with description) + category labels as `_cards/_news`; no date.
- `config/overview-sources.php` → `knowledgeBase`: section, `postDate DESC`, card, `filterLayout` top, `related.category` = `knowledgeBaseCategory`. The Overview column's `knowledgeBaseEntries` field picks these items.

## URLs and dummy content

Items' uriFormat uses the overview's slug in the same site; `Statik::OVERVIEW_ITEM_SECTIONS` has `knowledgeBaseOverview => knowledgeBase` (resave on slug change). Dummy items: `ddev craft statik/dummy-content/knowledge-base --count=12 --categories` (`KnowledgeBaseDummyContent`, texts under `knowledgeBase` in `config/dummy-content/content.json`).
