# General

This component takes care of some general coding that needs to run on every page.

## JS Enabled

The body element gets a class of `js-enabled` when the javascript is run.

## Preload transitions

When you have elements with a transition that are triggered on load, these gets animated right away. And that's something you almost never want.

On load the body has the class `preload-transitions`.

```CSS
.preload-transitions * {
  transition: none !important;
}
```

This class gets removed once the page is loaded.

## User is tabbing

As long as a user is not using the tab key, the outline on focus is removed. This is to prevent the outline is shown when a link is clicked.

```CSS
body:not(.user-is-tabbing) *:focus {
  outline: none;
  box-shadow: none;
}
```

When the user hits the tab-key the class `.user-is-tabbing` is added to the body element.
