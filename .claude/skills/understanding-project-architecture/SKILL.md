---
name: understanding-project-architecture
description: Use this skill when working on this Craft CMS 5 project to understand its architecture, configuration patterns, plugin ecosystem, custom module, multi-site setup, and frontend build pipeline. Invoke when making changes to config, templates, modules, or plugins, or when answering questions about how this project is structured.
---

# Statik Craft CMS 5 Base Install

This is **statikbe/craft** — a Craft CMS 5 scaffolding package used internally by Statik.be for new projects.

## Quick Reference

- **Craft CMS**: 5.x (currently `^5.9.23` in `composer.json`)
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
templates/_site/            # Main site templates (_layout, _contact, _account/, _news/)
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
- `config/custom.php` — Custom settings: `maintenanceMode` and Google CSE IDs per language
- Environment variables often accessed via `getenv()` instead of `App::env()`

**Environment-specific behavior:**
- **Production**: Template caching ON, backups ON, admin changes CLI-only, Postmark mailer
- **Staging**: Template caching OFF, backups OFF, admin changes CLI-only, Postmark mailer, test email redirect
- **Dev**: Template caching OFF, backups OFF, devMode ON, local SMTP (port 1025)

## Custom Module: `statik`

Registered in `config/app.php`, bootstrapped on every request. Source: `modules/statik/src/`

**Features:**
- **Language routing**: Cookie-based (`__language`) language switching, browser detection, auto-redirect
- **Twig extensions**: `IconExtension`, `HyperExtension`, `HyphenateExtension`, `StatikExtension`, `ValidateInputExtension`, `PaginateExtension`
- **Custom field**: `AnchorLink`
- **Maintenance mode**: Locks the CP, only allows login/logout paths
- **HTTP security headers**: Sets `X-Frame-Options`, `X-Content-Type-Options` (HSTS commented out)
- **Formie field filtering**: Excludes Address, Group, Section, Repeater, Tags, Users from Formie
- **CP navigation**: Adds Fields, Entry Types, Sections shortcuts when admin changes allowed
- **Asset filename normalization**: Forces lowercase extensions

## Plugins (23 installed)

See `./plugin-ecosystem.md` for the full list with purposes. `composer.json` is the source of truth — the count drifts as plugins are added/removed, so verify there rather than trusting this number.

**Key plugins to know about:**
- `verbb/formie` — Forms, stencils in `config/project/formie/`
- `craftcms/ckeditor` — Rich text editor
- `nystudio107/craft-vite` — Vite integration
- `studioespresso/craft-seo-fields` — SEO metadata
- `studioespresso/craft-navigate` — Navigation
- `verbb/hyper` — Hyperlink fields
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

- **~54 fields** (rich text, images, CTAs, videos, SEO, forms, tables, etc.)
- **~25 entry types** (hero, CTA, FAQ, forms, news, pages, quotes, etc.)
- **~26 sections** (mix of singles and channels/structures)
- **1 volume** (public files with optimized image handling, required alt text)

## Content Builder

The page-building system is a single Matrix field, **`contentBuilder`** ("Content Builder", `craft\fields\Matrix`), used across content/page entry types (rendered via templates like `_site/_contentPage.twig`). Each Matrix block entry type is one stackable "block".

**Rendering:** `templates/_site/_snippet/_content/_contentBuilder.twig` loops `entry.contentBuilder.collect()` and includes `_site/_snippet/_content/_blocks/_{{ block.type.handle }}.twig` for each block — so a block's entry-type **handle maps 1:1 to its template filename**. The caller passes a `settings` object; the dispatcher optionally wraps each block in `settings.section` / `settings.container` CSS classes and applies the block's `backgroundColor` class. Most blocks share a `blockTitle` field (rendered as an `<h2>` anchor).

**Blocks (12):**

| Handle | CP label | Template (`_blocks/`) | Renders |
|--------|----------|-----------------------|---------|
| `callToAction` | Call To Action | `_callToAction.twig` | CTA button / banner |
| `customTable` | Custom Table | `_customTable.twig` | Table (TableMaker) |
| `embed` | Embed | `_embed.twig` | Raw HTML embed (only if it contains `src="https:`) |
| `faq` | FAQ | `_faq.twig` | Q&A / accordion items |
| `form` | Form | `_form.twig` | Formie form via `craft.formie.renderForm()` |
| `image` | Image | `_image.twig` | One+ images with position + width (full / ½ / ⅓ / ¼), optional popup |
| `overview` | Overview | `_overview.twig` | Grid of related-entry cards (`block.entries`) |
| `quote` | Quote | `_quote.twig` | Pull quote |
| `textImage` | Text (+ Image) | `_textImage.twig` | Rich text alongside an image |
| `textTwoColumns` | Text (2 columns) | `_textTwoColumns.twig` | Two-column rich text |
| `textVideo` | Text + Video | `_textVideo.twig` | Rich text alongside a video |
| `video` | Video | `_video.twig` | Embedded video |

The other partials in `_site/_snippet/_content/` (`_hero`, `_intro`, `_pageTitle`, `_defaultHeader`, `_socialMedia`, `_socialShare`) are page chrome, rendered outside the Content Builder loop — not blocks.

**Block background colours** are driven by `config/config-values-field.php` (`Background colors` → `section--default` / `section--light` / `section--primary`); the stored value is the CSS class applied directly in the dispatcher.

See `./content-builder-blocks.md` for the full per-block field reference (every field's handle, type, and whether it's required).

**Adding a block:** create the Matrix block entry type (its `handle` becomes the template name) → add it to the `contentBuilder` field's allowed entry types in `config/project/` → create `_blocks/_<handle>.twig`.

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
