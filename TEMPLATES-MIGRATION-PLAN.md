# Plan: restructure `templates/_site`

Status: **carried out** on 2026-10-29 (steps 1–10), on the `Rectangle` branch; step 11 (review, merge, deploy) is open.
Written 2026-10-26. How it went, where it differs from the steps below:

- Step 1: the local database had no showcase pages, so `statik/contentbuilder` ran once before the move (it renders no
  site templates) and the before/after comparison covered all 459 URLs, 378 of them showcase pages.
- Step 7: every page has the same status and, apart from CSRF tokens, Formie form ids and hashes, the same HTML as before.
- Step 8: the account flow removal was checked on the path it removes (`_site/pages/account`, the 11 account templates and
  nothing else) instead of in a copy of the project.
- Step 9 also updated `CLAUDE.md`; the comments in templates, modules, config and CSS that named old paths were updated in step 3.
- Every include, embed, extends and import names its template with `.twig`.
- The translation keys in `website_name.php` were renamed to follow the template paths (GUIDELINES.MD §6): 96 of the 134
  keys, see the table in `WHATS-NEW.md`.

## Open points: Clint

Left for later (agreed 2026-10-30). Found in the code review of the move, worked out further on 2026-10-30.

1. **New projects think they're missing 20 updates they already have.** Clint counts every update in the published
   manifest (`index.json` on the `clint-updates` branch, 28 updates) that isn't in `frontend/.clint-applied` as pending.
   The base install's `.clint-applied` only lists `1.0.1`–`1.0.9`: the 20 dated updates since then (`20260727-…` to
   `20261005-…`) are already in the base install's code, but their ids were never added. `update:new`, the docs and the
   `authoring-clint-updates` skill don't mention it.
   - `yarn watch` only reports "20 frontend updates available"; it never blocks.
   - Applying them (`yarn update`) re-syncs frontend files for the first 19 (wasted work, and it can overwrite a project's
     own changes to shared frontend files). The 20th, `20261005-responsive-images-…`, fails: its `findAndReplace` targets
     `_site/_snippet/_content/_blocks/_image.twig`, which the move removed, and Clint fails on a missing target on purpose
     (`findAndReplaceInFile` in `clint/src/updater/updater.ts`). Updates apply in order, so every later update is stuck.
   - The base already has that change (`data-modal-srcset` in `contentBuilder/blocks/image.twig` and `columns/image.twig`).
   - Fix: (a) add the 20 dated ids to `frontend/.clint-applied` in the base install; (b) make adding the new id to
     `frontend/.clint-applied` part of authoring an update, in the same PR: in the `update:new` output (step 3), the docs
     ("Authoring a frontend change" in `docs/src/frontend/clint/updates.md`) and the `authoring-clint-updates` skill.
   - Leave `clint/updates/20261005-…/update.json` and its `CHANGELOG.md` at the old path: the update is for projects that
     still have it.
2. **Updates have to work with two template layouts.** Projects started before the move keep `_site/_snippet/…` and the
   old translation keys; projects started after it have the new paths and keys. A `findAndReplace` on one specific path
   fails in the projects that have the other one (a missing target fails the update and blocks the later ones); a key in
   `from` only matches in one kind of project. A glob over `../templates/_site/**/*.twig` works in both, as long as `from`
   only matches the intended text. The `authoring-clint-updates` skill builds updates from `git diff -- templates/`, so it
   only writes the new paths. Options:
   1. Rules only: docs and skill say template rules use a glob covering both layouts, and one rule per key form.
   2. `"optional": true` on a `findAndReplace` rule (a missing file is skipped, not an error), so an author writes one rule
      for the old path and one for the new path. A few lines in `findAndReplaceInFile`.
   3. An old → new map in Clint (the path and key tables from `WHATS-NEW.md` as JSON): Clint resolves a missing target or a
      key to the other form, so authors write for the new layout only and the skill keeps working. Most work, needs tests.

   Recommended: 2 now, 3 later. Either way, update the skill and the docs.

## Goal

Sort the templates in `_site/` by role, so every file has one obvious place:

| Folder | What goes in it |
| --- | --- |
| `layout.twig` | The base layout |
| `pages/` | The templates sections point to. A single gets a file; a section with entries gets a folder with `index` and `entry` |
| `contentBuilder/` | The content builder: the loop, the row, the columns, the older blocks |
| `components/` | Reusable parts you include anywhere, with a subfolder per group: |
| `components/frame/` | What's around every page: header, footer, flyout, navigation |
| `components/pageHeader/` | The page header and its presets |
| `components/cards/` | The cards of overviews and related entries |
| `components/partials/` | Partials: small parts other templates include, also the ones the content builder uses |
| `macros/` | Twig macros |

