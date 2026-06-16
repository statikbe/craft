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

## Content Architecture

Counts below are approximate snapshots — they drift as the project config changes, so treat them as orders of magnitude, not exact figures. The source of truth is `config/project/` (fields, entry types, sections, volumes).

- **~54 fields** (rich text, images, CTAs, videos, SEO, forms, tables, etc.)
- **~25 entry types** (hero, CTA, FAQ, forms, news, pages, quotes, etc.)
- **~26 sections** (mix of singles and channels/structures)
- **1 volume** (public files with optimized image handling, required alt text)

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
