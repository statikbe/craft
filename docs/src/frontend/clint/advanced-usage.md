---
prev:
  text: 'Updates'
  link: '/frontend/clint/updates'
---

# Advanced Usage

This page covers advanced features and technical details for power users and maintainers of Clint.

## Command-Line Arguments

Clint supports command-line arguments for automation and scripting purposes.

### --checkupdates

Check for available updates without launching the interactive prompt.

```bash
cd clint
node dist/cli.js --checkupdates
```

**Output example:**

```
---------------------------------------------------------------------------
| 🐦‍🔥 There is an update available for the CLI: 0.0.1 -> 0.0.2
| 🎨 There is an update available for the Frontend: 1.2.3 -> 1.3.0
---------------------------------------------------------------------------
```

**Use cases:**

- CI/CD pipelines to check for updates
- Automated monitoring scripts
- Pre-commit hooks to warn about available updates
- Scheduled cron jobs to notify teams

**Exit codes:**

- `0`: Successfully checked (updates may or may not be available)
- Non-zero: Error occurred during check

## Screenshot Comparison Workflow

Clint includes a powerful visual regression testing feature that uses Puppeteer and pixelmatch to detect visual changes.

### How It Works

1. **Pre-Update Screenshots**: Take screenshots of your site before applying updates
2. **Apply Updates**: Make your code changes or apply Clint updates
3. **Post-Update Screenshots**: Take screenshots after updates
4. **Comparison**: Clint automatically compares the two sets and highlights differences

### Screenshot Storage

Screenshots are stored in `/clint/public/screenshots/` organized by domain, with a specific naming convention:

```
clint/public/screenshots/
└── example.com/
    ├── a_home-page.png          # Pre-update screenshot
    ├── b_home-page.png          # Post-update screenshot
    ├── d_home-page.png          # Difference/comparison image
    ├── a_about-page.png
    ├── b_about-page.png
    ├── d_about-page.png
    ├── a_contact-page.png
    ├── b_contact-page.png
    └── d_contact-page.png
```

**Folder structure:**

- Each domain gets its own folder (e.g., `example.com`, `my-project.local.statik.be`)
- Allows testing multiple sites without screenshot conflicts

**Naming convention:**

- **`a_`** prefix = Pre-update (original) screenshots
- **`b_`** prefix = Post-update (altered) screenshots
- **`d_`** prefix = Difference images showing pixel changes

The filename after the prefix is derived from the page URL path.

### Taking Screenshots

From the Clint updater menu:

```bash
cd clint
yarn start
# Select: Update
# Choose: Pre update check
# Select your sitemap or URL
```

Screenshots are captured at:

- **Desktop viewport**: 1920x1080
- **Full page**: Entire scrollable content
- **Rendering**: Waits for page load and network idle

### Viewing Comparisons

After taking both "original" and "altered" screenshots, Clint generates a comparison report that:

- Highlights pixel differences
- Shows side-by-side comparisons
- Calculates difference percentage
- Opens automatically in Chrome

### Best Practices

::: tip Screenshot Timing
Always take pre-update screenshots before making ANY changes. Once you've modified code, you can't go back to get accurate "before" screenshots.
:::

## File Locations and Directory Structure

Understanding where Clint stores its files helps with debugging and customization.

### Core Directories

```
clint/
├── data/                       # Runtime data and session storage
│   └── session.json           # Last test session details
├── dist/                       # Compiled JavaScript (built files)
│   └── cli.js                 # Main executable
├── public/                     # Output files and reports
│   ├── screenshots/           # Visual regression screenshots
│   └── tmp/                   # Temporary files (HTML-outputs)
├── src/                        # TypeScript source code
│   ├── libs/                  # Helper utilities
│   ├── tester/                # Testing modules
│   ├── updater/               # Update modules
│   └── start.ts               # Entry point
├── templates/                  # Mustache templates for reports
│   └── changelog.html         # Changelog template
├── updates/                    # Update scripts (pulled from base repo)
├── cli.config.json            # Configuration
├── package.json               # Dependencies and version
└── .nvmrc                     # Node version specification
```

### Session Data

**Location**: `/clint/data/session.json`

Stores your last test session:

```json
{
  "responseTool": "a11y",
  "exportType": "html",
  "type": "sitemap",
  "sitemap": "project",
  "project": "my-project",
  "level": "WCAG2AA",
  "url": "https://my-project.local.statik.be/sitemap.xml"
}
```

This enables the "Run last session again" feature.

### Test Results

**Location**: `/clint/public/test-results/`

HTML reports are generated with timestamps:

- `a11y-report-1698765432.html`
- `html-validation-1698765433.html`
- `links-report-1698765434.html`

**Excel exports** are saved in the same directory:

- `links-export-1698765434.xlsx`
- `headings-export-1698765435.xlsx`
- `co2-report-1698765436.xlsx`

::: tip Clean Up Old Reports
Test results accumulate over time. Periodically clean the `/clint/public/test-results/` directory to save disk space.
:::

### Temporary Files

**Location**: `/clint/public/tmp/`

Temporary files like rendered changelogs are stored here. This directory is automatically cleaned when new files are generated.

## Build Scripts Explained

Clint uses Vite for building and has several build scripts for different purposes.

### Available Scripts

#### `yarn build`

```bash
cd clint
yarn build
```

**What it does:**