Plus two naming rules:

- **No `_` prefix inside `_site/`.** Craft never serves anything under `_site/` as a URL, and `GUIDELINES.MD` already says
  folders inside `_site` get no prefix. `_site` itself keeps its `_`.
- **One name per thing.** The image component, the image column and the image block no longer share the name `_image` in
  three `_snippet` folders; the templates of both `_partials` folders go to `components/partials/`, and the two flyouts each get their own place.

Not part of this plan: the content of the templates, the older `blocks/` (they stay until a content migration converts
the pages that still use them), and `404.twig`, `503.twig`, `_knock-knock.twig` and `_mail/` outside `_site/`.

**Existing projects are not migrated.** This is a one-time move in the base install; projects started from it before the
move keep the old structure. To keep the new structure consistent from now on, the rules are in `GUIDELINES.MD`
(§5 Template folder structure).

### The result as a tree

For reference only: the `New` column of the mapping below as a tree. When the two differ, the mapping is right.

```
_site/
├── layout.twig
├── components/
│   ├── cta.twig
│   ├── eventDate.twig
│   ├── image.twig
│   ├── loader.twig
│   ├── pagination.twig
│   ├── search.twig
│   ├── socialMedia.twig
│   ├── socialShare.twig
│   ├── cards/
│   │   ├── calendar.twig
│   │   ├── default.twig
│   │   ├── knowledgeBase.twig
│   │   ├── news.twig
│   │   └── person.twig
│   ├── frame/
│   │   ├── flyout.twig
│   │   ├── footer.twig
│   │   ├── header.twig
│   │   └── nav/
│   │       ├── breadcrumb.twig
│   │       ├── doormat.twig
│   │       ├── flyout.twig
│   │       ├── language.twig
│   │       ├── main.twig
│   │       └── service.twig
│   ├── pageHeader/
│   │   ├── default.twig
│   │   ├── hero.twig
│   │   └── pageHeader.twig
│   └── partials/
│       ├── carrouselControls.twig
│       ├── galleryImage.twig
│       ├── overview.twig
│       ├── textColumn.twig
│       └── filter/
│           ├── clearButton.twig
│           ├── options.twig
│           └── search.twig
├── contentBuilder/
│   ├── contentBuilder.twig
│   ├── gridRow.twig
│   ├── blocks/
│   │   ├── callToAction.twig
│   │   ├── faq.twig
│   │   ├── form.twig
│   │   ├── image.twig
│   │   ├── overview.twig
│   │   ├── quote.twig
│   │   ├── textColumns.twig
│   │   ├── textEmbed.twig
│   │   ├── textImage.twig
│   │   ├── textTable.twig
│   │   ├── textVideo.twig
│   │   └── video.twig
│   └── columns/
│       ├── callToAction.twig
│       ├── card.twig
│       ├── embed.twig
│       ├── faq.twig
│       ├── form.twig
│       ├── image.twig
│       ├── imageGallery.twig
│       ├── numbers.twig
│       ├── overview.twig
│       ├── partners.twig
│       ├── person.twig
│       ├── quote.twig
│       ├── table.twig
│       ├── team.twig
│       ├── text.twig
│       └── video.twig
├── macros/
│   └── imageSizes.twig
└── pages/
    ├── contact.twig
    ├── home.twig
    ├── page.twig
    ├── search.twig
    ├── account/
    │   ├── edit.twig
    │   ├── login.twig
    │   ├── profile.twig
    │   ├── password/
    │   │   ├── edit.twig
    │   │   ├── requestReset.twig
    │   │   ├── requestResetConfirmation.twig
    │   │   ├── set.twig
    │   │   └── setConfirmation.twig
    │   └── registration/
    │       ├── completed.twig
    │       ├── confirmation.twig
    │       └── register.twig
    ├── calendar/
    │   ├── entry.twig
    │   └── index.twig
    ├── knowledgeBase/
    │   ├── entry.twig
    │   └── index.twig
    └── news/
        ├── entry.twig
        └── index.twig
```

## Decisions

