# Multisite

The base install has three sites (NL, FR, EN) in one site group: one website in three languages, sharing templates and
frontend. That's not what this page is about.

A **multisite** is a project with several websites, each with its own look: its own templates, CSS, JS and favicon. The
base install is built with that in mind. The single site's files live in folders named `site` (`templates/_site`,
`frontend/css/site`, `frontend/js/site.ts`, `frontend/img/site`), and a second site is already sketched out next to them:
`vite.config.site2.js`, `vite-favicon.config.site2.js` and the `watch-site2`, `favicon-site2` and `prod-two-sites-example`
scripts in `frontend/package.json`.

How to rename the first site and add a second, third, … one is in
[MULTISITE.MD](https://github.com/statikbe/craft/blob/develop/MULTISITE.MD): the files to copy, the Tailwind and favicon
setup, the templates, the headers and `config/vite.php`.

For a single website you don't need to change anything.
