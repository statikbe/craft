# Add copy to clipboard component

**Release date:** 2026-08-28

## Summary

Adds a new core component that copies a value to the clipboard when a `[data-copy]` element is
clicked. The value is either written literally in the attribute or read from another element on the
page (an input value or its text content). When `data-copy-feedback` is set, the component shows a
temporary toaster message; the toaster markup is created by the component itself, so there is nothing
to add to your templates.

## Highlights

- ✅ **Literal or referenced value** - copy a hardcoded string, or the content of a `#id` target
- ✅ **Works on any element** - the click handler calls `preventDefault()`, so links work as triggers
- ✅ **Async Clipboard API** - `navigator.clipboard.writeText()` in secure contexts
- ✅ **Legacy fallback** - hidden textarea + `document.execCommand('copy')` outside secure contexts
- ✅ **Optional toaster** - shown only when `data-copy-feedback` is set, auto-dismissed after 3s
- ✅ **Live region** - the toaster container is `aria-live="polite"`, each toast gets `role="status"`
- ✅ **Dynamic content support** - re-initialisation is guarded by a `copy-initialized` class

## Added

- `js/components-core/copy.component.ts`: the new component, triggered by `[data-copy]` (automated)
- `css/site/components/toaster.css`: styling for the toaster the component creates -
  `.c-toaster`, `.c-toaster__item` and `.c-toaster__item--visible` (automated)

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/copy.html).

# Manual intervention

> ⚠️ **ATTENTION**:
>
> The two new files are synced automatically, but the component is **not active** until you register
> it and import its CSS. Both files are project-specific and are therefore never overwritten by an
> update, so these steps have to be done by hand:
>
> 1. **Register the component** in `frontend/js/site.ts` (and in `frontend/js/site2.ts` if your
>    project has a second site), in the `components` array, after the `CKEditor` entry:
>
>    ```ts
>    {
>      name: 'copy',
>      selector: '[data-copy]',
>    },
>    ```
>
> 2. **Import the toaster CSS** in `frontend/css/site/main.css`, next to the other component
>    imports. Only needed if you use `data-copy-feedback`:
>
>    ```css
>    @import './components/toaster.css' layer(components);
>    ```
>
>    Without this import the toaster renders as unstyled text **and never disappears** - the
>    component removes a toast on its `transitionend`, so it needs the transition from this file.
>    The same applies if you override the styling: keep a `transition` on `.c-toaster__item`.
>
> 3. **Check the theme tokens.** `toaster.css` uses `--color-primary`, `--color-primary-contrast`,
>    `--shadow-card` and `--text-sm` from the `@theme` block in `main.css`. If your project does not
>    define one of them, the toast will be missing its background, text colour or shadow - add the
>    token or restyle `toaster.css` to match the project.
>
> 4. **Run `yarn install && yarn build`** in `frontend/` so the new component lands in the compiled
>    bundle.