- **Folder names:** `frame/` (not `layout/`), `pages/` (not `sections/`) and `columns/` (not `cells/`).
- **Column template names:** keep the names they have now, the column type handle without `cell` (`cellText` →
  `columns/text.twig`), not the full handle.
- **The two flyouts:** keep both, `components/frame/flyout.twig` (the panel) and `components/frame/nav/flyout.twig`
  (the menu in it). They aren't merged.
- **`pagination`, not `paginate`:** `_global/_paginate.twig` becomes `components/pagination.twig`, to match the Twig
  function `render_pagination()`, which stays as it is.

## Mapping

All 85 files under `templates/_site`. Names as decided above.

#### `layout.twig`

| Now | New |
| --- | --- |
| `_site/_layout.twig` | `_site/layout.twig` |

#### `pages`

| Now | New |
| --- | --- |
| `_site/_account/_edit.twig` | `_site/pages/account/edit.twig` |
| `_site/_account/_editPassword.twig` | `_site/pages/account/password/edit.twig` |
| `_site/_account/_login.twig` | `_site/pages/account/login.twig` |
| `_site/_account/_passwordRequestReset.twig` | `_site/pages/account/password/requestReset.twig` |
| `_site/_account/_passwordRequestResetConfirmation.twig` | `_site/pages/account/password/requestResetConfirmation.twig` |
| `_site/_account/_passwordSet.twig` | `_site/pages/account/password/set.twig` |
| `_site/_account/_passwordSetConfirmation.twig` | `_site/pages/account/password/setConfirmation.twig` |
| `_site/_account/_profile.twig` | `_site/pages/account/profile.twig` |
| `_site/_account/_register.twig` | `_site/pages/account/registration/register.twig` |
| `_site/_account/_registrationCompleted.twig` | `_site/pages/account/registration/completed.twig` |
| `_site/_account/_registrationConfirmation.twig` | `_site/pages/account/registration/confirmation.twig` |
| `_site/_calendar/_entry.twig` | `_site/pages/calendar/entry.twig` |
| `_site/_calendar/_index.twig` | `_site/pages/calendar/index.twig` |
| `_site/_contact.twig` | `_site/pages/contact.twig` |
| `_site/index.twig` | `_site/pages/home.twig` |
| `_site/_knowledgeBase/_entry.twig` | `_site/pages/knowledgeBase/entry.twig` |
| `_site/_knowledgeBase/_index.twig` | `_site/pages/knowledgeBase/index.twig` |
| `_site/_news/_entry.twig` | `_site/pages/news/entry.twig` |
| `_site/_news/_index.twig` | `_site/pages/news/index.twig` |
| `_site/_contentPage.twig` | `_site/pages/page.twig` |
| `_site/_searchResults.twig` | `_site/pages/search.twig` |

#### `contentBuilder`

