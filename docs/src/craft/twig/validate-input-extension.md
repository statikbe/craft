# Validate Input Extension

Twig tests for validating user input to prevent security vulnerabilities and ensure data integrity. Includes validation for numeric IDs and safe query strings.

## Features

- ✅ **ID Validation**: Verify numeric IDs or arrays of IDs
- ✅ **Query Validation**: Ensure query strings contain only safe characters
- ✅ **Array Support**: Validate arrays of values recursively
- ✅ **Null Handling**: Explicit null value handling
- ✅ **Security-Focused**: Prevent injection attacks
- ✅ **Easy Testing**: Simple Twig test syntax

## Available Tests

### valid_id Test

Validates that input is a numeric ID or an array of numeric IDs. Useful for protecting against injection attacks when using user-provided IDs in database queries.

#### Test Signature

```twig
value is valid_id
```

#### Parameters

| Parameter | Type                  | Description       |
| --------- | --------------------- | ----------------- |
| `input`   | `null\|array\|string` | Value to validate |

#### Returns

`bool` - `true` if valid ID(s), `false` otherwise

#### Validation Rules

- `null` returns `false`
- Strings must be numeric
- Arrays are validated recursively (all elements must be numeric)
- Non-numeric strings return `false`

#### Basic Usage

```twig
{# Validate single ID #}
{% set id = craft.app.request.getQueryParam('id') %}

{% if id is valid_id %}
  {% set entry = craft.entries.id(id).one() %}
{% else %}
  <p>Invalid ID parameter</p>
{% endif %}
```

#### Common Patterns

##### Entry by ID Parameter

```twig
{% set entryId = craft.app.request.getQueryParam('entry') %}

{% if entryId is valid_id %}
  {% set entry = craft.entries.id(entryId).one() %}

  {% if entry %}
    <h1>{{ entry.title }}</h1>
    <div>{{ entry.content }}</div>
  {% else %}
    <p>Entry not found</p>
  {% endif %}
{% else %}
  <p>Invalid entry ID</p>
{% endif %}
```

##### Multiple Entry IDs

```twig
{% set entryIds = craft.app.request.getQueryParam('ids')|split(',') %}

{% if entryIds is valid_id %}
  {% set entries = craft.entries.id(entryIds).all() %}

  {% for entry in entries %}
    <article>{{ entry.title }}</article>
  {% endfor %}
{% else %}
  <p>Invalid entry IDs</p>
{% endif %}
```

##### Related Entries

```twig
{% set relatedId = craft.app.request.getQueryParam('related') %}

{% if relatedId is valid_id %}
  {% set entries = craft.entries
    .section('blog')
    .relatedTo(relatedId)
    .all() %}

  <h2>Related Articles</h2>
  {% for entry in entries %}
    <article>{{ entry.title }}</article>
  {% endfor %}
{% endif %}
```

##### Category Filter

```twig
{% set categoryId = craft.app.request.getQueryParam('category') %}

{% set query = craft.entries.section('products') %}

{% if categoryId is valid_id %}
  {% set query = query.relatedTo({ targetElement: categoryId }) %}
{% endif %}

{% set products = query.all() %}
```

##### User Profile by ID

```twig
{% set userId = craft.app.request.getQueryParam('user') %}

{% if userId is valid_id %}
  {% set user = craft.users.id(userId).one() %}

  {% if user %}
    <div class="profile">
      <h1>{{ user.fullName }}</h1>
      <p>{{ user.email }}</p>
    </div>
  {% endif %}
{% else %}
  {% redirect 'users' %}
{% endif %}
```

##### Asset by ID

```twig
{% set assetId = craft.app.request.getQueryParam('file') %}

{% if assetId is valid_id %}
  {% set asset = craft.assets.id(assetId).one() %}

  {% if asset %}
    <a href="{{ asset.url }}" download>
      Download {{ asset.title }}
    </a>
  {% endif %}
{% endif %}
```

##### Form with ID Validation

```twig
<form method="post">
  {{ csrfInput() }}

  {% set productId = craft.app.request.getQueryParam('product') %}

  {% if productId is valid_id %}
    <input type="hidden" name="productId" value="{{ productId }}">

    {% set product = craft.entries.id(productId).one() %}
    <h2>Ordering: {{ product.title }}</h2>

    <input type="number" name="quantity" min="1" required>
    <button type="submit">Add to Cart</button>
  {% else %}
    <p>Please select a valid product</p>
  {% endif %}
</form>
```

