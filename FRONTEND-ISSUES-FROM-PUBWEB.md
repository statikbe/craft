# Frontend issues found while porting PUBWEB to the Rectangle frontend

Found on 2026-11-24 while moving PUBWEB (publiq.be) from its old Sass/jQuery frontend to the frontend of `origin/Rectangle` (`b3a4c768`). All of them are in folders Clint keeps in sync (`frontend/js/components-core`, `frontend/js/i18n`), so a fix in a project is overwritten by the next Clint update. They need fixing here.

## 1. Modal: labels are "undefined" (`modal.component.ts`)

The constructor stores the language file import without awaiting it:

```ts
// frontend/js/components-core/modal.component.ts:91-103
constructor(trigger: HTMLElement, options: Object = {}, plugin: ModalPlugin = null) {
  // this.getLang().then(() => {
  this.lang = import(`../i18n/s-modal-${this.siteLang}.json`);
  ...
  this.initTrigger(trigger);
  // });
}

private async getLang() {
  this.lang = import(`../i18n/s-modal-${this.siteLang}.json`);
}
```

`this.lang` is a Promise, so `this.lang.closeLabel`, `nextLabel`, `nextText`, `prevLabel` and `prevText` (lines ~175–213) are `undefined`. The close, next and previous buttons of every modal (image gallery included) get the text "undefined" for screen readers.

Fix (the commented-out code was nearly there; the other components already do it this way, e.g. `validation.component.ts:45`, `chip.component.ts:109`):

```ts
constructor(trigger: HTMLElement, options: Object = {}, plugin: ModalPlugin = null) {
  // The labels (close, next, previous) are read while building the modal, so wait for the language file first
  this.getLang().then(() => {
    this.options = { ...this.options, ...options };
    this.plugin = plugin;
    this.initTrigger(trigger);
  });
}

private async getLang() {
  this.lang = await import(`../i18n/s-modal-${this.siteLang}.json`);
}
```

Nothing uses the return value of `new Modal(...)`, so waiting before `initTrigger` is safe. Tested in PUBWEB: the gallery buttons get their labels.

## 2. Modal: the Dutch language file is in English (`i18n/s-modal-nl.json`)

`frontend/js/i18n/s-modal-nl.json` holds the English texts ("Close modal (Press escape to close)", "Next Image", …). The translation used in PUBWEB:

```json
{
    "dialogLabel": "Dialoogvenster - Sluiten (druk op Escape om te sluiten)",
    "closeLabel": "Venster sluiten (druk op Escape om te sluiten)",
    "contentError": "De inhoud van dit venster werd niet gevonden.",
    "nextText": "Volgende afbeelding",
    "nextLabel": "Volgende afbeelding (gebruik de pijl naar rechts om te wisselen)",
    "prevText": "Vorige afbeelding",
    "prevLabel": "Vorige afbeelding (gebruik de pijl naar links om te wisselen)"
}
```

## 3. No fallback for languages without an i18n file (German)

`frontend/js/i18n` only has `nl`, `fr` and `en` files. Components load `../i18n/s-<component>-${siteLang}.json`, where `siteLang` is `<html lang>` (`utils/site-lang.ts`). On a site in any other language (PUBWEB has a German site, `lang="de"`) the dynamic import fails, so validation, modal, autocomplete, chip, ajaxSearch, swiper and rangeSlider break there.

Two parts to fix:

1. Fall back to a default language when the file doesn't exist, e.g. in `SiteLang`/a small helper used by every component:
   ```ts
   const lang = await import(`../i18n/s-modal-${siteLang}.json`).catch(() => import(`../i18n/s-modal-en.json`));
   ```
2. Optionally ship `de` files. PUBWEB now has `s-{ajax-search,autocomplete,chip,modal,range-slider,swiper,validation}-de.json` (in `PUBWEB/frontend/js/i18n/`); they can be copied from there.

## 4. CKEditor: the textarea value is only kept in sync with a character limit (`CKEditor.component.ts`)

The editor content is only copied back to the source `<textarea>` inside the `data-ck-editor-wordcount` + `data-ck-editor-limit > 0` branch (`frontend/js/components-core/CKEditor.component.ts:142-157`). Without a word count/limit nothing is written back while typing; CKEditor only updates the textarea itself on form submit.

Consequences:

