# Update 1.0.9

**Release date:** 2026-01-14

## Summary

Added word count and limit to the CKEditor component.

## Highlights

- ✅ **Word Count Display** - Real-time word and character counting with customizable templates
- ✅ **Character Limits** - Enforce maximum character limits to prevent database truncation
- ✅ **Link Configuration** - Control whether links open in new tabs with `data-ck-editor-link-open-new-tab`
- ✅ **SEO Protection** - Add `rel="nofollow"` to user-generated links with `data-ck-editor-link-nofollow`
- ✅ **Template Variables** - Dynamic templates support `${words}`, `${characters}`, and `${limit}`
- ✅ **HTML-aware Counting** - Character limits count plain text only (HTML tags excluded)
- ✅ **Soft Limit Enforcement** - Prevents typing when limit reached while allowing deletions

## Docs

You can find the [documentation on our docs](https://statikbe.github.io/craft/frontend/components/ckEditor.html).
