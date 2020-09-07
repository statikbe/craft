# TailOff

This is a Statik Front-end dev starterkit to get started with tailwind in our Craft CMS projects.

### Setup

We use tailwindscss and webpack.

- `webpack.config.js`
- `tailwind.config.js`

Getting started

````bash

yarn install

````

Afterwards you can build using
````bash

yarn dev

````
or
````bash

yarn watch

````

**CSS and Javascript**

`tailoff/css` and `tailoff/js`

**Favicon**
Add an svg in `tailoff/img/` called `favicon.svg` and run
````bash

yarn favicon

````

**Icons**
Icons can be added inside `tailoff/icons/` and after a build they will be available as a webfont.
Example usage
`<span class="icon icon--{icon-name}" aria-hidden="true"></span>`

  