- A `required` textarea with `data-ck-editor` can never pass the `validation` component: its submit handler runs before CKEditor's own sync, so the textarea is still empty. PUBWEB had to drop `required` from the editors on the vacancy form (`templates/_profile/vacancies/_form.twig`).
- Even inside the limit branch the sync uses `editor.sourceElement.innerHTML = editor.getData()`. For a `<textarea>` that changes the default value (the text content), not `.value`, which is what the form submits and what the constraint validation checks once the field has been edited.

Fix: always sync on `change:data`, outside the word count branch, with CKEditor's own method, then let validation re-check the field:

```ts
.then((editor) => {
  editor.model.document.on('change:data', () => {
    editor.updateSourceElement();
    editor.sourceElement.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // … existing word count / limit code, without its own `sourceElement.innerHTML = …`
})
```

Also worth checking: the validation component should show the error for a CKEditor textarea next to the editor (the textarea itself is hidden).

## 5. Tabs: an anchor in the URL that isn't a valid CSS identifier breaks the tabs (`tabs.component.ts`)

Found on 2026-11-25 (PUBWEB-672, FAQ block with tabs). On load the component looks for a tab matching the URL hash with an unquoted attribute selector:

```ts
// frontend/js/components-core/tabs.component.ts:77
const activeButton = document.querySelector(`button[role=tab][data-panel=${urlTab}]`) as HTMLButtonElement;
```

The hash is used as is, so any anchor that isn't a valid CSS identifier makes `querySelector` throw a `SyntaxError` and the tabs stop initialising (no panel switching). That happens with anchors that have nothing to do with the tabs, e.g. a table of contents link starting with a digit (`#3-stappen`, `#2026-data`) or containing a dot or other special character.

Fix (applied in PUBWEB): quote and escape the value:

```ts
const activeButton = document.querySelector(`button[role=tab][data-panel="${CSS.escape(urlTab)}"]`) as HTMLButtonElement;
```

## 6. Tabs: clicking an element inside a tab button activates the wrong element (`tabs.component.ts`)

Found together with issue 5. The click handler takes the clicked element as the tab button:

```ts
// frontend/js/components-core/tabs.component.ts:84-88
private onClick(e) {
  e.preventDefault();
  const button = e.target as HTMLButtonElement;
  this.activateTab(button);
}
```

When a tab button has child elements (an icon, a `<span>` around the label), `e.target` is that child. `activateTab` then sets `aria-selected` on the child and reads `data-panel` from it, which is `null`, so the panel isn't found and the tab doesn't switch.

Fix (applied in PUBWEB): use the element the listener is attached to:

```ts
const button = e.currentTarget as HTMLButtonElement;
```

The listener is added with `this.onClick.bind(this)`; binding doesn't change `currentTarget`, so this is safe.

## 7. Tooltip: Esc doesn't close an open tooltip (`tooltip.component.ts`)

Found on 2026-11-25 (PUBWEB-675, theme tooltips on the kenniscentrum hub). Tippy opens the tooltips on hover and focus (its default `trigger: 'mouseenter focus'`), but has no Esc handling of its own: a tooltip opened by keyboard focus or by the mouse stays open until focus or the pointer moves away. WCAG 1.4.13 (Content on Hover or Focus) requires that it can be dismissed without that.

Fix (applied in PUBWEB): at the end of `initTippy()`, after the tooltips are created:

```ts
// Esc closes an open tooltip (WCAG 1.4.13: dismissible without moving the pointer or focus)
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    tippy.hideAll({ duration: 0 });
  }
});
```

`initTippy()` only runs on pages with tooltips, so the listener is only added there. An alternative is Tippy's `hideOnEsc` plugin recipe (a plugin per instance); `hideAll()` in one document listener is simpler and covers both `data-tippy-content` and `data-tippy-template` tooltips.

## 8. Ajax search: Esc empties a search field instead of only closing the suggestions (`ajaxSearch.component.ts`)

Found on 2026-11-25 (PUBWEB-685, autocomplete on the homepage and kenniscentrum hub). The component closes the suggestion list on Esc in its keyup handler:

```ts
// frontend/js/components-core/ajaxSearch.component.ts:254 (onKeyUp)
case 'Escape':
  this.hideMenu();
  break;
```

