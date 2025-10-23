---
prev:
  text: 'Tests'
  link: '/frontend/clint/tests'
next:
  text: 'Updates'
  link: '/frontend/clint/updates'
---

# Configuration

Clint is configured through the `cli.config.json` file located in the `/clint` directory. This file defines how Clint should check for updates and where to fetch them from.

## Configuration File Structure

The configuration file has two main sections: `cli` and `frontend`.

```json
{
  "cli": {
    "packagePath": "package.json",
    "packageGitUrl": "https://raw.githubusercontent.com/statikbe/craft/refs/heads/main/clint/package.json",
    "cliPath": "clint",
    "updateRepo": "git@github.com:statikbe/craft.git",
    "updatePath": "clint/updates"
  },
  "frontend": {
    "packagePath": "../package.json",
    "packageGitUrl": "https://raw.githubusercontent.com/statikbe/craft/refs/heads/main/package.json",
    "updateRepo": "git@github.com:statikbe/craft.git",
    "updatePath": "clint/updates",
    "frontendPath": "frontend",
    "frontendExcludeFromSync": ["css", "icons", "img", "js/components-site", "/js/.*.ts$/"]
  }
}
```

## CLI Section

Configures how Clint checks for and applies updates to itself.

### `packagePath`

- **Type:** String
- **Description:** Path to the CLI's package.json file (relative to the clint directory)
- **Example:** `"package.json"`

### `packageGitUrl`

- **Type:** String (URL)
- **Description:** URL to the raw package.json file in the base repository to check for new versions
- **Example:** `"https://raw.githubusercontent.com/statikbe/craft/refs/heads/main/clint/package.json"`

### `cliPath`

- **Type:** String
- **Description:** Directory name of the CLI folder
- **Example:** `"clint"`

### `updateRepo`

- **Type:** String (Git URL)
- **Description:** Git repository URL for pulling updates
- **Example:** `"git@github.com:statikbe/craft.git"`

### `updatePath`

- **Type:** String
- **Description:** Path within the repository where update scripts are stored
- **Example:** `"clint/updates"`

## Frontend Section

Configures how Clint checks for and applies updates to your frontend codebase.

### `packagePath`

- **Type:** String
- **Description:** Path to the project's main package.json file (relative to the clint directory)
- **Example:** `"../package.json"`

### `packageGitUrl`

- **Type:** String (URL)
- **Description:** URL to the raw package.json in the base repository
- **Example:** `"https://raw.githubusercontent.com/statikbe/craft/refs/heads/main/package.json"`

### `updateRepo`

- **Type:** String (Git URL)
- **Description:** Git repository URL for pulling frontend updates
- **Example:** `"git@github.com:statikbe/craft.git"`

### `updatePath`

- **Type:** String
- **Description:** Path within the repository where frontend update scripts are stored
- **Example:** `"clint/updates"`

### `frontendPath`

- **Type:** String
- **Description:** Directory name of your frontend folder
- **Example:** `"frontend"`

### `frontendExcludeFromSync`

- **Type:** Array of Strings
- **Description:** Files and directories to exclude from synchronization during updates
- **Supports:**
  - Directory names: `"css"`, `"icons"`, `"img"`
  - Path patterns: `"js/components-site"`
  - Regular expressions: `"/js/.*.ts$/"`

**Example:**

```json
"frontendExcludeFromSync": [
  "css",
  "icons",
  "img",
  "js/components-site",
  "/js/.*.ts$/"
]
```

::: tip Why Exclude Files?
The `frontendExcludeFromSync` array is crucial for preserving your project-specific customizations. Add any files or directories that contain project-specific code or assets that should not be overwritten during updates.
:::

## Environment Detection

Clint can automatically detect your local development environment.

### DDEV Integration

If you're using DDEV for local development, Clint automatically:

- Reads your `.ddev/config.yaml` file
- Extracts your project name

This makes testing local projects seamless without manual URL entry.

## Version Tracking

Clint tracks versions through the `version` field in your project's `package.json` files:

- **CLI Version**: Found in `/clint/package.json`
- **Frontend Version**: Found in the root `package.json`

When you apply updates, Clint automatically updates these version numbers to match the latest applied update.

## Testing Configuration

Testing behavior is configured through interactive prompts rather than configuration files. However, Clint does save your last test session in `/clint/data/session.json`, allowing you to quickly re-run the same test.

## Best Practices

::: tip Keep Your Base Repository URL Current
Ensure the `packageGitUrl` and `updateRepo` URLs point to the correct repository and branch. If the base repository changes, update these URLs.
:::

::: tip Regularly Review Exclusions
Periodically review your `frontendExcludeFromSync` array. As your project evolves, you may need to add or remove exclusions.
:::

::: tip Use SSH for Git URLs
The `updateRepo` uses SSH (`git@github.com:...`) which requires SSH keys to be set up. This is more secure than HTTPS for automated operations.
:::

::: warning Don't Exclude Critical Shared Code
Be careful not to exclude shared utilities, components, or libraries that should receive updates. Only exclude truly project-specific code.
:::

## Next Steps

- Learn about the [update process](/frontend/clint/updates) and how updates are structured
