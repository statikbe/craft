# Plan: restructure `templates/_site`

Status: **draft, to revise**. Nothing has been changed yet. Written 2026-10-26.

## Goal

Sort the templates in `_site/` by role, so every file has one obvious place:

| Folder | What goes in it |
| --- | --- |
| `layout.twig` | The base layout |
| `pages/` | The templates sections point to. A single gets a file; a section with entries gets a folder with `index` and `entry` |
| `frame/` | What's around every page: header, footer, flyout, navigation |
| `pageHeader/` | The page header and its presets |
| `contentBuilder/` | The content builder: the loop, the row, the columns, the older blocks, their partials |
| `components/` | Reusable parts you include anywhere |
| `cards/` | The cards of overviews and related entries |
| `macros/` | Twig macros |

Plus two naming rules:

- **No `_` prefix inside `_site/`.** Craft never serves anything under `_site/` as a URL, and `GUIDELINES.MD` already says
  folders inside `_site` get no prefix. `_site` itself keeps its `_`.
- **One name per thing.** The image component, the image column and the image block no longer share the name `_image` in
  three `_snippet` folders; the two `_partials` folders and the two flyouts each get their own place.

Not part of this plan: the content of the templates, the older `blocks/` (they stay until a content migration converts
the pages that still use them), and `404.twig`, `503.twig`, `_knock-knock.twig` and `_mail/` outside `_site/`.

## Open questions

Decide these before starting:

1. **Folder names.** `frame/` or `layout/`? `pages/` or `sections/`? `columns/` or `cells/` (the entry types are called
   `cell…`)?
2. **`rows/gridRow.twig`.** The row is a block of the content builder field (handle `gridRow`), so the dynamic include of
   `blocks/` finds it there. Keep it in `blocks/` (no special case in the loop), or move it to `rows/` and add a special
   case?
3. **Column template names.** Keep the names the cell types give now (`text`, `image`, `card`, …), or rename with the
   entry type handles?
4. **The two flyouts.** `_global/_flyout` (the panel) and `_nav/_flyout` (the menu in it): keep both, as `frame/flyout`
   and `frame/nav/flyout`, or merge them?
5. **`pagination` vs `paginate`.** The Twig function stays `render_pagination()`; rename the template to match?
6. **Existing projects.** The plan only changes the base install. Do projects started from it before the move get a
   migration guide, or do they keep the old structure?

## Mapping

All 85 files under `templates/_site`. Proposed names; see the open questions.

#### `layout.twig`

| Now | New |
| --- | --- |
| `_site/_layout.twig` | `_site/layout.twig` |

#### `pages`

| Now | New |
| --- | --- |
| `_site/_account/_edit.twig` | `_site/pages/account/edit.twig` |
| `_site/_account/_editPassword.twig` | `_site/pages/account/editPassword.twig` |
| `_site/_account/_login.twig` | `_site/pages/account/login.twig` |
| `_site/_account/_passwordRequestReset.twig` | `_site/pages/account/passwordRequestReset.twig` |
| `_site/_account/_passwordRequestResetConfirmation.twig` | `_site/pages/account/passwordRequestResetConfirmation.twig` |
| `_site/_account/_passwordSet.twig` | `_site/pages/account/passwordSet.twig` |
| `_site/_account/_passwordSetConfirmation.twig` | `_site/pages/account/passwordSetConfirmation.twig` |
| `_site/_account/_profile.twig` | `_site/pages/account/profile.twig` |
| `_site/_account/_register.twig` | `_site/pages/account/register.twig` |
| `_site/_account/_registrationCompleted.twig` | `_site/pages/account/registrationCompleted.twig` |
| `_site/_account/_registrationConfirmation.twig` | `_site/pages/account/registrationConfirmation.twig` |
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

#### `frame`

| Now | New |
| --- | --- |
| `_site/_snippet/_global/_flyout.twig` | `_site/frame/flyout.twig` |
| `_site/_snippet/_global/_footer.twig` | `_site/frame/footer.twig` |
| `_site/_snippet/_global/_header.twig` | `_site/frame/header.twig` |
| `_site/_snippet/_nav/_breadcrumb.twig` | `_site/frame/nav/breadcrumb.twig` |
| `_site/_snippet/_nav/_doormat.twig` | `_site/frame/nav/doormat.twig` |
| `_site/_snippet/_nav/_flyout.twig` | `_site/frame/nav/flyout.twig` |
| `_site/_snippet/_nav/_language.twig` | `_site/frame/nav/language.twig` |
| `_site/_snippet/_nav/_main.twig` | `_site/frame/nav/main.twig` |
| `_site/_snippet/_nav/_service.twig` | `_site/frame/nav/service.twig` |

#### `pageHeader`

| Now | New |
| --- | --- |
| `_site/_snippet/_content/_defaultHeader.twig` | `_site/pageHeader/default.twig` |
| `_site/_snippet/_content/_hero.twig` | `_site/pageHeader/hero.twig` |
| `_site/_snippet/_content/_pageHeader.twig` | `_site/pageHeader/pageHeader.twig` |

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
| `_site/_snippet/_content/_grid/_partials/_galleryImage.twig` | `_site/contentBuilder/partials/galleryImage.twig` |
| `_site/_snippet/_content/_partials/_textColumn.twig` | `_site/contentBuilder/partials/textColumn.twig` |
| `_site/_snippet/_content/_blocks/_gridRow.twig` | `_site/contentBuilder/rows/gridRow.twig` |

