# Tooling

## ECS

[Easy Coding Standard](https://github.com/easy-coding-standard/easy-coding-standard) with Craft's coding standard
(`craftcms/ecs`, the `CRAFT_CMS_4` set). It checks the PHP in `modules/`.

```bash
ddev composer check-cs   # report
ddev composer fix-cs     # fix what it can
```

Config: `ecs.php`. Add a folder to `paths()` to check more code.

## PHPStan

Static analysis with Craft's PHPStan config (`craftcms/phpstan`), at level 2, on `modules/`.

```bash
ddev composer phpstan
```

Config: `phpstan.neon`. Raise `level` when the module is ready for stricter checks.

## Clint

Our frontend updater and tester: it brings frontend updates from the base install into a project, and tests a site for
accessibility, HTML validity, CO₂ and broken links. It runs on your computer, not in DDEV:

```bash
yarn --cwd frontend init-clint   # build it, once
yarn --cwd frontend update       # start it
```

See the frontend docs: [Introduction](../../frontend/clint/introduction),
[Getting started](../../frontend/clint/getting-started) and [Tests](../../frontend/clint/tests).

## Source

- `ecs.php`
- `phpstan.neon`
- `composer.json` (`scripts`)
- `clint/`
