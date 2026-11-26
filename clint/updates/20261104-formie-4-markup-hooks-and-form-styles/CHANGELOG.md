# Formie 4 markup hooks and form styles

**Release date:** 2026-11-04

## Summary

The base install moved to Formie 4. Formie 4 renames its classes from `fui-*` to `formie-*` and its data attributes from `data-fui-*` to `data-formie-*`, so the frontend no longer found the forms. This update prepares a project's frontend and form templates for Formie 4. Everything it changes keeps working on Formie 3, so you can apply it before or after the upgrade. The upgrade itself and the new `config/formie.php` are manual steps: see *Manual intervention*.

## Highlights

- **The Formie JS component starts on both versions**: its selector is now `[data-fui-form], [data-formie-form]`.
- **Forms render with `theme: 'none'`**: on Formie 4, only Formie's base CSS (3 KB) loads, not its theme CSS (63 KB). The styling stays ours (`config/formie.php`, `form.css`).
- **Labels with the label position "Hidden" stay visually hidden** on Formie 4.

## Changed

- `frontend/js/site.ts`, `frontend/js/site2.ts` (automated): the `formie` component selector `[data-fui-form]` becomes `[data-fui-form], [data-formie-form]`.
- `templates/**/*.twig` (automated): `craft.formie.renderForm(form)` becomes `craft.formie.renderForm(form, { theme: 'none' })`. This works with the old `_snippet` paths and with the new `pages/` / `contentBuilder/` ones. Formie 3 doesn't know the option and ignores it.
- `frontend/css/site/components/form.css` (automated): the base input selector puts its exclusions in `:where()`. They then add no specificity, so `input.has-error` wins again over the base input styles.

## Added

- `frontend/css/site/components/form.css` (automated): `[data-formie-sr-only] { @apply sr-only; }`. With `resetClasses` on, Formie 4 removes its `formie-sr-only` class from labels set to "Hidden"; the data attribute stays.

## Docs

See [Formie](https://statikbe.github.io/craft/frontend/components/formie.html) and [Forms](https://statikbe.github.io/craft/craft/content/forms.html) on our docs. `WHATS-NEW.md` (Rectangle, §11 Forms) lists everything that changed.

# Manual intervention

> ⚠️ **ATTENTION**:
> The Formie upgrade itself isn't automated. Do these steps when you move the project to Formie 4, and test every form afterwards (submit, validation errors, multi-page forms, the success message or redirect).

1. **Upgrade Formie**: `ddev composer require verbb/formie:^4.0.6 --no-update`, then `ddev composer update verbb/formie`, then `ddev craft up`. Formie's migrations move the captcha settings and the stencils.
2. **Replace `config/formie.php`** with the base install's version, then add back any project changes. Formie 4 rejects Twig (`{{ … }}`) in the theme config. Classes that depend on the field or page become `if` / `then` / `else` values, and browser states use the state keys `pageHidden`, `rowHidden`, `conditionalHidden`, `fieldControlError`, `tabLinkCurrent`, `tabLinkInactive`, `tabError` and `loading`. Renamed keys: `alertError` / `alertSuccess` → `messageError` / `messageSuccess`, `buttonWrapper` → `pageButtons`.
3. **Contact page redirect** (`templates/_site/pages/contact.twig`, or the old `_snippet` path): Formie 4 has no `form.submitActionEntryId` and no `redirectUrl` setting. Replace the `redirectEntry` / `form.setSettings({ redirectUrl: … })` part with:

   ```twig
   {% if form.settings.completionBehavior == 'redirect' and form.settings.completionRedirectSource == 'entry' and form.redirectEntryId %}
       {% set redirectEntry = craft.entries.id(form.redirectEntryId).siteId(currentSite.id).one() %}
       {% if redirectEntry and redirectEntry.url %}
           {% do form.setRedirectUrl(redirectEntry.url) %}
       {% endif %}
   {% endif %}
   ```

4. **Other `renderForm` calls**: calls that don't pass a plain `form` variable (e.g. `renderForm(entry.form.one())` or with options) weren't changed. Add `theme: 'none'` to their options.
5. **Project-specific CSS, JS and Twig** that use `fui-*` classes or `data-fui-*` attributes: rename them to `formie-*` / `data-formie-*`. A Formie event handler in `modules/` that uses `EVENT_MODIFY_HTML_TAG` / `ModifyFieldHtmlTagEvent` becomes `EVENT_MODIFY_SLOT_TAG` / `ModifyFieldSlotTagEvent`.
6. **reCAPTCHA**: Formie 4 keeps its captcha settings in the database instead of the project config. Check Formie → Settings → Captchas on every environment: reCAPTCHA on, with `$RECAPTCHA_ENABLED`, `$RECAPTCHA_SITE_KEY` and `$RECAPTCHA_SECRET_KEY`.
7. **Notifications**: on Formie 4, a notification that fails (e.g. without a recipient) makes the submit return a 500. Check the notifications of every form, or send them through the queue (`useQueueForNotifications`).
8. Once every environment runs Formie 4, you can shorten the selector in `site.ts` / `site2.ts` to `[data-formie-form]`.
9. Run `yarn prod` to rebuild the frontend.
