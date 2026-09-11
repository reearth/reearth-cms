# Group Fields

The **Group** field type allows you to define a **reusable set of sub-fields** that can appear multiple times within an item. It enables structured, repeatable data within a single item.

## Overview

**API key:** `group`

**Editor:** A collapsible section containing all the group's sub-fields, with an **Add** button to add more instances.

**API value type:** Array of `ItemGroup` objects, each containing values for the group's sub-fields

## What is a Group?

A Group is defined as a **separate schema** (a sub-schema) that is referenced by the Group field. This sub-schema has its own fields with their own types and configurations.

When an item has a Group field:
- The item stores zero or more **group instances** (item groups)
- Each instance has its own set of field values following the group's sub-schema
- Instances are ordered and can be reordered via drag-and-drop

## Creating a Group Field

1. In the schema editor, click **Add Field** → **Group**.
2. Give the field a name and key.
3. The system creates a linked group schema.
4. Add sub-fields to the group schema (Text, Number, Date, Asset, etc.).
5. Save the field.

## Configuring Sub-Fields

Group sub-fields are configured the same way as regular schema fields. They support all field types except:
- Another **Group** (nested groups are not supported)
- **Reference** (reference fields cannot be inside groups)

## Example Structure

Consider a `Contacts` group field on an `Organization` model:

```
Organization
├── name: Text
├── website: URL
└── contacts: Group
    ├── firstName: Text
    ├── lastName: Text
    ├── email: Text
    └── phone: Text
```

An `Organization` item could have multiple contact entries:
- Contact 1: John Smith, john@example.com, +1-555-0100
- Contact 2: Jane Doe, jane@example.com, +1-555-0101

## API Representation

Group fields are returned as arrays of item groups:

```json
{
  "schemaFieldId": "contacts",
  "value": [
    {
      "itemGroupId": "group-instance-id-1",
      "fields": [
        { "schemaFieldId": "first-name", "value": "John" },
        { "schemaFieldId": "last-name", "value": "Smith" },
        { "schemaFieldId": "email", "value": "john@example.com" }
      ]
    },
    {
      "itemGroupId": "group-instance-id-2",
      "fields": [
        { "schemaFieldId": "first-name", "value": "Jane" },
        { "schemaFieldId": "last-name", "value": "Doe" },
        { "schemaFieldId": "email", "value": "jane@example.com" }
      ]
    }
  ]
}
```

## Editing Groups in the UI

In the item editor:
- Each group instance appears as a collapsible card
- Click **Add** to add a new group instance (an empty instance is appended)
- Drag the handle to reorder instances
- Click the delete icon on an instance to remove it

## Limitations

- Groups **cannot** be nested inside other Groups.
- **Reference** and **Asset** sub-fields within Groups are skipped during schema auto-import (`MutateSchema`).
- Groups are not supported as filter targets in saved views.

## Example Use Cases

- **Addresses** — a person or organization with multiple addresses
- **Contact entries** — name + phone + email repeated per person
- **Schedule entries** — day + start time + end time for recurring events
- **Localized content** — language + translated text for multilingual content
- **Product variants** — size + color + SKU + price per variant
- **FAQ items** — question + answer pairs within a page item
