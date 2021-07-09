# How to make the frontend work for a multisite setup.

The base setup is configured for one site but made with a multisite in mind.
If it's a single site you are making. You don't need to adjust anything.

## Naming the sites.

The single base site files are located in subfolders with the name "site". If you know upfront that it's going to be a multisite, I advise you rename this to a more descriptive name.
If you want to rename the site you need to adjust the name or content of the following files/folder.

- templates/\_site
- tailoff/js/site.ts
- tailoff/img/site
- tailoff/ejs/header-site.ejs
- tailoff/css/site
- favicons.config.js
- webpack.config.js

## Adding a second, third, nth, site.

When adding extra sites, you need to uncomment and copy some code and data.

### Webpack.config.js

There are comments in the webpack.config.js file you can uncomment for a second site. And you can copy paste these blocks for a nth site.

### Tailwind

Default you have a "tailwind.config.js" file. When you have more than 1 website, I advice to make a config for every site next to this one.
As an example for 2 sites you wil have 3 files.

```
tailwind.config.js
tailwind.config.site.js
tailwind.config.site2.js
```

If you go for this setup, you also need to change the postcss.config.js file to postcss.config.site.js. And you have to adjust the reference in the webpack.config.js file.

So we have 2 configs for tailwind and a third file (tailwind.config.js) that is not directly used in the build or process flow. So why is this file around? We use vscode as our IDE and we use an extension for intellisense of our tailwind classes (https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss). This extension watches this file for the intellisense.

In order for this to work there are 2 buildscripts in the package.json file to easily copy the content of the project config files to this file. In this setup it's important never to alter the tailwind.config.css file directly.

### Favicon

Adjust the default favicons.config.js file to something like favicons.config.site.js and adjust the name in the build script located in projects.json.

For extra sites, make new favicons.config.projectx.js files and add build scripts in package.json.

### Templates

Duplicate the folder "templates/\_site" and rename the folder to something else.

Make sure the name fits the name you choose in the webpack.config.js file.

### JS

Rename the files "tailoff/js/site.ts" and "tailoff/js/site2.ts", or duplicate one. Also adjust the references in webpack.config.js.

### CSS

Rename or duplicate the folder "tailoff/css/site". And adjust the reference in the .ts files.

### Headers

Rename or duplicate the files "tailoff/ejs/header-site.ejs" and "tailoff/ejs/header-site2.ejs" and adjust the references in webpack.config.js

### Icons

The icons are shared for now over the different projects. But it's important to include them with there own baseurl. You can setup extra baseurls in "config/general.php"

Use it like

```twig
<svg class="icon" aria-hidden="true">
    <use xlink:href="{{ alias("@baseUrlSite/icon/sprite.svg#alarm") }}"></use>
</svg>
```

```twig
<svg class="icon" aria-hidden="true">
    <use xlink:href="{{ alias("@baseUrlSite2/icon/sprite.svg#alarm") }}"></use>
</svg>
```
