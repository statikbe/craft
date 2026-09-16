---
name: working-with-ddev
description: Use this skill when running commands in this project's DDEV local development environment. Invoke when executing PHP, Composer, Craft CLI, database operations, debugging, or any shell commands that need to run inside the DDEV containers. Also use when configuring DDEV, managing services, or troubleshooting the local environment.
---

# Working with DDEV in This Project

This project uses DDEV for local development. All PHP, Composer, and Craft CLI commands must be run through DDEV.

## This Project's DDEV Setup

- **Project name**: `craft-base-install`
- **Type**: `craftcms`
- **PHP**: 8.4
- **Web server**: Apache-FPM
- **Database**: MySQL 8.0
- **Docroot**: `public/`
- **TLD**: `local.statik.be`
- **URL**: `https://craft-base-install.local.statik.be`
- **Composer**: v2
- **Upload dirs**: `files`, `../node_modules` (bind-mounted, excluded from Mutagen sync)

## Critical Rule

**NEVER run PHP, Composer, or Craft commands directly on the host.** Always prefix with `ddev`:

```bash
# WRONG
php craft migrate/all
composer require vendor/package

# CORRECT
ddev craft migrate/all
ddev composer require vendor/package
```

## Essential Commands

### Project Lifecycle
```bash
ddev start              # Start containers
ddev stop               # Stop containers
ddev restart            # Restart (applies config changes)
ddev describe           # Show project info, URLs, ports
ddev launch             # Open site in browser
ddev launch -m          # Open Mailpit (email testing)
```

### Craft CMS CLI
```bash
ddev craft migrate/all           # Run all pending migrations
ddev craft project-config/apply  # Apply project config changes
ddev craft clear-caches/all      # Clear all caches
ddev craft db/restore <file>     # Restore database backup
ddev craft users/create          # Create a user
ddev craft install               # Run Craft installer
ddev craft up                    # Run migrations + project config apply
```

### Composer
```bash
ddev composer install                    # Install dependencies
ddev composer require vendor/package     # Add a package
ddev composer update                     # Update all packages
ddev composer dump-autoload -o           # Rebuild optimized autoload
```

### Database
```bash
ddev export-db --file=backup.sql.gz     # Export database
ddev import-db --file=backup.sql.gz     # Import database
ddev snapshot                           # Create a DB snapshot (fast, uses xtrabackup)
ddev snapshot --name my_snapshot        # Named snapshot
ddev snapshot --list                    # List snapshots
ddev snapshot restore --latest          # Restore latest snapshot
ddev snapshot restore <name>            # Restore named snapshot
```

### Shell & Execution
```bash
ddev ssh                    # SSH into the web container
ddev exec <command>         # Run a command in the web container
ddev logs                   # View web container logs
ddev logs -s db             # View database logs
ddev logs -f                # Follow logs (tail)
```

### Debugging
```bash
ddev xdebug on              # Enable Xdebug
ddev xdebug off             # Disable Xdebug
ddev xdebug status          # Check Xdebug status
ddev xdebug info            # Detailed Xdebug diagnostic info
```

### Code Quality (via Composer scripts)
```bash
ddev composer check-cs      # Check PHP coding standards (ECS)
ddev composer fix-cs         # Auto-fix coding standards
ddev composer phpstan        # Run static analysis
```

## DDEV Configuration

See `./ddev-configuration-reference.md` for details on customizing DDEV.

**Key config files:**
- `.ddev/config.yaml` — Main project config
- `.ddev/config.*.yaml` — Override files (merged into main config)
- `.ddev/commands/` — Custom DDEV commands (host, web, db)
- `.ddev/web-build/Dockerfile` — Customize web container image
- `.ddev/db-build/Dockerfile` — Customize db container image
- `.ddev/php/` — Custom PHP ini overrides
- `.ddev/mysql/` — Custom MySQL config
- `.ddev/nginx_full/` or `.ddev/apache/` — Web server config overrides
- `.ddev/providers/` — Hosting provider integrations (Acquia, Platform.sh, etc.)
- `.ddev/mutagen/mutagen.yml` — Mutagen sync configuration

## Common Workflows

### After pulling changes from Git
```bash
ddev start
ddev composer install
ddev craft migrate/all
ddev craft project-config/apply
```

Or the shorthand:
```bash
ddev start
ddev composer install
ddev craft up
```

### Before committing config changes
```bash
# Make changes in the CP, then:
ddev craft project-config/write
# Commit the config/project/ changes
```

### Resetting the database
```bash
ddev snapshot                           # Backup first
ddev import-db --file=path/to/dump.sql.gz
ddev craft migrate/all
ddev craft project-config/apply
```

### Installing a new plugin
```bash
ddev composer require vendor/plugin-name
ddev craft plugin/install plugin-handle
```

### Troubleshooting
```bash
ddev describe           # Check status, URLs, ports
ddev logs               # Check for PHP errors
ddev restart            # Restart when things seem stuck
ddev poweroff           # Nuclear option: stop all DDEV projects and router
ddev debug refresh      # Reinstall Composer, refresh images
```
