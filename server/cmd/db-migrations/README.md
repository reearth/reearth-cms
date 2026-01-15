# Database Migrations

This directory contains database migration scripts for Re:Earth CMS.

## Available Migrations

### asset-filename-normalization

Normalizes asset filenames using Unicode NFKC normalization to ensure consistent storage and retrieval across different Unicode representations.

#### Usage

**1. Build the migration tool:**

```bash
cd server
go build ./cmd/db-migrations
```

**2. Run dry run first (preview changes):**

```bash
./db-migrations --cmd=asset-filename-normalization
```

**3. Apply changes (wet run):**

```bash
./db-migrations --cmd=asset-filename-normalization --wet-run
```

### item-text-normalization

Normalizes text field values in items using Unicode NFKC normalization.

#### Problem

Item text fields (text, textArea, richText, markdown, select, tag, etc.) can contain Unicode characters in multiple representations, causing search and consistency issues:

- Searching for "Tokyo２０２４" (fullwidth digits) won't match items with "Tokyo2024" (halfwidth)
- Fullwidth and halfwidth characters are treated as different values
- Inconsistent data representation across the system

#### Solution

This migration normalizes all text-based field values in existing items. It works in conjunction with automatic normalization in the application code that handles new/updated field values.

#### Field Types Normalized

- `text` - Single-line text
- `textArea` - Multi-line text
- `richText` - HTML rich text
- `markdown` - Markdown content
- `select` - Dropdown selections
- `tag` - Tag values
- `geometryObject` - GeoJSON geometry
- `geometryEditor` - Geometry editor data

#### How to Run

**1. Run dry run first (preview changes):**

```bash
./db-migrations --cmd=item-text-normalization
```

Example output:

```text
dry run
  Item item-123 would normalize 2 field(s): [title-field description-field]
  Item item-456 would normalize 1 field(s): [name-field]
  ... and 5 more (showing first 10)

Summary: 15/1000 items need text field normalization
```

**2. Apply changes (wet run):**

```bash
./db-migrations --cmd=item-text-normalization --wet-run
```

Example output:

```text
Starting item text field normalization migration...
Normalized text field 'title-field' in item item-123
Normalized text field 'description-field' in item item-123
Processed 1000 items, modified 15 (125.50 items/sec)
Migration completed. Processed 5000 items, modified 75 in 39.8s (125.63 items/sec)
```

#### Notes

- **Safe to re-run**: The migration is idempotent - items already normalized won't be modified
- **Performance**: Processes items in batches of 1000 for optimal performance
- **Field preservation**: Only text field values are normalized; structure and other field types are unchanged
- **Automatic going forward**: New and updated items are automatically normalized by application code
