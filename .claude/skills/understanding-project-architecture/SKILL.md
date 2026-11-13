---
name: understanding-project-architecture
description: Use this skill when working on this Craft CMS 5 project to understand its architecture, configuration patterns, plugin ecosystem, custom module, multi-site setup, and frontend build pipeline. Invoke when making changes to config, templates, modules, or plugins, or when answering questions about how this project is structured.
---

# Statik Craft CMS 5 Base Install

This is **statikbe/craft** — a Craft CMS 5 scaffolding package used internally by Statik.be for new projects.

## Quick Reference

- **Craft CMS**: 5.x (currently `^5.12.1` in `composer.json`)
- **PHP**: >=8.4
- **Database**: MySQL 8.0
- **Dev environment**: DDEV — `https://craft-base-install.local.statik.be` (TLD is `local.statik.be`, not `ddev.site`)
- **Frontend**: Vite + Tailwind CSS v4 + TypeScript
- **Sites**: 3 (NL `nl-BE`, FR `fr-BE`, EN `en-BE`)

## Project Structure

```
config/                     # All Craft + plugin configuration
config/project/             # Project config YAML (fields, sections, entry types, sites)
config/project/formie/      # Formie form/stencil definitions
templates/                  # Twig templates
templates/_site/            # Main site templates (layout, pages/, contentBuilder/, components/, macros/)
modules/statik/src/         # Custom Yii2 module
frontend/                   # Frontend source (CSS, JS, icons, fonts)
frontend/css/               # Stylesheets
frontend/js/                # TypeScript entry (site.ts)
public/                     # Web root (index.php, frontend/, files/)
storage/                    # Logs, runtime, config-deltas
clint/                      # Custom CLI utility for Statik projects
.ddev/                      # DDEV Docker config
```

## Configuration

See `./craft-config-details.md` for full configuration details.

**Key points:**
- `config/general.php` — Uses legacy multi-environment array syntax (not fluent `GeneralConfig::create()`)
- `config/app.php` — Yii app config, registers the `statik` module, configures logging and mailer per environment
- `config/db.php` — Database config using `App::env()` (legacy array syntax)
- `config/custom.php` — Custom settings: `maintenanceMode`, Google CSE IDs per language, the content row showcase slug (`gridbuilderShowcaseSlug`)
- `config/trinity.php` — Content row settings for the Trinity plugin (page widths, minimum/maximum width per column type, blocked combinations), see `./content-row.md`
- Environment variables often accessed via `getenv()` instead of `App::env()`

**Environment-specific behavior:**
- **Production**: Template caching ON, backups ON, admin changes CLI-only, Postmark mailer
- **Staging**: Template caching ON, backups OFF, admin changes CLI-only, Postmark mailer, test email redirect
- **Dev**: Template caching OFF, backups OFF, devMode ON, local SMTP (port 1025)

## Custom Module: `statik`

Registered in `config/app.php`, bootstrapped on every request. Source: `modules/statik/src/`

**Features:**
- **Language routing**: Cookie-based (`__language`) language switching, browser detection, auto-redirect
- **Twig extensions**: `CtaExtension` (`render_ctas()`), `EmailExtension` (`obfuscate_emails`: hides email addresses, decoded by `email.component.ts`), `IconExtension`, `ImageExtension` (`render_image()`, `preload_image_transforms()`), `HyphenateExtension`, `StatikExtension`, `ValidateInputExtension`, `PaginateExtension`, `PhoneExtension` (`tel`: phone numbers for tel: links or display, libphonenumber)
- **Maintenance mode**: Locks the CP, only allows login/logout paths
- **HTTP security headers**: Sets `X-Frame-Options`, `X-Content-Type-Options` (HSTS commented out)
- **CP navigation**: Adds Fields, Entry Types, Sections shortcuts when admin changes allowed
- **Asset filename normalization**: Forces lowercase extensions
- **After an entry save**: clears the cached site settings (`layout-siteSettings-<site id>`), and when an overview single's slug changes (`OVERVIEW_ITEM_SECTIONS`: news, calendar, knowledge base) resaves its items so their URIs follow
- **Content rows**: the **Page section** field condition rule (`conditions/PageSectionConditionRule`, e.g. related news only on news items) and the showcase's page width listeners (`Statik.php`); the rules, validation, conditions and control panel layer are in the Trinity plugin, see `./content-row.md`

## Plugins (22 installed)

See `./plugin-ecosystem.md` for the full list with purposes. `composer.json` is the source of truth — the count drifts as plugins are added/removed, so verify there rather than trusting this number.

**Key plugins to know about:**
- `verbb/formie` — Forms, stencils in `config/project/formie/`
- `craftcms/ckeditor` — Rich text editor
- `nystudio107/craft-vite` — Vite integration
- `studioespresso/craft-seo-fields` — SEO metadata
- `studioespresso/craft-navigate` — Navigation
- `verbb/knock-knock` — Password protection for staging/dev
- `statikbe/craft-sentry` — Error tracking
- `statikbe/craft-cookie-banner` — Cookie consent
- `craftcms/postmark` — Email delivery (production/staging)

## Multi-site & Localization

