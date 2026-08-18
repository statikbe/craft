# DDEV Configuration Reference

## Project Config (`.ddev/config.yaml`)

The main configuration file. Changes require `ddev restart` to take effect.

### Key Settings

| Setting | Current Value | Notes |
|---------|---------------|-------|
| `name` | `craft-base-install` | Project name, used in URLs |
| `type` | `craftcms` | Enables `ddev craft` command |
| `docroot` | `public` | Web root relative to project |
| `php_version` | `8.4` | PHP version in container |
| `webserver_type` | `apache-fpm` | Can be `nginx-fpm`, `apache-fpm`, or `nginx-gunicorn` |
| `database.type` | `mysql` | Can be `mysql`, `mariadb`, or `postgres` |
| `database.version` | `8.0` | Database version |
| `project_tld` | `local.statik.be` | Custom TLD (default is `ddev.site`) |
| `composer_version` | `2` | Composer major version |
| `upload_dirs` | `files`, `../node_modules` | Bind-mounted dirs (excluded from Mutagen) |
| `xdebug_enabled` | `false` | Use `ddev xdebug on/off` instead of this |
| `use_dns_when_possible` | `true` | DNS-based hostname resolution |

## Override Files (`config.*.yaml`)

Additional YAML files in `.ddev/` matching `config.*.yaml` are merged into the main config. Useful for:
- Developer-specific overrides (gitignored)
- Environment-specific settings

Use `override_config: true` in an override file to replace (not merge) values.

## Custom Commands

Place scripts in `.ddev/commands/` to create custom `ddev <command>` commands:

```
.ddev/commands/
├── host/       # Commands that run on the host machine
├── web/        # Commands that run in the web container
├── db/         # Commands that run in the db container
└── solr/       # Commands for additional services
```

### Custom Command Format

```bash
#!/bin/bash
## Description: What this command does
## Usage: command-name [options]
## Example: ddev command-name --flag

# Your script here
```

## PHP Configuration

Add custom PHP ini settings in `.ddev/php/`:
```ini
; .ddev/php/custom.ini
upload_max_filesize = 64M
post_max_size = 64M
memory_limit = 512M
```

## MySQL Configuration

Add custom MySQL settings in `.ddev/mysql/`:
```ini
; .ddev/mysql/custom.cnf
[mysqld]
max_allowed_packet = 64M
```

## Web Server Configuration

- Apache config: `.ddev/apache/apache-site.conf`
- Nginx config: `.ddev/nginx_full/nginx-site.conf`

## Environment Variables

Inject env vars into the web container via `config.yaml`:
```yaml
web_environment:
  - MY_VAR=my_value
  - ANOTHER_VAR=another_value
```

Or via `.ddev/.env.web` (gitignored by default).

## Exposing Extra Ports

For running additional services (e.g., Vite dev server on port 3000):
```yaml
web_extra_exposed_ports:
  - name: vite
    container_port: 3000
    http_port: 2999
    https_port: 3000
```

## Extra Daemons

Run background processes in the web container:
```yaml
web_extra_daemons:
  - name: "vite"
    command: "npm run watch"
    directory: /var/www/html
```

## Hooks

Run commands at specific lifecycle points:
```yaml
hooks:
  post-start:
    - exec: composer install
    - exec: php craft migrate/all
  post-import-db:
    - exec: php craft project-config/apply
```

## DDEV Addons

Install community addons for additional services:
```bash
ddev addon list                    # List installed addons
ddev addon list --all              # List available addons
ddev get ddev/ddev-redis           # Install Redis addon
ddev get ddev/ddev-elasticsearch   # Install Elasticsearch addon
ddev get ddev/ddev-memcached       # Install Memcached addon
```

## Provider Integrations

Configured in `.ddev/providers/`. This project includes templates for:
- Acquia (`acquia.yaml`)
- Platform.sh (`platform.yaml`)
- Pantheon (`pantheon.yaml`)
- Lagoon (`lagoon.yaml`)
- Upsun (`upsun.yaml`)

These enable `ddev pull <provider>` to sync databases and files from hosting environments.

## Mutagen Sync

Configured in `.ddev/mutagen/mutagen.yml`. Mutagen provides high-performance file sync on macOS. The `upload_dirs` setting excludes large directories (like `files` and `node_modules`) from sync.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Containers won't start | `ddev poweroff && ddev start` |
| Config changes not applied | `ddev restart` |
| Port conflicts | `ddev stop --all` then start just your project |
| Stale images | `ddev debug refresh` |
| DNS issues | Try `ddev config --use-dns-when-possible=false && ddev restart` |
| Permission issues | `ddev exec chown -R $(id -u):$(id -g) .` |
| DB connection issues | `ddev describe` to check DB status, `ddev logs -s db` for errors |
