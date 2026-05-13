---
name: working-with-github-cli
description: Use this skill when working with GitHub using the gh CLI in this project. Invoke for creating/managing pull requests, issues, viewing CI checks, releases, browsing the repo, or interacting with the GitHub API. Covers this project's branching conventions, PR workflow against the develop branch, and CI pipeline.
---

# Working with GitHub CLI in This Project

## This Project's GitHub Setup

- **Repo**: `statikbe/craft` (private, SSH: `git@github.com:statikbe/craft.git`)
- **Default branch**: `develop` (not `main`)
- **PR target**: Always `develop` unless explicitly stated otherwise
- **CI**: Runs on push to `develop` and on all PRs — ECS linting via reusable workflow from `statikbe/.github`
- **Deploy**: SFTP — `develop` deploys to staging, `master` deploys to production
- **Branch naming**: `feature/description`, `KarelJanVanHaute/issue559`, or issue-number prefixed like `582-description`

## Critical Rules

1. **PRs always target `develop`**, not `main` or `master`
2. **Check CI status** before merging — the ECS linting job must pass
3. **Never force-push** to `develop` or `master`

## Pull Requests

### Create a PR
```bash
# Standard PR against develop
gh pr create --base develop --title "Description" --body "Details"

# Draft PR
gh pr create --base develop --draft --title "WIP: Description"

# Open PR creation in browser (for complex descriptions)
gh pr create --web
```

### View & Manage PRs
```bash
# List open PRs
gh pr list

# View current branch's PR
gh pr view

# View a specific PR
gh pr view 123

# View PR with comments
gh pr view 123 --comments

# View PR in browser
gh pr view 123 --web

# Check PR diff
gh pr diff 123

# Check CI status on a PR
gh pr checks 123
```

### Review PRs
```bash
# Checkout a PR locally
gh pr checkout 123

# Approve a PR
gh pr review 123 --approve

# Request changes
gh pr review 123 --request-changes --body "Please fix X"

# Comment on a PR
gh pr comment 123 --body "Looks good, one question about..."
```

### Merge PRs
```bash
# Merge (standard merge commit)
gh pr merge 123 --merge --delete-branch

# Squash merge
gh pr merge 123 --squash --delete-branch

# Enable auto-merge (merges when CI passes)
gh pr merge 123 --auto --squash
```

## Issues

```bash
# List open issues
gh issue list

# View an issue
gh issue view 582

# Create an issue
gh issue create --title "Bug: description" --body "Details"

# Create issue with labels
gh issue create --title "Title" --label bug --label "priority 1"

# Close an issue
gh issue close 582

# List issues assigned to you
gh issue list --assignee "@me"
```

## CI / GitHub Actions

```bash
# List recent workflow runs
gh run list

# View a specific run
gh run view <run-id>

# View run with job steps
gh run view <run-id> --verbose

# Watch a run in progress
gh run watch <run-id>

# View logs for failed steps
gh run view <run-id> --log-failed

# Re-run a failed workflow
gh run rerun <run-id>

# Manually trigger the CI workflow
gh workflow run ci.yml
```

### This Project's CI Pipeline
The CI runs on every PR and push to `develop`. It uses a reusable workflow from `statikbe/.github` that runs:
- **ECS** (Easy Coding Standard) — PHP code style linting

Check CI before merging:
```bash
gh pr checks    # Check status on current branch's PR
```

## Releases & Tags

```bash
# List releases
gh release list

# Create a release
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"

# Create a release from a specific branch
gh release create v1.0.0 --target develop --generate-notes
```

## Repository & Browse

```bash
# View repo info
gh repo view

# Open repo in browser
gh browse

# Open a specific file in browser
gh browse path/to/file.php

# Open issues page
gh browse --issues

# Open PRs page
gh browse --pulls
```

## GitHub API (Advanced)

For anything not covered by dedicated commands:

```bash
# Get PR comments
gh api repos/statikbe/craft/pulls/123/comments

# Get PR reviews
gh api repos/statikbe/craft/pulls/123/reviews

# Get repo labels
gh api repos/statikbe/craft/labels

# Get branch protection rules
gh api repos/statikbe/craft/branches/develop/protection

# Custom queries with jq filtering
gh api repos/statikbe/craft/pulls --jq '.[].title'

# GraphQL query
gh api graphql -f query='{ repository(owner:"statikbe", name:"craft") { pullRequests(last:5) { nodes { title number } } } }'
```

## Common Workflows

See `./github-workflows-for-this-project.md` for detailed workflow patterns specific to this project.
