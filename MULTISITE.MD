# How to make the frontend work for a multisite setup.

The base setup is configured for one site but made with a multisite in mind.
If it's a single site you are making. You don't need to adjust anything.

All frontend files and commands below are in `frontend/` (there is no `package.json` at the root).

## Naming the sites.

The single base site files are located in subfolders with the name "site". If you know upfront that it's going to be a multisite, I advise you rename this to a more descriptive name.
If you want to rename the site you need to adjust the name or content of the following files/folder.

- templates/\_site
- frontend/js/site.ts
- frontend/img/site
- frontend/css/site
- frontend/vite-favicon.config.js
- frontend/vite.config.js

## Adding a second, third, nth, site.

A second site is already prepared: `frontend/js/site2.ts`, `frontend/vite.config.site2.js` (builds to `public/frontend-site2/`) and `frontend/vite-favicon.config.site2.js`. Copy these for every extra site and adjust where necessary.

## package.json

`frontend/package.json` already has scripts for the second site:

- `yarn watch-site2`: the Vite dev server for the second site.
- `yarn favicon-site2`: the favicons for the second site.
- `"prod-two-sites-example": "vite build && vite build --config vite.config.site2.js"`: make this the main prod script and adjust where necessary.

## Tailwind

The project uses Tailwind 4: there is no `tailwind.config.js`. The configuration lives in the CSS: `frontend/css/site/main.css` imports Tailwind and the theme tokens from `theme.css`, and its `@source` lines say which files Tailwind scans (`templates/_site`, …).
If you duplicate the `css/site` folder for a new site, adjust the `@source` paths in its `main.css` to the new templates folder and the tokens in its `theme.css`.

## Favicon

Each site has its own favicon config: `frontend/vite-favicon.config.js` for the first site and `frontend/vite-favicon.config.site2.js` for the second, built with `yarn favicon` and `yarn favicon-site2`.

For extra sites, make new vite-favicon.config.projectx.js files and add build scripts in `frontend/package.json`.

## Templates

Duplicate the folder "templates/\_site" and rename the folder to something else.

Make sure the name fits the name you choose in the `frontend/vite.config.js` file.

## JS

Rename the files "frontend/js/site.ts" and "frontend/js/site2.ts", or duplicate one. Also adjust the references in the corresponding vite config (`frontend/vite.config.js`, `frontend/vite.config.site2.js`).

## CSS

Rename or duplicate the folder "frontend/css/site". And adjust the reference in the .ts files.

## Headers

Make sure the `layout.twig` file of each templates folder references the correct files in the head.

```
{{ craft.vite.script('js/site.ts', false) }}
{{ craft.vite.inline('@webroot/favicon/site/webapp.html') }}
```

## vite.php

In the config folder there is a vite.php file. Make sure the correct manifests are loaded per site. Complete the switch so it fits your current setup.
