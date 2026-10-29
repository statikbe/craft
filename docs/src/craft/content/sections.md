# Sections

The base install has 32 sections. Every section is enabled in the three sites (`nl` primary, `en`, `fr`); the URIs below
are the Dutch site's unless a section has its own per site.

## Pages and overviews

| Section          | Handle                   | Type      | URI format                 | Template                       | Entry type           |
| ---------------- | ------------------------ | --------- | -------------------------- | ------------------------------ | -------------------- |
| Home             | `home`                   | single    | `__home__`                 | `_site/pages/home`                  | `home`               |
| Pages            | `pages`                  | structure | `{parent.uri}/{slug}`      | `_site/pages/page`           | `pages`              |
| Contact          | `contact`                | single    | `{slug}`                   | `_site/pages/contact`               | `contact`            |
| News overview    | `newsOverview`           | single    | `{slug}`                   | `_site/pages/news/index`           | `newsOverview`       |
| Calendar overview | `calendarOverview`      | single    | `{slug}`                   | `_site/pages/calendar/index`       | `calendarOverview`   |
| Knowledge base overview | `knowledgeBaseOverview` | single | `{slug}`                | `_site/pages/knowledgeBase/index`  | `knowledgeBaseOverview` |
| Search results   | `searchResults`          | single    | `{slug}`                   | `_site/pages/search.twig`    | `searchResults`      |

`home` has the hero (see [Hero, page header and intro](./hero)) and the content builder. `pages` ("Content builder page") has a
header image, intro and the [content builder](./content-builder). These entry types, and those of the overviews and their
items, have an *Overview* tab (overview title, description and image, used on cards) and an *SEO* tab.

## News, calendar and knowledge base

| Section                    | Handle                    | Type      | URI format                    | Template                       | Entry type          |
| -------------------------- | ------------------------- | --------- | ----------------------------- | ------------------------------ | ------------------- |
| News items                 | `news`                    | channel   | `{overview slug}/{slug}`      | `_site/pages/news/entry`           | `news`              |
| News categories            | `newsCategories`          | structure | no URLs                       |                                | `category`          |
| Calendar                   | `calendar`                | channel   | `{overview slug}/{slug}`      | `_site/pages/calendar/entry`       | `event`             |
| Calendar categories        | `calendarCategories`      | structure | no URLs                       |                                | `category`          |
| Knowledge base             | `knowledgeBase`           | channel   | `{overview slug}/{slug}`      | `_site/pages/knowledgeBase/entry`  | `knowledgeBaseItem` |
| Knowledge base categories  | `knowledgeBaseCategories` | structure | no URLs                       |                                | `category`          |

The category structures go 3 levels deep.

### Items follow their overview's slug

The items' URI starts with the slug of their overview single, in the same site:

```twig
{{craft.entries.section('newsOverview').siteId(object.siteId).status(null).one().slug}}/{slug}
```

Craft only builds that URI when an item is saved. So when an editor changes an overview's slug, the Statik module queues a
*Resave elements* job for the items of that overview in that site ("Updating the URLs of the news items"); drafts and
revisions don't trigger it. The pairs are in `Statik::OVERVIEW_ITEM_SECTIONS`:

| Overview                | Items           |
| ----------------------- | --------------- |
| `newsOverview`          | `news`          |
| `calendarOverview`      | `calendar`      |
| `knowledgeBaseOverview` | `knowledgeBase` |

Add a pair there when you add an overview with its own items.

## Team and partners

| Section  | Handle     | Type      | URI format | Entry type |
| -------- | ---------- | --------- | ---------- | ---------- |
| Team     | `team`     | structure | no URLs    | `person`   |
| Partners | `partners` | structure | no URLs    | `partner`  |

Flat structures (1 level), so editors set the order. They are shown through the Team, Person and Partners columns of the
[content builder](./content-builder).

## Account pages

Singles with the `simplePage` entry type (title, intro, SEO) and a fixed URI per site. See [Accounts](./accounts) for the flow.

| Section                      | Handle                       | NL                              | EN                              | FR                                     |
| ---------------------------- | ---------------------------- | ------------------------------- | ------------------------------- | -------------------------------------- |
| Login                        | `login`                      | `aanmelden`                     | `login`                         | `inscrivez-vous`                       |
| Register                     | `register`                   | `registreren`                   | `register`                      | `registrer`                            |
| Confirm your account         | `confirmAccount`             | `bevestig-je-account`           | `confirm-your-account`          | `confirmez-votre-compte`               |
| Registration completed       | `registrationCompleted`      | `registratie-voltooid`          | `registration-completed`        | `inscription-terminee`                 |
| Profile                      | `profile`                    | `profiel`                       | `profile`                       | `profile`                              |
| Edit profile                 | `editProfile`                | `profiel/bewerken`              | `profile/edit`                  | `profile/modifier`                     |
| Edit password                | `editPassword`               | `profiel/wachtwoord-wijzigen`   | `profile/edit-password`         | `profile/changer-le-mot-de-passe`      |
| Forgot password              | `forgotPassword`             | `wachtwoord-vergeten`           | `forgot-password`               | `mot-de-passe-oublie`                  |
| Forgot password confirmation | `forgotPasswordConfirmation` | `wachtwoord-vergeten-bevestiging` | `forgot-password-confirmation` | `mot-de-passe-oublie-confirmation`     |
| Set password                 | `setPassword`                | `wachtwoord-vernieuwen`         | `renew-password`                | `renouveler-mot-de-passe`              |
| Set password confirmation    | `setPasswordConfirmation`    | `wachtwoord-ingesteld`          | `password-set`                  | `mot-de-passe-ensemble`                |

## System pages

Singles with the `pages` entry type, so editors fill them like a content page.

| Section                 | Handle                   | URI format | Template             |
| ----------------------- | ------------------------ | ---------- | -------------------- |
| Page not found          | `pageNotFound`           | `404`      | `404`                |
| System offline          | `systemOffline`          | `503`      | `503`                |
| Privacy policy          | `privacyPolicy`          | `{slug}`   | `_site/pages/page` |
| Cookie policy           | `cookiePolicy`           | `{slug}`   | `_site/pages/page` |
| Accessibility statement | `accessibilityStatement` | `{slug}`   | `_site/pages/page` |

## Site settings

`siteSettings` is a single without URLs (entry type `siteSettings`) for the settings of each site, such as the GTM snippets
(`gtmHead`, `gtmBody`) and the image the layout uses.

`_site/layout.twig` reads it once per site and caches it for an hour under `layout-siteSettings-<site id>`. The Statik module
deletes that cache key when the entry is saved, so changes show straight away. A new global single needs the same: add it next
to `siteSettings` in the `Entry::EVENT_AFTER_SAVE` handler.

## Source

- `config/project/sections/`
- `modules/statik/src/Statik.php`: `OVERVIEW_ITEM_SECTIONS`, the `Entry::EVENT_AFTER_SAVE` handler
- `templates/_site/layout.twig`
