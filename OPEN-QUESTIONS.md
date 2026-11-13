# Base install: open questions for the team

Questions that came up while checking the docs and Claude skills against the code (2026-11-13). Add your answer under the question.

## 1. The `templates/api/` folder in the docs

**What the docs say:** `docs/src/craft/templates/structure.md` lists a folder in the template tree:

```
├── api/                     Empty: for JSON or other API templates
```

**What the repo shows:**

- `templates/api/` doesn't exist, and no commit or tag has ever had it (checked 3.10, 5.9.0, 5.15.0 and the full history). Git doesn't
  track empty folders and there's no `.gitkeep` in it, so it probably only existed locally when the docs were written.
- The line was added on 2026-10-26 in `67ebe857` ("Docs: fill the Craft section").
- Nothing else mentions it: not `GUIDELINES.MD` §5 (template folder structure), `WHATS-NEW.md`, or `config/routes.php`.

**Question:** was `templates/api/` meant as a convention, so JSON or API templates (e.g. a JSON route in `config/routes.php`)
always go in the same place?

**Options:**

1. **Keep it as a convention:** add `templates/api/.gitkeep`, add the folder to `GUIDELINES.MD` §5, and keep the docs line
   (without "Empty").
2. **Docs only:** keep it as a note, e.g. "JSON or API templates go in `templates/api/` (not in the base install)".
3. **Remove** the line from the docs.

**Answer:**

## 2. The old content builder blocks and their Claude reference page

**What it is:** `.claude/skills/understanding-project-architecture/content-builder-blocks.md` used to be the field reference of
every content builder block. It is now a short legacy reference: the 12 old blocks (`textImage`, `faq`, `quote`, …), the column
types that replace each one, and their older names (`customTable`, `textTwoColumns`, `embed`).

**What the repo shows:**

- The `contentBuilder` field only offers the Content row (`gridRow`). No field references the old block entry types any more.
- The old entry types are still in `config/project/entryTypes/` and their templates in `templates/_site/contentBuilder/blocks/`.
  `contentBuilder.twig` still renders `blocks/<handle>.twig` for an entry that isn't a row.
- The column templates in `contentBuilder/columns/` don't include the block templates (`columns/callToAction.twig` is a copy).

**Question:** do we still need the legacy reference page? It only helps when Claude meets old blocks, e.g. in a project from
before content rows or in old content. And, related: do the old block entry types and `blocks/` templates stay in the base
install at all?

**Options:**

1. **Keep the page** as it is now, as long as the old blocks are in the base install.
2. **Remove the page**, and keep one sentence in the skill's `SKILL.md` about the old `blocks/` templates.
3. **Remove the old blocks from the base install** (entry types, `blocks/` templates, the `blocks/` branch in `contentBuilder.twig`)
   and then the page too. Projects that still have block content keep their own copy.

**Answer:**

## 3. Clint updates: "root" config examples in the `authoring-clint-updates` skill

**What the skill says:** `.claude/skills/authoring-clint-updates/SKILL.md` says an update is needed for "root config
(`vite.config*.js`, root `package.json`)" (line 14), its table lists `vite.config.js` and root `package.json` as root-level
files for `root.modify` (line 39), and the example `update.json` has `"root": {"modify": ["vite.config.js"]}` (lines 72–74).

**What the repo shows:** there is no `package.json` or `vite.config*.js` at the repo root; both are in `frontend/`. The
`frontend/vite.config*.js` files match no `frontendExcludeFromSync` pattern (`css`, `icons`, `img`, `js/components-site`,
`/js/.*.ts$/`), so the normal frontend sync already brings them; a `root.modify` with `vite.config.js` points to a file that
doesn't exist.

**Question:** which root-level files do updates actually need `root.modify` for? With that, the skill gets a real example.

**Proposal:** drop `vite.config*.js` and `package.json` as root examples, and use a real root file (e.g. something in
`config/` or `templates/`) in the example.

**Answer:**

## 4. Clint updates for projects from before the template move

**What's agreed:** `CLAUDE.md` says a Clint update that changes a template must still work in projects started before the
template move (2026-10-29), which keep the old `_site/_snippet/…` paths and translation keys.

**What the skill does:** `authoring-clint-updates` builds updates from `git diff -- templates/`, so it only writes the new
paths. It never mentions the old layout. A `findAndReplace` on a path that doesn't exist fails the update on purpose, and
updates apply in order, so one failing update blocks every later one.

**Already worked out:** `TEMPLATES-MIGRATION-PLAN.md` ("Open points: Clint", point 2) lists three options and recommends 2 now
and 3 later:

1. Rules only: template rules use a glob that covers both layouts (`../templates/_site/**/*.twig`), and one rule per key form.
2. `"optional": true` on a `findAndReplace` rule (a missing file is skipped), so an author writes one rule for the old path
   and one for the new path. A few lines in `findAndReplaceInFile` (`clint/src/updater/updater.ts`).
3. An old → new map in Clint (the path and key tables from `WHATS-NEW.md` as JSON), so authors only write for the new
   layout. Most work, needs tests.

**Question:** which option do we go for? Then the skill and the Clint docs (`docs/src/frontend/clint/updates.md`) get the
matching step.

**Answer:**

