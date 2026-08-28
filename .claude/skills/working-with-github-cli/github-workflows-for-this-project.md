# GitHub Workflows for This Project

## Branching Model

```
master (production deploys via SFTP)
  ↑ merge
develop (staging deploys via SFTP, CI runs here)
  ↑ merge PRs
feature/*, bugfix/*, <issue-number>-* (working branches)
```

- `develop` is the main integration branch
- `master` is production — only merged from `develop` via release process
- Feature branches are created from `develop` and PR'd back to `develop`

## Typical Feature Branch Workflow

```bash
# 1. Create a branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/123-add-new-thing

# 2. Do your work, commit
git add specific-files
git commit -m "Add new thing"

# 3. Push and create PR
git push -u origin feature/123-add-new-thing
gh pr create --base develop --title "Add new thing" --body "Closes #123"

# 4. Check CI passes
gh pr checks

# 5. After review, merge
gh pr merge --squash --delete-branch
```

## Reviewing a Colleague's PR

```bash
# 1. Check out their PR
gh pr checkout 456

# 2. Test locally
ddev start
ddev composer install
ddev craft up

# 3. Review
gh pr review 456 --approve
# or
gh pr review 456 --request-changes --body "Please update X"
```

## CI Pipeline Details

**File**: `.github/workflows/ci.yml`

**Triggers**:
- Push to `develop`
- All pull requests
- Manual dispatch (`workflow_dispatch`)

**What it runs**:
- Reusable workflow from `statikbe/.github`
- Job: `ecs` (Easy Coding Standard — PHP code style)
- PHP 8.2, Craft 4 context (note: may need updating to match PHP 8.4 / Craft 5)

**Concurrency**: Grouped by ref, cancels in-progress runs on same branch.

## Deployment

**Staging** (`.github/workflows/staging.yml`):
- Triggers on push to `develop`
- Deploys via SFTP

**Production** (`.github/workflows/main.yml`):
- Triggers on push to `master`
- Deploys via SFTP

## Git Hooks (Local)

The project includes local git hooks in `.githooks/`:

**post-merge** (runs after `git pull`):
- Auto-runs `yarn install` and `ddev composer install` if lock files changed
- Runs `yarn dev` if frontend files changed
- Runs `ddev craft up` if project config changed

**pre-push**:
- Runs `ddev craft up` if `config/project/project.yaml` has changed

## Commit Message Conventions

Based on recent history, the project uses descriptive commit messages:
- `Craft 5.9.4` — version update commits
- `Fix typo in README build instructions` — descriptive fix messages
- PRs are merged with standard merge commits (not squash by default)