Three sites all under one site group, URL structure: `@baseUrl/{locale}` (nl, fr, en).

The custom `LanguageService` handles:
1. Checking for `?lang=` query parameter
2. Reading/writing the `__language` cookie
3. Browser `Accept-Language` detection
4. Redirecting to the correct locale prefix

## Frontend Build

All frontend tooling lives in `frontend/` — there is **no `package.json` at the project root**, so run `yarn` commands from inside `frontend/` (Yarn 1.x, pinned via `packageManager`).

- **Vite** config in `frontend/vite.config.js` (+ `frontend/vite.config.site2.js` for a second site)
- **Entry point**: `frontend/js/site.ts`
- **TailwindCSS v4** via `@tailwindcss/vite` plugin
- **Dev server**: `https://localhost:3000` (https via `vite-plugin-mkcert`)
- **Output**: `public/frontend/`
- **Scripts** (from `frontend/`): `yarn watch` (dev + HMR), `yarn dev` and `yarn prod` (both run `vite build`), `yarn watch-site2` / `yarn prod-two-sites-example` (second site), `yarn ckeditor` (builds the CKEditor bundle separately via `frontend/vite-ckeditor.config.js`)

**Component system:** `frontend/js/site.ts` registers components in a `components` array and lazy-loads each by CSS selector via `ComponentLoader` (`frontend/js/loader/`). To add a site component: create the file under `frontend/js/components-site/` and add it to the `components` array in `site.ts`. `components-core/` holds shared base components; `site2.ts` is the second-site entry.

**Frontend documentation:** The full frontend/component docs are **not** present in projects scaffolded from this starter — `/docs/` is `export-ignore`d in `.gitattributes`, so `composer create-project` strips it (the skills under `.claude/` are *not* stripped, so this pointer always travels with the project). To read the docs:
- **In this starter repo** → they're local: `docs/src/` (a Vite/VitePress site; entry `docs/src/index.md`).
- **In a project built from the starter** (no local `docs/`) → fetch the published version with WebFetch:
  - Rendered (best for a single fetch): `https://statikbe.github.io/craft/frontend/frontend.html`
  - Source of truth (Markdown, browse/link individual pages): `https://github.com/statikbe/craft/tree/develop/docs`

## Content Architecture

Counts below are approximate snapshots — they drift as the project config changes, so treat them as orders of magnitude, not exact figures. The source of truth is `config/project/` (fields, entry types, sections, volumes).

- **~100 fields** (rich text, images, CTAs, videos, SEO, forms, tables, etc.)
- **~50 entry types** (pages, news, the content row and its 16 column types, the old blocks, hero, links, etc.)
- **~32 sections** (mix of singles and channels/structures)
- **1 volume** (public files with optimized image handling, required alt text)

## Content Builder

The page-building system is a Matrix field, **`contentBuilder`** ("Content Builder", `craft\fields\Matrix`), used across content/page entry types (rendered via templates like `_site/pages/page.twig`). It offers **one entry type: the Content row** (`gridRow`). A page is a stack of rows; each row has a layout of 1–3 columns and every column holds one **column type** (a `cell*` entry type in the row's `gridCells` Matrix).

**Rendering:** `templates/_site/contentBuilder/contentBuilder.twig` loops the field's entries and renders each row with `_site/contentBuilder/gridRow.twig`, which includes one template per column: `_site/contentBuilder/columns/<type>.twig`, where `<type>` is the cell entry type handle without the `cell` prefix (Trinity's `cellTypePrefix`): `cellText` → `columns/text.twig`, `cellCallToAction` → `columns/callToAction.twig`. The caller passes a `settings` object; the dispatcher wraps each row in `settings.section` / `settings.container` CSS classes, applies the row's `backgroundColor` class and its spacing (`rowSpacing`). Most column types share a `blockTitle` field (Entry Anchors plugin, rendered as an `<h2>` with an anchor).

**Column types (16)** (fields as editors see them; template in `contentBuilder/columns/`; widths from `config/trinity.php`, a column of any width is allowed unless listed):

