# Reference Fields

The **Reference** field creates a link from one item to another item in the same project. It enables relationships between content types.

## Overview

**API key:** `reference`

**Editor:** An item picker that searches and selects items from the target model.

**API value type:** Item ID (string) — the API response can include the full referenced item

## How References Work

A Reference field is configured with a **target model** — only items from that model can be selected. When you select a referenced item, the field stores that item's ID.

References are **unidirectional by default** — the field on the source item points to the target item, but the target item has no automatic back-reference.

### Bidirectional References

The field configuration wizard supports setting up **bidirectional references**: when you create a Reference field, you can optionally configure a corresponding field on the target model that points back to the source model. Both fields are created together and kept in sync by the CMS.

## Configuration

In the field configuration modal:

| Option | Description |
|---|---|
| **Name** | Display label |
| **Key** | API key |
| **Required** | Whether a reference must be set |
| **Multiple** | Allow multiple item references (one-to-many) |
| **Target Model** | The model whose items can be selected |
| **Corresponding Field** | (Optional) The field on the target model that points back |

## Multiple References

When `multiple: true`, the field stores an array of item IDs. In the editor, you can add multiple items from the target model.

## Example Use Cases

- An `Article` model has an `Author` reference field pointing to a `Person` model
- A `Project` model has `Tags` reference field pointing to a `Tag` model
- A `Building` model has a `District` reference field pointing to a `District` model
- A `Feature` model has a `Dataset` reference field for grouping

## API Response

When fetching an item via the API, a Reference field returns the referenced item's ID. You can request the full referenced item in the same query:

```graphql
query {
  item(id: "...") {
    fields {
      schemaFieldId
      value
    }
    referencedItems {
      id
      fields { schemaFieldId value }
    }
  }
}
```

## Dependency-Aware Publishing

When you publish an item that has reference fields, the system checks whether the referenced items are published. If any referenced items are in DRAFT status, the publish modal shows a warning and offers to publish them together.

This ensures that public content never contains references to non-public items.

## Filtering on Reference Fields

In saved views, Reference fields support:

| Operator | Description |
|---|---|
| `equals` | References a specific item (by ID) |
| `not_equals` | Does not reference a specific item |
| `empty` | No reference set |
| `not_empty` | Has a reference set |

## Notes

- References can only point to items **within the same project**. Cross-project references are not supported.
- Circular references are technically possible but should be avoided.
- Deleting a referenced item does not automatically clear the reference from the source item — it results in a dangling reference.
- Reference fields **cannot** be used in schema import (`MutateSchema`). They are skipped during bulk import because the relationship configuration is too complex to infer automatically.