| Now | New |
| --- | --- |
| `_site/_snippet/_content/_blocks/_callToAction.twig` | `_site/contentBuilder/blocks/callToAction.twig` |
| `_site/_snippet/_content/_blocks/_faq.twig` | `_site/contentBuilder/blocks/faq.twig` |
| `_site/_snippet/_content/_blocks/_form.twig` | `_site/contentBuilder/blocks/form.twig` |
| `_site/_snippet/_content/_blocks/_image.twig` | `_site/contentBuilder/blocks/image.twig` |
| `_site/_snippet/_content/_blocks/_overview.twig` | `_site/contentBuilder/blocks/overview.twig` |
| `_site/_snippet/_content/_blocks/_quote.twig` | `_site/contentBuilder/blocks/quote.twig` |
| `_site/_snippet/_content/_blocks/_textColumns.twig` | `_site/contentBuilder/blocks/textColumns.twig` |
| `_site/_snippet/_content/_blocks/_textEmbed.twig` | `_site/contentBuilder/blocks/textEmbed.twig` |
| `_site/_snippet/_content/_blocks/_textImage.twig` | `_site/contentBuilder/blocks/textImage.twig` |
| `_site/_snippet/_content/_blocks/_textTable.twig` | `_site/contentBuilder/blocks/textTable.twig` |
| `_site/_snippet/_content/_blocks/_textVideo.twig` | `_site/contentBuilder/blocks/textVideo.twig` |
| `_site/_snippet/_content/_blocks/_video.twig` | `_site/contentBuilder/blocks/video.twig` |
| `_site/_snippet/_content/_grid/_callToAction.twig` | `_site/contentBuilder/columns/callToAction.twig` |
| `_site/_snippet/_content/_grid/_card.twig` | `_site/contentBuilder/columns/card.twig` |
| `_site/_snippet/_content/_grid/_embed.twig` | `_site/contentBuilder/columns/embed.twig` |
| `_site/_snippet/_content/_grid/_faq.twig` | `_site/contentBuilder/columns/faq.twig` |
| `_site/_snippet/_content/_grid/_form.twig` | `_site/contentBuilder/columns/form.twig` |
| `_site/_snippet/_content/_grid/_image.twig` | `_site/contentBuilder/columns/image.twig` |
| `_site/_snippet/_content/_grid/_imageGallery.twig` | `_site/contentBuilder/columns/imageGallery.twig` |
| `_site/_snippet/_content/_grid/_numbers.twig` | `_site/contentBuilder/columns/numbers.twig` |
| `_site/_snippet/_content/_grid/_overview.twig` | `_site/contentBuilder/columns/overview.twig` |
| `_site/_snippet/_content/_grid/_partners.twig` | `_site/contentBuilder/columns/partners.twig` |
| `_site/_snippet/_content/_grid/_person.twig` | `_site/contentBuilder/columns/person.twig` |
| `_site/_snippet/_content/_grid/_quote.twig` | `_site/contentBuilder/columns/quote.twig` |
| `_site/_snippet/_content/_grid/_table.twig` | `_site/contentBuilder/columns/table.twig` |
| `_site/_snippet/_content/_grid/_team.twig` | `_site/contentBuilder/columns/team.twig` |
| `_site/_snippet/_content/_grid/_text.twig` | `_site/contentBuilder/columns/text.twig` |
| `_site/_snippet/_content/_grid/_video.twig` | `_site/contentBuilder/columns/video.twig` |
| `_site/_snippet/_content/_contentBuilder.twig` | `_site/contentBuilder/contentBuilder.twig` |
| `_site/_snippet/_content/_blocks/_gridRow.twig` | `_site/contentBuilder/gridRow.twig` |

#### `components`

| Now | New |
| --- | --- |
| `_site/_snippet/_global/_cta.twig` | `_site/components/cta.twig` |
| `_site/_snippet/_item/_eventDate.twig` | `_site/components/eventDate.twig` |
| `_site/_snippet/_global/_image.twig` | `_site/components/image.twig` |
| `_site/_snippet/_item/_loader.twig` | `_site/components/loader.twig` |
| `_site/_snippet/_global/_paginate.twig` | `_site/components/pagination.twig` |
| `_site/_snippet/_global/_search.twig` | `_site/components/search.twig` |
| `_site/_snippet/_content/_socialMedia.twig` | `_site/components/socialMedia.twig` |
| `_site/_snippet/_content/_socialShare.twig` | `_site/components/socialShare.twig` |

#### `components/frame`

| Now | New |
| --- | --- |
| `_site/_snippet/_global/_flyout.twig` | `_site/components/frame/flyout.twig` |
| `_site/_snippet/_global/_footer.twig` | `_site/components/frame/footer.twig` |
| `_site/_snippet/_global/_header.twig` | `_site/components/frame/header.twig` |
| `_site/_snippet/_nav/_breadcrumb.twig` | `_site/components/frame/nav/breadcrumb.twig` |
| `_site/_snippet/_nav/_doormat.twig` | `_site/components/frame/nav/doormat.twig` |
| `_site/_snippet/_nav/_flyout.twig` | `_site/components/frame/nav/flyout.twig` |
| `_site/_snippet/_nav/_language.twig` | `_site/components/frame/nav/language.twig` |
| `_site/_snippet/_nav/_main.twig` | `_site/components/frame/nav/main.twig` |
| `_site/_snippet/_nav/_service.twig` | `_site/components/frame/nav/service.twig` |

#### `components/pageHeader`

| Now | New |
| --- | --- |
| `_site/_snippet/_content/_defaultHeader.twig` | `_site/components/pageHeader/default.twig` |
| `_site/_snippet/_content/_hero.twig` | `_site/components/pageHeader/hero.twig` |
| `_site/_snippet/_content/_pageHeader.twig` | `_site/components/pageHeader/pageHeader.twig` |

#### `components/cards`

