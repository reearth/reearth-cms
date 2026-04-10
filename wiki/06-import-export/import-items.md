# Import Items

Re:Earth CMS supports bulk import of content items from JSON, CSV, and GeoJSON files.

## Overview

The import feature lets you:
- Load large numbers of items into a model at once
- Import from structured data files (JSON, CSV, GeoJSON)
- Automatically extend the model schema with new fields found in the data (MutateSchema mode)
- Choose how to handle existing items (replace, skip, or insert-only)

## Import Limits

| Limit | Value |
|---|---|
| Maximum records per import | 50,000 |
| Maximum file size | 100 MB |
| Batch processing size | 1,000 items per chunk |

Imports exceeding these limits must be split into multiple files.

## Supported Formats

### JSON

An array of objects where each object represents one item. Keys correspond to field keys defined in the schema.

```json
[
  {
    "title": "My Article",
    "status": "active",
    "published-date": "2024-03-15T00:00:00Z",
    "count": 42
  },
  {
    "title": "Another Article",
    "status": "draft",
    "count": 7
  }
]
```

### CSV

A CSV file where the header row contains field keys. Each subsequent row is one item.

```csv
title,status,count,published-date
My Article,active,42,2024-03-15T00:00:00Z
Another Article,draft,7,
```

**CSV Import Notes:**
- Encoding: UTF-8 (with or without BOM)
- Delimiter: comma (`,`)
- Empty cells are treated as null/empty values
- Boolean values: `true`/`false` or `1`/`0`
- Date values: ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`)
- Multiple values in a single cell: separate with `|` (pipe character)

### GeoJSON

A GeoJSON `FeatureCollection`. Each `Feature` becomes one item. The geometry is mapped to a geometry field, and properties map to other fields.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [139.69, 35.69]
      },
      "properties": {
        "name": "Tokyo Station",
        "category": "transport"
      }
    }
  ]
}
```

When importing GeoJSON, you specify which field in the schema receives the geometry value.

## Import via the Web UI

1. Navigate to a model in the content list.
2. Click **Import** (usually in the toolbar or the ⋮ menu).
3. Select the file format (JSON, CSV, or GeoJSON).
4. Upload the file.
5. Configure the mapping:
   - For CSV: map CSV columns to schema fields
   - For GeoJSON: select which field receives the geometry
6. Choose a [strategy](#import-strategies) (Insert, Update/Replace, or Skip).
7. Optionally enable **MutateSchema** (see below).
8. Click **Import**.

The import runs asynchronously for large files. You can monitor progress in the import job status.

## Import via REST API

```
POST /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/import
```

**Request body** (multipart or JSON):
- `file` — the file to import
- `format` — `json`, `csv`, or `geojson`
- `strategy` — `insert`, `update`, or `upsert`
- `mutateSchema` — `true` or `false`
- `geoFieldKey` — (GeoJSON only) the field key to store geometry

## Import Strategies

See [Import Strategies](./import-strategies.md) for a detailed comparison.

| Strategy | Behavior for existing items | Behavior for new items |
|---|---|---|
| **Insert** | Skip (do not overwrite) | Create |
| **Update/Replace** | Overwrite fields | Skip (do not create) |
| **Upsert** | Overwrite fields | Create |

Items are matched by their unique field value (typically the title field or an ID field).

## MutateSchema (Auto Schema Extension)

When `MutateSchema: true`, the importer automatically adds new fields to the model schema for any keys found in the data that do not already exist as fields.

- Skipped field types: Asset, Group, Reference (too complex to infer)
- New fields are created with the type inferred from the data (text by default)
- Useful for one-off data migrations where you do not want to manually define every field first

> **Caution:** MutateSchema can create unexpected fields if your import data has inconsistent keys. Review the schema after import to clean up any unwanted fields.

## Error Handling

Import errors are reported after the import completes:
- **Validation errors** — a field value does not match the field type or constraints
- **Duplicate errors** — an item with the same key already exists (when using Insert strategy)
- **Schema errors** — a column in the CSV does not match any field in the schema (unless MutateSchema is enabled)

Partial imports are supported — valid rows are imported even if some rows fail. The error report lists all failed rows with reasons.

## Streaming

The import worker uses a **streaming JSON decoder** to process large files without loading the entire file into memory. This enables importing files up to 100 MB without out-of-memory issues.

## Import Jobs

Large imports run as asynchronous jobs. You can:
- Check the job status in the UI (a progress indicator is shown)
- Query job status via the GraphQL API: `job(id: ...)`
- Receive a notification when the import completes (if webhooks are configured)
