# How to load extra scripts on certain pages.

## Step 1

Create a new ".ts" file under the main "/js" folder.

## Step 2

Add the file as an entry to the [webpack.config.js file](/webpack.config.js)

Example

```js
entry: {
      main: getSourcePath("js/main.ts"),
      extra: getSourcePath("js/extraComponent.ts"),
    },
```

## Step 3

Add the reference to the entry in your Twig templates.

```Twig
{% set jsFiles = ["extra"] %}
```

<mark>
Notice that the name you include in the array is the name of the entry in the webpack.config.js file, not the name of the .ts file.
</mark>
