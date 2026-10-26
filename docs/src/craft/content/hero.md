# Hero, page header and intro

Every page starts with a header: breadcrumb, title, intro, buttons and an image. One template draws it, `_pageHeader.twig`,
in one of three variants. Two presets fill it with data: `_hero.twig` for the home page and `_defaultHeader.twig` for the
other pages.

| Template              | Data                                                                                  | Used on                         |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| `_pageHeader.twig`    | none of its own: the presets pass it                                                  | through the presets             |
| `_hero.twig`          | the entry's **Hero** content block (`hero`); no breadcrumb                             | `_site/index` (home)            |
| `_defaultHeader.twig` | the entry's title, `intro`, `headerImage` and `ctas` (when the entry has them)         | content pages, overviews, items, account pages, 404, 503, search results |

All three are in `templates/_site/_snippet/_content/`.

## The Hero field

`hero` is a Content Block on the Home entry type:

| Field | Handle    | Required |
| ----- | --------- | -------- |
| Title | `heading` | yes      |
| Image | `image`   | yes      |
| Intro | `intro`   | no       |
| Links | `ctas`    | no       |

Nothing is rendered without a title.

## Variants and options

Pass these to a preset with `include … with`. `_hero.twig` also takes them with a `hero` prefix (`heroVariant`, `heroSide`, …).
Unknown values fall back to the default (the first value).

| Variable           | Values                           | What                                                                                     |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `headerVariant`    | `overlay` · `panel` · `split`    | Image behind the text, darkened · image behind a text box · text and image side by side (stacked below `md`) |
| `headerSide`       | `left` · `right`                 | The half with the text                                                                   |
| `headerHeight`     | `auto` · `medium` · `full`       | As high as the text, or at least `--height-hero-medium` / `--height-hero-full`           |
| `headerAlign`      | `center` · `top` · `bottom`      | Where the text sits when the header is higher than the text                              |
| `headerOverlay`    | `flat` · `gradient`              | Overlay only: the same darkening everywhere, or only on the text's side (from `md`)       |
| `headerImageWidth` | `full` · `container`             | Image to the screen's edges, or in the container with rounded corners                    |
| `headerTextWidth`  | `half` · `wide` · `full`         | The text's width without an image                                                        |
| `headerSectionClass` | classes                        | On the outer element, e.g. `section--light`, so a row with the same background joins it  |

And the data: `headerTitle`, `headerIntro` (`false` for none), `headerIntroClass`, `headerImage`, `headerCtas` (`[]` for none),
`showBreadcrumb`.

### Defaults of the presets

| Preset           | Defaults                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `_defaultHeader` | `split`, image in the `container`, text `left` and `wide`, aligned `top`, `section--light`, intro `text-xl` |
| `_hero`          | the engine's defaults: `overlay`, `left`, `auto`, `center`, `flat`, `full`                         |

The home page uses a panel:

```twig
{% include '_site/_snippet/_content/_hero' with {
    heroVariant: 'panel',
    heroImageWidth: 'full',
    heroSide: 'left',
    heroHeight: 'auto',
    heroAlign: 'center',
    heroOverlay: 'gradient'
} %}
```

News items use `{ headerVariant: 'split', headerImageWidth: 'full' }`.

## Blocks

Embed a preset to add content in the header:

```twig
{% embed '_site/_snippet/_content/_defaultHeader' %}
    {% block afterTitle %}
        <div class="mb-5 text-sm">{{ entry.postDate|date('d/m/Y') }}</div>
    {% endblock %}
{% endembed %}
```

| Block                                                    | Where                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `afterBreadcrumb`, `beforeTitle`, `afterTitle`, `afterIntro`, `afterCtas` | around the parts of the text                |
| `imageSlot`                                              | in the image's place when there is no image                 |
| `headerText`                                             | replaces the whole text column                              |

News items show the date in `afterTitle`, events their details.

## Styling

Colours, spacing, radii and heights are the Hero tokens in `frontend/css/site/theme.css` (`--color-hero-*`, `--spacing-hero-*`,
`--radius-hero-*`, `--height-hero-*`). The image is loaded eagerly with a high fetch priority, at its focal point.

## Source

- `templates/_site/_snippet/_content/_pageHeader.twig`, `_hero.twig`, `_defaultHeader.twig`
- `config/project/fields/hero--*.yaml`
