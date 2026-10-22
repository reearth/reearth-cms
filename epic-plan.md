# Geometry-Field-Unification

Owner: Woody Chang
Priority: Must
Status: Planning

**Legends**

- 🎨: UI/UX, frontend
- 🥞: server, backend

# Unified Geometry Field

Based on the Unified Geometry Field RDD (draft 0.1). Phase 2 tasks depend on the phase split being confirmed.

Applies to every coding task below: unit tests are required, and any new UI text needs Japanese translations.

---

## Phase 1

### 1. Add the Geometry field type 🎨🥞

**Background**
The CMS has two geometry field types that store the same data and differ only in how a value is entered. A single Geometry field replaces them for new fields.

**What to Do**

- Add a new Geometry field type with no geometry-specific configuration.
- Support the standard settings: required, multiple, title, description.
- Store the value as a structured object rather than text. The content stays standard GeoJSON.
- Keep API output identical to today’s geometry output.
- Leave existing Geometry Editor and Geometry Object fields unchanged.

**Depends on:** none

---

### 2. Geometry validation 🎨🥞

**Background**
Validation must be the same on the map, in the GeoJSON editor and through the API.

**What to Do**

- Accept any of the seven GeoJSON geometry types.
- Check positions: finite numbers in longitude, latitude order, with optional altitude.
- Check ranges: longitude within -180 to 180, latitude within -90 to 90.
- Check that a LineString has at least 2 positions, and a polygon ring at least 4 positions with the first equal to the last.
- Allow nested GeometryCollections.
- Reject unknown properties inside a geometry.
- Enforce the agreed size limit per value.
- Return errors that name the field and the cause, including the two specified messages for reversed coordinates and unknown properties.

**Depends on:** task 1

---

### 3. Geometry field in the schema editor 🎨

**Background**
Users currently choose between two geometry field types when designing a model, before they know how data will arrive.

**What to Do**

- Offer Geometry as the field type for new geometry fields, named “Geometry” with the description: *Draw points, lines or areas on a map, or enter them as coordinates or GeoJSON.*
- Show no geometry-type options when creating the field.
- Do not show multipart geometry types anywhere in field creation.

**Depends on:** task 1

---

### 4. Unique setting for Geometry 🥞

**Background**
The unique setting prevents two items in a model from holding the same value. For geometry, “the same value” is not obvious — for example, two points that differ only at a far decimal place, or the same polygon starting from a different vertex.

**What to Do**

- Define the comparison rule first, such as coordinate precision and vertex order, and get it agreed before implementation.
- Offer the unique setting when creating or editing a Geometry field.
- Enforce uniqueness using the agreed rule, with an error that names the field.

**Depends on:** tasks 1, 2 and 3

---

### 5. One map for all shapes, with shape editing 🎨

**Background**
Today a multi-value geometry field shows one map per value, drawing a new shape replaces the existing one, and an existing shape cannot be moved or reshaped.

**What to Do**

- Show all shapes of the field on one map.
- Single mode: drawing a new shape replaces the value after the existing confirmation.
- Multiple mode: drawing a new shape adds a new value.
- For Point, LineString and Polygon: select, move, edit vertices and delete on the map.
- For MultiPoint, MultiLineString, MultiPolygon and GeometryCollection: display them, allow deleting the whole value, and offer no editing on the map.
- Never change the type of an existing value.

**Depends on:** task 1

---

### 6. Undo and redo 🎨

**Background**
Once shapes can be edited on the map, mistakes need to be reversible.

**What to Do**

- Add undo and redo for adding, editing and deleting shapes, in single and multiple mode.

**Depends on:** task 5

---

### 7. Shape list 🎨

**Background**
With several shapes on one map, small shapes, overlapping shapes and shapes outside the current view are hard to select.

**What to Do**

- List the shapes in the field next to the map, showing each shape’s type.
- Keep selection synchronised both ways: selecting on the map highlights the row, selecting a row highlights the shape and zooms the map to it.
- Show a multipart value as one entry.

**Depends on:** task 5

---

### 8. Editable GeoJSON panel 🎨

**Background**
The GeoJSON editor is read-only for Geometry Editor fields, so drawn values cannot be corrected by text.

**What to Do**

- Show a collapsible GeoJSON panel, collapsed by default and always editable.
- Keep it synchronised with the map.
- Apply a text change once it is a valid geometry; until then keep the map on the last valid value and mark the error.
- Prevent saving an invalid value.

**Depends on:** tasks 2 and 5

---

## Phase 2

### 9. Coordinates panel 🎨

**Background**
Users need to enter or fine-tune a point’s longitude and latitude precisely, which the map alone does not allow.

**What to Do**

- Add a collapsible coordinates panel, collapsed by default.
- Show the selected shape only. With nothing selected, show “Select a shape to edit its coordinates.”
- Offer numeric editing for Point values only. For other types, point to the GeoJSON editor.
- Enter or blur applies a change; Esc reverts.
- Keep the panel synchronised with the map and the GeoJSON panel.

**Depends on:** tasks 5 and 8

---

### 10. Apply location search results 🎨

**Background**
Location search already exists but only moves the map; the result cannot be used as a value.

**What to Do**

- Set the selected point to the search result, or add a new point when nothing is selected.

**Depends on:** task 5; choice of geocoding provider

---

### 11. Interoperability notice 🎨

**Background**
Nested GeometryCollections are valid and stored, but some GIS tools may not render them.

**What to Do**

- Show a light, non-blocking notice in the editor when a value contains a nested GeometryCollection: *Nested GeometryCollection · may not render in some GIS tools.*

**Depends on:** task 5

---

### 12. Large values in the editor 🎨

**Background**
A field can hold many shapes; the shape list and the map must stay responsive.

**What to Do**

- Keep the shape list responsive with many shapes.
- Keep the map readable with many shapes.

**Depends on:** tasks 5 and 7

---

## Before kickoff

These RDD open questions affect the tasks above:

- Phase split — confirms which tasks are in the first release.
- Limits: value size and its basis of measurement, shapes per value, total coordinates and nesting depth — affects task 2.
- Geocoding provider — blocks task 10.
