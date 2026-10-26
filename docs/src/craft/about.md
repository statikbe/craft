# About the base install

The Craft base install is the starter project Statik uses for new Craft CMS 5 sites. You create a project from it with
Composer, and you get a working site with content model, templates, frontend build and plugins already set up. The
[README](https://github.com/statikbe/craft/blob/develop/README.MD) has the short version of the install.

## Assumptions

| What          | We assume                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Local dev     | [DDEV](https://ddev.com/) (PHP 8.4, Apache, MySQL 8.0), see `.ddev/config.yaml`                |
| Frontend      | [Vite](https://vite.dev/) and [Tailwind CSS 4](https://tailwindcss.com/), see the [frontend docs](/frontend/frontend) |
| Email         | [Postmark](https://postmarkapp.com/) on staging and production, Mailpit locally                 |
| Sites         | Three sites in one site group, with NL as the primary site                                      |
| Craft edition | Pro                                                                                             |

The three sites:

| Site | Handle | Language | Base URL       |
| ---- | ------ | -------- | -------------- |
| NL   | `nl`   | `nl-BE`  | `@baseUrl/nl`  |
| FR   | `fr`   | `fr-BE`  | `@baseUrl/fr`  |
| EN   | `en`   | `en-BE`  | `@baseUrl/en`  |

`@baseUrl` is the `BASE_URL` variable from `.env` (see [Environments and .env](./getting-started/environments)).

## What you get

- **Content model**: pages, news, a calendar, a knowledge base, team members, partners, the account pages and the system
  pages (404, 503, search results), each with its categories where it needs them. See [Sections](./content/sections).
- **Content builder**: pages are built from content rows of 1–3 columns, with the [Trinity](https://github.com/statikbe/craft-trinity)
  plugin. See [Content builder](./content/content-builder) and the [Content builder showcase](./showcase/about).
- **Templates**: a layout, header, footer, navigation, flyout, search, overviews with filters and detail pages. See
  [Templates](./templates/structure).
- **Twig functions and filters** of our own: icons, images, CTAs, pagination, phone numbers and more. See the
  [quick reference](./twig/custom-filters).
- **The Statik module** (`modules/statik`): language redirect, console commands for setup and dummy content, and more.
  See [What the module does](./module/about).
- **Plugins**: forms, SEO, navigation, cookie banner, translations, password protection on staging. See
  [Default plugins](./plugins).
- **Frontend**: Tailwind theme with design tokens, TypeScript components, kept up to date with Clint. See the
  [frontend docs](/frontend/frontend).
- **Translations** for the control panel and the front end in Dutch and French. See [Translations](./templates/translations).

## In these docs

| Section                                          | What's in it                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| [Getting started](./getting-started/setup)       | Setting up a new project, the `.env` variables, multisite        |
| [Plugins](./plugins)                             | The plugins we install by default, and why                        |
| [Content model](./content/sections)              | Sections, the content builder, hero, forms and accounts           |
| [Content builder showcase](./showcase/about)     | The demo pages with every column type, and how to (re)generate them |
| [Templates](./templates/structure)               | Folder structure, partials and macros, translations              |
| [Twig](./twig/custom-filters)                    | Our own Twig functions, filters, tests and the `craft.statik` variable |
| [Statik module](./module/about)                  | What the module does, console commands, condition rules, config files |
| [Code quality](./code-quality/guidelines)        | Code guidelines, ECS, PHPStan, Clint                             |
| [Working with Claude](./claude/skills)           | The project skills, and the Figma starter                        |
| [Release notes](./release-notes)                 | What's new and the changelog                                     |
