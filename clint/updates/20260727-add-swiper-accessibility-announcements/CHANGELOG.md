# Add Swiper accessibility announcements

**Release date:** 2026-07-27

## Summary

The swiper component now feeds translated messages to Swiper's `A11y` module, so screen reader
users hear meaningful labels on the navigation buttons and pagination bullets instead of the
English defaults. The strings live in new `s-swiper-<lang>.json` language files and are loaded for
the current site language, following the same pattern as the other components.

## Highlights

- ✅ **Translated screen reader messages** — `prevSlideMessage`, `nextSlideMessage`, `firstSlideMessage`, `lastSlideMessage` and `paginationBulletMessage` are passed to the `A11y` module
- ✅ **Language files for NL, FR and EN** — `frontend/js/i18n/s-swiper-nl.json`, `-fr.json` and `-en.json`
- ✅ **Language-aware initialisation** — the swiper is initialised after its language file resolves, using `SiteLang.getLang()`

## Added

- `frontend/js/i18n/s-swiper-en.json`, `s-swiper-fr.json`, `s-swiper-nl.json` (automated)

## Changed

- `frontend/js/components-core/swiper.component.ts`: imports `SiteLang`, awaits the matching
  language file and passes the messages through the `a11y` option of the Swiper config (automated)

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - `swiper.component.ts` is force-synced by this update. If your project customised that file,
>   your changes are overwritten — check the file after updating and re-apply your customisations
>   on top of the new language-aware `constructor` / `getLang` structure.
> - The language file is resolved from `document.documentElement.lang`. If your project runs a site
>   language other than `nl`, `fr` or `en`, add a matching
>   `frontend/js/i18n/s-swiper-<lang>.json` (copy `s-swiper-en.json` and translate it), otherwise
>   the dynamic import fails and the swiper does not initialise.
> - Run `yarn build` (or restart `yarn dev`) after updating so the new language files are bundled.

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/swiper.html).
