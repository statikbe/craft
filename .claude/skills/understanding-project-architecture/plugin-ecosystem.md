# Plugin Ecosystem

## Production Plugins

### Core & Content
| Plugin | Purpose |
|--------|---------|
| `craftcms/cms` | Craft CMS core |
| `craftcms/ckeditor` | Rich text editor (Simple, Standard, Extended variants) |
| `verbb/formie` | Form builder with stencils (config in `config/project/formie/`) |
| `verbb/hyper` | Hyperlink field type |
| `verbb/tablemaker` | Table field type |
| `verbb/expanded-singles` | Better singles management in CP |

### Navigation & Structure
| Plugin | Purpose |
|--------|---------|
| `studioespresso/craft-navigate` | Navigation management |

### Media & Images
| Plugin | Purpose |
|--------|---------|
| `nystudio107/craft-imageoptimize` | Image optimization with variant generation |
| `verbb/image-resizer` | Image resizing on upload |

### SEO
| Plugin | Purpose |
|--------|---------|
| `studioespresso/craft-seo-fields` | SEO metadata fields + redirects |

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
| `statikbe/craft-carbon-tracker` | Website carbon footprint tracking |
| `statikbe/craft-config-values` | Expose config values as field options |
| `statikbe/craft-cookie-banner` | GDPR cookie consent banner |
| `statikbe/craft-sentry` | Sentry error tracking integration |
| `statikbe/craft-translate` | Translation helpers |
| `statikbe/craft-video-parser` | Parse and embed videos (YouTube, Vimeo, etc.) |

### Email
| Plugin | Purpose |
|--------|---------|
| `craftcms/postmark` | Postmark transactional email adapter |

### Utilities
| Plugin | Purpose |
|--------|---------|
| `miranj/craft-obfuscator` | Email address obfuscation in templates |
| `hybridinteractive/craft-position-fieldtype` | Visual position picker field |
| `hybridinteractive/craft-width-fieldtype` | Width selector field |

### PHP Libraries (non-plugin)
| Package | Purpose |
|---------|---------|
| `jaybizzle/crawler-detect` | Bot/crawler detection |
| `vanderlee/syllable` | Syllable counting for hyphenation |
| `mikehaertl/php-shellcommand` | Shell command execution |
| `vlucas/phpdotenv` | .env file loading |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| `craftcms/ecs` | Easy Coding Standard for Craft projects |
| `craftcms/phpstan` | PHPStan config for Craft projects |

## Unconfigured / Optional

- **Scout (Algolia)**: Config file exists at `config/scout.php` but API keys are empty in `.env`. Not listed in `composer.json` — may have been removed or is installed differently.
