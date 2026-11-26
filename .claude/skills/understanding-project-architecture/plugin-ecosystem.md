# Plugin Ecosystem

## Production Plugins

### Core & Content
| Plugin | Purpose |
|--------|---------|
| `craftcms/cms` | Craft CMS core |
| `craftcms/ckeditor` | Rich text editor (Simple, Standard, Extended variants) |
| `verbb/formie` | Form builder with stencils (forms and stencils in `config/project/formie/`, theme config in `config/formie.php`) |
| `verbb/expanded-singles` | Better singles management in CP |

### Navigation & Structure
| Plugin | Purpose |
|--------|---------|
| `studioespresso/craft-navigate` | Navigation management |

### Media & Images
| Plugin | Purpose |
|--------|---------|
| `verbb/image-resizer` | Image resizing on upload |

### SEO
| Plugin | Purpose |
|--------|---------|
| `studioespresso/craft-seo-fields` | SEO metadata fields + redirects |
| `statikbe/craft-headings-checker` | Checks the heading order of every page on save (`config/headings-checker.php`, `ddev craft headings-checker/check`) |
| `statikbe/craft-link-checker` | Finds broken internal and external links in the content (`config/link-checker.php`, `ddev craft link-checker/report`) |

### Security & Access
| Plugin | Purpose |
|--------|---------|
| `verbb/knock-knock` | Password protect non-production environments |
| `craftpulse/craft-password-policy` | Enforce password strength rules |

### Developer Tools
| Plugin | Purpose |
|--------|---------|
| `nystudio107/craft-vite` | Vite asset integration in Twig |
| `studioespresso/craft-dumper` | Debug dump helper |
| `verbb/element-index-defaults` | Customize default element index columns |
| `mostlyserious/craft-markerio` | Marker.io visual bug reporting widget |

### Statik Custom Plugins
| Plugin | Purpose |
|--------|---------|
| `statikbe/craft-config-values` | Expose config values as field options |
| `statikbe/craft-cookie-banner` | GDPR cookie consent banner |
| `statikbe/craft-entry-anchors` | Anchors: the `blockTitle` field type (`AnchorLink`, "Title (Anchor)") and `anchor_id()` (`config/entry-anchors.php`) |
| `statikbe/craft-sentry` | Sentry error tracking integration |
| `statikbe/craft-translate` | Static translations editable in the CP; editors' changes stored in the database on top of `translations/` (`config/translate.php`, `storeInDatabase`) |
| `statikbe/craft-trinity` | Content row block: row/column layouts in the content builder, validation, field conditions, CP layer (see `./content-row.md`) |
| `statikbe/craft-video-parser` | Parse and embed videos (YouTube, Vimeo, etc.) |

### Email
| Plugin | Purpose |
|--------|---------|
| `craftcms/postmark` | Postmark transactional email adapter |

### PHP Libraries (non-plugin)
| Package | Purpose |
|---------|---------|
| `jaybizzle/crawler-detect` | Bot/crawler detection |
| `giggsey/libphonenumber-for-php` | Phone number parsing and formatting for the `tel` filter |
| `vanderlee/syllable` | Syllable counting for hyphenation |
| `mikehaertl/php-shellcommand` | Shell command execution |
| `vlucas/phpdotenv` | .env file loading |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| `craftcms/ecs` | Easy Coding Standard for Craft projects |
| `craftcms/phpstan` | PHPStan config for Craft projects |

## Used on projects, not in the base install

- **Scout (Algolia)**: `studioespresso/craft-scout`, for search with Algolia on several projects. Not in `composer.json`: install
  it per project. The base install had an example `config/scout.php` (reading `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`,
  `ALGOLIA_SEARCH_KEY`); it and the `ALGOLIA_*` variables in `.env.example` were removed in the Rectangle release. Get the example
  back from git: `git show 67ebe857^:config/scout.php`.

## Removed plugins

Don't assume these are available; `composer.json` is the source of truth. Projects started before their removal may still have
them (see `WHATS-NEW.md`, "Removed and replaced").

| Plugin | Replaced by |
|---|---|
| Hyper (`verbb/hyper`) | Craft native: Link entries with the native Link field (`linkField` + `linkStyle`), rendered with `render_ctas()` |
| Table Maker (`verbb/tablemaker`) | Craft native: the Table column type (`cellTable`, a CKEditor table) |
| Position Fieldtype (`hybridinteractive/craft-position-fieldtype`) | Craft native: Button Group fields with icons only (custom icons from `config/icons/`, Craft 5.12 `customIconPath`); the stored values stayed the same |
| Width Fieldtype (`hybridinteractive/craft-width-fieldtype`) | Craft native: Button Group fields with icons only, as for Position |
| ImageOptimize (`nystudio107/craft-imageoptimize`) | Craft native image transforms in `render_image()` (AVIF + the original format) |
| Obfuscator (`miranj/craft-obfuscator`) | Our own code: the module's `obfuscate_emails` filter (`EmailExtension`) + `email.component.ts`, instead of `enkode_emails` (no inline scripts or `eval()`, works with a strict CSP) |
| Carbon Tracker (`statikbe/craft-carbon-tracker`) | Obsolete: we measure CO2 with our Karbon tool |