| Now | New |
| --- | --- |
| `_site/_snippet/_item/_cards/_calendar.twig` | `_site/components/cards/calendar.twig` |
| `_site/_snippet/_item/_cards/_default.twig` | `_site/components/cards/default.twig` |
| `_site/_snippet/_item/_cards/_knowledgeBase.twig` | `_site/components/cards/knowledgeBase.twig` |
| `_site/_snippet/_item/_cards/_news.twig` | `_site/components/cards/news.twig` |
| `_site/_snippet/_item/_cards/_person.twig` | `_site/components/cards/person.twig` |

#### `components/partials`

| Now | New |
| --- | --- |
| `_site/_snippet/_content/_partials/_carrouselControls.twig` | `_site/components/partials/carrouselControls.twig` |
| `_site/_snippet/_content/_partials/_filterClearBtn.twig` | `_site/components/partials/filter/clearButton.twig` |
| `_site/_snippet/_content/_partials/_filterOptions.twig` | `_site/components/partials/filter/options.twig` |
| `_site/_snippet/_content/_partials/_filterSearch.twig` | `_site/components/partials/filter/search.twig` |
| `_site/_snippet/_content/_grid/_partials/_galleryImage.twig` | `_site/components/partials/galleryImage.twig` |
| `_site/_snippet/_content/_partials/_overview.twig` | `_site/components/partials/overview.twig` |
| `_site/_snippet/_content/_partials/_textColumn.twig` | `_site/components/partials/textColumn.twig` |

#### `macros`

| Now | New |
| --- | --- |
| `_site/_snippet/_macros/_imageSizes.twig` | `_site/macros/imageSizes.twig` |

## What has to change besides the files

| Where | What | How many |
| --- | --- | --- |
| `templates/**` | `include`, `embed`, `extends` and `import` paths | about 115 |
| `templates/_site/_snippet/_content/_contentBuilder.twig` | Dynamic include `'_site/_snippet/_content/_blocks/_' ~ block.type.handle` | 1 |
| `templates/_site/_snippet/_content/_blocks/_gridRow.twig` | Dynamic include `'_site/_snippet/_content/_grid/_' ~ cellTypes[…]` | 1 |
| `templates/_site/_snippet/_content/_partials/_overview.twig` | Dynamic path `'_site/_snippet/_item/_cards/_' ~ source.card` | 1 |
| `templates/404.twig`, `templates/503.twig` | Extend or include `_site/…` | 2 files |
| `config/project/sections/*.yaml` | `siteSettings.*.template` of 24 sections, 3 sites each: 11 account pages, the news, calendar and knowledge base overviews and details, 4 sections on `_contentPage`, contact, search and home. Some have `.twig`, some don't: leave it out everywhere (`GUIDELINES.MD` §5). The `404` and `503` sections point outside `_site/` and stay the same | 72 values |
| `modules/statik/src/web/twig/CtaExtension.php` | `_site/_snippet/_global/_cta` (also in the class comment) | 2 |
| `modules/statik/src/web/twig/ImageExtension.php` | `_site/_snippet/_global/_image` | 1 |
| `modules/statik/src/web/twig/PaginateExtension.php` | `_site/_snippet/_global/_paginate` | 1 |
| `modules/statik/src/console/controllers/SetupController.php` | Removes `/_site/_account` when the account flow is removed | 1 |
| `frontend/css/site/components/gridbuilder.css` | Comment with the path of `_gridRow.twig` | 1 |
| `frontend/css/site/theme.css` | Comment with the path of `_hero.twig` | 1 |
| `.gitignore`, `.gitignore.example` | Three old entries under `_site/_snippet/_global/` (`_headerAssets`, `_iconSprite`, `_favicon`) that nothing generates any more: remove them | 6 lines |
| `frontend/css/site/main.css` | `@source "../../../templates/_site"`: stays the same | 0 |
| `config/app.php` | Comment mentioning `templates/_site`: stays the same | 0 |
| `.claude/skills/` | `understanding-project-architecture` (several files), `removing-contentbuilder-showcase`, `updating-contentbuilder-showcase`, `checking-code-guidelines` | 4 skills |
| `CLAUDE.md` | The template paths in the Architecture section, and the Conventions note to keep the `_`-prefixed names for now | 2 |
| `docs/src/craft/` | Mainly `templates/structure.md` and `templates/partials.md`, and paths on about 15 other pages | ~17 pages |
| `WHATS-NEW.md` | A new entry for the move. The older entries keep their old paths | 1 entry |
| `GUIDELINES.MD` | §5 Template folder structure is written already; remove its "applies after the move" note | 1 |

## Steps

