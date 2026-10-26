# Figma

## The starter kit

A Figma file that mirrors the base install: the same components, with the same options as in Craft, so you can wireframe or
design a site that can be built without surprises.
[Open the starter](https://www.figma.com/design/3j2ILGjt8ZdeCSoJ48qoFA).

- **Pages**: Foundations, Elements (logo, icons, buttons, breadcrumb, image, pagination), the page layout components (header,
  page header, content row, footer, …), one page per column type (in the order of the content row's cells), and test pages.
- **Content row**: the Trinity layouts, with Column 1–3 as swappable instances of the column types, and an Order property for
  the reversed layouts.
- **Variables** carry the CSS names of `frontend/css/site/theme.css` (their WEB code syntax is `var(--…)`). Modes make it
  responsive and themeable: Breakpoint (Mobile, Tablet, Desktop), Theme (Base install, Wireframe), Row background, Row
  spacing, Column width, Card width.
- **Neutral by default**: the starter uses the Wireframe theme (greys), placeholder images and a placeholder logo, and square
  corners. Duplicate the file for a project and change the variable values for its design.

## Annotations

Every component has an annotation that tells the developer what the component can do in Craft. They use three categories:

| Category           | Colour | Means                                                                                        |
| ------------------ | ------ | -------------------------------------------------------------------------------------------- |
| Rectangle          | Green  | The component as it is in the base install: a bullet list of its options for the editor, width rules, and which options are template choices |
| Rectangle Change   | Orange | The design needs a change to the base install component                                      |
| Custom component   | Red    | Not in the base install: has to be built for the project                                     |

The Rectangle annotations come with the starter; add Rectangle Change and Custom component annotations in the project's
design, so the developer sees at a glance what's standard and what isn't.

## From Figma to theme.css

The variables of a design go into the code with the theme export:

```
Figma file ──(plugin or Claude)──▶ figma-theme.json ──(apply-theme.mjs)──▶ theme.css
```

1. **Export**: with the *Theme export (base install)* Figma plugin (`tooling/figma-theme/plugin`), or ask Claude "export the
   theme from &lt;Figma link&gt;".
2. **Apply**: `node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json` shows what would change; add `--write`
   to change `theme.css`, and `--add-missing` for tokens `theme.css` doesn't have yet.
3. **Fonts**: a changed `--font-*` token needs the font: `yarn --cwd frontend googlefonts`, and import
   `css/site/base/fonts.css` in `main.css`.
4. **Build and check**: `yarn --cwd frontend prod`, then look at a few pages.

The `exporting-figma-theme` skill does steps 1–4 with you (see [Project skills](./skills)). How variables map to tokens,
what's skipped and the JSON format are in the
[figma-theme README](https://github.com/statikbe/craft/blob/develop/tooling/figma-theme/README.md).

## Source

- `tooling/figma-theme/` (plugin and `apply-theme.mjs`)
- `.claude/skills/exporting-figma-theme/SKILL.md`
