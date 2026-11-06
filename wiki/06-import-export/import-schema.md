# Schema Import / Export

Re:Earth CMS allows you to export and import model schema definitions (field structures) independently of content data. This enables schema portability across projects and environments.

## Overview

Schema export produces a JSON document describing the model's fields — their types, keys, names, and configuration. Schema import reads this JSON and creates corresponding fields in a target model.

This is useful for:
- Copying a model structure from one project to another
- Version-controlling schema definitions in a repository
- Setting up new projects from a schema template
- Migrating schema between environments (dev → staging → production)

---

## Schema Export

### Via the Web UI

1. Open a model in the schema editor.
2. Click the **Export** button (in the schema toolbar).
3. A JSON file is downloaded with the schema definition.

### Via the REST API

The schema is available as JSON:

```
GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/schema.json
```

For the metadata schema:

```
GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/metadata_schema.json
```

---

## Schema JSON Format

The exported schema uses **JSON Schema** format (`draft/2020-12`) with custom `x-fieldType` extensions:

```json
{
  "$id": "01kj7r1a009ct8ansz9xw8yhcr",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "My Model",
  "type": "object",
  "properties": {
    "title": {
      "title": "Title",
      "description": "The article title",
      "type": "string",
      "x-fieldType": "text",
      "x-required": true,
      "x-unique": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "x-fieldType": "select",
      "x-selectValues": ["draft", "review", "published"]
    },
    "count": {
      "title": "Count",
      "type": "integer",
      "x-fieldType": "integer"
    },
    "location": {
      "title": "Location",
      "type": "object",
      "x-fieldType": "geometryEditor",
      "x-geoSupportedType": "POINT"
    }
  }
}
```

The `x-fieldType` property identifies the Re:Earth CMS field type. Common values:

| `x-fieldType` | Field |
|---|---|
| `text` | Text (single line) |
| `textArea` | TextArea (multi-line) |
| `markdown` | Markdown |
| `datetime` | Date |
| `bool` | Bool |
| `integer` | Integer |
| `number` | Number |
| `url` | URL |
| `select` | Select (add `"x-multiple": true` for multi-select) |
| `asset` | Asset |
| `geometryEditor` | Geometry Editor |
| `geometryObject` | Geometry Object |
| `group` | Group (not importable) |
| `reference` | Reference (not importable) |

---

## Schema Import

### Via the Web UI

1. Open the target model in the schema editor.
2. Click the **Import** button.
3. Select the schema JSON file.
4. The system previews the fields to be created.
5. Confirm to import — fields are added to the model.

> **Important:** Schema import only works on models that have **no existing fields**. If the target model already has fields, the import will be rejected. Create a new empty model first, then import the schema into it.

> **Note:** Reference and Group fields in the schema JSON are **not supported** and will be skipped during import. Add these fields manually after importing.

### Via the REST API (as part of item import)

When importing items with `MutateSchema: true`, the importer automatically extends the schema with new fields inferred from the data. This is not a direct schema import but achieves a similar result.

---

## Field Types Supported in Schema Import

Most field types can be imported:

| Field Type | Schema Import |
|---|---|
| Text, TextArea, RichText, Markdown | Supported |
| Integer, Number | Supported |
| Bool, Checkbox | Supported |
| Date | Supported |
| Select, Tag | Supported (with options) |
| URL | Supported |
| GeometryObject, GeometryEditor | Supported |
| Asset | Limited (reference configuration is complex) |
| Reference | **Skipped** (target model relationship cannot be inferred) |
| Group | **Skipped** (sub-schema requires separate import) |

---

## GeoJSON Schema Import

When importing a GeoJSON file, the CMS can infer a schema from the `properties` of the GeoJSON features. This enables quickly creating a model from an existing GeoJSON dataset.

The importer maps:
- String properties → Text fields
- Numeric properties → Number fields
- Boolean properties → Bool fields
- Geometry → GeometryObject field

---

## Schema Version Control Best Practice

For projects where schema changes are critical, it is recommended to:
1. Export the schema JSON after any schema modification
2. Commit the JSON to a version control repository (e.g. Git)
3. Use the import functionality to deploy schema changes to other environments

This provides an audit trail of schema changes and enables rollback by re-importing a previous schema version.
