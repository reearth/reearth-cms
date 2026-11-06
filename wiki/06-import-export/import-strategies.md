# Import Strategies

When importing items into Re:Earth CMS, you choose a **strategy** that determines how the importer handles conflicts between imported data and existing items.

## Available Strategies

### Insert

Only **new** items are created. Existing items are not modified.

| Condition | Action |
|---|---|
| Item does not exist | **Create** new item |
| Item already exists | **Skip** (leave unchanged) |

**Use when:** You want to add new data without affecting existing records. Safe for incremental imports where the source data may contain items already in the CMS.

**Example:** Daily data feed where you only want to add records not yet in the system.

---

### Update (Replace)

Only **existing** items are updated. New items are not created.

| Condition | Action |
|---|---|
| Item does not exist | **Skip** (do not create) |
| Item already exists | **Update** (overwrite fields) |
| Item already exists but operator lacks permission | **Error** |

**Use when:** You want to refresh existing records from a source of truth without adding new ones. Useful for syncing changes from an external system.

**Example:** Updating price and stock fields for a product catalog that already exists in the CMS.

---

### Upsert

Creates new items AND updates existing items.

| Condition | Action |
|---|---|
| Item does not exist | **Create** new item |
| Item already exists | **Update** (overwrite fields) |
| Item already exists but operator lacks permission | **Error** |

**Use when:** You want a full synchronization — after the import, the CMS should exactly reflect the source data. This is the most complete but also the most disruptive strategy.

**Example:** Full sync of a database table where you want the CMS to mirror the source.

---

## How Items Are Matched

To decide whether an item "already exists," the importer matches on a **unique field**. Typically, this is:
- The item's ID (if included in the import file)
- A field marked as **Unique** in the schema (e.g. a slug, SKU, or external ID)

If no matching key is found in the imported data, all rows are treated as new items (Insert behavior regardless of strategy).

**Best practice:** Include a unique identifier field in your schema (e.g. `external-id`, `slug`) and ensure it is present in every row of your import file.

---

## Strategy Comparison Table

| Scenario | Insert | Update | Upsert |
|---|---|---|---|
| Item is new | Create | Skip | Create |
| Item exists, no permission | Skip | Error | Error |
| Item exists, has permission | Skip | Overwrite | Overwrite |
| Safe for incremental adds | Yes | Yes | Yes |
| Modifies existing data | No | Yes | Yes |
| Creates new data | Yes | No | Yes |
| Risk of data loss | Low | Medium | High |

---

## Permission Checks on Update/Upsert

When the strategy is **Update** or **Upsert** and an existing item is found:
- If the operator is a **Maintainer** or **Owner** → update proceeds
- If the operator is a **Writer** → update only proceeds if the operator created the original item (ownership-based restriction)
- If the operator does not have permission → the row is reported as an error

This ensures that WRITER-role imports cannot silently overwrite items they do not own.

---

## Combined with MutateSchema

The strategy setting works independently of **MutateSchema**:
- `MutateSchema: true` + `Insert` → add new fields to schema AND create new items
- `MutateSchema: true` + `Update` → add new fields to schema AND update existing items
- `MutateSchema: true` + `Upsert` → add new fields AND create/update items

See [Import Items](./import-items.md#mutateschema-auto-schema-extension) for MutateSchema details.
