# Image warming

`modules/statik/src/helpers/ImageWarmer.php`, job `jobs/WarmImages.php`, command `console/controllers/ImagesController.php`, hooks in `Statik.php`, tables from `migrations/ImageWarmerTables.php` (created by `ImageWarmer::ensureTables()`), setting `warmImages` in `config/custom.php` (`enabled`, `timeout` 300, `verifySsl`: off on dev for the DDEV certificate).

## Tables on a new install

A module has no install migration and `craft install` doesn't run content migrations, but it applies the project config: `ImageWarmer::ensureTables()` on `ProjectConfig::EVENT_AFTER_APPLY_CHANGES` creates the missing tables (schema in `migrations/ImageWarmerTables.php`), also on `craft up` / `project-config/apply`. The content migration delegates to the same class for projects from before. Should the tables still be missing (`tablesExist()`, checked once per request), warming runs without recording and a warning asks for `craft project-config/apply --force`: an entry save never fails on them.

## Why

Without `generateTransformsBeforePageLoad`, a transform that doesn't exist yet renders as `/actions/assets/generate-transform?transformId=…` (Craft also queues a `GenerateImageTransform` job at priority 2048 and sends no-cache headers), and `TemplateCaches` refuses to store output containing that URL. The first visitor's browser makes PHP generate the versions (AVIF of a large original: seconds), and the page stays uncached until all exist.

## Warm request

A GET of the page with header `X-Statik-Warm-Images` = `hash_hmac('sha256', 'statik-warm-images', securityKey)` (and `X-Statik-Warm-Url` = the URL the job asked for, stored instead of the request's own URL, which can differ behind a proxy). In `Statik::init()` (site requests): `prepareWarmRequest()` sets `generateTransformsBeforePageLoad = true` and `App::maxPowerCaptain()`; the language redirect is skipped. The job sends `Accept-Language` = the site's language, no redirects followed, and for Knock Knock (site password on staging/production) a valid access cookie: `AccessTokenHelper::create()` per site, signed like Craft cookies (`security->hashData(serialize([$name, $token]), securityKey)`). 404/410 → the page is forgotten.

## Which pages: element cache tags

- **Recording**: in a warm request, `View::EVENT_BEFORE_RENDER_PAGE_TEMPLATE` → `Elements::startCollectingCacheInfo()`, `EVENT_AFTER_RENDER_PAGE_TEMPLATE` → `stopCollectingCacheInfo()` and save (status 200). Save there, not on `EVENT_AFTER_REQUEST`: Craft renders the page template while sending the response, after that event. Tags come from every element query (`ElementQuery::afterPrepare()`: `element::<type>::section:5`, `element::<id>` for ID queries, owner IDs for nested queries) and every element used in Twig (`helpers/Template.php`: `element::<id>`); a `{% cache %}` hit adds its stored tags. Stored per URL in `statik_warmpages` (url, urlHash unique, siteId, dateWarmed) and `statik_warmtags` (pageId, tag; index on tag).
- **Reacting**: `Elements::EVENT_INVALIDATE_CACHES` (tags from `invalidateCachesForElement()`: `element::<id>`, the owner's ID, `element::<type>::*`, `getCacheTags()` such as section/entryType/volume) → the pages with one of the tags → `queueUrl()`. Plus `Entry::EVENT_AFTER_SAVE` → the entry's own URL (a new entry has no record yet).
- **Not matched** (`isMatchable()`): `element`, `element::<type>`, `element::<type>::*` (every save of the type, drafts included), `…::drafts`, `…::revisions`, `…::field:<id>` (every page's content builder query has it; its owner `element::<id>` picks out the page). Not during a warm request (its own saves), not for `resaving` elements.
- Measured: a news item save → 67 pages (every news item via related news, the overview, a page with a news Overview column; 3 sites); a new focal point → the 33 pages rendering that image; a partner → 42 showcase pages; a draft → 0.

## Queue

`queueUrl()` pushes immediately (priority 1024, delay 5 s so the save is committed, ttr = timeout + 60), deduplicated per process for 60 s. Without a queue daemon Craft runs the queue only while the CP is open. The web server's timeout (nginx `fastcgi_read_timeout`) must allow a slow warm request.

## Command

`ddev craft statik/images/warm [--site=nl] [--section=news] [--queue]`: every live entry with a URL; fills the record (run after a deploy). Redirects (pages for logged-in users) are skipped. Not covered: pagination and search pages, entries that go live on a schedule (no save, no invalidation): run `warm --queue` daily from cron for those.
