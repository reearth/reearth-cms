# Text Fields

Re:Earth CMS has four text field types for storing textual content of varying richness.

## Text (`text`)

A single-line plain text field. Use this for short strings such as names, titles, slugs, or identifiers.

**Editor:** Single-line text input.

**API value type:** `string`

**Validation options:**
- **Min length** — minimum number of characters
- **Max length** — maximum number of characters

**Example use cases:**
- Article title
- Product name
- URL slug
- Author name

---

## TextArea (`textArea`)

A multi-line plain text field. Use this for longer plain text content such as descriptions or summaries that do not require formatting.

**Editor:** Multi-line text input (resizable).

**API value type:** `string`

**Validation options:**
- **Min length** — minimum number of characters
- **Max length** — maximum number of characters

**Example use cases:**
- Short description
- Plain-text summary
- Notes or comments

---

## Rich Text (`richText`)

A WYSIWYG (What You See Is What You Get) rich text field. Produces HTML output. Supports formatted text: bold, italic, headings, lists, links, and embedded images.

**Editor:** Rich text editor with a formatting toolbar.

**API value type:** `string` (HTML)

**Validation options:** None

**Example use cases:**
- Article body
- Product description with formatting
- Page content

> **Note:** The stored value is HTML. When rendering this on a website, use a safe HTML sanitizer to prevent XSS.

---

## Markdown (`markdown`)

A Markdown text field. Use this for content that will be rendered with a Markdown processor. The raw stored value is plain Markdown syntax.

**Editor:** Monaco code editor with Markdown syntax highlighting and a preview pane.

**API value type:** `string` (Markdown syntax)

**Validation options:**
- **Min length** — minimum number of characters
- **Max length** — maximum number of characters

**Example use cases:**
- Documentation pages
- Blog post bodies (for static site generators)
- README content
- Structured text with code blocks, tables, or lists

---

## Comparison

| | Text | TextArea | Rich Text | Markdown |
|---|---|---|---|---|
| Single line | Yes | No | No | No |
| Formatting | No | No | Yes (HTML) | Yes (MD) |
| Max length validation | Yes | Yes | No | Yes |
| Use for short labels | Best | OK | No | No |
| Use for long content | No | Yes | Yes | Yes |
| Output format | Plain string | Plain string | HTML | Markdown |

## Multiple Values

All four text field types support `multiple: true`, which allows storing an array of strings (e.g. an array of tags or aliases). In the editor, a new input is added for each value.

## Title Field Compatibility

All four text types can be designated as the title field of a schema.
