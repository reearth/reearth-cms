# Items

An **item** is a single content record — an instance of a model. Items hold the actual data for each field defined in the model's schema.

## Overview

Items are created within a **model** in a **project**. Each item contains a value (or values) for each field in the model's schema. Items support:
- Draft and publish states
- Full version history
- Metadata items (secondary data attached to the main item)
- Threaded comments
- Review requests

## Item Statuses

Every item has one of five statuses:

| Status | Description |
|---|---|
| **DRAFT** | The item has been saved but not published. Not accessible via the public API. |
| **PUBLIC** | The item has been published. Accessible via the public API. |
| **REVIEW** | The item is in draft state and has an open review request. Not yet public. |
| **PUBLIC_REVIEW** | The item is published AND has an open review request for pending changes. |
| **PUBLIC_DRAFT** | The item is published but has unsaved draft changes pending. |

### Status Transitions

```
                 ┌──────────────┐
                 │    DRAFT     │◄─────────────┐
                 └──────┬───────┘              │
                        │ Publish              │ Unpublish
                        ▼                      │
                 ┌──────────────┐              │
                 │    PUBLIC    │──────────────►│
                 └──────┬───────┘
                        │ Create request
                        ▼
              ┌──────────────────┐
              │  PUBLIC_REVIEW   │
              └──────────────────┘

(REVIEW = draft with open request)
(PUBLIC_DRAFT = published with draft changes)
```

## Creating an Item

1. Navigate to a model in the left sidebar.
2. Click **New Item** (the **+** button).
3. Fill in the field values in the editor.
4. Click **Save** — the item is saved as **DRAFT**.

## Editing an Item

1. Click an item in the content list to open the item editor.
2. Make changes to the fields.
3. Click **Save** to save changes (remains in current status).

The editor detects unsaved changes and warns you if you try to navigate away without saving.

## Publishing an Item

To publish an item and make it available via the public API:

1. Open the item editor.
2. Click **Publish**.
3. The status changes to **PUBLIC**.

If the item references other items that are not yet published, the system may warn you about unpublished dependencies.

### Dependency-Aware Publishing

When publishing an item with reference fields, the system detects if any referenced items are in DRAFT state and offers to publish them together. This ensures that published content does not contain broken references.

## Unpublishing an Item

1. Open the item editor.
2. Click **Unpublish**.
3. The status returns to **DRAFT**.

## Item Versioning

Re:Earth CMS maintains a complete version history for every item. Versioning works similarly to Git:

- **Latest version** — the current draft state, always reflects the most recent save
- **Published version** — the snapshot that was most recently published (visible via the public API)
- Each version has a **parent reference** forming a version chain

### Viewing Version History

In the item editor, click **Version History** to see all previous versions with timestamps and authors. You can view the data at any previous version.

### Versions in the API

The API distinguishes between version references:
- `latest` — returns the most recently saved version
- `public` — returns the published version
- A specific version ID can be used to fetch historical snapshots

## Item Metadata

Each item can have a linked **metadata item** — a secondary record using a separate metadata schema defined on the model. Metadata items are useful for storing administrative or operational data separately from the main content.

- The metadata item is created automatically when the main item is created (if the model has a metadata schema)
- Metadata items share the same versioning and status as their parent item
- Metadata fields appear in a separate section of the item editor

## Fields on Items

Each field in the schema corresponds to a value in the item. A field value can be:
- A single value (e.g. one text string)
- Multiple values (if the field has `multiple: true`)
- A group of nested field values (for Group fields)

Fields not filled in are stored as null/empty. Required fields must be filled before saving.

## Bulk Operations

From the content list, you can select multiple items and perform bulk operations:
- **Publish** — publish all selected items
- **Unpublish** — unpublish all selected items
- **Add to Request** — add all selected items to a review request
- **Delete** — permanently delete all selected items

## API Access

| GraphQL Operation | Description |
|---|---|
| `items(modelId: ...)` | List items in a model with filtering/pagination |
| `item(id: ...)` | Get a single item by ID |
| `createItem(input: ...)` | Create a new item |
| `updateItem(input: ...)` | Update an item's fields |
| `publishItem(input: ...)` | Publish items |
| `unpublishItem(input: ...)` | Unpublish items |
| `deleteItem(input: ...)` | Delete an item |
| `itemsByIDs(ids: ...)` | Fetch multiple items by ID |

Public REST API (published items only, public projects):
```
GET /api/p/{workspaceIdOrAlias}/{projectIdOrAlias}/{modelIdOrKey}
GET /api/p/{workspaceIdOrAlias}/{projectIdOrAlias}/{modelIdOrKey}/{itemId}
```
