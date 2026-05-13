---
name: understanding-project-architecture
description: Use this skill when working on this Craft CMS 5 project to understand its architecture, configuration patterns, plugin ecosystem, custom module, multi-site setup, and frontend build pipeline. Invoke when making changes to config, templates, modules, or plugins, or when answering questions about how this project is structured.
---

# Statik Craft CMS 5 Base Install

This is **statikbe/craft** — a Craft CMS 5 scaffolding package used internally by Statik.be for new projects.

## Quick Reference

- **Craft CMS**: ^5.9.4
- **PHP**: >=8.4
- **Database**: MySQL 8.0
- **Dev environment**: DDEV (`craft-base-install.ddev.site`)
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
tailoff/                    # Tailwind CSS utilities
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

## Plugins (26 production)

See `./plugin-ecosystem.md` for the full list with versions and purposes.

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

- **Vite** config in `vite.config.js` (+ `vite.config.site2.js` for multi-site)
- **Entry point**: `frontend/js/site.ts`
- **TailwindCSS v4** via `@tailwindcss/vite` plugin
- **Dev server**: `https://localhost:3000`
- **Output**: `public/frontend/`
- **Scripts**: `yarn watch` (dev), `yarn dev` / `yarn prod` (build), `yarn test-a11y`, `yarn test-html`

## Content Architecture

- **54 fields** (rich text, images, CTAs, videos, SEO, forms, tables, etc.)
- **25 entry types** (hero, CTA, FAQ, forms, news, pages, quotes, etc.)
- **26 sections** (mix of singles and channels/structures)
- **1 volume** (public files with optimized image handling, required alt text)

## Known Issues & Technical Debt

See `./known-issues.md` for a tracked list of issues found during inspection.

## Common Tasks

**Adding a new plugin:**
```bash
ddev composer require vendor/plugin-name
ddev craft plugin/install plugin-handle
```

**Running the frontend:**
```bash
yarn watch    # Dev with HMR
yarn prod     # Production build
```

**Code quality:**
```bash
ddev composer check-cs    # PHP coding standards
ddev composer fix-cs      # Auto-fix standards
ddev composer phpstan     # Static analysis
```
