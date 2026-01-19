# Database Migrations

This directory contains database migration scripts for Re:Earth CMS.

## Available Migrations

### text-normalization (Recommended)

**Unified migration** that normalizes both asset filenames and item text fields in a single run. This is the recommended way to apply all text normalization.

#### Usage

```bash
# Dry run - preview all changes
./db-migrations --cmd=text-normalization

# Wet run - apply all changes
./db-migrations --cmd=text-normalization --wet-run
```

#### What it does

1. **Asset Filename Normalization**
   - Normalizes the `filename` field in all assets
   - Converts fullwidth characters to halfwidth
   - Ensures consistent filename storage

2. **Item Text Field Normalization**
   - Normalizes all text-based field values in items
   - Affects: text, textArea, richText, markdown, select, tag, geometryObject, geometryEditor
   - Processes all items in batches

#### Example Output

```text
=== Asset Filename Normalization ===
dry run
  Would normalize: 'ｆｉｌｅ．ｔｘｔ' -> 'file.txt'
  Would normalize: 'document２０２４.pdf' -> 'document2024.pdf'
Summary: 15/100 assets need filename normalization

=== Item Text Field Normalization ===
dry run
  Item item-123 would normalize 2 field(s)
  Item item-456 would normalize 1 field(s)
Summary: 25/1000 items need text field normalization
```

---

## Other Migrations

### ref-field-schema

Migrates reference field schemas.

### item-migration

Performs item-related migrations.

### project-visibility

Updates project visibility settings.
