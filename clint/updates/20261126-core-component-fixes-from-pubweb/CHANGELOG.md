# Core component fixes from PUBWEB

**Release date:** 2026-11-26

## Summary

Fixes in the core components, found while porting PUBWEB to the Rectangle frontend.

## Added

- German language files (`js/i18n/s-*-de.json`) for every core component.
- An English fallback: a site in a language without a language file (`<html lang>`) loads the `-en.json` file instead of breaking validation, modal, autocomplete, chip, ajax search and swiper.

## Fixed

- **Modal**: the close, next and previous buttons had the label "undefined" (the language file wasn't awaited).
- **Modal**: `s-modal-nl.json` held the English texts; it's now in Dutch.
- **CKEditor**: the textarea is kept in sync while typing (`updateSourceElement()` + an `input` event), not only with a character limit. A `required` CKEditor textarea now passes the validation component.
- **Tabs**: an anchor in the URL that isn't a valid CSS identifier (`#3-stappen`) no longer stops the tabs from working.
- **Tabs**: clicking an icon or `<span>` inside a tab button activates the tab.
- **Tooltip**: Esc closes an open tooltip (WCAG 1.4.13).
- **Ajax search**: with the suggestions open, Esc only closes them: it doesn't empty a `type="search"` field, and it doesn't also close the header search or the flyout. A second Esc does that.
- **Ajax search**: Enter without a highlighted suggestion submits the form.
- **Ajax search**: closing the suggestions forgets the highlighted one, so Enter afterwards searches for the typed text.

# Manual intervention

> ⚠️ **ATTENTION**:
> Projects that worked around these issues in a project component (e.g. PUBWEB's Esc/Enter capture listeners on the search form, or dropping `required` from CKEditor textareas) can remove those workarounds. Run `yarn prod` after the update.
