# Content Builder Blocks — Field Reference

Per-block field breakdown for the `contentBuilder` Matrix field. See the "Content Builder" section in `SKILL.md` for how blocks are dispatched to templates. Source of truth: `config/project/entryTypes/<block>--*.yaml` (field layout) + `config/project/fields/` (field definitions).

Field handles below are the **layout handles** (what you use in Twig, e.g. `block.text`). A block's `type.handle` selects its template `_site/_snippet/_content/_blocks/_<handle>.twig`.

## Common fields (shared by most blocks)

- **`blockTitle`** — `AnchorLink` (custom statik field "Title (Anchor)"), optional. Rendered as an `<h2>` anchor.
- **`backgroundColor`** — Config Values field, optional. Options come from `config/config-values-field.php` → `Background colors` (`section--default` / `section--light` / `section--primary`); stored value is the CSS class.

"Text" fields are CKEditor rich text. "Hyper" = `verbb/hyper` link field. "Position"/"Width" = `hybridinteractive` field types. Each block also has a native entry **Title** (admin-only label; `hasTitleField: false` on all blocks, so it's set via the title element, not shown as content).

---

## callToAction — "Call To Action" (`_callToAction.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | "Title (Anchor)" |
| `text` | CKEditor (Extended) | – | Body copy |
| `cta` | Hyper | **yes** | "Call to actions" — link button(s) |
| `image` | Assets | – | Single image |
| `backgroundColor` | Config Values | – | |

## customTable — "Custom Table" (`_customTable.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | |
| `table` | CKEditor ("CK Editor - Table") | **yes** | Table-enabled CKEditor config |

_No `backgroundColor`._

## embed — "Embed" (`_embed.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `embed` | Plain Text | **yes** | Raw embed HTML — template only renders it if it contains `src="https:` |

_Has a Markdown instructions UI element. No `blockTitle`/`backgroundColor`._

## faq — "FAQ" (`_faq.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | |
| `text` | CKEditor (Extended) | – | Intro copy |
| `faqBlock` | Matrix ("Title + Text") | – | Label "FAQ Block" — repeatable Q&A items |
| `backgroundColor` | Config Values | – | |

## form — "Form" (`_form.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | |
| `text` | CKEditor (Extended) | – | Copy above the form |
| `form` | Formie Forms | **yes** | Rendered via `craft.formie.renderForm()` |
| `backgroundColor` | Config Values | – | |

## image — "Image" (`_image.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `images` | Assets | **yes** | One or more images |
| `imageWidth` | Width | – | `full` / `1/2` / `1/3` / `1/4` (drives `srcset`/sizes) |
| `imagePosition` | Position | – | left / right / center |
| `showLargerVersionInPopup` | Lightswitch | – | Opens larger image in a popup |
| `backgroundColor` | Config Values | – | |

_No `blockTitle`._

## overview — "Overview" (`_overview.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | |
| `entries` | Entries relation | **yes** | Rendered as a responsive card grid (`_item/_card`) |
| `backgroundColor` | Config Values | – | |

## quote — "Quote" (`_quote.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `text` | Plain Text | **yes** | The quote itself (field name "Quote") |
| `writer` | Plain Text | – | Label "Author" |
| `authorImage` | Assets | – | |
| `cta` | Hyper | – | |
| `backgroundColor` | Config Values | – | |

_No `blockTitle`._

## textImage — "Text (+ Image)" (`_textImage.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | |
| `text` | CKEditor (Extended) | **yes** | |
| `cta` | Hyper | – | |
| `image` | Assets | – | |
| `position` | Position ("Position Left/Right") | – | Label "Image position" |
| `backgroundColor` | Config Values | – | |

## textTwoColumns — "Text (2 columns)" (`_textTwoColumns.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `titleColumn1` | AnchorLink | – | |
| `textColumn1` | CKEditor (Extended) | **yes** | |
| `ctaColumn1` | Hyper | – | |
| `titleColumn2` | AnchorLink | – | |
| `textColumn2` | CKEditor (Extended) | **yes** | |
| `ctaColumn2` | Hyper | – | ⚠️ its CP label reads "Call to action Column **1**" — likely a config typo (should be Column 2) |
| `backgroundColor` | Config Values | – | |

## textVideo — "Text + Video" (`_textVideo.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `blockTitle` | AnchorLink | – | |
| `text` | CKEditor (Extended) | **yes** | |
| `cta` | Hyper | – | |
| `video` | URL | **yes** | Video URL (parsed by `statikbe/craft-video-parser`) |
| `placeholderImage` | Assets | – | Poster image |
| `position` | Position ("Position Left/Right") | – | Label "Video position" |
| `videoCaption` | Plain Text | – | Field name "Caption" |
| `backgroundColor` | Config Values | – | |

## video — "Video" (`_video.twig`)

| Field (handle) | Type | Required | Notes |
|---|---|---|---|
| `video` | URL | **yes** | Video URL (parsed by `statikbe/craft-video-parser`) |
| `videoCaption` | Plain Text | – | Field name "Caption" |
| `placeholderImage` | Assets | – | Poster image |
| `backgroundColor` | Config Values | – | |

_No `blockTitle`._