#### `components`

| Now | New |
| --- | --- |
| `_site/_snippet/_content/_partials/_carrouselControls.twig` | `_site/components/carrouselControls.twig` |
| `_site/_snippet/_global/_cta.twig` | `_site/components/cta.twig` |
| `_site/_snippet/_item/_eventDate.twig` | `_site/components/eventDate.twig` |
| `_site/_snippet/_content/_partials/_filterClearBtn.twig` | `_site/components/filter/clearButton.twig` |
| `_site/_snippet/_content/_partials/_filterOptions.twig` | `_site/components/filter/options.twig` |
| `_site/_snippet/_content/_partials/_filterSearch.twig` | `_site/components/filter/search.twig` |
| `_site/_snippet/_global/_image.twig` | `_site/components/image.twig` |
| `_site/_snippet/_item/_loader.twig` | `_site/components/loader.twig` |
| `_site/_snippet/_content/_partials/_overview.twig` | `_site/components/overview.twig` |
| `_site/_snippet/_global/_paginate.twig` | `_site/components/pagination.twig` |
| `_site/_snippet/_global/_search.twig` | `_site/components/search.twig` |
| `_site/_snippet/_content/_socialMedia.twig` | `_site/components/socialMedia.twig` |
| `_site/_snippet/_content/_socialShare.twig` | `_site/components/socialShare.twig` |

#### `cards`

| Now | New |
| --- | --- |
| `_site/_snippet/_item/_cards/_calendar.twig` | `_site/cards/calendar.twig` |
| `_site/_snippet/_item/_cards/_default.twig` | `_site/cards/default.twig` |
| `_site/_snippet/_item/_cards/_knowledgeBase.twig` | `_site/cards/knowledgeBase.twig` |
| `_site/_snippet/_item/_cards/_news.twig` | `_site/cards/news.twig` |
| `_site/_snippet/_item/_cards/_person.twig` | `_site/cards/person.twig` |

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
| `templates/404.twig`, `templates/503.twig` | Extend or include `_site/…` | 2 files |
| `config/project/sections/*.yaml` | `siteSettings.*.template` of 14 sections, 3 sites each. Some have `.twig`, some don't: make them the same | 42 values |
| `modules/statik/src/web/twig/CtaExtension.php` | `_site/_snippet/_global/_cta` (also in the class comment) | 2 |
| `modules/statik/src/web/twig/ImageExtension.php` | `_site/_snippet/_global/_image` | 1 |
| `modules/statik/src/web/twig/PaginateExtension.php` | `_site/_snippet/_global/_paginate` | 1 |
| `modules/statik/src/console/controllers/SetupController.php` | Removes `/_site/_account` when the account flow is removed | 1 |
| `frontend/css/site/components/gridbuilder.css` | Comment with the path of `_gridRow.twig` | 1 |
| `frontend/css/site/main.css` | `@source "../../../templates/_site"`: stays the same | 0 |
| `config/app.php` | Comment mentioning `templates/_site`: stays the same | 0 |
| `.claude/skills/` | `understanding-project-architecture` (several files), `removing-contentbuilder-showcase`, `updating-contentbuilder-showcase`, `checking-code-guidelines` | 4 skills |
| `docs/src/craft/` | Mainly `templates/structure.md` and `templates/partials.md`, and paths on about 15 other pages | ~17 pages |
| `WHATS-NEW.md` | A new entry for the move. The older entries keep their old paths | 1 entry |

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
4. **Rewrite the two dynamic includes by hand:**
   - `'_site/contentBuilder/blocks/' ~ block.type.handle`
   - `'_site/contentBuilder/columns/' ~ cellTypes[…]`

   Depending on open question 2, add the special case for `gridRow`.
5. **Change the section templates.** Edit the 42 `template:` values in `config/project/sections/*.yaml`. Then:
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
   - The four skills and the docs pages from the table above.
   - In the guidelines check skill, the C2 rule ("ignoring an optional leading `_`") can become stricter: no `_` inside `_site/`.
   - Build the docs: `cd docs && yarn docs:build`.
10. **Write the `WHATS-NEW.md` entry,** with the old → new table for whoever merges this into a project.
11. **Review and merge,** then deploy to the Rectangle testing server and check the pages there.

## Risks

| Risk | How the plan covers it |
| --- | --- |
| A missed include breaks a page only when that template is used (a rare column, an account page) | Step 6 searches for every old path; step 7 checks every section and every showcase page, which covers every column type |
| A dynamic include builds a path the search doesn't see | Only two, both handled by hand in step 4 |
| A section points at a template that no longer exists: a 404 or an error on that section's pages | Step 5 and the per-section check in step 7 |
| Projects started from the base install can no longer merge base install updates easily | Open question 6; the old → new table in `WHATS-NEW.md` |
| Template caches still hold the old paths | `ddev craft clear-caches/all` after step 5, and on every environment after the deploy |

