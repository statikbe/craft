---
name: authoring-clint-updates
description: Use this skill when a frontend change in this Craft base repo (statikbe/craft) needs to ship as a Clint update so existing projects receive it. Invoke when the user mentions creating/filling a Clint update, an update folder, update.json, CHANGELOG.md, the update manifest/index.json, or "ship this frontend fix to projects". It analyzes the git diff and produces update.json (modify + findAndReplace) and CHANGELOG.md, then regenerates the manifest.
---

# Authoring Clint Updates

Clint distributes frontend changes to existing projects through **update folders**. Editing `frontend/` only updates the template for *new* clones — existing projects receive a change **only** when it also ships as an update that the manifest lists. So whenever a frontend change should propagate, author an update alongside it.

Full reference: `docs/src/frontend/clint/updates.md` and `docs/src/frontend/clint/configuration.md`.

## When an update is needed

Author an update when the change touches shared frontend code/assets, root config (`vite.config*.js`, root `package.json`), or shared `templates/` that downstream projects use. Skip it for purely project-specific files or for clint-internal changes.

## Procedure

### 1. Determine the change set

Look at what changed (against the base branch, usually `develop`):

```bash
git diff --name-status develop...HEAD -- frontend/ templates/ vite.config*.js package.json composer.json
# or, for uncommitted work:
git status --short
git diff --stat
```

Read the actual diffs of the changed files so you can write an accurate changelog and spot template/class renames that need a `findAndReplace`.

### 2. Classify each changed path

Read `clint/cli.config.json` → `frontend.frontendExcludeFromSync` and classify every changed file. Exclude entries are: directory names (`css`, `icons`, `img`), path prefixes (`js/components-site`), and regexes wrapped in slashes (`/js/.*.ts$/`).

| Where the file lives | How it propagates |
| --- | --- |
| Under `frontend/`, **not** matching an exclude pattern | Synced automatically by the full frontend sync — just ensure the update has a `frontend` block. Do **not** list it in `modify`. |
| Under `frontend/`, **matching** an exclude pattern (e.g. a `js/components-site/*` file, or a `.ts` under `js`) | Excluded from the normal sync — **must** be listed in `frontend.modify` to force-sync it. Paths are relative to `frontend/`. |
| Root-level (e.g. `vite.config.js`, root `package.json`) | List in `root.modify` (path relative to repo root). |
| A class/string rename across `templates/` or code | Use a `findAndReplace` rule instead of (or in addition to) a file sync. |
| Documentation / advisory only | **Record-only** update — omit both `frontend` and `root` blocks. |

> **Note:** the frontend sync copies the whole `frontend/` tree (minus excludes) from the pinned channel, so non-excluded files don't need enumerating — the `modify` list exists specifically to *also* pull excluded files.

### 3. Scaffold the folder

From `clint/` (build first if `dist/` is stale: `yarn build-cli`):

```bash
node dist/cli.js update:new "<concise title>"
```

Creates `clint/updates/<YYYYMMDD>-<kebab-title>/` with a prefilled `update.json` and a `CHANGELOG.md` template. The folder name is the update `id`.

### 4. Fill `update.json`

```json
{
  "id": "20260612-fix-card-spacing",
  "title": "Fix card spacing",
  "description": "Corrects the gap between cards in the grid component.",
  "date": "2026-06-12",
  "issues": [612],
  "pr": null,
  "requires": [],
  "frontend": {
    "modify": ["js/components-site/card.component.ts"],
    "findAndReplace": [
      { "files": ["../templates/**/*.twig"], "from": "/gap-3/g", "to": "gap-4" }
    ]
  },
  "root": {
    "modify": ["vite.config.js"]
  }
}
```

- `id` **must** equal the folder name; `issues`/`pr` are for linking only (never ordering).
- `requires`: list another update's id only if this one genuinely depends on it landing first.
- `frontend.modify` / `root.modify`: only the paths identified as excluded/root in step 2.
- Omit a block entirely when unused; omit **both** for a record-only update.

**findAndReplace rules — must be idempotent.** A rule's `from` must match only the *pre-change* state so a re-run (after a failed/partial apply) is a no-op. Prefer renames over appends.
- `"from": "/pattern/g"` → global regex (all occurrences).
- `"from": "plain text"` → literal string, **first occurrence only**.
- Targets that don't exist now fail loudly — don't point at files a project may not have unless that's intended.

### 5. Write `CHANGELOG.md`

Summarize from the actual diff. Sections (include those that apply): `## Summary`, `## Highlights`, `## Added`, `## Changed`, `## Fixed`, and a top-level `# Manual intervention` for anything that can't be automated (custom components, project-specific CSS/JS/Twig, required `yarn install`/`yarn build`).

```markdown
# Fix card spacing

**Release date:** 2026-06-12

## Summary

Corrects the gap between cards in the grid component.

## Changed

- `gap-3` → `gap-4` on the card grid (automated)

# Manual intervention

> ⚠️ **ATTENTION**:
> Re-check any custom card layouts that override the grid gap.
```

### 6. Regenerate the manifest and commit

```bash
node dist/cli.js update:index   # assigns seq, validates, writes clint/updates/index.json
```

The generator fails if a folder lacks `update.json`/`CHANGELOG.md`, `id` ≠ folder name, or JSON is invalid. **Never hand-edit `index.json`.** Commit the regenerated `index.json` together with the update folder and the real frontend change in the same PR (target `develop`). CI (`clint-update-index`) re-validates; merge to `develop` publishes to the `clint-updates` channel.

## Checklist before finishing

- [ ] The real frontend change and the update folder are in the same change set.
- [ ] Excluded/root files are in `modify`; non-excluded files are not.
- [ ] Every `findAndReplace.from` matches only the pre-change state (idempotent).
- [ ] `CHANGELOG.md` reflects the diff and flags manual steps.
- [ ] `update:index` ran clean and `index.json` is committed.
