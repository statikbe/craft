# Environments and .env

Every environment has its own `.env` file in the project root (on a server: the shared `.env`). `.env.example` lists all
variables; `.env` itself is not in Git. `CRAFT_ENVIRONMENT` picks the environment block in the config files: `dev`,
`staging` or `production`.

## Variables

| Variable                                  | What it does                                                                                      | Used in                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `CRAFT_ENVIRONMENT`                       | `dev`, `staging` or `production`: which block of the config files applies                         | Craft, `config/*.php`                           |
| `CRAFT_APP_ID`                            | Unique ID for sessions, caches and mutex locks. Filled in by `setup/welcome`                      | Craft                                           |
| `CRAFT_SECURITY_KEY`                      | Key for hashing and encryption. Filled in by `setup/welcome`; the same on every environment of a project. Older `.env` files call it `SECURITY_KEY`, which still works | `config/general.php`                    |
| `CRAFT_DB_DRIVER` … `CRAFT_DB_TABLE_PREFIX` | Database connection. The DDEV defaults are in `.env.example`                                    | Craft                                           |
| `SYSTEM_NAME`                             | The system name in the control panel, the sender name of mails and the app name of the favicon    | `project.yaml` (`system.name`, `email.fromName`), `frontend/vite-favicon.config.js` |
| `SYSTEM_EMAIL`                            | The sender address of every mail. Required: without it Craft can't send mail                       | `project.yaml` (`email.fromEmail`)              |
| `POSTMARK_API_KEY`                        | The Postmark server token, for mail on staging and production                                       | `config/app.php`                                |
| `DEBUG_EMAIL`                             | On staging, every mail goes to this address instead of the real recipient (`testToEmailAddress`)    | `config/general.php`                            |
| `RECAPTCHA_ENABLED`                       | `true` turns on Formie's reCAPTCHA (v3) captcha. Each form also needs it on in its Spam settings    | Formie captcha settings (`project.yaml`), `statik/setup` |
| `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | The reCAPTCHA keys, set by `statik/setup`                                                      | Formie captcha settings (`project.yaml`)        |
| `BASE_URL`                                | The `@baseUrl` alias the sites' base URLs start from, e.g. `https://example.be`                     | `config/general.php`                            |
| `PUBLIC_ACCOUNT_FLOW`                     | `1`: front-end login, register and password pages, with their paths per language. Empty or `0`: none | `config/general.php`, `statik/setup`         |
| `FRONTEND_DEV`                            | `true` loads the CSS and JS from the Vite dev server (only on `dev`)                                | `config/vite.php`                               |
| `SITE_PASSWORD`                           | The password of the front end on staging and production                                            | `config/knock-knock.php`                        |

Two variables aren't in `.env.example` but are read when they're there:

| Variable         | What it does                                                         | Used in                  |
| ---------------- | -------------------------------------------------------------------- | ------------------------ |
| `ENVIRONMENT`    | Older name of `CRAFT_ENVIRONMENT`; `dev` also enables the dev server | `config/vite.php`        |
| `SENTRY_RELEASE` | The release name sent to Sentry                                       | `config/craft-sentry.php` |

::: tip
`project.yaml` stores `$SYSTEM_EMAIL` and `$SYSTEM_NAME`, not their values. A server whose `.env` lacks one of them gets an
empty sender, and every mail fails with `Email "" does not comply with addr-spec of RFC 2822`.
:::

## Differences per environment

|                                | `dev`                         | `staging`                         | `production`                      |
| ------------------------------ | ----------------------------- | --------------------------------- | --------------------------------- |
| `devMode`                      | on                            | off                               | off                               |
| Template caching (`{% cache %}`) | off                         | on                                | on                                |
| `allowAdminChanges`            | on (Craft's default)          | only on the command line          | only on the command line          |
| `backupOnUpdate`               | off                           | off                               | on                                |
| `testToEmailAddress`           | –                             | `DEBUG_EMAIL`                     | –                                 |
| Mail transport                 | SMTP to `127.0.0.1:1025` (Mailpit in DDEV) | Postmark (`POSTMARK_API_KEY`) | Postmark (`POSTMARK_API_KEY`) |
| Knock Knock password           | off                           | on (`SITE_PASSWORD`)              | on (`SITE_PASSWORD`)              |
| Sentry                         | off                           | off                               | on                                |
| Vite dev server                | when `FRONTEND_DEV=true`      | never                             | never                             |

`allowAdminChanges` only on the command line means: on staging and production nobody can change sections, fields or
plugin settings in the control panel; the changes come from the project config with `craft up` on deploy.

The settings for every environment (`'*'`) are in `config/general.php` too: for example `useEmailAsUsername`,
`addTrailingSlashesToUrls`, `maxRevisions` (10), `defaultCpLocale` (`nl-BE`), `defaultCpLanguage` (`en`) and
`postCpLoginRedirect` (`entries`).

## Mail locally

DDEV comes with [Mailpit](https://mailpit.axllent.org/): every mail Craft sends locally lands there.

```bash
ddev launch -m
```

## Frontend dev server

`config/vite.php` uses the Vite dev server (`https://localhost:3000`) when the environment is `dev` and `FRONTEND_DEV` is
set. Start it with `yarn watch` in `frontend/`. Without `FRONTEND_DEV`, the site loads the built files from
`public/frontend/` (`yarn prod`).

## Source

- `.env.example`
- `config/general.php`, `config/app.php`
- `config/vite.php`, `config/knock-knock.php`, `config/craft-sentry.php`
