# Components

This section documents all JavaScript components included in Statik's Craft CMS Base Install. All components are custom-built, TypeScript-based, and designed to work together seamlessly.

## Overview

Our component library provides a comprehensive set of UI patterns and interactions commonly needed in web projects. Each component is:

- ✅ **TypeScript-first** - Type-safe with full IDE support
- ✅ **Accessible** - Built with WCAG 2.1 AA compliance in mind
- ✅ **Modular** - Use only what you need
- ✅ **Progressive Enhancement** - Works without JavaScript when possible
- ✅ **Framework-agnostic** - Pure JavaScript, no framework dependencies

## Component Categories

### Interactive UI

Core interactive elements for user engagement:

- **[Accordion](/frontend/components/accordion)** - Expandable/collapsible content sections
- **[Tabs](/frontend/components/tabs)** - Tabbed content navigation
- **[Toggle](/frontend/components/toggle)** - Show/hide content triggers
- **[Modal](/frontend/components/modal)** - Overlay dialogs and lightboxes
  - [Ajax Modal](/frontend/components/modal_ajax) - Load content dynamically
  - [Confirmation Modal](/frontend/components/modal_confirmation) - Confirm user actions
  - [Image Modal](/frontend/components/modal_image) - Image lightbox
  - [Video Modal](/frontend/components/modal_video) - Video player overlay
- **[Dropdown](/frontend/components/dropdown)** - Contextual menus and selectors
- **[Flyout](/frontend/components/flyout)** - Slide-out panels
- **[Tooltip](/frontend/components/tooltip)** - Contextual help text

### Forms & Input

Enhanced form controls and validation:

- **[Autocomplete](/frontend/components/autocomplete)** - Enhanced select with search
- **[Datepicker](/frontend/components/datepicker)** - Calendar date selection
- **[Chip](/frontend/components/chip)** - Multi-select with tags
- **[Password Toggle](/frontend/components/passwordToggle)** - Show/hide password input
- **[Range Slider](/frontend/components/rangeSlider)** - Visual number input
- **[Matrix](/frontend/components/matrix)** - Dynamic form field groups
- **[Optional Blocks](/frontend/components/formOptionalBlocks)** - Conditional form sections
- **[Other Radio Option](/frontend/components/formOtherRadio)** - "Other" option with text input
- **[Indeterminate Checkboxes](/frontend/components/indeterminateChecks)** - Partial selection states
- **[Formie](/frontend/components/formie)** - Craft Formie integration

### Form Validation

Client-side validation components:

- **[Validation](/frontend/components/validation)** - Base validation system
  - [Checkbox Range](/frontend/components/checkboxRange) - Min/max checkbox selection
  - [Countdown](/frontend/components/countdown) - Character/word counting
  - [Password Confirm](/frontend/components/passwordConfirm) - Match password fields
  - [Password Strength](/frontend/components/passwordStrength) - Password complexity meter

### Content Display

Components for presenting and organizing content:

- **[Ajax Paging](/frontend/components/ajaxpaging)** - Load more content without page refresh
- **[Ajax Search](/frontend/components/ajaxsearch)** - Dynamic search results
- **[Load More](/frontend/components/loadMore)** - Infinite scroll or button-based loading
- **[Filter](/frontend/components/filter)** - Client-side content filtering
- **[Search](/frontend/components/search)** - Search functionality
- **[Masonry](/frontend/components/masonry)** - Grid layout with varying heights
- **[Table](/frontend/components/table)** - Responsive data tables
- **[Swiper](/frontend/components/swiper)** - Touch-enabled slider/carousel

### Media

Media handling components:

- **[Background Image](/frontend/components/backgroundImage)** - Responsive background images
- **[Video Background](/frontend/components/videoBackground)** - Full-screen video backgrounds
- **[Video Toggle](/frontend/components/videoToggle)** - Play/pause video controls
- **[Google Maps](/frontend/components/googleMaps)** - Google Maps integration
- **[Leaflet Map](/frontend/components/leaflet)** - Open-source map alternative

### Layout & Navigation

Structural components for page layout:

- **[Sticky Header](/frontend/components/stickyHeader)** - Fixed header on scroll
- **[Parallax](/frontend/components/parallax)** - Parallax scrolling effects
- **[Pull Out](/frontend/components/pullOut)** - Break out of container constraints

### Content Editing

Components for content management:

- **[CKEditor](/frontend/components/ckEditor)** - Rich text editor integration

### Utilities

Helper components for common patterns:

- **[General](/frontend/components/general)** - Utility functions and helpers

## How Components Work

### Auto-initialization

Components automatically initialize when they detect their data attribute in the DOM:

```html
<div data-accordion>
  <!-- Component content -->
</div>
```

The component loader detects the `data-accordion` attribute and loads the Accordion component automatically.

### Data Attributes

Each component uses a specific data attribute pattern:

- Format: `data-[component-name]`
- Examples: `data-accordion`, `data-modal`, `data-tabs`
- Case-sensitive and hyphenated

### Dynamic Content

Components work with dynamically added content:

```javascript
// After adding new content to the DOM
DOMHelper.onDynamicContent(container, 'select[data-autocomplete]', (elements) => {
  // Components auto-initialize
});
```

### Configuration

Most components accept configuration through:

1. **Data attributes** - `data-config-option="value"`
2. **JSON configuration** - `data-config='{"option": "value"}'`
3. **JavaScript API** - Direct instantiation

## Component Architecture

### Component Types

**Core Components** (`components-core/`)

- Essential components for most projects
- Updated via Clint
- Can be extended in site components

**Site Components** (`components-site/`)

- Project-specific implementations
- Never overwritten by updates
- Your custom components go here

::: tip Creating Custom Components
Always create custom components in `components-site/` to prevent them from being overwritten during Clint updates.
:::

## Accessibility

All components are built with accessibility in mind:

- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ ARIA attributes
- ✅ Focus management
- ✅ Color contrast compliance

Test your implementations with [Clint's accessibility testing](/frontend/clint/tests).

## Browser Support

Components support:

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

Components are optimized for performance:

- **Lazy Loading** - Components load only when needed
- **Event Delegation** - Efficient event handling
- **Debouncing** - Throttled expensive operations
- **Small Bundle Size** - Tree-shaking removes unused code

## Getting Help

### Documentation

Browse individual component pages in the sidebar for:

- Detailed usage instructions
- Configuration options
- Code examples
- Accessibility notes

### Support

- 🐛 **Bug Reports** - [Open an issue on GitHub](https://github.com/statikbe/craft/issues)
- 💡 **Feature Requests** - [Open an issue on GitHub](https://github.com/statikbe/craft/issues)
- 📖 **Questions** - Check existing documentation or create an issue

### Testing

Use [Clint](/frontend/clint/introduction) to test your component implementations:

- Accessibility compliance
- HTML validation

## Next Steps

- Browse component documentation in the sidebar
- Learn about [frontend architecture](/frontend/frontend)
- Explore [Clint testing tools](/frontend/clint/introduction)
