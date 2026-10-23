---
name: exporting-figma-theme
description: Use this skill when the user wants the variables of a Figma design (made from the base install Figma starter) in the code, e.g. "export the theme from <Figma link>", "sync the Figma variables to theme.css", "apply this figma-theme.json". Reads the variables through the Figma connection or takes a JSON file from the Theme export plugin, and updates frontend/css/site/theme.css with tooling/figma-theme/apply-theme.mjs.
---

# Exporting a Figma theme to theme.css

The tooling lives in `tooling/figma-theme/` (read its `README.md` for the mapping rules):

- `plugin/code.js`: the Figma plugin. The extractor is the block between `// <extract>` and `// </extract>`.
- `apply-theme.mjs`: applies a `statik-figma-theme/1` JSON file to `frontend/css/site/theme.css`. Dry run by default.

Figma is the source of truth: every variable with a CSS name (WEB code syntax) overwrites the token in theme.css, also
where theme.css had a formula. Agreed with the user on 2026-10-23.

## Steps

1. **Get the JSON.**
   - The user has a file from the plugin: use it.
   - The user gives a Figma link: load the Figma skills the Figma connection requires, create a session for the file, then
     read `tooling/figma-theme/plugin/code.js`, take the text between `// <extract>` and `// </extract>` and run it with
     `use_figma`, ending with `return JSON.stringify(await extractTheme('<Theme mode>'));`. It only reads, it changes
     nothing in the file.
     - Ask which Theme mode when the file has more than the starter's two (*Base install*, *Wireframe*); never export
       *Wireframe* unless asked, it's the grey wireframe look.
     - Through the API `figma.root.name` is "Document": set `file` in the JSON to the real file name.
     - Save the result as `frontend/figma-theme.json` (or where the user wants it).
2. **Dry run**: `node tooling/figma-theme/apply-theme.mjs frontend/figma-theme.json`. Show the user the changes, the
   skipped tokens, the tokens theme.css doesn't have and the notes. Point out anything surprising (e.g. a radius of 999
   becoming pill buttons, a Breakpoint variable adding a new `@variant` override).
3. **Write** after the user agrees: add `--write`, and `--add-missing` only when the user wants the missing tokens
   (adding Tailwind palette tokens such as `--color-gray-*` overrides Tailwind's defaults for the whole site).
4. **Fonts**: when a `--font-*` token changed, the font isn't loaded yet. Offer to run the Google Fonts download
   (`yarn --cwd frontend googlefonts` asks for a Google Fonts URL with the families and weights from Figma) and to import
   `css/site/base/fonts.css` in `main.css`.
5. **Build and check**: `cd frontend && npx vite build` (or `yarn prod`), then look at a few pages with the browser
   (home, a page with content rows, a form) at desktop and mobile width.
6. Commit only when the user asks. Don't commit the JSON unless the user wants it in the repo.

## When the mapping is wrong

- A variable has the wrong CSS name: fix its WEB code syntax in Figma (variables panel → the variable → Code syntax),
  in the design file and in the starter (Figma file `3j2ILGjt8ZdeCSoJ48qoFA`), then export again.
- A token Figma only approximates (a fixed width where CSS uses a fraction, px where CSS uses svh) gets overwritten:
  add it to `SKIP` in `apply-theme.mjs` with the reason.
- A new responsive token: give the Figma variable in the Breakpoint collection a CSS name; the script writes Mobile
  first with `@variant md` / `lg` overrides, or uses an existing `-mobile` token pair.
