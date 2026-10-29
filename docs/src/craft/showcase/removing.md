# Removing the showcase

A client project doesn't need the showcase when it goes live. It's made of these pieces:

| Piece          | What                                                                   | Removed by                                       |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Pages          | The `gridbuilder` page and all its child pages (Pages section)         | `statik/contentbuilder-cleanup`                  |
| Images         | The `contentbuilder-showcase` folder in Public Files                   | `statik/contentbuilder-cleanup --with-images`    |
| Template code  | The marked blocks in `contentBuilder.twig`                            | By hand, or the Claude skill                     |
| Feature code   | The commands, helper, Twig helpers, config and content                 | Only when the feature should go for good         |

## The pages

```bash
ddev craft statik/contentbuilder-cleanup
```

| Option            | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| (none)            | Moves the `gridbuilder` page and its child pages to the trash        |
| `--with-images`   | Also deletes the image folder (`assets` in `content.json`)           |
| `--hard-delete`   | Deletes the pages permanently instead of moving them to the trash    |
| `--interactive=0` | Doesn't ask for confirmation                                         |

The command only changes the database of the environment it runs in. On a server, run it there too
(`php craft statik/contentbuilder-cleanup`).

## The template code

`templates/_site/contentBuilder/contentBuilder.twig` has showcase code between markers:

```twig
{# contentbuilder-showcase:start #}
…
{# contentbuilder-showcase:end #}
```

Remove every block between the markers, the markers included: one before the loop, one at the top of the loop, and two inline
ones around the `include` that wrap the 2/3 and 3/4 pages. Keep everything else: the project may have changed the file since.
Then check that nothing is left:

```bash
grep -rn "contentbuilder-showcase\|isShowcase\|variationAttr\|contentbuilderShowcase" templates/
```

Clear the caches (`ddev craft clear-caches/all`) and check that a page with content rows still renders.

## Removing the feature for good

Only when the project should never generate the showcase again. Run the cleanup command first: it's one of the files that go.

- `modules/statik/src/console/controllers/ContentbuilderController.php`
- `modules/statik/src/console/controllers/ContentbuilderCleanupController.php`
- `modules/statik/src/helpers/ContentbuilderShowcase.php`
- The `contentbuilderShowcaseLabel()`, `isContentbuilderShowcasePage()` and `showcasePageWidth()` methods in
  `modules/statik/src/variables/StatikVariable.php`
- The two Trinity page width listeners in `modules/statik/src/Statik.php` (under the `contentbuilder-showcase` comment).
  Keep Trinity and `config/trinity.php`: they are the content row itself.
- `gridbuilderShowcaseSlug` in `config/custom.php`
- `config/contentbuilder-showcase/`
- The `updating-contentbuilder-showcase` and `removing-contentbuilder-showcase` skills in `.claude/skills/`

## Claude skill

The [`removing-contentbuilder-showcase`](../claude/skills) skill does all of this: the pages, optionally the images, the
template code and, when asked, the feature code. It then checks the result.

## Source

- `modules/statik/src/console/controllers/ContentbuilderCleanupController.php`
- `templates/_site/contentBuilder/contentBuilder.twig`
