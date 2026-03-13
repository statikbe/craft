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
- Template caching OFF, backups OFF
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
- `cse` => Google Custom Search Engine IDs per language (nl, fr, en) — currently test values

## Plugin Configs

Located in `config/`:
- `vite.php` — Vite dev server and build settings
- `scout.php` — Algolia search (needs API keys, currently unconfigured)
- `image-optimize.php` — Detailed image processor configs (jpegoptim, optipng, gifsicle, svgo, etc.)
- `ckeditor.php` — CKEditor field configuration
- `cta.php` — Call-to-action field layout
- `config-values-field.php` — Custom config value fields
- `craft-sentry.php` — Sentry error tracking
- `element-index-defaults.php` — Default element index views
- `image-resizer.php` — Image resize settings
- `knock-knock.php` — Password protection for non-production
- `markerio.php` — Marker.io visual feedback
- `password-policy.php` — Password policy rules
- `seo-fields.php` — SEO fields configuration
