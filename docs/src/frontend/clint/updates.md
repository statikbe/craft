---
prev:
  text: 'Configuration'
  link: '/frontend/clint/configuration'
next:
  text: 'Advanced Usage'
  link: '/frontend/clint/advanced-usage'
---

# Update Process

Clint's updater keeps your frontend codebase synchronized with the latest components, utilities, and best practices from the base repository. This page explains how the update system works and how to use it.

## How Updates Work

### Version Detection

When you start Clint, it automatically checks for updates:

1. **Fetches Latest Versions**: Connects to the base repository and retrieves the latest version numbers
2. **Compares Versions**: Compares your local versions (from package.json) with the latest available
3. **Notifies You**: Displays a message if updates are available

```
---------------------------------------------------------------------------
| 🐦‍🔥 There is an update available for the CLI: 0.0.1 -> 0.0.2
| 🎨 There is an update available for the Frontend: 1.2.3 -> 1.3.0
---------------------------------------------------------------------------
```

### Update Flow Options

When you select "Update" from the main menu, you can choose:

1. **Pre-update Check**: Take screenshots before updating
2. **Update**: Apply the updates
3. **Post-update Check**: Take screenshots after updating

## Pre-Update and Post-Update Checks

Before applying updates, it's recommended to take "before" screenshots of your site. After updating, take "after" screenshots to visually compare and detect any regressions.

### Visual Regression Testing

The screenshot comparison helps you:

- Spot unintended visual changes
- Verify that updates don't break your layouts
- Identify CSS conflicts quickly

You can test:

- **Full Sitemap**: All pages from your sitemap.xml
- **Single URL**: A specific page
- **Local or Remote**: DDEV projects or external URLs

## Applying Updates

### Safety Checks

Before updating, Clint verifies:

1. **No Local Git Changes**: You must have a clean working directory
2. **Screenshot Availability**: Warns if you haven't taken pre-update screenshots

::: danger Critical: Commit Your Changes
Clint will refuse to update if you have uncommitted changes. This protects you from losing work.
:::

### Update Types

#### CLI Updates

When Clint itself needs updating:

1. Downloads the latest CLI code from the base repository
2. Runs `yarn install` to update dependencies
3. Runs `yarn build` to rebuild the CLI
4. **Requires Restart**: You must restart Clint to apply CLI updates

::: warning Restart Required
After updating the CLI, Clint exits automatically. Restart it to continue with frontend updates.
:::

#### Frontend Updates

Frontend updates are more sophisticated and can include:

1. **File Synchronization**: Updates shared components and utilities
2. **Selective Updates**: Only updates files not in the exclusion list
3. **Version-Specific Updates**: Applies structured update scripts
4. **Find & Replace**: Automated code transformations

### Update Selection

If multiple updates are available, you can choose:

- **All Updates in Sequence**: Apply all pending updates in order (recommended)
- **Specific Version**: Apply only one update

```
Which update do you want to apply?
> All updates in sequence
  1.2.4
  1.2.5
  1.3.0
```

::: tip Recommended: All Updates in Sequence
Unless you have a specific reason, always choose "All updates in sequence" to ensure you don't miss intermediate changes. This is now the default option.
:::

## Update Structure

Updates are stored in the `/clint/updates` directory, with each version in its own folder:

```
clint/updates/
├── 1.2.4/
│   ├── update.json
│   └── changelog.md
├── 1.2.5/
│   ├── update.json
│   └── changelog.md
└── 1.3.0/
    ├── update.json
    └── changelog.md
```

### update.json

Each update includes an `update.json` file that defines what changes to make:

```json
{
  "description": "Update button components and add new utility classes",
  "frontend": {
    "modify": ["js/components-site/custom-button.component.ts"],
    "findAndReplace": [
      {
        "files": ["../templates/**/*.twig"],
        "from": "/btn-primary/g",
        "to": "btn--primary"
      }
    ]
  },
  "root": {
    "modify": ["vite.config.js"],
    "findAndReplace": [
      {
        "files": ["../templates/**/*.twig"],
        "from": "/old-pattern/g",
        "to": "new-pattern"
      }
    ]
  }
}
```

