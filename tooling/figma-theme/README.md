# Figma theme export

Takes the variables of a design made from the base install Figma starter and writes them into
`frontend/css/site/theme.css`. Figma is the source of truth: every variable with a CSS name gets Figma's value.

```
Figma file ──(Theme export plugin + the project's theme.css)──▶ new theme.css
```

No Claude and no extra step needed: the plugin merges Figma's values into your current theme.css and gives you the new
file. It only replaces values: comments, font fallbacks and tokens Figma doesn't know stay as they are; a formula is
overwritten when Figma has that variable.

## Install the plugin (once per computer)

In the Figma desktop app: *Plugins → Development → Import plugin from manifest…* and pick
`tooling/figma-theme/plugin/manifest.json`.

## Export

1. Open the design file and run *Plugins → Development → Theme export (base install)*.
2. Choose the **Theme mode**: the project's brand mode, not *Wireframe*.
3. Drop the project's `frontend/css/site/theme.css` on the plugin (or click to choose it).
4. Optional: tick **Add the tokens theme.css doesn't have yet** (e.g. Tailwind's grays; that overrides Tailwind's
   defaults for the whole site).
5. Click **Export**. The plugin lists the changes, the tokens theme.css doesn't have, the skipped tokens and notes.
6. Click **Download theme.css** and replace `frontend/css/site/theme.css` with it. `git diff` shows what changed.
7. A font changed (the notes say so)? Load it with `yarn --cwd frontend googlefonts` and import
   `css/site/base/fonts.css` in `main.css`.
8. Build (`yarn --cwd frontend prod`) and check the site.

## Other ways

- **JSON + script**: the plugin also gives the export as JSON (*JSON (for apply-theme.mjs)*). Apply it from the
  command line, for example to see a dry run first or to apply the same export to several themes:

  ```bash
  node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json            # what would change
  node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json --write    # change theme.css
  ```

  | Option | |
  |---|---|
  | `--write` | write the changes (without it: a dry run) |
  | `--add-missing` | add tokens Figma has but theme.css doesn't, in a block at the end of `@theme` |
  | `--css <path>` | another theme file (default `frontend/css/site/theme.css`) |

- **With Claude** (optional): if you work with Claude Code, ask "export the theme from <Figma link>". The
  `exporting-figma-theme` skill runs the same extractor through the Figma connection, so you don't have to open the file
  in the desktop app, and walks you through the dry run, fonts and build check.

There is no script that reads Figma by itself: Figma's REST API for variables is only open to Enterprise plans, so the
export has to run inside Figma (the plugin or Claude's Figma connection).

## How variables become tokens

- A variable's CSS name is its **WEB code syntax** in Figma (`var(--color-primary)`). Variables without one are Figma-only
  helpers (image heights per breakpoint, type sizes) and are ignored.
- **Theme** variables are read in the chosen mode. A variable that points to another variable with a CSS name stays a
  reference: `var(--color-primary)`.
- **Spacing** values in px become `--spacing(n)` when they're a multiple of 4 (spacing and radius tokens), else px; 999+
  becomes `calc(infinity * 1px)`. The same size written differently (`4rem` vs `64px`) isn't a change.
- **Breakpoint** variables (Mobile / Tablet / Desktop):
  - with a `-mobile` token in theme.css (e.g. `--spacing-section` + `--spacing-section-mobile`): Desktop and Mobile;
  - otherwise mobile first: Mobile in `@theme`, overrides in `@layer theme` (`@variant xs/sm/md` get Tablet,
    `lg/xl` Desktop). New overrides go to `@variant md` (Tablet) and `@variant lg` (Desktop).
- **Fonts** keep the fallback that's in theme.css (`"Figtree", sans-serif`). The font itself still has to be loaded (see
  step 7).
- **Formulas** in theme.css (`color-mix(...)` shades, the hero overlay) are overwritten with Figma's value.
- **Skipped** (Figma only approximates them): `--container-md`, `--width-form`, `--height-hero-medium`,
  `--height-hero-full`. Edit `SKIP` in `merge-theme.mjs` to change that.

## Files

| File | |
|---|---|
| `plugin/` | The Figma plugin: `code.js` reads the variables, `ui.html` is the window and does the merge |
| `merge-theme.mjs` | The merge rules: theme.css + export → new theme.css and a report. Used by the plugin and the script |
| `apply-theme.mjs` | The command line version |
| `build-ui.mjs` | Copies `merge-theme.mjs` into `plugin/ui.html` |

## Changing the rules

- **The merge** lives once, in `merge-theme.mjs`. A Figma plugin window is one HTML file, so after changing it run
  `node tooling/figma-theme/build-ui.mjs`; it copies the file into `plugin/ui.html` between `// <merge>` and
  `// </merge>`. `node tooling/figma-theme/build-ui.mjs --check` tells you when `ui.html` is out of date. Keep
  `merge-theme.mjs` plain JavaScript without imports.
- **The extractor** lives in `plugin/code.js` between `// <extract>` and `// </extract>`. The skill runs that block through
  the Figma connection, so keep it self-contained (no references outside the block).

## JSON format

```json
{
  "format": "statik-figma-theme/1",
  "file": "Project – design",
  "theme": "Brand",
  "breakpoints": ["Mobile", "Tablet", "Desktop"],
  "exportedAt": "2026-10-23T08:00:00.000Z",
  "tokens": [
    { "name": "--color-primary", "figma": "color/primary", "collection": "Theme", "type": "COLOR", "value": "#1f4d3a" },
    { "name": "--color-button-primary-bg", "figma": "button/primary-bg", "collection": "Theme", "type": "COLOR", "alias": "--color-primary" },
    { "name": "--spacing-cta-x", "figma": "spacing/cta-x", "collection": "Breakpoint", "type": "FLOAT", "values": { "Mobile": 24, "Tablet": 40, "Desktop": 40 } }
  ]
}
```
