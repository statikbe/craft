# New project setup

Make sure [DDEV](https://ddev.com/) is installed and Docker is running before you start: the install starts DDEV and
fails when it can't.

## 1. Create the project

```bash
composer create-project statikbe/craft PATH
```

Composer installs the packages, then runs the `post-create-project-cmd` scripts from `composer.json`:

| Step                                  | What it does                                                   |
| ------------------------------------- | -------------------------------------------------------------- |
| copy `.env.example` → `.env`          | Only when there's no `.env` yet                                |
| copy `.gitignore.example` → `.gitignore` | The project's own `.gitignore`                              |
| `ddev config`                         | Asks for the DDEV project name and writes `.ddev/config.yaml` |
| `ddev start`                          | Starts the containers                                          |
| `ddev composer dump-autoload -o`      | Autoloads the Statik module (`modules\statik\`)                 |
| `ddev craft setup/welcome`            | Craft's own setup: app ID, security key, database, install     |

## 2. Craft's setup

`setup/welcome` asks for the database connection: the defaults Craft suggests (`127.0.0.1`, port `3306`, user `root`)
connect to the DDEV database. Then it installs Craft: an admin email and password, and the first site (keep `NL`,
`@baseUrl/nl` and `nl-BE`, the primary site of the project config).

Craft installs the plugins and applies the project config in `config/project/`: all sections, fields, sites and plugin
settings are there after the install.

## 3. The Statik setup

```bash
cd PATH
ddev craft statik/setup
```

It asks, in this order:

| Question                                | What it changes                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A new system name                       | `SYSTEM_NAME` in `.env` (the CP name, the mail sender name, the favicon app name)                    |
| The project code                        | Replaces `[PROJECT_CODE_HERE]` in `config/htaccess-staging`, `config/htaccess-production`, `deploy.php`, `hosts.yml` and `bitbucket-pipelines.yml` |
| Remove the frontend account flow?       | Yes: deletes the 11 account sections and `templates/_site/_account`, sets `PUBLIC_ACCOUNT_FLOW=0`. No: sets `PUBLIC_ACCOUNT_FLOW=1` |
| Use Postmark? Postmark API key          | `POSTMARK_API_KEY`                                                                                   |
| Email address for testing on staging    | `DEBUG_EMAIL` (only asked after a Postmark key)                                                      |
| Use reCAPTCHA? Site key, secret key     | `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_ENABLED=true`                               |
| Set up a git repo? Remote?              | `git init`, `git remote add origin …`, and `git-flow init -d` when git-flow is installed             |

See [Accounts](../content/accounts) for what the account flow is, and [Environments and .env](./environments) for every
variable.

## 4. Translations

The front-end translations (`website_name.php`) and the control panel translations are kept in `setup-translations/`;
`translations/` itself is not in Git. Copy them in once:

```bash
ddev craft statik/setup/install-translation-files
```

It only copies into an empty `translations/` folder, so it never overwrites translations you changed. See
[Translations](../templates/translations).

## 5. Frontend

```bash
cd frontend
nvm install   # the Node version in frontend/.nvmrc
yarn start
```

`yarn start` runs `ddev composer install`, `yarn install`, a production build and the Clint install, and sets up the Git
hooks in `.githooks/`. After that, `yarn watch` starts the Vite dev server (set `FRONTEND_DEV=true` in `.env`, see
[Environments and .env](./environments#frontend-dev-server)) and `yarn prod` builds for production. See the
[frontend docs](/frontend/frontend).

## What to change right away

- **Logo and favicon**: `frontend/img/site/logo.svg` and `frontend/img/site/favicon.svg`, then `yarn favicon`.
- **Theme**: colours, fonts, spacing and radii in `frontend/css/site/theme.css`, or export them from Figma (see
  [Figma](../claude/figma)).
- **Site names and URLs**: Settings → Sites. Remove the sites the project doesn't need.
- **Knock Knock**: the password for staging and production is `SITE_PASSWORD` in `.env`; the allowed IP addresses are in
  `config/knock-knock.php`.
- **Marker.io**: the project ID in `config/markerio.php`.
- **The showcase pages**: the content builder showcase is for development and demos. Remove it before go-live, see
  [Removing it](../showcase/removing).
- **Dummy content**: news, calendar, knowledge base, team and partners can be filled with dummy entries, see
  [Console commands](../module/console-commands).

## Working on an existing project

Clone the repo, copy `.env.example` to `.env` and fill it in, then:

```bash
ddev start
ddev import-db --file=dump.sql.gz   # a database dump from a colleague or a server
cd frontend && yarn start
ddev craft statik/setup/install-translation-files
```

## Source

- `composer.json` (`post-create-project-cmd`)
- `modules/statik/src/console/controllers/SetupController.php`
- `frontend/package.json` (`start`)
