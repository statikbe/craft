# How to load extra css on certain pages.

## Step 1

Create a new ".css" file under the main "/css" folder.

## Step 2

import the css file in a .ts file that is defined as an entry point in the [webpack.config.js file](/webpack.config.js)

Example

```js
import "../css/extra.css";
```

## Step 3

Add the reference to the entry in your Twig templates.

```Twig
{% set cssFiles = ["extra"] %}
```

<mark>
Notice that the name you include in the array is the name of the css file.
</mark>
