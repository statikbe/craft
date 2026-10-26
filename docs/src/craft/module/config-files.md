# Custom config files

Next to Craft's own `general.php`, `db.php`, `app.php` and `routes.php` (empty), `config/` holds a few files of our own and
the config of the plugins.

## custom.php

Project settings that aren't Craft or plugin settings. Craft loads it as `Craft::$app->config->custom` (in Twig:
`craft.app.config.custom`). Multi-environment: `'*'` plus an environment key.

| Key                       | Default       | Read by                                                                                          |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `maintenanceMode`         | `false`       | `Statik.php`: locks the control panel, see [What the module does](./about#maintenance-mode-for-the-control-panel) |
| `gridbuilderShowcaseSlug` | `gridbuilder` | `helpers/ContentbuilderShowcase.php`: the slug of the showcase page, see [Content builder showcase](../showcase/about) |

```php
'*' => [
    'maintenanceMode' => true, // lock the control panel during a migration
],
```

## overview-sources.php

The sources of the Overview column (`_grid/_overview.twig`) and of the related items on news items, events and knowledge base
items, by the value of the column's "Overview options" field. One entry per source:

| Key                      | What                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `label`                  | The source in texts ("news", "events")                                                                         |
| `field`                  | The Entries field with the editor's own choice (`newsEntries`)                                                 |
| `section`, `orderBy`     | Where "Dynamically fill" takes the newest entries from                                                         |
| `fill: 'upcoming'`       | Fill with the soonest upcoming events instead (calendar); chosen events that have ended are left out          |
| `card`                   | The card template: `_item/_cards/_<card>`                                                                      |
| `filterLayout`           | The filter on the section's overview page: `top` (a bar above the results, 3 columns) or `side` (filters on the left, 2 columns) |
| `relatedField`, `related` | The Config Values field for Related items on a page in that section, and its options: `field` (shares an entry in that field, e.g. a category) or `attribute` (same value, e.g. `authorId`) |

Adding a relation is one line under `related`; the keys are stored in the content, so change a label freely, never a key. The
comment at the top of the file explains a new source with relations.

Read by `_grid/_overview.twig`, `_partials/_overview.twig`, `_partials/_filterOptions.twig`, `_partials/_filterSearch.twig`,
the overview pages (`_news/_index.twig`, `_calendar/_index.twig`, `_knowledgeBase/_index.twig`) and the detail pages
(`_news/_entry.twig`, `_calendar/_entry.twig`, `_knowledgeBase/_entry.twig`), with
`craft.app.config.getConfigFromFile('overview-sources')`, and by `config-values-field.php`.

## config-values-field.php

The datasets of the [Config Values](https://github.com/statikbe/craft-config-values) fields: a field picks a dataset by name
(`dataSet` in its settings) and shows its options.

| Dataset                 | Field                         | Options                                                                     |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `Related <label>`       | `relatedNews`, …              | Built from `related` in `overview-sources.php`: "Off" + the relation labels |
| `Background colors`     | `backgroundColor`             | Row backgrounds: CSS class ⇒ label, or a swatch colour                      |
| `CTA styles`            | `linkStyle`                   | Button and link classes ⇒ label                                              |
| `Image grid options`    | `imagesLayouts`               | The image grid shapes and their folder (`@webroot/image-grid/`)              |

A new background colour or button style is a line here plus its CSS. The empty `config/config-values-field/` folder isn't used.

## element-index-defaults.php

The config of [Element Index Defaults](https://github.com/verbb/element-index-defaults): the default columns of the element
indexes, per element type.

| Element type | Columns                                                               |
| ------------ | --------------------------------------------------------------------- |
| `Entry`      | Title, Date created, Author, Date updated, Revision creator, Link     |
| `Category`   | Title, Date created, Date updated                                     |
| `Asset`      | Title, Filename, Size, Date modified, Usage                           |

## Plugin configs

The other files configure a plugin; see [Default plugins](../plugins) for what each plugin does.

| File                  | Plugin                  |
| --------------------- | ----------------------- |
| `craft-sentry.php`    | Sentry (on in production only) |
| `entry-anchors.php`   | Entry Anchors           |
| `formie.php`          | Formie (the theme config: classes on every form) |
| `image-resizer.php`   | Image Resizer           |
| `knock-knock.php`     | Knock Knock (on in staging and production, password `SITE_PASSWORD`) |
| `markerio.php`        | Marker.io               |
| `password-policy.php` | Password Policy         |
| `seo-fields.php`      | SEO Fields              |
| `trinity.php`         | Trinity                 |
| `vite.php`            | Vite                    |

Other files in `config/`:

- `ckeditor/Simple.json`, `htmlpurifier/statik.json`: CKEditor and HTML Purifier configs that fields refer to.
- `htaccess-staging`, `htaccess-production`, `robots-staging`, `robots-production`: copied to `public/` per environment
  on deploy.
- `contentbuilder-showcase/`, `dummy-content/`: the content for the [showcase](../showcase/generating) and the
  [dummy content](./console-commands#statik-dummy-content).

## Source

`config/`
