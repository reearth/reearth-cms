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

The exported schema JSON follows the structure:

```json
{
  "id": "schema-id",
  "fields": [
    {
      "id": "field-id",
      "key": "title",
      "name": "Title",
      "type": "text",
      "description": "The article title",
      "required": true,
      "multiple": false,
      "unique": false,
      "isTitle": true,
      "typeProperty": {}
    },
    {
      "id": "field-id-2",
      "key": "status",
      "name": "Status",
      "type": "select",
      "required": false,
      "multiple": false,
      "typeProperty": {
        "selectDefaultValue": "draft",
        "selectValues": ["draft", "review", "published"]
      }
    },
    {
      "id": "field-id-3",
      "key": "count",
      "name": "Count",
      "type": "integer",
      "typeProperty": {
        "integerMin": 0,
        "integerMax": 1000
      }
    }
  ]
}
```

---

## Schema Import

### Via the Web UI

1. Open the target model in the schema editor.
2. Click the **Import** button.
3. Select the schema JSON file.
4. The system previews the fields to be created.
5. Confirm to import — fields are added to the model.

> **Note:** Schema import **adds** fields to the existing schema. It does not delete existing fields. If a field with the same key already exists, it is skipped.

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
