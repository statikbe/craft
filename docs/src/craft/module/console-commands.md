# Console commands

Run them in DDEV: `ddev craft <command>`.

| Command                                  | What it does                                                   |
| ---------------------------------------- | -------------------------------------------------------------- |
| `statik/setup`                           | Sets up a new project: `.env` values, project code, git        |
| `statik/setup/install-translation-files` | Copies `setup-translations/` into `translations/`              |
| `statik/dummy-content`                   | Lists the dummy content types                                  |
| `statik/dummy-content/<type>`            | Creates dummy news, events, knowledge base items, people or partners |
| `statik/dummy-content/clean <type>`      | Removes the dummy content of a type                            |
| `statik/contentbuilder`                  | Generates the content row showcase: see [Generating it](../showcase/generating) |
| `statik/contentbuilder-cleanup`          | Removes the showcase: see [Removing it](../showcase/removing)  |

## statik/setup

```bash
ddev craft statik/setup
```

Creates a security key when `.env` has none. Then, when Craft is installed and the command runs interactively, it asks for:

1. **System name**: `SYSTEM_NAME` in `.env`.
2. **Project code**: replaces `[PROJECT_CODE_HERE]` (in lowercase) in `config/htaccess-staging`, `config/htaccess-production`,
   `deploy.php`, `hosts.yml` and `bitbucket-pipelines.yml`.
3. **Front-end account flow**: keep it (`PUBLIC_ACCOUNT_FLOW=1`), or remove it: deletes the account sections (Login,
   Register, Profile, Edit profile, the password pages, …) and `templates/_site/pages/account`, and sets `PUBLIC_ACCOUNT_FLOW=0`.
   See [Accounts](../content/accounts).
4. **Postmark**: `POSTMARK_API_KEY`, and `DEBUG_EMAIL`, the address that receives every mail on staging.
5. **reCAPTCHA**: `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`, and `RECAPTCHA_ENABLED=true`, which turns on Formie's
   reCAPTCHA captcha. See [Forms](../content/forms).
6. **Git**: `git init`, a remote, and `git flow init -d` when git-flow is installed.

Every question can be skipped. Craft isn't installed yet: the command stops after the security key.

### install-translation-files

```bash
ddev craft statik/setup/install-translation-files
```

`translations/` is gitignored in the base install; the tracked translations are in `setup-translations/`. This copies them
into `translations/`, but only when that folder is empty, so it never overwrites translations. See
[Translations](../templates/translations).

## statik/dummy-content

Fills overviews and cards with test content, so you can check a listing, a filter or pagination without writing content.

```bash
ddev craft statik/dummy-content/news --count=20 --categories --category-count=6
ddev craft statik/dummy-content/calendar --count=12 --categories
ddev craft statik/dummy-content/knowledge-base --count=12 --categories
ddev craft statik/dummy-content/team --count=8
ddev craft statik/dummy-content/partners --count=8
ddev craft statik/dummy-content/clean news --categories
```

| Type             | Section         | Categories                | What an item gets                                                                                  |
| ---------------- | --------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| `news`           | `news`          | `newsCategories`          | Post date (newest first, a few days apart), header image, intro, 1–2 categories, content rows (text, text next to an image, a quote on every other item) |
| `calendar`       | `calendar`      | `calendarCategories`      | Header image, intro, a category, location, organisation, often a price, one date. The first event has ended, the second is ongoing, the others follow over the coming weeks |
| `knowledge-base` | `knowledgeBase` | `knowledgeBaseCategories` | Date added, header image, intro, 1–2 categories, content rows                                       |
| `team`           | `team`          | –                         | First and last name, mostly a photo, job title, email address on example.com, sometimes a phone number |
| `partners`       | `partners`      | –                         | Name, a generated SVG logo (five shapes), mostly a website                                          |

### Options

| Option             | Default | Effect                                                                         |
| ------------------ | ------- | ------------------------------------------------------------------------------ |
| `--count`          | `12`    | How many items to create                                                       |
| `--categories`     | off     | Also create dummy categories; without it, items get the categories that exist  |
| `--category-count` | `6`     | How many dummy categories, with `--categories`                                 |
| `--keep`           | off     | Keep the dummy items of an earlier run instead of replacing them               |
| `--dry-run`        | off     | Only show what would be created or removed                                     |
| `--seed`           | `1`     | Seed for the random choices (images, dates, categories), so a run can be repeated |

`clean` takes `--categories` and `--dry-run`.

### What it touches

- Generated items and categories get a slug that starts with `dummy-`. A new run removes only those (unless `--keep`) and
  `clean` deletes only those, permanently. Content an editor made is never touched.
- Items are created in the primary site and enabled on every site of their section.
- Texts come from `config/dummy-content/content.json`, one key per type (titles, intros, sections, categories, names, …).
  Edit it to give the dummy content a project's tone.
- Images are picked from the existing image assets (no SVGs); text next to an image gets a landscape one. Partner logos are
  generated as `dummy-logo-<name>.svg` in the logo field's volume.

### A new type

Add a subclass of `DummyContentType` in `helpers/dummycontent/`, list it in `DummyContentController::TYPES`, add an
action, and add its texts to `content.json`.

## Source

- `modules/statik/src/console/controllers/SetupController.php`
- `modules/statik/src/console/controllers/DummyContentController.php`
- `modules/statik/src/helpers/dummycontent/`
- `config/dummy-content/content.json`
