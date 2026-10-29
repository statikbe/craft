# Upgrade frontend dependencies to latest

**Release date:** 2026-08-31

## Summary

Every frontend dependency is moved to its latest published version. Four of them are major upgrades
that needed code changes, not just a version bump — TypeScript 7 removed a `tsconfig` option the
project used, and google-fonts-helper 3 removed the API `googlefonts.js` was written against.

Verified on the base install: all four Vite build configs (site, site2, CKEditor, favicon) succeed,
and `tsc --noEmit` reports the same two pre-existing errors as before the upgrade and no new ones.

## Changed

Majors:

| Package | From | To |
| --- | --- | --- |
| `typescript` | 5.9.3 | 7.0.2 |
| `swiper` | 12.0.3 | 14.2.0 |
| `sharp` (resolution) | 0.29.3 | 0.35.4 |
| `google-fonts-helper` | 2.0.1 | 3.7.4 |

Minors and patches: `vite` 8.0.12 → 8.2.2, `tailwindcss` + `@tailwindcss/vite` → 4.3.3,
`@vitejs/plugin-legacy` → 8.2.3, `@floating-ui/dom` → 1.8.0, `@vimeo/player` → 2.30.4,
`terser` → 5.51.2, `autoprefixer` → 10.5.4, `vite-plugin-mkcert` → 2.1.0.

- `tsconfig.json`: `moduleResolution` `node` → `bundler` and `module` `es2020` → `esnext`.
  **Required** — TypeScript 7 removed `moduleResolution: node10`, and the compiler refuses to run
  without this. `bundler` is the correct resolution mode for a Vite project.
- `googlefonts.js`: ported to the google-fonts-helper 3 API. The `GoogleFontsHelper` class is gone;
  the script now imports the standalone `download` / `isValidURL` functions, and `download()` returns
  a `Downloader` that must be `.execute()`d. The options object is unchanged, and the script writes
  the same output as before.

## Fixed

- `leaflet.component.ts`: the `data-address` branch called `leaflet.marker(...)`, and Leaflet 2
  removed the lowercase factory functions — so a map configured with `data-address` threw
  `leaflet.marker is not a function` and rendered no marker. It now uses `new leaflet.Marker(...)`,
  matching what the `data-locations` branch already did. The removed-in-v2 `tap` option was dropped
  from the map options at the same time.

# Manual intervention

> ⚠️ **ATTENTION**:
>
> - **Run `yarn install` in `frontend/` before anything else**, then `yarn build`. The lockfile and
>   `package.json` both change, so an install is mandatory — not the usual optional rebuild.
> - **Your `frontend/package.json` is overwritten by this update.** It is not in the sync exclude
>   list, so the base install's version replaces yours. If your project added its own dependencies,
>   scripts or `resolutions` there, note them first (`git diff frontend/package.json` after applying)
>   and merge them back before running `yarn install`. The same applies to `frontend/yarn.lock` and
>   `frontend/tsconfig.json`.
> - **TypeScript 7 is a hard requirement of the new `tsconfig.json`,** and equally the new
>   `tsconfig.json` is required by TypeScript 7. Do not take one without the other. If your project
>   pinned an older TypeScript, it must move too.
> - **Check your own `tsconfig` for `moduleResolution: node`.** Any project-level override still
>   setting it will fail the same way; change it to `bundler`.
> - **Swiper 12 → 14 is two majors.** The base component only uses `Swiper`, `swiper/modules`
>   (`Navigation`, `A11y`), `swiper/css` and `navigation.lockClass`, all unchanged in 14. If your
>   project uses other Swiper modules, effects or CSS entry points, re-check them against the Swiper
>   14 migration notes — this update does not cover custom carousel code.
> - **If your project uses Leaflet directly,** the same v2 caveat applies to your code: the lowercase
>   factories (`L.marker`, `L.tileLayer`, `L.map`, …) do not exist. Use the class constructors.
> - **Favicons will change when you next run `yarn favicon`.** sharp 0.35 compresses noticeably
>   better — some generated PNGs drop by ~40%. Nothing regenerates automatically; the assets change
>   only when you run that command yourself.
> - **Not covered by the verification above:** the Vite dev server (`yarn watch`) and real browser
>   behaviour. Do one `yarn watch` pass and check a Swiper carousel and a `data-address` Leaflet map
>   before shipping.
> - `leaflet` stays on `2.0.0-alpha.1` — there is no newer 2.x, and the latest stable (1.9.4) would be
>   a downgrade. It is the one dependency not on a stable release.
