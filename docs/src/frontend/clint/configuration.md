---
prev:
  text: 'Tests'
  link: '/frontend/clint/tests'
next:
  text: 'Updates'
  link: '/frontend/clint/updates'
---

# Configuration

Clint is configured through the `cli.config.json` file located in the `/clint` directory. This file defines how Clint checks for updates and where to fetch them from.

## Configuration File Structure

The configuration file has two main sections: `cli` and `frontend`.

```json
{
  "cli": {
    "packagePath": "package.json",
    "packageGitUrl": "https://raw.githubusercontent.com/statikbe/craft/refs/heads/master/clint/package.json",
    "cliPath": "clint",
    "updateRepo": "git@github.com:statikbe/craft.git",
    "updatePath": "clint/updates"
  },
  "frontend": {
    "packagePath": "../frontend/package.json",
    "packageGitUrl": "https://raw.githubusercontent.com/statikbe/craft/refs/heads/master/frontend/package.json",
    "indexGitUrl": "https://raw.githubusercontent.com/statikbe/craft/refs/heads/clint-updates/clint/updates/index.json",
    "updateRepo": "git@github.com:statikbe/craft.git",
    "updateRef": "clint-updates",
    "updatePath": "clint/updates",
    "frontendPath": "frontend",
    "appliedStatePath": "../frontend/.clint-applied",
    "frontendExcludeFromSync": ["css", "icons", "img", "js/components-site", "/js/.*.ts$/"]
  }
}
```

## CLI Section

Configures how Clint checks for and applies updates to itself. The CLI still updates by **semver** — it compares the version in its `package.json` against the version in the base repository.

### `packagePath`

- **Type:** String
- **Description:** Path to the CLI's package.json file (relative to the clint directory)
- **Example:** `"package.json"`

### `packageGitUrl`

- **Type:** String (URL)
- **Description:** URL to the raw package.json file in the base repository, used to check for a newer CLI version
- **Example:** `"https://raw.githubusercontent.com/statikbe/craft/refs/heads/master/clint/package.json"`

### `cliPath`

- **Type:** String
- **Description:** Directory name of the CLI folder
- **Example:** `"clint"`

### `updateRepo`

- **Type:** String (Git URL)
- **Description:** Git repository URL for pulling CLI updates
- **Example:** `"git@github.com:statikbe/craft.git"`

### `updatePath`

- **Type:** String
- **Description:** Path within the repository where the CLI source lives
- **Example:** `"clint/updates"`

## Frontend Section

Configures how Clint detects and applies frontend updates. Frontend updates are **manifest-driven**: Clint fetches a published manifest (`index.json`) and compares it against the project's applied log (`frontend/.clint-applied`) — there is no version comparison. See [the update process](/frontend/clint/updates) for the full model.

### `packagePath`

- **Type:** String
- **Description:** Path to the frontend `package.json` (relative to the clint directory). Now used **only during the one-time migration** to read the legacy `version` and seed the applied log. It no longer drives ongoing update detection.
- **Example:** `"../frontend/package.json"`

::: warning Path correction
Earlier versions pointed this at `"../package.json"`, which does not exist (there is no root `package.json`). It must point at the frontend package: `"../frontend/package.json"`.
:::

### `packageGitUrl`

- **Type:** String (URL)
- **Description:** Legacy field, retained for reference. The frontend check no longer uses it — detection is driven by `indexGitUrl`.
- **Example:** `"https://raw.githubusercontent.com/statikbe/craft/refs/heads/master/frontend/package.json"`

### `indexGitUrl`

- **Type:** String (URL)
- **Description:** Raw URL of the update **manifest** (`clint/updates/index.json`) on the publish channel. Clint fetches this on startup to compute which updates are pending. The fetch **fails closed**: if the manifest can't be reached or parsed, Clint reports an error rather than "up to date".
- **Example:** `"https://raw.githubusercontent.com/statikbe/craft/refs/heads/clint-updates/clint/updates/index.json"`

### `updateRef`

- **Type:** String
- **Description:** The git ref (branch or tag) Clint pins and fetches update content from. Each run resolves this ref to one immutable commit SHA so the manifest and the synced files can't drift mid-update. Points at the dedicated publish channel.
- **Example:** `"clint-updates"`

### `updateRepo`

- **Type:** String (Git URL)
- **Description:** Git repository URL for fetching frontend update content
- **Example:** `"git@github.com:statikbe/craft.git"`

### `updatePath`

- **Type:** String
- **Description:** Path within the repository where the update folders and `index.json` live
- **Example:** `"clint/updates"`

### `frontendPath`

- **Type:** String
- **Description:** Directory name of your frontend folder
- **Example:** `"frontend"`

### `appliedStatePath`

- **Type:** String
- **Description:** Path to the committed applied log (relative to the clint directory) — the sorted, newline-delimited list of update ids this project has already applied. Clint reads it to compute pending updates and appends to it as each update is applied.
- **Example:** `"../frontend/.clint-applied"`

::: tip Committed vs. ignored
`frontend/.clint-applied` is **committed** (and uses `merge=union` so concurrent appends merge cleanly). Its companion `frontend/.clint-applied.meta.json` and the `frontend/.clint.lock` lock file are **gitignored**.
:::

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
The `frontendExcludeFromSync` array preserves your project-specific customizations. Add any files or directories that contain project-specific code or assets that should not be overwritten during updates. An individual update can still force-sync an excluded file by listing it in its `update.json` `modify` array.
:::

## Environment Detection

Clint can automatically detect your local development environment.

### DDEV Integration

If you're using DDEV for local development, Clint automatically:

- Reads your `.ddev/config.yaml` file
- Extracts your project name

This makes testing local projects seamless without manual URL entry.

## Update State Tracking

Clint tracks the CLI and the frontend differently:

- **CLI version** — semver, from `/clint/package.json`, compared against `packageGitUrl`.
- **Frontend updates** — tracked by the **applied log** at `appliedStatePath` (`frontend/.clint-applied`), a set of applied update ids. The frontend `package.json` `version` is **legacy**: it is read only once, during the first-run migration that seeds the applied log, and is never written by Clint afterwards.

## Testing Configuration

Testing behavior is configured through interactive prompts rather than configuration files. Clint saves your last test session in `/clint/data/session.json`, allowing you to quickly re-run the same test.

## Best Practices

::: tip Keep Your Channel URLs Current
Ensure `indexGitUrl`, `updateRef`, and `updateRepo` point at the correct repository and publish channel. If the channel branch (e.g. `clint-updates`) or repository changes, update these values together.
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
