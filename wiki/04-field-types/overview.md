# Field Types Overview

Re:Earth CMS supports **17 field types** for defining the structure of your content models. Each field type controls what kind of data can be stored in a field and how it is displayed and edited in the UI.

## All Field Types

| Type | API Key | Category | Description |
|---|---|---|---|
| [Text](./text-fields.md) | `text` | Text | Single-line plain text |
| [TextArea](./text-fields.md) | `textArea` | Text | Multi-line plain text |
| [Rich Text](./text-fields.md) | `richText` | Text | WYSIWYG rich text (HTML) |
| [Markdown](./text-fields.md) | `markdown` | Text | Markdown text |
| [Integer](./number-fields.md) | `integer` | Number | Whole number |
| [Number](./number-fields.md) | `number` | Number | Floating-point number |
| [Bool](./boolean-fields.md) | `bool` | Boolean | True/False toggle |
| [Checkbox](./boolean-fields.md) | `checkbox` | Boolean | True/False checkbox |
| [Date](./date-fields.md) | `datetime` | Date | Date and time |
| [Select](./select-and-tag.md) | `select` | Selection | Single-choice dropdown |
| [Tag](./select-and-tag.md) | `tag` | Selection | Multi-value tag picker |
| [Asset](./media-fields.md) | `asset` | Media | File reference |
| [Reference](./reference-fields.md) | `reference` | Reference | Reference to another item |
| [URL](./url-fields.md) | `url` | URL | URL with format validation |
| [Geometry Object](./geometry-fields.md) | `geometryObject` | Geometry | GIS geometry value (read) |
| [Geometry Editor](./geometry-fields.md) | `geometryEditor` | Geometry | GIS geometry value (editable) |
| [Group](./group-fields.md) | `group` | Structural | Nested group of fields |

> **Note:** There are also `json` and `datetime` types used internally. The Date field in the UI uses the `datetime` type internally.

## Common Field Properties

All field types share these common properties:

| Property | Description |
|---|---|
| **Name** | Display label shown in the item editor UI |
| **Key** | Machine-readable API identifier (lowercase, letters/numbers/hyphens) |
| **Description** | Optional help text shown below the field |
| **Required** | If true, the field must have a value before the item can be saved |
| **Multiple** | If true, the field accepts multiple values (stored as an array) |
| **Unique** | If true, no two items in the same model can have the same value |
| **Is Title** | If true, this field's value is used as the item's display name in lists |
| **Default Value** | Pre-populated value when a new item is created |

## Type-Specific Validation

Many field types have additional validation options available in the **Validation** tab of the field configuration:

| Type | Validation Options |
|---|---|
| Text / TextArea / Markdown | Min length, Max length |
| Rich Text | — |
| Integer | Min value, Max value |
| Number | Min value, Max value |
| URL | Must be a valid URL format |
| Select | Predefined options list |
| Tag | Predefined options list |
| Reference | Target model |
| Date | Min date, Max date |

## Multiple Values

When a field has `multiple: true`, the API returns the value as an array. In the item editor, multiple values can be added and reordered. This applies to all field types except **Group** and **Reference** (which have their own multi-value behavior).

## Field Keys

Field keys are used as property names in API responses. Rules:
- Lowercase letters, numbers, and hyphens only
- Must be unique within a schema
- Auto-generated from the field name (spaces → hyphens, lowercased)
- Can be changed after creation via the field editor

Example: a field named "Published Date" gets the key `published-date`.

## Title Field

One field per schema can be designated as the **title field**. This field's value is shown:
- As the item's row label in content lists
- In reference pickers when selecting items
- In search results

The title field should contain a meaningful identifier (e.g. name, title, slug). Any field type that produces a string value can be the title field.
