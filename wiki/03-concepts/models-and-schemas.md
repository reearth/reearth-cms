# Models and Schemas

A **model** defines the structure of a type of content in Re:Earth CMS. Its **schema** is the collection of fields that describes what data each content item of that type holds.

## Models

A model is roughly equivalent to a database table, a content type, or a spreadsheet sheet. Every item belongs to exactly one model.

### Creating a Model

1. In the left sidebar, navigate to your project.
2. Click **New Model** (or the **+** next to the model list).
3. Enter:
   - **Name** — display name (e.g. `Article`)
   - **Key** — URL-safe identifier used in API paths (e.g. `article`). Must be unique within the project.
   - **Description** — optional description
4. Click **Create**.

### Model Properties

| Property | Description |
|---|---|
| **Name** | Human-readable display name |
| **Key** | URL-safe API identifier (immutable after creation) |
| **Description** | Optional description shown in the UI |
| **Order** | Display order in the sidebar |
| **Metadata Model** | Optional secondary schema for metadata (see below) |

### Metadata Model

Each model can optionally have a **metadata schema** — a secondary set of fields for administrative metadata that is separate from the main content fields. Metadata items are linked to the main item but stored and versioned independently.

Common uses for metadata schemas:
- Administrative labels (categories, status flags)
- Workflow fields (approver notes, priority)
- Custom date fields (publication date, expiry date)

The metadata schema supports a limited set of field types:

| Supported Field Types |
|---|
| Tag |
| Bool (Boolean) |
| Checkbox |
| Date |
| Text |
| URL |

### Adding Metadata Fields

1. Open a model in the schema editor.
2. Click the **Metadata** tab at the top of the field list.
3. Click **Add Field** and select a field type.
4. Once added, the metadata field appears on every item's editing form for that model.

> **Warning:** Changes to metadata fields (edits or deletions) are immediately reflected across all existing items in that model.

### Model Ordering

Models can be reordered within a project using drag-and-drop in the sidebar. The display order is preserved and reflected in the API.

---

## Schemas

A schema is the set of fields attached to a model. Fields define the type, constraints, and behavior of each piece of data within an item.

### Field Types

Re:Earth CMS supports **19 field types**:

| Category | Types |
|---|---|
| Text | Text, TextArea, RichText, MarkdownText |
| Number | Integer, Number |
| Boolean | Bool, Checkbox |
| Date/Time | Date |
| Selection | Select, Tag |
| Media | Asset |
| Reference | Reference |
| URL | URL |
| Geometry | GeometryObject, GeometryEditor |
| Structural | Group |

See [Field Types Overview](../04-field-types/overview.md) for detailed documentation on each type.

### Adding a Field

1. Select a model in the left sidebar.
2. Click **Add Field** (or the **+** button in the schema editor).
3. Choose a field type.
4. The field modal opens with three tabs:

#### Tab 1: Settings

| Option | Description |
|---|---|
| **Name** | Display label shown in the item editor |
| **Key** | API identifier (auto-generated from name; must be unique within the schema) |
| **Description** | Optional help text shown below the field |
| **Required** | The field must have a value before saving |
| **Multiple** | Allows multiple values for this field |
| **Is Title** | Marks this field as the title field — its value is displayed as the item's display name in lists |

#### Tab 2: Validation

Type-specific validation options (e.g. min/max length for text, min/max value for numbers, URL format validation).

#### Tab 3: Default Value

Set a default value that is pre-populated when a new item is created.

### Field Key

The **key** is the machine-readable identifier for a field. It is used:
- As the property name in API responses
- As the column name in CSV exports
- As the field identifier in filter expressions

Keys must be lowercase, and can contain letters, numbers, and hyphens. They cannot be changed after creation.

### Title Field

One field in the schema can be designated as the **title field**. This field's value is used as the item's display name in lists, search results, and reference pickers. Any field type that returns a string can be the title field.

### Field Ordering

Fields can be reordered using drag-and-drop in the schema editor. The order is reflected in the item editing form and in export outputs.

### Editing and Deleting Fields

Fields can be edited (name, description, validation, default value) but the **type and key cannot be changed** after creation. If you need a different type or key, delete the field and create a new one.

> **Warning:** Deleting a field permanently removes all stored values for that field across all items.

---

## Schema Import and Export

Schemas can be exported to JSON and imported into another project. This enables:
- Copying model structures between projects
- Version-controlling schema definitions outside the CMS
- Creating model templates

See [Schema Import/Export](../06-import-export/import-schema.md) for details.

---

## API Access

| GraphQL Operation | Description |
|---|---|
| `models(projectId: ...)` | List models in a project |
| `createModel(input: ...)` | Create a new model |
| `updateModel(input: ...)` | Update a model |
| `deleteModel(input: ...)` | Delete a model |
| `schema(id: ...)` | Get a schema |
| `createField(input: ...)` | Add a field to a schema |
| `updateField(input: ...)` | Update a field |
| `deleteField(input: ...)` | Remove a field |
| `updateFieldsOrder(input: ...)` | Reorder fields |
