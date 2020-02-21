# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.9] - 2019-07-03

## Added
- Added `modaal.js`
- Added `slider.js`
- Added `slider.scss`

## Changed
- Updated `list.scss` for better usage with our contentbuilder / redactor / temp fix

## [2.0.8] - 2019-06-20

## Changed
- Update `filter.js` use const and let instead of var
- Update `README.md`

## [2.0.7] - 2019-06-13

## Added
- Padding utility classes in `_spacing.scss` disabled by default
- Utility documentation

## Changed
- Cleanup flyout
- Prefixed the print classes with `u-`

## Removed
- Remove fixed height form `.form__select`

## [2.0.6] - 2019-05-29

## Added
- Heart icon
- btn download

## Changed
- Cleanup components

## [2.0.5] - 2019-04-12

## Changed
- Remove API keys

## [2.0.4] - 2019-04-09

## Changed
- Updated google icon
- Bug fix `spacing.scss` see https://github.com/statikbe/takeoff/issues/20

## [2.0.3] - 2019-03-15

## Added
- Added opacity on the placeholder selector to avoid it gets transparent

## Changed
- `Spacer.scss` gave the spacer its own breakpoint and rhythm variables for more lightweight
- Updated the button documentation
- Replaced the google plus icon with the regular google icon

## [2.0.2] - 2019-03-01

### Changed
- Spacer.scss updated now you can use breakpoints and select your own rhythms

## Removed
- Remove jQuery imports in js components

## [2.0.1] - 2019-01-28

### Added
- Accessible skip to main content link
- Added text-decoration: none styling for abbr[title]

### Changed
- Update btn--link

## [2.0.0] - Released

### Added
- Added icons for checkboxes and radio buttons
- Added %ext-icon-{icon_file_name} extends for icons (don't use stuff like `content: '\f111'` anymore) and applied where used
- Added text modifiers for notice colors
- Added display classes in /utility/_helpers.scss `u-display-block` and `u-display-inline-block`
- Added `_panel.scss`

### Changed
- Remove `keyboard-` prefix from arrow icon names
- Update docs/index.html to improve code block functionality (no more messing around with IDs)
- Simplify classes and completely rework _forms.scss
- Clean up _pagination.scss and use svg icons instead of css entities
- Use svg icons for `btn--ext`
- Increase border width for buttons and form inputs
- Make form input and button heights more coherent (with $btn-height and $input-height variables + quick maths for paddings)
- Make inline forms easier out of the box, including responsive
- Make list more coherent (there was a difference in padding between `<ol>` and `<ul>`)
- Decrease transition timing to 100ms
- Rework javascript files into ES6
- Moved /core/_helpers.scss to /utility/_helpers.scss
- Prefixed some helpers classes in /utility/_helpers.scss with `u-`
- Changed the class `pull--left` to `u-float-left` same for right
- Changed the class `hide--bp-med` to `u-hide@med` first try of new breakpoint syntax same for the `show` class
- Update hero component made it more responsive

### Removed
- Removed `btn--close`
- Removed `_block.scss`

## [1.5.4] - 2018-11-22

### Fixed
- Sass compilation error in _spacing.scss

## [1.5.3] - 2018-11-09

### Fixed
- Sass compilation error in _extends.scss

## [1.5.2] - 2018-10-18

### Added
- Active classes for pagination component

### Changed
- Use flexbox for inline component
- Increase container padding

### Removed
- Carousel component
- Navbar component

## [1.5.1] - 2018-08-31

### Updated
- Changed (.flyout__overlay) to (.overlay)
- Changed $grid-gutter-width to $rh-sml
- Changed the padding of the container, made it larger
- Changed (.form__item) margin-top when repeating inside a (.form__row)
- Changed (.card) made the card fully clickable with (.card__title:before)

### Added
- Added webfont.js (js/singles/webfont.js) with fallback for IE (promises bug)
- Added .text--primary in (type.scss)

## [1.4.5] - 2017-08-09

### Updated
- Comment offset grid classes by default

## [1.4.4] - 2017-08-07

### Updated
- components/map.scss - made map--wide responsive

### Added
- core/helpers.scss - responsive-embed, pointer
- core/grid.scss - grid--reverse, grid--offset--bp-{breapoint}__offset-{#}
- core/type.scss - text--white

- components/nav.scss - nav--social, nav--social-share

- icons/svg/material-icons - search.svg

## [1.4.3] - 2017-05-30

### Fixed
- Components where no longer concatenated and uglified to main.min.js

## [1.4.2] - 2017-05-12

### Updated
- Social icons
- Gallery component

### Added
- Download icon

## [1.4.1] - 2017-04-25

### Changed
- package.json: updated the version to the one corresponding in the changelog file
- package.json: removed grunt as a dependency (it already was a dev dependency, which was throwing warnings when running grunt)
- package.json: added a script to package.json so we can use yarn/npm to run our build ('yarn run build').

## [1.4.0] - 2017-04-24

### Changed
- Added babel to the default buildtasks in order to be able to start to use ES6 functionality for new projects today

## [1.3.0] - 2017-04-26

### Changed
- Flyout.scss: Full refactor new animations, new styling

### Added
- Scaffold.scss: Added class .clearfix

### Removed
- mixins/_type.scss: Removed hide-text