| Column type | Handle → template | Fields and options | Width |
|---|---|---|---|
| Text | `cellText` → `text.twig` | Title (anchor), Text, Links | any |
| Image | `cellImage` → `image.twig` | Image, Show larger version in popup | any |
| Image gallery | `cellImageGallery` → `imageGallery.twig` | Images; type *Grid* or *Carrousel*; for a grid: Image width and position (full and 2/3 columns), Images layout (1/2 columns), popup | min 1/2 |
| Quote | `cellQuote` → `quote.twig` | Quote, Author, Author role, Author image, Author image position (*Left*, *Right*, *Next to the name*; only with an image), Link | any |
| Video | `cellVideo` → `video.twig` | Video URL, Placeholder image, Video caption | any |
| Table | `cellTable` → `table.twig` | Table (a CKEditor table), Table caption, Mobile table (*Cards* or *Scroll*) | min 1/2 |
| Card | `cellCard` → `card.twig` | Card type *Entry* (an entry, Show image) or *Custom* (Card info); Card layout *Stacked* or *Image left* | min and max 1/2 |
| Person | `cellPerson` → `person.twig` | Person (an entry of the Team section), see `./team.md` | max 1/2 |
| Numbers | `cellNumbers` → `numbers.twig` | Title (anchor), Intro, Buttons, Numbers | min 1/2 |
| Form | `cellForm` → `form.twig` | Form (Formie) | min 1/2 |
| FAQ | `cellFaq` → `faq.twig` | Title (anchor), FAQ items | min 1/2 |
| Embed | `cellEmbed` → `embed.twig` | Embed code | min 1/2 |
| Call to action | `cellCallToAction` → `callToAction.twig` | Title (anchor), Text, Links, Image | full rows only |
| Overview | `cellOverview` → `overview.twig` | Overview options (*Entries*, *News*, *Calendar*, *Knowledge Base*, each with its Entries field), Dynamically fill, Related news (news items only), Overview type *Grid* or *Carrousel*, Card layout and Highlight the first card (grid, not at 1/2), Link and Link position. Sources in `config/overview-sources.php`, rendering in `partials/overview.twig`: see `./content-row.md` | min 1/2 |
| Team | `cellTeam` → `team.twig` | Title (anchor), Text, Columns (2, 3 or 4), Team members, see `./team.md` | full rows only |
| Partners | `cellPartners` → `partners.twig` | Title (anchor), Text, Partners, type *Grid* or *Carrousel*, see `./partners.md` | min 1/2 |

The column types with a title also have **Show title** (off: only screen readers read it). Blocked combinations: two Partners columns in one row, and Quote with FAQ. Editors' docs for the same table: `docs/src/craft/content/content-builder.md`.

The rules (which type fits which column width, blocked combinations), validation, field conditions and the control panel layer come from the **Trinity** plugin, with this project's settings in `config/trinity.php`. See `./content-row.md` for how it fits together and the checklist for **adding a column type** (entry type in `gridCells`, template in `columns/`, rules in `config/trinity.php`, showcase content).

**Old blocks:** `contentBuilder/blocks/` still holds the templates of the full-width blocks from before content rows (`textImage`, `faq`, …). Their entry types still exist in `config/project/`, but no field offers them, and `contentBuilder.twig` only falls back to `blocks/<handle>.twig` for an entry that isn't a row. New work goes in the column templates. See `./content-builder-blocks.md` for the old blocks and the column types that replace them.

The page header (`_site/components/pageHeader/pageHeader.twig` with its presets `default` and `hero`) and `components/socialMedia` / `components/socialShare` are page chrome, rendered outside the Content Builder loop. The page header engine, its variables and slots, and the Hero content block: see `./page-header.md`.

**Row background colours** are driven by `config/config-values-field.php` (`Background colors` → `section--default` / `section--light`); the stored value is the CSS class applied in the dispatcher. Trinity's `rowBackgroundField` / `rowBackgroundDefault` in `config/trinity.php` name the field and its default.

**Showcase:** `ddev craft statik/contentbuilder` builds the content row showcase: a `gridbuilder` page tree with every column type in every layout and next to every other column type. Cell types and fields are read at runtime; the content comes from `config/contentbuilder-showcase/content.json`. See the `updating-contentbuilder-showcase` skill.

**Dummy content:** `ddev craft statik/dummy-content/<type>` for `news`, `calendar`, `knowledge-base`, `team` and `partners` (news: `[--count=12] [--categories] [--category-count=6] [--keep] [--dry-run] [--seed=1]`) creates dummy entries with content rows, enabled on every site; `ddev craft statik/dummy-content/clean <type>` removes them (news: `[--categories]`). Generated entries have a `dummy-` slug, the only ones a run replaces or removes. Texts: `config/dummy-content/content.json` (a key per type). Code: `DummyContentController` + `helpers/dummycontent/DummyContentType` (shared: content, images, dates, content rows) with one subclass per type (`NewsDummyContent`, …). For a new type: add a subclass, list it in `DummyContentController::TYPES`, add an action and a key in content.json.

The **calendar** (events with date blocks, upcoming logic in the module, overview and detail templates, URLs that follow the overview's slug): see `./calendar.md`. The **knowledge base** placeholder (projects, publications, …, built after news): see `./knowledge-base.md`. The **team** (people without URLs, the Person and Team column types, the person card): see `./team.md`. The **partners** (logos without URLs, the Partners column type): see `./partners.md`.

## Common Tasks

**Adding a new plugin:**
```bash
ddev composer require vendor/plugin-name
ddev craft plugin/install plugin-handle
```

**Running the frontend:** (from `frontend/`)
```bash
cd frontend
yarn watch    # Dev with HMR
yarn prod     # Production build (vite build)
```

**Code quality:**
```bash
ddev composer check-cs    # PHP coding standards
ddev composer fix-cs      # Auto-fix standards
ddev composer phpstan     # Static analysis
```
Both tools scan `modules/` only (not templates or `config/`): ECS via `ecs.php`, PHPStan at level 2 via `phpstan.neon`. Note `ecs.php` uses the Craft **4** ruleset (`SetList::CRAFT_CMS_4`), matching the CI's `craft_version: '4'`.
