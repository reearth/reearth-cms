# Geometry Fields

Re:Earth CMS has two geometry field types for storing and editing geographic data. These are specialized fields designed for GIS use cases.

## Geometry Object (`geometryObject`)

Stores a **GeoJSON geometry** value. The stored value is a GeoJSON `Geometry` object (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, or GeometryCollection).

**API key:** `geometryObject`

**Editor:** A read-only JSON editor displaying the GeoJSON structure. The value is entered as raw GeoJSON text.

**API value type:** `string` (GeoJSON geometry JSON)

### Supported Geometry Types

- `Point`
- `LineString`
- `Polygon`
- `MultiPoint`
- `MultiLineString`
- `MultiPolygon`
- `GeometryCollection`

### Example Value

```json
{
  "type": "Point",
  "coordinates": [139.6917, 35.6895]
}
```

---

## Geometry Editor (`geometryEditor`)

An interactive map editor for drawing and editing geometric shapes. Provides the same data as Geometry Object but with a visual drawing interface.

**API key:** `geometryEditor`

**Editor:** An interactive 2D map (OpenLayers) with drawing tools for:
- Drawing points
- Drawing lines
- Drawing polygons
- Moving and editing existing shapes

**API value type:** `string` (GeoJSON geometry JSON)

### Drawing Tools

In the Geometry Editor, you can:
- **Draw Point** — click to place a point
- **Draw Line** — click to add line vertices, double-click to finish
- **Draw Polygon** — click to add polygon vertices, double-click to close
- **Select and Edit** — move vertices of an existing shape
- **Delete** — remove the current geometry

---

## Comparison

| | Geometry Object | Geometry Editor |
|---|---|---|
| API key | `geometryObject` | `geometryEditor` |
| Editor | JSON text input | Interactive map |
| Best for | Importing/API-managed geometry | Manual geometry drawing |
| Supported types | All GeoJSON types | All GeoJSON types |

## Multiple Values

Both geometry types support `multiple: true` — the field stores an array of GeoJSON geometry strings. This is useful for storing multiple spatial features on a single item.

## Asset vs Geometry Field

- Use a **Geometry field** when geometry is an intrinsic property of the item (e.g. a landmark's location).
- Use an **Asset field** referencing a GeoJSON file when you need to store a large, complex geographic dataset (e.g. a road network with thousands of features).

## In-Browser Preview

When viewing an item with a geometry field, the UI renders the geometry on a Cesium 3D globe or OpenLayers 2D map, depending on the geometry type and the application context.

## API Usage

Geometry values are returned as raw GeoJSON strings in the API:

```json
{
  "schemaFieldId": "location",
  "value": "{\"type\":\"Point\",\"coordinates\":[139.6917,35.6895]}"
}
```

When working with these values programmatically, parse the string as JSON to get the GeoJSON geometry object.

## Example Use Cases

- **Point**: Building location, sensor placement, event venue
- **LineString**: Road segment, river, trail, pipeline
- **Polygon**: Park boundary, district, flood zone, property outline
- **GeometryCollection**: Mixed feature set for complex items

## Notes

- Geometry values are validated as valid GeoJSON before saving.
- The coordinate system is always WGS 84 (EPSG:4326) — longitude, latitude (in that order, per GeoJSON spec).
- For large geometry datasets (thousands of coordinates), consider using an Asset field with a GeoJSON file instead to avoid performance issues.
