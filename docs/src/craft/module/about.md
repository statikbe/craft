# What the module does

The `statik` module (`modules/statik`) holds the project code that isn't a plugin. `config/app.php` loads it on every
request (`'bootstrap' => ['statik']`) and gives it its own log target: messages in the `statik` category go to
`storage/logs/statik-*.log`, at debug level in dev mode and info level otherwise.

## Language redirect

On the front end, `LanguageService` (available as `Statik::getInstance()->language`) sends visitors to the site in their
language when they arrive on the homepage.

1. **`?lang=<site handle>`** on any front-end URL stores that site in the `__language` cookie (30 days). The language switcher
   (`components/frame/nav/language.twig`) adds it to its links, so a visitor's choice wins over the browser's languages.
2. **Only the homepage, only from outside**: the redirect runs for GET requests to the root (`/`) without a referrer or with a
   referrer from another host. A visitor who clicks to the homepage from within the site is never redirected.
3. **The cookie first**: when the `__language` cookie names another site in the same site group, the visitor goes to that
   site's base URL. Sites in other groups (another website in the same install) are never redirect targets.
4. **Then the browser**: without a cookie, the `Accept-Language` header is matched against the languages of the sites in the
   current group, on the full language (`nl-BE`) and on the language alone (`nl`). The first match in the visitor's order of
   preference sets the cookie and redirects. No match, or no header at all (bots, monitoring): no redirect.

## Maintenance mode for the control panel

With `maintenanceMode` on in `config/custom.php` (see [Custom config files](./config-files#custom-php)):

- every control panel request is redirected to `/admin/logout`, except the login page, the login action and logout;
- logging in throws a 503 "The control panel is temporarily locked for maintenance."

So editors can't work in the control panel while you migrate or deploy, and see why. The front end isn't affected.

## Security headers

Every web response gets:

| Header                   | Value          |
| ------------------------ | -------------- |
| `X-Frame-Options`        | `SAMEORIGIN`   |
| `X-XSS-Protection`       | `1; mode=block` |
| `X-Content-Type-Options` | `nosniff`      |

`Strict-Transport-Security` is ready in `setHttpHeaders()` but commented out: turn it on per project once the domain and
its subdomains are HTTPS only.

## After an entry is saved

- **Site settings**: saving the Site settings entry clears its cache (`layout-siteSettings-<site id>`), which the layout
  keeps so it doesn't query the settings on every page. Another global section with a cache needs the same line.
- **Overview slug**: when the slug of News overview, Calendar overview or Knowledge base overview changes, a queue job
  resaves the items of its section (`news`, `calendar`, `knowledgeBase`) in that site, because their URIs start with the
  overview's slug. The map is `Statik::OVERVIEW_ITEM_SECTIONS`. Drafts and revisions don't trigger it.

## Formie

- **Fields left out**: the Address, Group, Section, Repeater, Tags and Users fields aren't offered in the form builder.
- **Multi-select dropdowns** get `data-autocomplete`, so they use the frontend's
  [Autocomplete](../../frontend/components/autocomplete) component instead of a native multiple select.

## Control panel

- **Nav items**: when `allowAdminChanges` is on (in dev), the control panel nav gets Fields, Entry types and Sections, the
  settings pages you open most while building.
- **Stylesheet**: `StatikAsset` adds `assetbundles/Statik/dist/css/Statik.css` to every control panel page (the green
  Save buttons).
- **Template root**: templates in `modules/statik/templates` (when that folder exists) can be rendered in the control panel
  as `statik/...`.
- **Translations**: the `statik` translation category reads `modules/statik/src/translations/<language>/statik.php`.

## Assets

Uploaded files get a lowercase extension (`Photo.JPG` → `Photo.jpg`), so transforms and URLs don't depend on the camera's
casing.

## Content builder

- **"Page section" condition rule** for field conditions in nested entry types: see [Condition rules](./condition-rules).
- **Page widths**: the module tells Trinity which pages render the content builder narrower than the page (the 2/3 and 3/4
  pages of the content row showcase). See [Content builder showcase](../showcase/about).

## Twig and variables

The module registers the project's Twig extensions (see the [quick reference](../twig/custom-filters)) and the
[`craft.statik` variable](../twig/statik-variable).

## Console commands

See [Console commands](./console-commands).

## Source

- `modules/statik/src/Statik.php`
- `modules/statik/src/services/LanguageService.php`
- `modules/statik/src/assetbundles/Statik/`
- `config/app.php` (module, log target)
