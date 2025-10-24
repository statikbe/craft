---
prev:
  text: 'Getting Started'
  link: '/frontend/clint/getting-started'
next:
  text: 'Configuration'
  link: '/frontend/clint/configuration'
---

# Testing Capabilities

Clint provides a comprehensive suite of testing tools to ensure your website meets quality standards. When you run Clint and select the "Test" option, you'll be presented with several testing choices.

## Available Tests

### 1. Accessibility Testing (A11y)

Tests your website against Web Content Accessibility Guidelines (WCAG) to ensure it's accessible to all users, including those with disabilities.

**Features:**

- Uses pa11y with HTML_CodeSniffer runner
- Multiple WCAG compliance levels:
  - **WCAG 2.0 Level AAA** (highest standard)
  - **WCAG 2.0 Level AA** (recommended standard)
  - **WCAG 2.0 Level A** (minimum standard)
- Identifies accessibility violations with detailed error descriptions
- Shows affected HTML elements and their CSS selectors

**What it catches:**

- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- Improper heading hierarchy
- Keyboard navigation issues
- ARIA attribute problems

**Output formats:**

- CLI: Real-time output in your terminal
- HTML: Interactive report that opens in Chrome

### 2. HTML Validation

Validates your HTML markup against web standards to catch syntax errors and invalid HTML.

**Features:**

- Uses html-validate library
- Checks for proper HTML structure
- Validates attributes and nesting
- Identifies deprecated elements

**What it catches:**

- Malformed HTML tags
- Invalid attributes
- Incorrect element nesting
- Missing required attributes
- Deprecated HTML elements

**Output formats:**

- CLI: Terminal output with error details
- HTML: Interactive report that opens in Chrome

### 3. Broken Links Testing

Scans your website for broken internal and external links to ensure all navigation works correctly.

**Features:**

- Tests both internal and external links
- Checks HTTP status codes
- Validates anchor links (same-page navigation)
- Detects redirect chains

**What it catches:**

- 404 Not Found errors
- 500 Server errors
- Timeout issues
- Redirect loops
- Broken anchor links

**Output formats:**

- CLI: Terminal output
- HTML: Interactive report that opens in Chrome
- Excel: Spreadsheet export for easy sharing

### 4. Compare Two Sites

Compares the URL structure between two websites, useful for testing migrations or ensuring feature parity.

**Features:**

- Compares sitemap URLs between origin and destination sites
- Identifies missing pages
- Detects URL structure differences
- Useful for site migrations and relaunches

**Use cases:**

- Pre-launch migration testing
- Staging vs. production comparison
- Ensuring no pages are lost during redesign

**Output formats:**

- CLI: Terminal output
- HTML: Interactive comparison report
- Excel: Spreadsheet export

### 5. Heading Structure Export

Analyzes and exports the heading structure (h1, h2, h3, etc.) of your pages.

**Features:**

- Validates proper heading hierarchy
- Exports complete heading structure
- Identifies heading level skips (e.g., h1 to h3 without h2)

**What it catches:**

- Multiple h1 tags on a page
- Skipped heading levels
- Improper heading order
- Missing headings

**Output formats:**

- CLI: Terminal output
- HTML: Interactive structure view
- Excel: Spreadsheet export for content audits

### 6. CO₂ Footprint Testing

Measures the carbon footprint of your web pages to help build more sustainable websites.

**Features:**

- Uses @tgwf/co2 library (The Green Web Foundation)
- Measures page transfer size
- Calculates CO₂ emissions per page load
- Detects green hosting
- Uses Belgian grid intensity data by default

**What it measures:**

- Total page weight (bytes transferred)
- Estimated CO₂ emissions per visit
- Green hosting status
- Average emissions across all tested pages

**Output formats:**

- CLI: Terminal output with emission data
- HTML: Interactive report with charts
- Excel: Spreadsheet export for reporting

## Testing Workflow

### 1. Choose Your Test Type

When you run Clint and select "Test", you'll be prompted to choose which test to run.

### 2. Select Input Source

For most tests, you can test:

- **Sitemap**: Test all URLs from a sitemap.xml file
  - Local project (automatically finds your DDEV project)
  - External URL (any publicly accessible sitemap)
- **Single URL**: Test a specific page
- **Multiple URLs**: Comma-separated list of URLs

### 3. Set Options

Depending on the test, you may be able to:

- **Limit the number of URLs tested per level**: Useful for large sites where you want to test a representative sample rather than all pages. For example, if your sitemap contains 100 news articles under `/news`, you can limit testing to only 10 pages from that section. This helps:
  - Speed up testing during development
  - Focus on specific content types
  - Reduce resource usage when testing large sitemaps
  - Get quick feedback without testing every single page
- Choose accessibility compliance level (for A11y tests)
- Select output format (CLI, HTML, or Excel)

### 4. Review Results

Results are presented in your chosen format:

- **CLI**: Color-coded output directly in your terminal
- **HTML**: Opens automatically in Chrome with interactive features
- **Excel**: Saved to a file for easy sharing with stakeholders

## Run Last Session Again

Clint remembers your last testing session. When you start a new test, you'll see an option to run the same test again with the same parameters, making it easy to retest after fixes.

## Tips for Effective Testing

::: tip Test Regularly
Run tests frequently during development to catch issues early. Don't wait until launch!
:::

::: tip Start with A11y and HTML
These tests catch the most critical issues. Fix these first, then move to other tests.
:::

::: tip Use URL Limiting During Development
When testing large sites, use the URL limit option to test faster during active development.
:::

::: tip Export to Excel for Stakeholders
Use Excel exports when sharing results with non-technical team members or clients.
:::

::: warning External Links Take Time
Testing external links can be slow as it needs to make HTTP requests to external servers. Be patient!
:::

## Next Steps

- Learn how to [configure Clint](/frontend/clint/configuration) for your project
- Understand the [update process](/frontend/clint/updates)