#### Frontend Section

- **`modify`**: Array of files to force-sync from the base repository, even if they are listed in `frontendExcludeFromSync`. This is used when you need to update files that are normally excluded (like project-specific components in `js/components-site`). Files not in the exclusion list are synced automatically and don't need to be listed here.
- **`findAndReplace`**: Array of find/replace operations to apply across your templates or code

::: tip When to use `modify`
Only list files in the `modify` array if they are in your `frontendExcludeFromSync` configuration but need to be updated for this specific release. Regular shared files are synced automatically.
:::

#### Root Section

- **`modify`**: Array of root-level files to update (outside the frontend directory)
- **`findAndReplace`**: Find/replace operations for root-level files

#### Find and Replace Operations

Clint uses the [replace-in-file](https://www.npmjs.com/package/replace-in-file) package for automated code transformations. Each operation includes:

- **`files`**: Glob pattern of files to search (e.g., `"../templates/**/*.twig"`)
- **`from`**: Pattern to find (supports regex like `"/text/g"`)
- **`to`**: Replacement text

For advanced usage and additional options, refer to the [replace-in-file documentation](https://www.npmjs.com/package/replace-in-file).

### changelog.md

Each update includes a changelog in Markdown format following this structure:

```markdown
# Update 1.2.4

**Release date:** 2024-03-15

## Summary

Updated button components to use BEM naming convention.

## Highlights

- All button classes now use BEM (Block Element Modifier) naming

## Changed

- Renamed `.btn-primary` to `.btn--primary`
- Updated button component TypeScript

## Fixed

- Fixed button hover states on mobile devices

# Manual intervention

> ⚠️ **ATTENTION**:  
> You need to update any custom button implementations in your project-specific components.
```

The changelog opens automatically in Chrome after updates are applied.

## What Happens During an Update

1. **Download Updates**: Pulls latest code from the base repository
2. **Show Description**: Displays the update description
3. **Sync Frontend Files**:
   - Copies specified files from base repository
   - Respects `frontendExcludeFromSync` configuration
   - Only updates files listed in `modify` array
4. **Apply Find & Replace**: Runs automated code transformations
5. **Update Root Files**: Syncs root-level configuration files if specified
6. **Update Version**: Updates your package.json version number
7. **Show Changelog**: Opens an HTML changelog in Chrome

## After Updating

### Required Actions

::: warning Rebuild Required
After updates, you must rebuild your frontend:

```bash
yarn build
```

:::

### Testing

1. **Visual Check**: Compare pre- and post-update screenshots
2. **Functional Testing**: Test key user flows
3. **Check Console**: Look for JavaScript errors
4. **Review Manual Interventions**: Check the changelog for manual steps

### Manual Interventions

Some updates require manual changes that can't be automated. These are documented in the "Manual intervention" section of the changelog.

Common manual interventions:

- Updating project-specific components
- Adjusting custom CSS
- Migrating custom JavaScript
- Updating Twig templates with project-specific logic

## Best Practices

::: tip Take Screenshots First
Always run pre-update checks before applying updates. Visual regression testing saves time.
:::

::: tip Update Regularly
Don't let updates pile up. Regular small updates are easier to manage than large jumps.
:::

::: tip Read the Changelog
Always read the changelog after updating. Pay special attention to "Manual intervention" sections.
:::

::: tip Test in Development First
Never apply updates directly to production. Test in your local or staging environment first.
:::

::: tip Commit After Each Update
If applying multiple updates, consider committing after each one. This makes it easier to roll back if needed.
:::

## Creating Your Own Updates

If you maintain the base repository, you can create updates:

1. Create a new version folder in `/clint/updates/`
2. Add an `update.json` file with your changes
3. Add a `changelog.md` file documenting the changes
4. Update the `version` in the base repository's package.json
5. Commit and push to the base repository

Projects using Clint will automatically detect and offer your update.

### Using the Example Templates

Clint includes example template files to help you create your own updates:

- **`example_update.json`** - Template for the update configuration
- **`example_CHANGELOG.md`** - Template for the changelog with all recommended sections

You can find these files in the `/clint` directory and use them as starting points for creating new updates.

#### example_update.json

```json
{
  "description": "This is a test update to verify the update mechanism.",
  "frontend": {
    "modify": ["path_to_file_relative_to_frontend"]
  },
  "root": {
    "modify": ["path_to_file_relative_to_root"],
    "findAndReplace": [
      {
        "files": ["../templates/**/*.twig"],
        "from": "/text/g",
        "to": "changed-text"
      }
    ]
  }
}
```

This template shows:

- How to structure the JSON file
- Where to specify files to modify
- How to set up find/replace operations
- Placeholder paths you need to replace

#### example_CHANGELOG.md

The example changelog includes all recommended sections:

- **Summary**: One-sentence overview
- **Highlights**: Key changes users should know
- **Added**: New features or APIs
- **Changed**: Behavioral or API changes
- **Fixed**: Bug fixes
- **Deprecated**: Features being phased out
- **Removed**: Breaking changes
- **Manual intervention**: Required manual steps

::: tip Quick Start
Copy these example files when creating a new update. Replace the version number, update the content, and you're ready to go!
:::

## Complete Update Example

Let's walk through a real-world example: upgrading Vite to v7 and Tailwind CSS from v4 to v5, which requires updating class names.

### Scenario

You need to:

- Update Vite configuration files for Vite 7
- Update Tailwind CSS for v5
- Replace deprecated `flex-shrink-0` class with `shrink-0` throughout templates

### Directory Structure

```
clint/updates/
└── 2.1.0/
    ├── update.json
    └── changelog.md
```

### update.json

```json
{
  "description": "Upgrade to Vite 7 and Tailwind CSS v5 with class name updates",
  "frontend": {
    "findAndReplace": [
      {
        "files": ["../templates/**/*.twig"],
        "from": "/flex-shrink-0/g",
        "to": "shrink-0"
      }
    ]
  },
  "root": {
    "modify": ["vite.config.js", "vite.config.site2.js", "package.json"]
  }
}
```

### changelog.md

````markdown
# Update 2.1.0

**Release date:** 2025-10-20

## Summary

Major upgrade to Vite 7 and Tailwind CSS v5 with automated class name migrations.

## Highlights

- Vite upgraded from v6 to v7 for improved build performance
- Tailwind CSS upgraded from v4 to v5 with new utilities
- Automated migration of deprecated Tailwind classes

## Changed

- **Build Tools**: Updated Vite configuration for v7 compatibility
- **Tailwind CSS**: Updated to v5 with breaking changes
  - `flex-shrink-0` → `shrink-0` (automated)
- **Dependencies**: Updated vite and tailwindcss packages in package.json

## Added

- New Tailwind CSS v5 utilities available
- Improved build times with Vite 7

## Breaking Changes

- Tailwind CSS v4 class names are no longer supported
- Vite configuration format has minor changes

# Manual intervention

> ⚠️ **ATTENTION**:  
> After this update, you MUST run the following commands:

```bash
# Install updated dependencies
yarn install

# Rebuild the frontend
yarn build
```
````

> ⚠️ **Additional checks:**
>
> - Review any custom Tailwind configurations in your project
> - Test responsive layouts (flex utilities changed)
> - Check for any custom CSS using the old class names
> - Verify that all Vite plugins are compatible with v7

```

### What This Update Does

When applied, this update will:

1. **Update Vite Configuration Files**:
   - Syncs `vite.config.js` and `vite.config.site2.js` from the base repository
   - These files contain the necessary changes for Vite 7

2. **Update package.json Dependencies**:
   - Uses regex to find and update the Vite version
   - Uses regex to find and update the Tailwind CSS version

3. **Migrate Template Classes**:
   - Searches all `.twig` files in the templates directory
   - Replaces all instances of `flex-shrink-0` with `shrink-0`

4. **Display Changelog**:
   - Opens the formatted changelog in Chrome
   - Highlights the manual steps needed (yarn install, yarn build)

### Result

After running this update:
- Your project is on Vite 7 and Tailwind CSS v5
- All template files use the new class names
```
