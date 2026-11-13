# Craft Configuration Details

## config/general.php

Uses legacy multi-environment array syntax with `'*'`, `'production'`, `'staging'`, `'dev'` keys.

**Global settings (`*`):**
- `enableGql` => false (GraphQL disabled)
- `defaultWeekStartDay` => 1 (Monday)
- `defaultTokenDuration` => 'P10D' (10 days)
- `defaultCpLocale` => 'nl-BE'
- `addTrailingSlashesToUrls` => true
- `useEmailAsUsername` => true
- `enableCsrfProtection` => true
- `omitScriptNameInUrls` => true
- `postCpLoginRedirect` => 'entries'
- `maxRevisions` => 10
- `defaultCpLanguage` => 'en'
- `securityKey` => from env (uses `getenv()`)
- `elevatedSessionDuration` => 360000 (seconds — ~100 hours, unusually long)
- `verificationCodeDuration` => 'P3W' (3 weeks)
- `transformGifs` => false
- `preserveImageColorProfiles` => true
- `preserveCmykColorspace` => true
- `defaultSearchTermOptions` => substring matching both sides

**Production:**
- Template caching ON, backups ON
- `allowAdminChanges` => CLI only (`php_sapi_name() === 'cli'`)
- `baseUrl` alias from env

**Staging:**
- Template caching ON, backups OFF
- `testToEmailAddress` from DEBUG_EMAIL env
- `allowAdminChanges` => CLI only

**Dev:**
- Template caching OFF, backups OFF, devMode ON
- `baseUrl` alias from env

**Conditional public account flow** (when `PUBLIC_ACCOUNT_FLOW` env is set):
- `loginPath`: nl=/aanmelden, fr=/inscrivez-vous, en=/login
- `setPasswordPath`: nl=/wachtwoord-vernieuwen, fr=/renouveler-mot-de-passe, en=/renew-password
- `activateAccountSuccessPath`: nl=/registratie-voltooid, fr=/inscription-terminee, en=/registration-completed
- `setPasswordSuccessPath`: nl=/wachtwoord-ingesteld, fr=/mot-de-passe-ensemble, en=/password-set

## config/app.php

Yii2 application config with multi-environment support.

**Global (`*`):**
- Registers `statik` module and bootstraps it
- Custom Monolog log target for 'statik' category (debug in dev, info in production)

**Production:**
- Mailer: Postmark adapter with `POSTMARK_API_KEY` env
- DB: optional profiling via `DB_PROFILING` env

**Staging:**
- Mailer: Postmark adapter

**Dev:**
- Mailer: Local SMTP on 127.0.0.1:1025 (for Mailhog/Mailpit)

## config/db.php

Legacy array syntax returning DSN, driver, server, port, database, user, password, schema, tablePrefix — all from `App::env()`.

## config/custom.php

Custom settings accessible via `Craft::$app->config->custom`:
- `maintenanceMode` => false (toggles CP lockdown in statik module)
- `gridbuilderShowcaseSlug` => `gridbuilder` (slug of the page in the Pages section that holds the content row showcase, see the `updating-contentbuilder-showcase` skill)
- `cse` => Google Custom Search Engine IDs per language (nl, fr, en) — currently test values; nothing in the base install reads it, kept for projects that use Google CSE

## Plugin Configs

Located in `config/` (one file per plugin, named after the plugin handle, laid over the plugin's default settings; multi-environment aware like `general.php`):
- `vite.php` — Vite dev server and build settings (manifest per site, see `MULTISITE.MD`)
- `config-values-field.php` — Config Values: options of the Config Values fields (background colours, link styles, image grid options, related items per overview source)
- `craft-sentry.php` — Sentry error tracking (production only)
- `element-index-defaults.php` — Default element index views
- `entry-anchors.php` — Entry Anchors (the `blockTitle` anchor field, `anchor_id()`)
- `formie.php` — Formie theme config: the Tailwind classes on every form
- `headings-checker.php` — Headings Checker (heading order check on save; `rowHeadings`)
- `image-resizer.php` — Image resize settings
- `knock-knock.php` — Password protection for staging and production (`SITE_PASSWORD`)
- `link-checker.php` — Link Checker (`knownAnchors`, `internalHosts`, external checks)
- `markerio.php` — Marker.io visual feedback
- `password-policy.php` — Password policy rules
- `seo-fields.php` — SEO fields configuration
- `translate.php` — Translate (`storeInDatabase`: editors' changes in the database, on top of `translations/`)
- `trinity.php` — Trinity content rows (column widths per type, blocked combinations, page widths, row spacing and background fields), see `./content-row.md`

Other project files in `config/`:
- `overview-sources.php` — the "Overview options" sources (section, card, filters, related items), read by `columns/overview.twig`
- `routes.php` — site routes (empty in the base install)
- `scout.php` — not in the base install any more: an example config for Scout (Algolia), which several projects use and which may come back in the project setup. Get it from git with `git show 67ebe857^:config/scout.php` (see `plugin-ecosystem.md`)