## 5. GitHub setup in the `working-with-github-cli` skill

**What the skill says** (`.claude/skills/working-with-github-cli/SKILL.md`, lines 10–14):

- "Repo: `statikbe/craft` (private, …)"
- "Default branch: `develop` (not `main`)"
- "Deploy: SFTP — `develop` deploys to staging, `master` deploys to production"

**What the repo shows:**

- The package is installed with `composer create-project statikbe/craft` and the docs are published on GitHub Pages
  (statikbe.github.io/craft), which suggests the repo is public.
- The local `origin/HEAD` points to `master`, not `develop`. PRs do target `develop`.
- SFTP is right for this repo, but the skill is also copied into new projects, which deploy from Bitbucket with Deployer
  (`bitbucket-pipelines.yml` + `deploy.php`: `develop` → staging, `main` → production).

**Questions:** is the repo public or private? Is the default branch on GitHub `master` or `develop`? Should the skill say how
generated projects deploy?

**Answer:**

## 6. GitHub workflows in the `working-with-github-cli` skill

**What the skill says:** `.claude/skills/working-with-github-cli/github-workflows-for-this-project.md` lists `ci.yml` (ECS),
`staging.yml` (develop) and `main.yml` (master).

**What the repo shows:** `.github/workflows/` also has:

| Workflow | Runs on | What it does |
| --- | --- | --- |
| `clint-update-index.yml` | pull requests that touch `clint/updates/**` | Validates the Clint update folders; its comment says it is a required status check on `develop` and `master` |
| `clint-publish-updates.yml` | pushes to `develop` | Publishes the updates to the `clint-updates` branch (with the generated `index.json`) |
| `docs.yml` | pushes to `master` and `develop` | Builds the VitePress docs and deploys them to GitHub Pages |
| `demo.yml` | pushes to `demo` | Deploys the demo site |
| `deploy-rectangle.yml` | pushes to `Rectangle` | Deploys the Rectangle branch with Deployer |

Also: the skill says the post-merge hook runs `yarn install` / `composer install` "if lock files changed". The hook was
fixed on 2026-11-13: it now runs `ddev composer install` when `composer.json` or `composer.lock` changed, `yarn install` (in
`frontend/`) when `frontend/package.json` or `frontend/yarn.lock` changed, a frontend build when anything in `frontend/`
changed, and `ddev craft up` when `config/project/project.yaml` changed.

**Questions:** which of these workflows should the skill describe (is `deploy-rectangle.yml` temporary, is `demo.yml` still
used)? `docs.yml` still has the sample comment about the `main` branch; can it go?

**Answer:**

## 7. The templates plan: what's still open ("Open points: Clint")

**What it is:** `TEMPLATES-MIGRATION-PLAN.md` is the plan for the template move of 2026-10-29. Steps 1–10 are done; the
mapping and the decisions are also in `WHATS-NEW.md` §22 and `GUIDELINES.MD` §5. Two things are still open, and the plan is the
only place the first one is written down. Once both are settled (and Rectangle is merged), the plan can be deleted.

### 7a. Step 11: review, merge and deploy

"Review and merge, then deploy to the Rectangle testing server and check the pages there." Open until Rectangle is merged.

### 7b. New projects think they're missing 20 updates they already have

Left for later on 2026-10-30, found in the code review of the move.

- Clint counts every update in the published manifest (`index.json` on the `clint-updates` branch, 28 updates) that isn't in
  `frontend/.clint-applied` as pending.
- The base install's `frontend/.clint-applied` only lists `1.0.1`–`1.0.9` (without `1.0.3`). The 20 dated updates since then
  (`20260727-add-option-to-close-dropdown-on-scroll` … `20261005-responsive-images-and-gallery-opener-for-the-image-modal`,
  all in `clint/updates/`) are already in the base install's code, but their ids were never added.
- So every new project gets "20 frontend updates available" on `yarn watch` (a message only, it never blocks).
- Applying them (`yarn update`) re-syncs the frontend files of the first 19: wasted work, and it can overwrite a project's own
  changes to shared frontend files.
- The 20th, `20261005-responsive-images-…`, fails: its `findAndReplace` targets
  `_site/_snippet/_content/_blocks/_image.twig`, which the move removed, and Clint fails on a missing target on purpose
  (`findAndReplaceInFile` in `clint/src/updater/updater.ts`). Updates apply in order, so every later update is stuck too.
- The base install already has that change (`data-modal-srcset` in `contentBuilder/blocks/image.twig` and
  `columns/image.twig`).

**Proposed fix (from the plan):**

1. Add the 20 dated ids to `frontend/.clint-applied` in the base install. One file, fixes it for every new project.
2. Make adding the new id to `frontend/.clint-applied` part of authoring an update, in the same PR: in the `update:new` output,
   in the docs ("Authoring a frontend change" in `docs/src/frontend/clint/updates.md`) and in the `authoring-clint-updates`
   skill.
3. Leave `clint/updates/20261005-…/update.json` and its `CHANGELOG.md` at the old path: that update is for projects that still
   have the old layout.

**Questions:** OK to do 1 now? And who does 2 (Clint code, docs and skill)?

### 7c. Updates have to work with both template layouts

The second open point of the plan. See question 4 above.

**Answer:**
