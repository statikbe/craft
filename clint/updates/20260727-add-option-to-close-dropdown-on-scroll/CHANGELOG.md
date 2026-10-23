# Add option to close dropdown on scroll

**Release date:** 2026-07-27

## Summary

Adds an opt-in `data-dropdown-close-on-scroll` attribute to the dropdown component. When present, the
menu closes on the first scroll event instead of staying open and repositioning itself. The default
behaviour is unchanged: without the attribute the menu keeps following its trigger on scroll.

## Highlights

- ✅ **Close on Scroll** - Add `data-dropdown-close-on-scroll` to dismiss the menu as soon as the user scrolls
- ✅ **Opt-in** - Purely additive; dropdowns without the attribute behave exactly as before
- ✅ **Useful for anchored menus** - Handy when the trigger scrolls out of view and a repositioned menu would feel disconnected

## Added

- `data-dropdown-close-on-scroll` attribute on `[data-dropdown]`, read once during initialisation
  (`frontend/js/components-core/dropdown.component.ts`)

## Changed

- The dropdown's scroll handler now closes the menu when the attribute is set, after repositioning

## Usage

```html
<button id="btn">Menu</button>
<div data-dropdown data-dropdown-trigger="btn" data-dropdown-close-on-scroll>
  <!-- Menu closes when the user scrolls -->
  <a href="#">Item 1</a>
  <a href="#">Item 2</a>
</div>
```

# Manual intervention

> ⚠️ **ATTENTION**:
> This update force-syncs `frontend/js/components-core/dropdown.component.ts`, which is normally
> excluded from the frontend sync. If your project has local changes to that file, re-apply them
> after updating.
>
> Run `yarn build` (or `yarn dev`) afterwards so the recompiled component ends up in your bundle.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/dropdown.html).
