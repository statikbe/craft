# Brief: scripts voor de tutorialvideo's (Rectangle)

The video series is for clients whose site is built on the **Rectangle** version of the base install. That's the repo at
`/Users/kareljanvanhaute/Documents/GIT/Craft Base Install` (branch Rectangle; local site
`https://craft-base-install.local.statik.be`). The outline and the client training transcripts it was distilled from stay outside the repo (they contain client data).

## Decisions by the user (2026-11-07)

- All 16 proposals in "Tegenstrijdigheden" are approved. Use those answers and never repeat the claims they replace. In short:
  - Search keywords only serve the site's own search.
  - Upload images large. The site scales anything bigger than 3500 px down on upload.
  - Alt text only for informative images. Purely illustrative images stay empty.
  - Tick "new tab" yourself for PDFs.
  - Use H2 and H3, and H4 rarely.
  - A deleted block comes back through revisions. Ten revisions are kept per page.
  - You don't need to save again after applying a draft.
  - Autosave keeps your work, but nothing goes live before you save.
  - A preview link is valid 10 days.
  - The social image is the one in the SEO tab, otherwise the default from the SEO settings.
  - Don't make claims about pasting only once.
  - Build forms in Formie rather than embedding them.
  - Form submissions are deleted after 1 year.
- **Formie**: keep part 10 short. A separate Formie course may follow later.
- **Images**: the site processes images the native Craft way. Never mention "Image Optimize", "Optimizing images" or waiting
  until versions are ready.
  - On upload, images bigger than 3500 px are scaled down.
  - The site makes the sizes and modern formats (WebP/AVIF) itself, the first time a page shows the image. That first view
    can be a bit slower; every visitor after that gets the ready version.
  - Moving the focal point or cropping makes new versions automatically.
  - Outline video 5.3 is dropped and merged into 5.2.
- **Part 4 (content builder)** follows the new logic: content rows with columns. See below.
- **Headings**: mention the Headings Checker in the headings video.
- **Links**: mention the Link Checker in the links part.
- **Anchors**: describe the new Entry Anchors mechanism, not the old "copy the link icon" approach.

## Rectangle facts

Read the docs for details:
- `docs/src/craft/content/content-builder.md`, `headings.md`, `links.md`, `hero.md`
- `plugins/trinity/README.md`
- `vendor/statikbe/craft-entry-anchors/README.md`

### Content builder

The **Content builder** field is a stack of **content rows** ("Inhoudsrij"; check the Dutch label).
- Each row has a **Layout** with 1–3 columns:
  - full;
  - 1/2 + 1/2;
  - 1/3 × 3;
  - 1/3 + 2/3;
  - 2/3 + 1/3.
- Each column holds one **column type**: Text, Image, Image gallery, Quote, Video, Table, Card, Person, Numbers, Form, FAQ,
  Embed, Call to action, Overview, Team, Partners.
- Only the types that fit a column's width are offered:
  - Card, Table, FAQ, Embed, Form, Image gallery, Overview, Partners and Numbers need at least 1/2.
  - Call to action and Team are always full width.
  - Card and Person are at most 1/2.
  - Two Partners columns can't share a row, and neither can Quote and FAQ.
- The control panel shows the columns side by side as cards. Empty columns can be filled. Columns can be added or merged (only
  when one is empty). A column can be moved to another row.
- Row settings:
  - **Background color**. Hidden on a row with a FAQ column.
  - **Vertical alignment**: top, center or bottom.
  - **Space above**: Auto, Close, Normal or Extra. It only matters between rows with the same background. It shows as a
    compact control between the rows.
- Each column type except Team has a **Mobile** tab with **Mobile order** (Auto, 1, 2, 3). It sets the column's position when
  the columns are stacked on a phone.
- Columns with a title have **Show title**. When it's off, only screen readers read the title.
- **Overview column**:
  - Overview options: Entries, News, Calendar or Knowledge Base.
  - **Dynamically fill**.
  - Grid or Carrousel.
  - Card layout: Stacked or Image left.
  - Highlight the first card.
  - Link with a position.
- **Card column**: type Entry or Custom, layout Stacked or Image left.
- The old blocks "Text + image", "Text in columns" etc. no longer exist. A text next to an image is now a row of 1/2 + 1/2
  with a Text column and an Image column.

### Headings

The **Headings Checker** plugin:
- The page title is the H1.
- The title of a column is an H2.
- Cards are H3.
- In the text, editors pick H3 to H5.
- CKEditor shows **level badges** next to headings.
- The entry sidebar shows the page's **heading outline**.
- Publishing a page whose headings skip a level is **blocked**: the row and the column turn red.
- A **Heading issues** dashboard widget lists the pages with issues.

### Links

Buttons and links are a **Links** field, max 5 (single **Link** in some places). Each link has:
- a link field: Entry, URL, Asset, Email or Phone; check the types in `config/project/fields/`;
- a **Link style**: Primary, Primary >, Secondary, Secondary >, Ghost, Ghost >, Link, Link >;
- a "new window/tab" option.