On an `<input type="search">` the browser has its own Esc behaviour: it clears the field, on keydown (before this keyup handler runs). So with the suggestions open, Esc closes the list **and** empties the field. The visitor who presses Esc to get rid of the list and then Enter to search, searches for nothing (`?q=`). The expected combobox behaviour (WAI-ARIA APG): the first Esc closes the listbox and keeps the text, a second Esc may clear it.

Fix (applied in PUBWEB, in a project component because this file is Clint-synced): on keydown, when the list is open, prevent the browser default. In the component itself, in `onKeyDown`:

```ts
case 'Escape':
  // only close the suggestions; a type="search" field would also clear itself
  if (!this.ajaxSearchListElement.classList.contains('hidden')) {
    e.preventDefault();
  }
  break;
```

With the list closed, Esc keeps the browser's own behaviour (clearing the field).

Related, same component, also worked around in PUBWEB: `onKeyDown` calls `preventDefault()` + `stopImmediatePropagation()` on **every** Enter, and `onKeyUp` only acts when a suggestion is highlighted. So Enter without a highlighted suggestion does nothing: the form isn't submitted. Expected: Enter without a highlighted option submits the form (e.g. `this.formElement.requestSubmit()` in the `else` of `if (this.hoverOption)`).

## 9. Ajax search inside the header search or the flyout: one Esc closes everything (`ajaxSearch`, `search`, `flyout`)

Found on 2026-11-25 (PUBWEB-685, autocomplete in the header search and in the search of the mobile menu). Three components react to the same Esc, each on its own:

```ts
// ajaxSearch.component.ts:254 (onKeyUp): closes the suggestions
case 'Escape':
  this.hideMenu();
  break;

// search.component.ts:62-70: closes the header search (#searchForm slide-out) on keyup
input.addEventListener('keyup', (e) => {
  if (searchElement.getAttribute('aria-expanded') == 'true' && e.key === 'Escape') { … form.classList.remove('search-show'); … }
});

// flyout.component.ts:111 (keydown listener on the document): closes the flyout
case 'Escape':
  e.preventDefault();
  this.closeFlyout();
  break;
```

So with an ajax search field in the header search or in the flyout, Esc with the suggestions open closes the suggestions **and** the whole header search (focus jumps to the trigger) or the whole flyout. Expected: the innermost thing closes first. The first Esc closes the suggestions, a second Esc the header search or the flyout.

Fix (applied in PUBWEB in a project component, capture listeners on the form that run before the components' own):

- keydown, Esc, suggestions open: `preventDefault()` (see issue 8), `stopPropagation()` (the flyout's document listener doesn't get it), close the list, and remember that this Esc closed it;
- keyup, Esc that closed the list: `stopImmediatePropagation()` (neither ajaxSearch nor the search component get it).

In the base install itself it's simpler: let `ajaxSearch` handle Esc on **keydown** when its list is open (close the list, `preventDefault()`, `stopPropagation()`), and let `search.component.ts` ignore an Esc whose keydown was already handled (`e.defaultPrevented` isn't kept between keydown and keyup, so e.g. a flag on the input, or move the search component to keydown too and check `defaultPrevented`).

## 10. Ajax search: Enter after closing the list still follows the last highlighted suggestion (`ajaxSearch.component.ts`)

Found together with issue 9. `hideMenu()` doesn't forget the highlighted option:

```ts
// ajaxSearch.component.ts:401-406
private hideMenu() {
  this.ajaxSearchListElement.classList.add('hidden');
  this.inputElement.setAttribute('aria-expanded', 'false');
  this.inputElement.removeAttribute('aria-activedescendant');
  this.inputElement.dispatchEvent(new CustomEvent('ajaxSearchHideMenu', { bubbles: true }));
}
```

`this.hoverOption` stays set, and the Enter case in `onKeyUp` follows it (`link.click()`) without checking whether the list is still open. Steps: type, arrow down to a suggestion, Esc (list closes, the typed text stays), Enter. That opens the suggestion instead of searching for the typed text.

Fix: in `hideMenu()` also clear the highlight:

```ts
if (this.hoverOption) {
  this.hoverOption.removeAttribute('aria-selected');
  this.hoverOption = null;
}
```

(and, with the Enter fix from issue 8, Enter with the list closed submits the form). In PUBWEB this is worked around in the project component: a capture keyup listener that keeps Enter away from ajaxSearch when the list is closed.
