# Known Issues & Technical Debt

Issues identified during project inspection (2026-02-11).

## High Priority

### 1. Elevated session duration is ~100 hours
- **File**: `config/general.php:25`
- **Issue**: `elevatedSessionDuration` is set to `360000` (seconds = ~100 hours). Craft default is `PT5M` (5 minutes). This means a hijacked admin session retains elevated privileges for days.
- **Fix**: Change to a DateInterval string like `'PT15M'` (15 minutes).

## Medium Priority

### 2. `getenv()` used instead of `App::env()`
- **Files**: `config/general.php:24,42,47,52,60`, `config/app.php:58,75`
- **Issue**: Craft 5 recommends `App::env()` which checks both real env vars and `.env` parsed values. `getenv()` may miss values in certain contexts.
- **Fix**: Replace all `getenv()` calls with `App::env()` in config files.

### 3. `preventUserEnumeration` not enabled
- **File**: `config/general.php`
- **Issue**: With `useEmailAsUsername` and public account flow enabled, attackers can probe for valid email addresses via login/reset forms.
- **Fix**: Add `'preventUserEnumeration' => true` to global settings.

## Low Priority

### 4. Legacy config syntax (not fluent)
- **Files**: `config/general.php`, `config/db.php`
- **Issue**: Uses Craft 3/4 style multi-environment arrays instead of Craft 5 fluent `GeneralConfig::create()` / `DbConfig::create()`.
- **Impact**: Misses IDE autocompletion and type checking.

### 5. Deprecated `X-XSS-Protection` header still sent
- **File**: `modules/statik/src/Statik.php:233`
- **Issue**: `X-XSS-Protection` is deprecated by all modern browsers and can introduce vulnerabilities in older ones.
- **Fix**: Remove the `X-XSS-Protection` header line. Keep `X-Content-Type-Options: nosniff` (not deprecated).

### 6. HSTS header commented out
- **File**: `modules/statik/src/Statik.php:231`
- **Issue**: `Strict-Transport-Security` is commented out. Should be enabled for production/staging.
- **Fix**: Conditionally enable for non-dev environments.

### 7. `preloadSingles()` not enabled
- **File**: `config/general.php`
- **Issue**: Craft 5 supports `preloadSingles()` for performance. With many single sections, this would reduce query count.

## Informational

### 8. Static `$instance` property pattern
- **File**: `modules/statik/src/Statik.php:53`
- **Issue**: Uses legacy `public static $instance` pattern from Craft 3/4. Craft 5 modules can use `Module::getInstance()`.

### 9. Scout/Algolia config exists but is unconfigured
- **File**: `config/scout.php`, `.env`
- **Issue**: Scout config file exists with empty API keys. If search isn't needed, the config file could be removed to avoid confusion.