The **Link Checker** plugin:
- a **Links** panel in the entry sidebar with the broken links and warnings of the page, including unsaved changes;
- a warning when you publish a page with broken links (the page is still saved);
- a **Broken links** dashboard widget;
- Utilities → Link Checker, with CSV export and **Ignore**.

### Anchors

The **Entry Anchors** plugin:
- A column title is an **Anchor Text** field. Below the title you see "Anchor: #…" with **Edit**.
- While the block isn't published yet, the anchor follows the title. After that it stays the same, so links keep working.
- You can edit the anchor. Changing it breaks links that use the old anchor.
- Two small copy buttons: one copies the link to the block, the other the anchor.
- In a Link field, when you pick an entry, a dropdown lists the anchors on that page.
- A URL link has a dropdown with the anchors of the current page.

### Page header

- On the home page: the **Hero** content block (title, image, intro, links).
- On other pages: the title, **Intro**, **Header image** and **Links**.

### Other facts

- Preview links are valid for 10 days.
- Ten revisions are kept per page.
- Formie submissions are kept for 1 year.
- Plugins: SEO Fields, Translate (fixed texts), Navigate (menus), Formie, Cookie banner, Knock Knock (staging password).
- Sites: NL / FR / EN.

## Verify the labels

The scripts name what to click by its label in the **Dutch** control panel.
- Look up labels in:
  - `config/project/` (field and entry type names);
  - `translations/nl/site.php` (Dutch CP translations of our labels);
  - Craft's `vendor/craftcms/cms/src/translations/nl/app.php`;
  - the plugins' `src/translations/nl/*.php` in `vendor/`.
- When you can't confirm a label, write it as you expect it and mark it `[label?]` in the Screen line.
- Don't invent features. If the base install doesn't have something the trainers showed (for example "page navigation" on
  some client sites), leave it out or say "op sommige sites".

## Script format

This is the `making-screencasts` skill format; the recorder reads the captions and voice lines from it.
- One folder per video: `course/videos/<part>-<nr>-<slug>/script.md`, with two-digit part and number, for
  example `04-02-rij-toevoegen`.

```markdown
# <Titel>

- **Doel:** … **Publiek:** contentbeheerders van een Rectangle-site. **Taal:** Nederlands. **Lengte:** ongeveer N s.
- **Start:** where the recording begins (page, state, demo content needed).

## 1. <Caption shown on screen, max ~6 words>
Voice: <one to three short spoken sentences>
Screen: <what happens: clicks, typing, scrolling, by UI label>
```

### Rules

- The length follows the outline's duration (60–150 s).
- Use 6–12 scenes. A scene lasts at least as long as its narration, at about 2.5 words per second.
- Narration:
  - Dutch, jij-vorm, warm and down to earth, like a colleague showing you something.
  - Written for the ear: no abbreviations, symbols or parentheses. Write "één derde" instead of "1/3", "H twee" instead of
    "H2". Don't spell out URLs or keyboard shortcuts.
  - Never say "Statik". To refer to the agency, say "ons" ("laat het ons weten"). Name nobody.
- Explain *why* briefly when the trainings did; that is what made the live trainings good. Use the customer questions from the trainings to anticipate confusion.
- The first scene says what you'll learn. The last scene gives one tip, or points to the next video.
- Content typed on screen is neutral demo content: the demo theme is a nature-walk organisation with routes, news and events.
  No real names or customer data.

## Return

Write the files. Then return a short list: folder, title, duration, and any `[label?]` or open question.

## Second deliverable per video: a written walkthrough (`walkthrough.md`)

Added by the user: next to `script.md`, each video folder gets a **`walkthrough.md`**: a written alternative for people who
don't like watching videos. NOT a transcript of the narration: it explains more, in more detail.

```markdown
# <Titel>

<Intro: what you'll learn and when you need it, 2–3 sentences.>

## <Step or subject>
<Explanation in full sentences: what to click (labels in **bold**), what happens, and why.>

![<alt text describing what the screenshot shows>](screenshots/<nn>-<slug>.png)
<!-- screenshot: which screen, state and what to highlight -->

> **Tip:** … / > **Let op:** … (sparingly)

## Veelgestelde vragen
- **<customer question from the trainings>** <answer>

## Zie ook
- <related videos/walkthroughs by number and title>
```

Rules: Dutch, jij-vorm, same tone and facts as the script; more depth than the video (edge cases, the "why", options the
video skips, the customer questions from the topic files as FAQ). Numbered steps for procedures. Screenshot placeholders
with a planned filename and an HTML comment saying what to capture (they're made later with the recorder); a meaningful alt
text for each. Written for the eye, so "H2", "1/3", shortcuts are fine here. Typically 300–800 words.
