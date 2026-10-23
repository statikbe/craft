# Figma theme export

Takes the variables of a design made from the base install Figma starter and writes them into
`frontend/css/site/theme.css`. Figma is the source of truth: every variable with a CSS name gets Figma's value.

```
Figma file ──(plugin or Claude skill)──▶ figma-theme.json ──(apply-theme.mjs)──▶ theme.css
```

## 1. Export the variables

**With the plugin** (no Claude needed)

1. In the Figma desktop app: *Plugins → Development → Import plugin from manifest…* and pick
   `tooling/figma-theme/plugin/manifest.json`. Once per computer.
2. Open the design file, run *Plugins → Development → Theme export (base install)*.
3. Choose the Theme mode (e.g. the project's brand mode, not *Wireframe*), click **Export**, then **Download**.
4. Put the JSON file in the project, for example `frontend/figma-theme.json`.

**With Claude**: ask "export the theme from <Figma link>". The `exporting-figma-theme` skill runs the same extractor
through the Figma connection and saves the JSON for you.

## 2. Apply it to theme.css

```bash
node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json            # what would change
node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json --write    # change theme.css
```

| Option | |
|---|---|
| `--write` | write the changes (without it: a dry run) |
| `--add-missing` | add tokens Figma has but theme.css doesn't (e.g. Tailwind's grays), in a block at the end of `@theme` |
| `--css <path>` | another theme file (default `frontend/css/site/theme.css`) |

Then build (`yarn --cwd frontend prod`) and check the site.

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
- **Fonts** keep the fallback that's in theme.css (`"Figtree", sans-serif`). Load the font itself with
  `yarn --cwd frontend googlefonts` and import `css/site/base/fonts.css` in `main.css`; the report reminds you.
- **Formulas** in theme.css (`color-mix(...)` shades, the hero overlay) are overwritten with Figma's value.
- **Skipped** (Figma only approximates them): `--container-md`, `--width-form`, `--height-hero-medium`,
  `--height-hero-full`. Edit `SKIP` in `apply-theme.mjs` to change that.

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

## Changing the extractor

The extraction code lives once, in `plugin/code.js` between `// <extract>` and `// </extract>`. The skill runs that block
through the Figma connection, so keep it self-contained (no references outside the block).
