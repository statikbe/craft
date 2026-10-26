# Project skills

The base install comes with skills for [Claude Code](https://code.claude.com): instructions Claude loads when a task needs
them, so it works the way this project expects. They live in `.claude/skills/<name>/SKILL.md` and travel with the repository,
so every project made from the base install has them.

## Using a skill

- **Ask for the task**: Claude picks the skill whose description matches ("check my fields against the code guidelines").
- **Call it by name**: type `/<name>`, e.g. `/checking-code-guidelines`, optionally followed by what you want.

## The skills

| Skill                                | Use it to                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `understanding-project-architecture` | Get Claude up to speed on the project: config, plugins, the Statik module, the sites, the content builder, the frontend build |
| `working-with-ddev`                  | Run PHP, Composer and Craft commands the right way (always through `ddev`), and troubleshoot DDEV                     |
| `working-with-github-cli`            | Pull requests, issues and CI with `gh`, following our branching (PRs against `develop`)                               |
| `checking-code-guidelines`           | Check fields, entry types, sections and templates against the [code guidelines](../code-quality/guidelines), and apply the fixes you approve |
| `exporting-figma-theme`              | Put the variables of a Figma design into `theme.css`, from a Figma link or an exported JSON file. See [Figma](./figma) |
| `updating-contentbuilder-showcase`   | Fill or refresh the content of the [content builder showcase](../showcase/about): scrape a client site, invent content for a theme, translate it, or follow new column types |
| `removing-contentbuilder-showcase`   | Remove the showcase pages and the showcase code before go-live, or the whole showcase feature. See [Removing it](../showcase/removing) |
| `authoring-clint-updates`            | Ship a frontend change to existing projects as a Clint update (`update.json` and `CHANGELOG.md`)                      |

## When to use which

### understanding-project-architecture

Background for any change to config, templates, the module or plugins, or a question about how the project fits together.
Claude usually loads it by itself; it holds reference pages on the content row, the content builder blocks, the page header,
calendar, knowledge base, team, partners and the plugin set.

### working-with-ddev

For anything that runs in the containers: `ddev craft …`, `ddev composer …`, database imports and exports, Xdebug, logs.

### working-with-github-cli

Creating and reviewing pull requests, checking CI before a merge, issues and releases.

### checking-code-guidelines

Before a pull request, or after adding fields and sections: "check my work against the code guidelines", "check the casing
of the sections on this branch". It asks which guideline parts and which part of the project to check, reports what doesn't
follow the guidelines, and changes nothing until you approve. For handle renames it first asks whether the project is live.

### exporting-figma-theme

When a design made from the Figma starter is ready: "export the theme from &lt;Figma link&gt;" or "apply this
figma-theme.json". It shows a dry run first, then writes `theme.css` and offers to load the fonts.

### updating-contentbuilder-showcase

"Fill the showcase with content from &lt;client site&gt;", "make the showcase look like a bakery", or after a column type
changed. It edits `config/contentbuilder-showcase/content.json` and regenerates the pages.

### removing-contentbuilder-showcase

Before go-live: "remove the showcase". By default it removes the pages and the showcase code in `_contentBuilder.twig`; the
images and the feature code only when you ask.

### authoring-clint-updates

After a change in `frontend/` (or shared templates and root config) that existing projects should get: "make a Clint update
for this". It reads the diff and writes the update folder. See the [Clint docs](../../frontend/clint/updates).

## Source

`.claude/skills/`