### valid_query Test

Validates that input contains only safe characters commonly used in search queries. Prevents potential XSS and injection attacks while allowing multilingual content.

#### Test Signature

```twig
value is valid_query
```

#### Parameters

| Parameter | Type                  | Description              |
| --------- | --------------------- | ------------------------ |
| `input`   | `null\|array\|string` | Query string to validate |

#### Returns

`bool` - `true` if contains only safe characters, `false` otherwise

#### Allowed Characters

The validation allows:

- Letters: `a-z`, `A-Z`
- Numbers: `0-9`
- Punctuation: `.`, `!`, `?`, `@`, `;`, `:`
- Accented characters: `é`, `É`, `è`, `È`, `ê`, `Ê`, `à`, `À`, `ë`, `Ë`, `ï`, `Ï`
- Whitespace
- Quotes: `'`, `"`

#### Validation Pattern

```php
private const COMMON_QUERY_CHARACTERS_REGEX = "/^[a-zA-Z0-9.!?@;:éÉèÈêÊàÀëËïÏ\s'\"]+$/";
```

#### Basic Usage

```twig
{# Validate search query #}
{% set searchQuery = craft.app.request.getQueryParam('q') %}

{% if searchQuery is valid_query %}
  {% set results = craft.entries.search(searchQuery).all() %}

  <h2>Search Results for "{{ searchQuery }}"</h2>
  {% for result in results %}
    <article>{{ result.title }}</article>
  {% endfor %}
{% else %}
  <p>Invalid search query. Please use only letters, numbers, and common punctuation.</p>
{% endif %}
```

#### Common Patterns

##### Search Form

```twig
<form action="/search" method="get">
  <input
    type="search"
    name="q"
    placeholder="Search..."
    value="{{ craft.app.request.getQueryParam('q') }}"
    required
  >
  <button type="submit">Search</button>
</form>

{% set query = craft.app.request.getQueryParam('q') %}

{% if query %}
  {% if query is valid_query %}
    {% set results = craft.entries
      .search(query)
      .limit(20)
      .all() %}

    <div class="search-results">
      <p>Found {{ results|length }} results</p>

      {% for result in results %}
        <article>
          <h3><a href="{{ result.url }}">{{ result.title }}</a></h3>
          <p>{{ result.summary }}</p>
        </article>
      {% endfor %}
    </div>
  {% else %}
    <div class="error">
      Invalid search query. Please avoid special characters.
    </div>
  {% endif %}
{% endif %}
```

## Security Considerations

### Why Validate IDs?

**SQL Injection Prevention**: Even with prepared statements, validating IDs provides defense in depth:

```twig
{# BAD: No validation #}
{% set id = craft.app.request.getQueryParam('id') %}
{% set entry = craft.entries.id(id).one() %}  {# Could cause errors or exploits #}

{# GOOD: With validation #}
{% set id = craft.app.request.getQueryParam('id') %}
{% if id is valid_id %}
  {% set entry = craft.entries.id(id).one() %}
{% endif %}
```

### Why Validate Queries?

**XSS Prevention**: Prevents malicious scripts in search queries:

```twig
{# BAD: No validation #}
{% set query = craft.app.request.getQueryParam('q') %}
<h2>Results for "{{ query }}"</h2>  {# Could inject HTML #}

{# GOOD: With validation and escaping #}
{% set query = craft.app.request.getQueryParam('q') %}
{% if query is valid_query %}
  <h2>Results for "{{ query }}"</h2>
{% endif %}
```

### Additional Security Layers

1. **CSRF Protection**: Always use `{{ csrfInput() }}` in forms
2. **Rate Limiting**: Implement rate limiting for search endpoints
3. **Input Sanitization**: Combine validation with Craft's built-in escaping
4. **Whitelist Approach**: Only allow expected characters
5. **Error Messages**: Don't reveal sensitive info in error messages

## Resources

- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Craft Security Best Practices](https://craftcms.com/docs/4.x/security.html)
- [XSS Prevention](https://owasp.org/www-community/attacks/xss/)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
