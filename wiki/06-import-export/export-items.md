# Export Items

Re:Earth CMS allows you to export content items from any model in multiple formats.

## Supported Export Formats

| Format | Extension | Best For |
|---|---|---|
| JSON | `.json` | General data export, APIs, JavaScript applications |
| CSV | `.csv` | Spreadsheets, data analysis, tabular tools |
| GeoJSON | `.geojson` | GIS applications, mapping tools |

## Export via the Web UI

1. Navigate to a model's content list.
2. Click **Export** (in the toolbar or the ⋮ menu).
3. Select the format (JSON, CSV, or GeoJSON).
4. Optionally apply the current view's filters (exports only filtered items).
5. Click **Download**.

For large datasets, the export may run as a background job. A download link is provided when ready.

## Export via REST API

### JSON Export

```
GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items
Accept: application/json
```

The standard list endpoint returns JSON with pagination. To export all items, paginate through all pages.

### CSV Export

```
GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.csv
```

Returns all items as CSV. The header row contains field keys.

**Query parameters:**
- Filters and sort parameters are applied to the export

### GeoJSON Export

```
GET /{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items.geojson
```

Returns all items as a GeoJSON `FeatureCollection`. Items with geometry fields have their geometry included in the `Feature.geometry`. All other fields are included in `Feature.properties`.

---

## Export Format Details

### JSON Structure

```json
{
  "items": [
    {
      "id": "item-id",
      "fields": [
        { "key": "title", "type": "text", "value": "My Article" },
        { "key": "count", "type": "integer", "value": 42 }
      ],
      "status": "PUBLIC",
      "createdAt": "2024-03-15T09:30:00Z",
      "updatedAt": "2024-03-15T10:00:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "perPage": 50
}
```

### CSV Structure

```csv
id,title,count,status,createdAt,updatedAt
item-id,My Article,42,PUBLIC,2024-03-15T09:30:00Z,2024-03-15T10:00:00Z
```

- Asset fields: exported as the asset URL
- Reference fields: exported as the referenced item's ID
- Multiple values: separated by `|` (pipe character)
- Group fields: exported as JSON strings

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "item-id",
      "geometry": {
        "type": "Point",
        "coordinates": [139.69, 35.69]
      },
      "properties": {
        "title": "My Location",
        "category": "transport",
        "createdAt": "2024-03-15T09:30:00Z"
      }
    }
  ]
}
```

If an item has no geometry field or the geometry is empty, `"geometry": null` is used.

> **Multiple geometry fields:** GeoJSON format supports only one geometry per feature. If a model has more than one geometry field, only the **first** geometry field is exported. Subsequent geometry fields are dropped. To preserve all geometry fields, use JSON export instead.

---

## Filtering Exports

When exporting, the current view's filter and sort settings can be applied. This allows you to export only a subset of items — for example, only published items, or items matching a specific category.

To export all items regardless of filters, clear the view filters before exporting.

---

## Export of Public Items Only

The public REST API returns only **published** (PUBLIC status) items by default. To export all items including drafts, use an authenticated request with an integration token or API key.

---

## Large Exports

For very large models (thousands of items), exports are processed asynchronously:
1. The export job is queued.
2. A progress indicator is shown in the UI.
3. When complete, a download link is provided.
4. The export file is stored temporarily and expires after a period.

---

## Re-importing Exported Files

Exported JSON files **cannot be directly re-imported** into Re:Earth CMS. The export format wraps items in a `{"items": [...], "totalCount": N, "page": N, "perPage": N}` envelope, whereas the import endpoint expects a bare JSON array `[...]`. To re-import exported data, strip the wrapper and extract the `items` array before importing.

---

## CSV Export Limitations

CSV export does not correctly represent all field types. The following fields are not reliably exported in CSV format:

| Field Type | CSV Behavior |
|---|---|
| Geometry (GeometryObject, GeometryEditor) | Not exported |
| Reference | Exported as item ID only (no nested data) |
| Asset | Exported as asset URL only |
| Group | Not correctly exported |
| Tag (multi-select) | May not export all selected values correctly |

For models containing these field types, **JSON or GeoJSON export** is recommended.

---

## Schema Export

To export only the schema (field definitions without item data), see [Schema Import/Export](./import-schema.md).
