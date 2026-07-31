# URL Field

The **URL** field stores a web URL with format validation.

## Overview

**API key:** `url`

**Editor:** A single-line text input with URL validation.

**API value type:** `string` (URL)

## Validation

The URL field validates that the entered value is a properly formatted URL. Invalid URLs (missing scheme, malformed syntax) are rejected with an error message.

Accepted URL formats:
- `https://example.com`
- `http://example.com/path?query=value`
- `https://subdomain.example.com:8080/path`

## Configuration Options

| Option | Description |
|---|---|
| **Name** | Display label |
| **Key** | API key |
| **Required** | Whether a URL must be provided |
| **Multiple** | Allow multiple URLs |
| **Default Value** | A pre-filled URL for new items |

## Multiple Values

When `multiple: true`, the field stores an array of URL strings. Each entry is validated independently.

## Example Use Cases

- External resource link (official website, source document)
- API endpoint URL
- Thumbnail or preview image URL (as an alternative to an Asset field)
- Documentation link
- Social media profile URL
- Related project URL

## Notes

- The URL field stores the URL as a plain string — it does not fetch or validate the URL's content.
- For file uploads, use an [Asset field](./media-fields.md) instead.
- There is no built-in link preview or unfurling — display logic is handled by the consuming application.