- Builds both the frontend HTML templates AND the CLI
- Equivalent to running `yarn build-front && yarn build-cli`
- Use this after making any changes to Clint's code

**When to use:**

- After pulling updates to Clint
- After modifying Clint's source code
- When setting up Clint for the first time

#### `yarn build-cli`

```bash
cd clint
yarn build-cli
```

**What it does:**

- Builds only the CLI executable (`dist/cli.js`)
- Uses `vite.config.cli.js` configuration
- Faster than full build

**When to use:**

- After modifying only TypeScript files in `/src`
- When you haven't changed HTML templates
- Quick iterations during development

#### `yarn build-front`

```bash
cd clint
yarn build-front
```

**What it does:**

- Builds only the frontend HTML report templates
- Uses `vite.config.js` configuration
- Compiles assets for HTML reports

**When to use:**

- After modifying templates or styles
- When customizing report appearance
- Rarely needed unless customizing Clint

#### `yarn start`

```bash
cd clint
yarn start
```

**What it does:**

- Sets up SSL certificates for HTTPS (using mkcert)
- Runs the compiled CLI (`node dist/cli.js`)
- Launches the interactive menu

**Prerequisites:**

- Must have run `yarn build` at least once
- Requires mkcert for certificate generation

### Build Troubleshooting

**Error: "Cannot find module './dist/cli.js'"**

```bash
# You haven't built the CLI yet
yarn build-cli
```

**Error: "Module not found" after updating**

```bash
# Clear and reinstall dependencies
rm -rf node_modules
rm yarn.lock
yarn install
yarn build
```

**Changes not reflecting after build**

```bash
# Clear dist and rebuild
rm -rf dist
yarn build
```

## Local Server for HTML Reports

When viewing HTML test reports, Clint can optionally start a local server that enables retesting individual URLs directly from the report.

### How It Works

1. Generate an HTML report (A11y, HTML validation, or Links test)
2. If enabled, a local Express server starts on port 3000
3. The HTML report includes "Retest" buttons
4. Clicking "Retest" triggers a new test for that specific URL
5. Results update in real-time

### Configuration

The server is automatically started when:

- You generate an HTML report
- The port 3000 is available
- You're running locally (not in production mode)

### Port Already in Use?

If port 3000 is busy:

- The HTML report still opens
- "Retest" functionality won't work
- You can still view all results normally

**To free up port 3000:**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>
```

## Performance and Optimization

### Testing Speed

Typical test durations:

- **Single URL**: 2-5 seconds
- **Small sitemap (10 pages)**: 30-60 seconds
- **Medium sitemap (50 pages)**: 3-5 minutes
- **Large sitemap (200+ pages)**: 15-30 minutes

### Factors Affecting Speed

1. **Network latency**: External links testing is slowest
2. **Page complexity**: Heavy JavaScript pages take longer
3. **Number of tests**: A11y + HTML validation = 2x time
4. **Parallel processing**: Local tests run faster than external

### Optimization Tips

::: tip Use URL Limiting During Development
Test a subset of pages (5-10) during active development. Run full tests before deployment.
:::

::: tip Test Locally When Possible
Local DDEV sites test much faster than remote URLs due to network latency.
:::

::: tip Skip External Links During Development
External link checking is the slowest test. Run it less frequently or on CI/CD.
:::

## Network Considerations

### DNS Resolution

Clint sets DNS resolution to prefer IPv4:

```typescript
dns.setDefaultResultOrder('ipv4first');
```

This improves compatibility with some hosting environments.

### User Agent

Clint identifies itself with a custom user agent:

```
Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)
```

This helps:

- Identify Clint traffic in server logs
- Whitelist Clint in security tools
- Debug rate limiting issues

### Timeouts and Retries

- **Page load timeout**: 30 seconds
- **Network idle**: Waits for 2 seconds of network inactivity
- **No automatic retries**: Failed pages are reported, not retried

## Debugging Tips

### Enable Verbose Mode

Most tests have a verbose option that shows detailed progress:

```typescript
// In code, when calling tests
await tester.test(url, '', true, 'cli', true); // Last param = verbose
```

### Check Session Data

If "Run last session again" isn't working:

```bash
cat clint/data/session.json
```

Verify the session data looks correct.

### View Compiled Code

The compiled CLI is in `dist/cli.js`. You can inspect it to debug issues:

```bash
less clint/dist/cli.js
```

### Clear Caches

If you're experiencing weird behavior:

```bash
cd clint
rm -rf dist
rm -rf node_modules
rm yarn.lock
yarn install
yarn build
```

## Security Considerations

### SSH Keys for Updates

Updates require SSH access to the base repository. Ensure:

- Your SSH keys are added to GitHub
- You have read access to the repository
- SSH agent is running

Test your connection:

```bash
ssh -T git@github.com
```

### HTTPS Certificates

The `yarn start` command uses mkcert to generate local SSL certificates. This is safe for local development but:

- Don't commit these certificates
- Don't use them in production
- They're only for local HTTPS testing

### Sensitive Data

Be careful when:

- Sharing HTML reports (may contain site content)
- Committing test results (may expose issues)
- Sharing screenshots (contain actual site content)

::: tip Contributing
Found a bug or want to improve Clint? [Create an issue on GitHub](https://github.com/statikbe/craft/issues) or submit a pull request!
:::
