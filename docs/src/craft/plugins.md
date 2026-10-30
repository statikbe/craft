# Default plugins

The plugins and libraries every new project starts with, from `composer.json`. Their settings are in the project config
(`config/project/project.yaml`, under `plugins`) and, for some, in a config file in `config/`, which wins over the
control panel.

## Statik plugins

Our own plugins. Their docs are in their repos.

| Plugin                                                                    | What it does                                                    | Config file                     |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| [Trinity](https://github.com/statikbe/craft-trinity)                      | Content rows of 1–3 columns in a Matrix field: the content builder | `config/trinity.php`         |
| [Entry Anchors](https://github.com/statikbe/craft-entry-anchors)          | Anchors on content blocks, and an anchor dropdown on Link fields | `config/entry-anchors.php`     |
| [Headings Checker](https://github.com/statikbe/craft-headings-checker)    | Checks the heading order of the content builder on publish, the heading outline in the sidebar, a dashboard widget. See [Heading order](./content/headings) | `config/headings-checker.php` |
| [Link Checker](https://github.com/statikbe/craft-link-checker)            | Finds broken links in the content (deleted, disabled or expired entries, deleted assets, own-site URLs that no longer exist, missing anchors) and lists the pages in a dashboard widget | `config/link-checker.php` |
| [Config Values Field](https://github.com/statikbe/craft-config-values)    | Dropdown fields whose options come from a config file            | `config/config-values-field.php` |
| [Cookie Banner](https://github.com/statikbe/craft-cookie-banner)          | The cookie banner and cookie settings modal                      | –                               |
| [Translate](https://github.com/statikbe/craft-translate)                  | Edit the static translations in the control panel                | –                               |
| [Sentry](https://github.com/statikbe/craft-sentry)                        | Sends errors to Sentry, on production only                        | `config/craft-sentry.php`       |
| [Video Parser](https://github.com/statikbe/craft-video-parser)            | Turns YouTube and Vimeo URLs into embeds                          | –                               |

## Third-party plugins

| Plugin | Why it's there | Config file | Good to know |
| ------ | -------------- | ----------- | ------------ |
| [CKEditor](https://github.com/craftcms/ckeditor) | The rich text fields | `config/ckeditor/`, `config/htmlpurifier/statik.json` | The editor CSS is built separately: `yarn ckeditor` in `frontend/` |
| [Formie](https://github.com/verbb/formie) | Forms: the contact form and the Form column | `config/formie.php` | `formie.php` holds the theme config: the Tailwind classes Formie renders. The contact form comes as a stencil per language (`contactForm_NL`, `_FR`, `_EN`). Its reCAPTCHA integration is off |
| [SEO Fields](https://github.com/studioespresso/craft-seo-fields) | Meta title, description and social images per entry, sitemap, robots.txt, redirects and 404 log | `config/seo-fields.php` | The field handle is `seo` |
| [Navigate](https://github.com/studioespresso/craft-navigate) | The menus | – | Two navigations: `mainNav` and `serviceNav` |
| [Vite](https://github.com/nystudio107/craft-vite) | Loads the frontend build, or the dev server locally | `config/vite.php` | See [Environments and .env](./getting-started/environments#frontend-dev-server) |
| [Knock Knock](https://github.com/verbb/knock-knock) | Password protection of the front end on staging and production | `config/knock-knock.php` | Off on `dev`. The password is `SITE_PASSWORD`; IPs in `allowIps` get in without one. The page is `templates/_knock-knock.twig` |
| [Postmark](https://github.com/craftcms/postmark) | Mail transport on staging and production | – (set in `config/app.php`) | Needs `POSTMARK_API_KEY` and a sender (`SYSTEM_EMAIL`) that Postmark accepts |
| [Image Resizer](https://github.com/verbb/image-resizer) | Shrinks uploaded images that are too large | `config/image-resizer.php` | Max 3500 × 3500 px, quality 100 |
| [Element Index Defaults](https://github.com/verbb/element-index-defaults) | The default columns of the entry, category and asset indexes | `config/element-index-defaults.php` | |
| [Expanded Singles](https://github.com/verbb/expanded-singles) | Lists every single on its own in the Entries sidebar | – | |
| [Password Policy](https://github.com/craftpulse/craft-password-policy) | Password rules for users | `config/password-policy.php` | At least 12 characters, with upper and lower case, numbers and symbols |
| [Marker.io](https://github.com/mostlyserious/craft-markerio) | The Marker.io feedback widget, for clients testing a site | `config/markerio.php` | Fill in the Marker.io project ID |
| [Position Fieldtype](https://github.com/hybridinteractive/craft-position-fieldtype) | Position fields with icons (left, right, …) | – | For example `imagePosition`, `authorImagePosition` |
| [Width Fieldtype](https://github.com/hybridinteractive/craft-width-fieldtype) | Width fields with predefined widths | – | For example `imageWidth` |
| [Dumper](https://github.com/studioespresso/craft-dumper) | `dump()` and `dd()` with Symfony's VarDumper, in Twig and PHP | – | For debugging only |

## Libraries

| Library | Used for |
| ------- | -------- |
| [libphonenumber-for-php](https://github.com/giggsey/libphonenumber-for-php) | The [`tel` filter](./twig/phone-extension) |
| [phpSyllable](https://github.com/vanderlee/phpSyllable) | The [`hyphenate` filter](./twig/hyphenate-extension) |
| [Crawler-Detect](https://github.com/JayBizzle/Crawler-Detect) | The `isBot` global of the [Statik extension](./twig/statik-extension) |
| [php-shellcommand](https://github.com/mikehaertl/php-shellcommand) | The Git steps of `statik/setup` |
| [phpdotenv](https://github.com/vlucas/phpdotenv) | Loads `.env` in `bootstrap.php` |

The development packages, `craftcms/ecs` and `craftcms/phpstan`, are on the [Tooling](./code-quality/tooling) page.

## Source

- `composer.json`
- `config/`
