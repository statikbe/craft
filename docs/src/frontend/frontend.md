# Frontend

Welcome to the frontend documentation for Statik's Craft CMS Base Install. This page provides an overview of the frontend architecture, build system, and development workflow.

## Overview

Our frontend stack is built with modern web technologies, focusing on performance, maintainability, and developer experience:

- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized production builds
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling
- **TypeScript**: Type-safe JavaScript development
- **Component-Based**: Modular, reusable components

## Key Concepts

### Component Architecture

Components are organized into two categories:

1. **Core Components** (`components-core/`)

   - Essential components for most projects
   - Updated via Clint
   - Examples: form validation, toggles, ...

2. **Site Components** (`components-site/`)
   - Project-specific components
   - Never overwritten by updates
   - Custom implementations for your project

::: tip
Keep your custom code in `components-site/` to prevent it from being overwritten during Clint updates.
:::

### TypeScript First

All JavaScript is written in TypeScript for:

- Type safety and better IDE support
- Easier refactoring and maintenance
- Better documentation through types
- Catching errors at compile time

### CSS Architecture

We use Tailwind CSS with a custom configuration:

- Utility-first approach for rapid development
- Component-specific styles when needed

## Development Workflow

### Environment Configuration

Before starting development, configure the `FRONTEND_DEV` variable in your `.env` file:

```bash
# .env
FRONTEND_DEV=true
```

**Important:**

- **`FRONTEND_DEV=true`** - Required for `yarn watch` to work properly. Craft will load assets from the Vite dev server.
- **`FRONTEND_DEV=false`** - Uses built assets from `/public/frontend/`. You must run `yarn dev` at least once to build the assets before Craft can load them.

::: warning First Time Setup
If you set `FRONTEND_DEV=false`, make sure to run `yarn dev` at least once to generate the built assets. Otherwise, Craft won't be able to load any frontend resources.
:::

### Starting Development

Start the development server with hot module replacement:

```bash
yarn watch
```

**Prerequisites:**

- `FRONTEND_DEV=true` in your `.env` file
- Vite dev server will be started on port 5173

This command:

- Checks for Clint updates
- Starts Vite dev server with HMR
- Watches for file changes
- Enables HTTPS for local development

For multisite projects:

```bash
yarn watch-site2
```

### Building for Production

Build optimized assets for production:

```bash
yarn prod
```

For multisite projects:

```bash
yarn prod-two-sites-example
```

This creates optimized, minified bundles in `/public/frontend/`.

### Development vs Production Mode

| Mode            | Command      | FRONTEND_DEV | Assets Loaded From                 |
| --------------- | ------------ | ------------ | ---------------------------------- |
| **Development** | `yarn watch` | `true`       | Vite dev server (HMR enabled)      |
| **Production**  | `yarn prod`  | `false`      | Built files in `/public/frontend/` |
| **Hybrid**      | `yarn dev`   | `false`      | Built files (build once, no HMR)   |

::: tip Quick Switching
To switch between development and production modes, just toggle `FRONTEND_DEV` in your `.env` file and restart Craft (or clear cache with `ddev craft clear-caches/all`).
:::

### Build Commands

| Command                       | Description                   |
| ----------------------------- | ----------------------------- |
| `yarn watch`                  | Development server with HMR   |
| `yarn watch-site2`            | Development server for site 2 |
| `yarn dev`                    | Build once + check updates    |
| `yarn prod`                   | Production build              |
| `yarn prod-two-sites-example` | Build for multiple sites      |
| `yarn ckeditor`               | Build CKEditor styles         |
| `yarn favicon`                | Generate favicon assets       |
| `yarn favicon-site2`          | Generate favicon for site 2   |
| `yarn googlefonts`            | Download Google Fonts         |

## Vite Configuration

The project uses multiple Vite configurations:

- **`vite.config.js`** - Main site configuration
- **`vite.config.site2.js`** - Secondary site (multisite setup)
- **`vite-ckeditor.config.js`** - CKEditor-specific build
- **`vite-favicon.config.js`** - Favicon generation

### Key Features

- **HTTPS Support**: Automatic SSL certificates via mkcert
- **Legacy Support**: Polyfills for older browsers
- **Code Splitting**: Automatic bundle optimization
- **HMR**: Hot module replacement for instant updates
- **Asset Optimization**: Images, fonts, and icons

## Tailwind CSS

### Version 4

We use Tailwind CSS v4 with the Vite plugin for enhanced performance.

### Configuration

Main configuration is in `frontend/css/site/main.css`:

```css
@import 'tailwindcss';
```

Custom utilities and components are in `frontend/css/site/utilities/` and `frontend/css/site/components/`.

### Custom Utilities

The base install includes custom utilities like:

- **Pullout**: Break out of container constraints
- **Hover Underline**: Add animated underlines on hover
- **Weight Hover**: Change font weight on hover states

See individual component documentation for details.

## JavaScript Components

Components are automatically loaded based on data attributes:

```html
<select data-autocomplete>
  <!-- options -->
</select>
```

The component loader (`js/loader/`) automatically:

- Detects components in the DOM
- Lazy loads component code
- Initializes components
- Handles dynamic content

### Creating Components

Components follow this pattern:

```typescript
export default class MyComponent {
  constructor() {
    // Initialize components
    Array.from(document.querySelectorAll('[data-my-component]')).forEach((element) => {
      new MyComponentInstance(element);
    });
  }
}

class MyComponentInstance {
  constructor(element: Element) {
    // Component logic
  }
}
```

### Available Components

Browse the [Components](/frontend/components/components) section for:

- Complete component documentation
- Usage examples
- Configuration options
- Accessibility considerations

## Internationalization (i18n)

Internationalization files are in `frontend/js/i18n/`:

```
i18n/
├── s-autocomplete-en.json
├── s-autocomplete-nl.json
├── s-autocomplete-fr.json
└── ...
```

Components can load language-specific strings:

```typescript
private async getLang() {
  this.lang = await import(`../i18n/s-component-${this.siteLang}.json`);
}
```

## Asset Management

### Images

Store images in `frontend/img/`:

- Use appropriate formats (WebP, AVIF, etc.)
- Optimize before committing

### Icons

Icons are in `frontend/icons/`:

- SVG format preferred
- Inline SVGs for critical icons

### Fonts

Web fonts in `frontend/fonts/`:

- Variable fonts when possible
- Use `yarn googlefonts` to download from Google Fonts

## Best Practices

::: tip Keep It Modular
Break functionality into small, reusable components. Each component should do one thing well.
:::

::: tip Use TypeScript
Take advantage of TypeScript's type system. Define interfaces for your data structures.
:::

::: tip Follow Naming Conventions

- Components: `data-omponent-name`
- CSS classes: BEM notation for custom styles
- Files: kebab-case for file names
  :::

::: tip Optimize Assets

- Compress images before committing
- Remove unused CSS/JS
  :::

## Browser Support

The build targets modern browsers with automatic polyfills for:

- ES6+ features
- CSS custom properties
- Intersection Observer
- Other modern APIs

Legacy builds are automatically generated when needed.

## Testing Your Code

Use [Clint](/frontend/clint/introduction) to test your frontend:

- **Accessibility**: WCAG compliance testing
- **HTML Validation**: Catch markup errors
- **Links**: Find broken links
- **Performance**: CO₂ footprint analysis

## Next Steps

Explore specific topics:

- **[Components](/frontend/components/components)** - All available components
- **[Clint](/frontend/clint/introduction)** - Frontend testing and updating tool

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

::: tip Need Help?
If you encounter issues, [create an issue on GitHub](https://github.com/statikbe/craft/issues) or check existing documentation.
:::