Work on a separate branch from `develop`, one commit per step, so a step can be reverted on its own.

1. **Freeze the inventory.** Regenerate the mapping (`find templates/_site -type f`) and check nothing was added since
   this plan. Save a list of every page URL to check afterwards:
   - one page of every section and site, from the database;
   - every showcase page (`gridbuilder/…`).

   Save each page's HTML from before the move (`curl` into `storage/before/`), to compare with afterwards.
2. **Move the files.** A script that runs `git mv` for every line of the mapping, so Git keeps the history of every file.
   Create the folders first.
3. **Rewrite the static paths.** A script that replaces every old path from the mapping with the new one in `templates/`,
   `modules/` and `frontend/css/`:
   - longest path first, so `_site/_snippet/_content/_grid/_partials/_galleryImage` is replaced before `_site/_snippet/_content/_grid`;
   - each path with and without `.twig`.
4. **Rewrite the three dynamic paths by hand:**
   - `'_site/contentBuilder/blocks/' ~ block.type.handle`
   - `'_site/contentBuilder/columns/' ~ cellTypes[…]`
   - `'_site/components/cards/' ~ source.card`

   The row is a block of the content builder field (handle `gridRow`), but its template is not in `blocks/`: it sits
   directly in `contentBuilder/`, because it is not a block itself but the template that includes the columns. Add a
   special case to the loop, so a `gridRow` block includes `'_site/contentBuilder/gridRow'`.
5. **Change the section templates.** Edit the 72 `template:` values in `config/project/sections/*.yaml`, with the new
   path from the mapping (e.g. `_site/_account/_passwordSet` → `_site/pages/account/password/set`). Then:
   ```bash
   ddev craft project-config/apply
   ddev craft project-config/diff   # nothing left over
   ```
6. **Search for leftovers.** `grep -rn "_snippet\|_site/_" templates modules config frontend/css .claude docs/src` must return
   nothing, apart from the `WHATS-NEW.md` history.
7. **Check every page.**
   - **Status:** every URL from step 1 returns `200`.
   - **Errors:** `storage/logs/web-*.log` has no new Twig errors.
   - **HTML:** each page is the same as before. Compare it with `storage/before/`, ignoring CSRF tokens and cache-busting
     hashes. The HTML must not change: this is a move, not a redesign.
   - **Front-end build:** run `yarn prod`, so Tailwind still finds every class through `@source`.
8. **Check the console commands:**
   - **`statik/setup`:** in a copy of the project, the "remove the account flow" step removes `pages/account`.
   - **Showcase:** `ddev craft statik/contentbuilder` runs and the showcase pages still render. Run it once only, with its
     output going to a file.
9. **Update the skills and docs.**
   - The four skills, `CLAUDE.md` and the docs pages from the table above.
   - In the guidelines check skill, the C2 rule ("ignoring an optional leading `_`") can become stricter: no `_` inside `_site/`.
     Add a check for §5 of `GUIDELINES.MD` (template folder structure), and drop the line that says not to check the folder
     structure.
   - In `GUIDELINES.MD`, remove the note that §5 applies after the move.
   - Build the docs: `cd docs && yarn docs:build`.
10. **Write the `WHATS-NEW.md` entry,** with the old → new table, so whoever looks up a template finds where it went.
    Existing projects are not migrated, so it is not a migration guide.
11. **Review and merge,** then deploy to the Rectangle testing server and check the pages there.

## Risks

| Risk | How the plan covers it |
| --- | --- |
| A missed include breaks a page only when that template is used (a rare column, an account page) | Step 6 searches for every old path; step 7 checks every section and every showcase page, which covers every column type |
| A dynamic include builds a path the search doesn't see | Only three, all handled by hand in step 4 |
| A section points at a template that no longer exists: a 404 or an error on that section's pages | Step 5 and the per-section check in step 7 |
| Projects started from the base install can no longer merge base install updates easily | Accepted: existing projects keep the old structure. The old → new table in `WHATS-NEW.md` helps when porting a change by hand |
| A Clint update that changes a template points at the new path, which older projects don't have (e.g. `20261005-responsive-images-and-gallery-opener-for-the-image-modal` changes `_blocks/_image.twig`) | Template changes in a Clint update after the move need the old path for older projects; check how Clint handles a missing file before the first such update. Leave the existing `clint/updates/*` folders as they are |
| Template caches still hold the old paths | `ddev craft clear-caches/all` after step 5, and on every environment after the deploy |

