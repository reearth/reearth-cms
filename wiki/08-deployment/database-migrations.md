# Database Migrations

Re:Earth CMS includes a standalone migration tool for applying schema changes to the MongoDB database.

## Overview

The migration tool is located at `server/cmd/db-migrations/`. It applies data transformations to the MongoDB database to support schema changes introduced in new versions.

## Running Migrations

### Dry Run (default)

By default, the migration tool runs in **dry-run** mode — it reports what changes would be made without actually modifying the database:

```bash
cd server/cmd/db-migrations
go run . \
  --db "mongodb://localhost:27017" \
  --db-name "reearth_cms"
```

Review the output carefully before running with `--wet-run`.

### Wet Run (applies changes)

To actually apply migrations:

```bash
go run . \
  --db "mongodb://localhost:27017" \
  --db-name "reearth_cms" \
  --wet-run
```

> **Warning:** Wet-run permanently modifies the database. Always back up the database before running migrations.

## Available Migrations

Four migrations are available:

### 1. Text Normalization

**Migration:** `text-normalization`

Normalizes all text fields in the database using **NFKC Unicode normalization**. This ensures consistent Unicode representation (e.g. full-width characters → half-width, compatibility characters → canonical form).

Run this after upgrading to a version that introduced NFKC normalization for text search.

### 2. Item Migration

**Migration:** `item-migration`

A composite migration that performs three transformations:
- **Date → DateTime**: Converts date field values stored as date-only strings to full datetime strings (adds `T00:00:00Z`)
- **Array normalization**: Ensures multi-value fields are stored as arrays (converts any scalar values to single-element arrays)
- **Asset field flattening**: Normalizes asset field value storage format

Run this when upgrading from versions that used the old date and array storage format.

### 3. Project Visibility

**Migration:** `project-visibility`

Updates the visibility field for existing projects to ensure it matches the new enum values introduced in a schema change.

### 4. Reference Field Schema

**Migration:** `ref-field-schema`

Updates reference field type properties in schemas to use the new format introduced when bidirectional references were added.

## Migration Command Options

| Flag | Description |
|---|---|
| `--db` | MongoDB connection string |
| `--db-name` | Database name to migrate (default: `reearth_cms`) |
| `--wet-run` | Apply changes (default: dry-run only) |
| `--migration` | Run a specific migration by name (default: all) |

## Example: Targeted Migration

To run only the text-normalization migration in wet-run mode:

```bash
go run . \
  --db "mongodb://localhost:27017" \
  --db-name "reearth_cms" \
  --migration text-normalization \
  --wet-run
```

## Pre-Migration Checklist

Before running any migration in wet-run mode:

1. **Back up the database:**
   ```bash
   mongodump --uri="mongodb://localhost:27017" --db reearth_cms --out ./backup
   ```

2. **Test on a staging environment first.**

3. **Stop the CMS server** during migration to prevent concurrent writes.

4. **Run dry-run** and review the output.

5. **Apply the migration** with `--wet-run`.

6. **Restart the CMS server.**

7. **Verify** that the application works correctly.

## Restore from Backup

If a migration fails or causes issues:

```bash
mongorestore \
  --uri="mongodb://localhost:27017" \
  --db reearth_cms \
  --drop \
  ./backup/reearth_cms
```
