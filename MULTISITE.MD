# How to make the frontend work for a multisite setup.

The base setup is configured for one site but made with a multisite in mind.
If it's a single site you are making. You don't need to adjust anything.

## Naming the sites.

The single base site files are located in subfolders with the name "site". If you know upfront that it's going to be a multisite, I advise you rename this to a more descriptive name.
If you want to rename the site you need to adjust the name or content of the following files/folder.

- templates/\_site
- tailoff/js/site.ts
- tailoff/img/site
- tailoff/css/site
- vite-favicon.config.js
- vite.config.js

## Adding a second, third, nth, site.

When adding extra sites, you need to uncomment and copy some code and data.

## package.json

There is an example script already made `"prod-two-sites-example": "vite build && vite build --config vite.config.site2.js",`
Make this the main prod script and adjust where necessary.

## Tailwind

From tailwind css v3.2 and up you can include the config in your main.css file. So if you duplicate the css/site folder for your new project you also copy the tailwind.config.js file.
If you use VSCode I recommend altering the config file (.vscode/settings.json) to your current setup. This make s sure the [tailwind intellisense plugin](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) uses the correct config on your templates.

## Favicon

Adjust the default vite-favicon.config.js file to something like vite-favicon.config.site.js and adjust the name in the build script located in package.json.

For extra sites, make new vite-favicon.config.projectx.js files and add build scripts in package.json.

## Templates

Duplicate the folder "templates/\_site" and rename the folder to something else.

Make sure the name fits the name you choose in the vite.config.js file.

## JS

Rename the files "tailoff/js/site.ts" and "tailoff/js/site2.ts", or duplicate one. Also adjust the references in the corresponing vite.config.js.

## CSS

Rename or duplicate the folder "tailoff/css/site". And adjust the reference in the .ts files.

## Headers

Make sure the \_layout.twig files are referencing the correct files in the head.

```
{{ craft.vite.script("tailoff/js/site.ts") }}
{{ craft.vite.inline("@webroot/favicon/site/webapp.html") }}
```

## vite.php

In the config folder there is a vite.php file. Make sure the correct manifests are loaded per site. Complete the switch so it fits your current setup.
