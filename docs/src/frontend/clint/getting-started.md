---
prev:
  text: 'Introduction'
  link: '/frontend/clint/introduction'
next:
  text: 'Tests'
  link: '/frontend/clint/tests'
---

# Getting Started

This guide will help you set up and start using Clint in your project.

## Prerequisites

Before using Clint, ensure you have:

- **Node.js** v22 (specified in `.nvmrc` file)
- **nvm** (Node Version Manager) - recommended for managing Node versions
- **Yarn** package manager
- **Git** for version control and updates
- **SSH keys** configured for GitHub access (for updates)
- **DDEV** (optional, for local development environment detection)

### Node Version Management

Clint includes a `.nvmrc` file that specifies the required Node.js version (v22). If you're using nvm, the correct Node version will be used automatically.

**Using nvm (recommended):**

```bash
# Install nvm if you haven't already
# Visit: https://github.com/nvm-sh/nvm

# Navigate to the clint directory
cd clint

# Install and use the correct Node version
nvm install
nvm use
```

**Manual installation:**

If you prefer not to use nvm, ensure you have Node.js v22 installed:

```bash
node --version
# Should output: v22.x.x
```

## Installation

Clint comes pre-installed in the Craft Base Install. You'll find it in the `/clint` directory of your project.

### First-Time Setup

1. Navigate to the Clint directory:

   ```bash
   cd clint
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Build Clint:
   ```bash
   yarn build
   ```

## Running Clint

To start Clint, run:

```bash
yarn start
```

You'll be greeted with the Clint ASCII art and main menu:

```
·······································
:                                     :
:   _________ .__  .__        __      :
:   \_   ___ \|  | |__| _____/  |_    :
:   /    \  \/|  | |  |/    \   __\   :
:   \     \___|  |_|  |   |  \  |     :
:    \______  /____/__|___|  /__|     :
:           \/             \/         :
:                                     :
·······································

? What do you want to run?
  ❯ Test
    Exit
```

## Main Options

### Test

Select this option to run any of the available tests on your website:

- Accessibility (A11y)
- HTML Validation
- Broken Links
- Site Comparison
- Heading Structure
- CO₂ Footprint

See the [Testing Capabilities](/frontend/clint/tests) page for detailed information about each test.

### Update

If updates are available, you'll see an "Update" option. This allows you to:

- Take pre-update screenshots
- Apply CLI and/or frontend updates
- Take post-update screenshots for comparison

See the [Update Process](/frontend/clint/updates) page for detailed information about updating.

## Your First Test

Let's run your first accessibility test:

1. **Start Clint**:

   ```bash
   cd clint
   yarn start
   ```

2. **Select Test**:

   ```
   ? What do you want to run? › Test
   ```

3. **Choose Test Type**:

   ```
   ? What do you want to do? › Test A11y
   ```

4. **Select Compliance Level**:

   ```
   ? What level do you want to test? › WCAG 2.0 Level AA
   ```

5. **Choose Input Source**:

   ```
   ? What do you want to test? › Sitemap
   ```

6. **Select Sitemap Location**:

   ```
   ? Where is the sitemap? › Local project
   ```

7. **Confirm Project Name**:

   ```
   ? What is the project code? › your-project-name
   ```

8. **Limit URLs (optional)**:
   ```
   ? Limit URL's? › Yes
   ? How many URL's do you want to test per level? › 5
   ```

Clint will now test your site and display the results in your terminal or open an HTML report in Chrome.

## Common Workflows

### Testing Before Deployment

```bash
cd clint
yarn start
# Select: Test
# Choose: Test A11y
# Select: WCAG 2.0 Level AA
# Choose: Sitemap
# Select: External URL
# Enter: https://staging.yoursite.com/sitemap.xml
```

### Applying Updates with Visual Testing

```bash
cd clint
yarn start
# Select: Update
# Choose: Pre update check
# Select sitemap and run screenshots
# Choose: Update
# Apply updates
# Choose: Post update check
# Compare visual changes
```

### Quick Retest After Fixes

```bash
cd clint
yarn start
# Select: Test
# Choose: Run last session again
```

## Tips for New Users

::: tip Start Small
Begin by testing a single URL or a limited number of pages to understand how Clint works before testing your entire sitemap.
:::

::: tip Use Local Testing
Test on your local DDEV environment first. Clint automatically detects your project name from `.ddev/config.yaml`.
:::

::: tip Check for Updates Regularly
Run `yarn start` regularly to check for CLI and frontend updates. Staying up-to-date makes each update smaller and easier to manage.
:::

## Troubleshooting

### Wrong Node version

**Solution**: Use nvm to switch to the correct version:

```bash
cd clint
nvm use
```

Or install the required version:

```bash
nvm install 22
nvm use 22
```

### "Command not found: yarn"

**Solution**: Install Yarn globally:

```bash
npm install -g yarn
```

### "Port already in use" (when using HTML reports)

**Solution**: Clint tries to open a local server. If the port is busy, close other local servers or the HTML report will open without the refresh feature.

### "DDEV project not found"

**Solution**: Ensure you're running Clint from within a DDEV project, or choose "External URL" and enter your site URL manually.

### "Permission denied" when updating

**Solution**: Ensure your SSH keys are properly configured for GitHub:

```bash
ssh -T git@github.com
```

### Build errors after running `yarn install`

**Solution**: Clear cache and reinstall:

```bash
rm -rf node_modules
rm yarn.lock
yarn install
yarn build
```

## Next Steps

Now that you have Clint set up, explore these topics:

- **[Testing Capabilities](/frontend/clint/tests)** - Learn about all available tests
- **[Configuration](/frontend/clint/configuration)** - Deep dive into configuration options
- **[Update Process](/frontend/clint/updates)** - Understand how to manage updates

::: tip Need Help?
If you encounter issues not covered here, please [create an issue on GitHub](https://github.com/statikbe/craft/issues) or check the README.md file in the `/clint` directory.
:::
