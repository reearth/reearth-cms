# Geometry Field Unification

Owner: Woody Chang
Priority: Must
Status: Planning

**Legends**

- 🎨: frontend
- 🥞: backend
- 💅: design

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
- ~~Allow nested GeometryCollections.~~
- Reject nested GeometryCollections (a GeometryCollection inside another), in both frontend and backend. The integration API lets users write data without the UI, so the backend check is required.
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
- ~~Do not show multipart geometry types anywhere in field creation.~~

**Depends on:** task 1

---

### 4. Unique setting for Geometry 🥞

**Background**

The method of uniqueness check might differ from other field types, due to the data structure.

**What to Do**

- ~~Define the comparison rule first, such as coordinate precision and vertex order, and get it agreed before implementation.~~
- Offer the unique setting when creating or editing a Geometry field.
- ~~Enforce uniqueness using the agreed rule, with an error that names the field.~~
- **Same vertex:** two vertices are the same when their longitude, latitude and altitude (if any) are exactly equal. A vertex with an altitude never equals one without.
  - Same: `[139.7, 35.6]` and `[139.70, 35.60]` (same numbers, different formatting)
  - Same: `[139.7, 35.6, 50]` and `[139.7, 35.6, 50]`
  - Different: `[139.7, 35.6]` and `[139.7000001, 35.6]` (no rounding or tolerance)
  - Different: `[139.7, 35.6]` and `[139.7, 35.6, 0]` (altitude 0 is not the same as no altitude)
  - Different: `[139.7, 35.6, 50]` and `[139.7, 35.6, 51]`
- **Points:** User might want to save points very close to each other on purpose, so we cannot see close points as the same value.
- **LineStrings:** the same vertex sequence in either direction is the same value (A→B→C equals C→B→A).
- **Polygons:** the same ring in either direction, from any starting vertex, is the same value (A→B→C equals A→C→B and B→C→A). The vertex sequence still matters otherwise, so a square and a bow-tie drawn from the same 4 corners are different values.
- **Polygons with holes:** the outer ring and every hole follow the polygon ring rule. Holes can be in any order.
- **MultiPoint, MultiLineString and MultiPolygon:** the same parts in any order are the same value (`[A, B]` equals `[B, A]`). Each part follows its own type's rule.
- **GeometryCollection:** the same members in any order are the same value. Each member follows its own type's rule.
- **Duplicate parts:** parts are compared as lists, so duplicates count (`[A, A]` does not equal `[A]`, and `[A, A, B]` does not equal `[A, B, B]`).
- **Different types are never the same value:** a MultiPoint `[A, B]` does not equal two Point values `A` and `B`, and a Point `A` does not equal a MultiPoint `[A]`.
- **Multiple mode:** uniqueness works the same as for other field types with multiple values.
- Validate geometries at backend, with exact match. Show (throw) error when it already exists in the database, just like other field types.

**Depends on:** tasks 1, 2 and 3

---

### 5. One map for all shapes, with shape editing 🎨 💅

**Background**
Currently, a multi-value geometry field shows one map per value, drawing a new shape replaces the existing one, and an existing shape cannot be moved or reshaped.

**What to Do**

- Show all shapes of the field on one map.
- Single mode: drawing a new shape replaces the value after the existing confirmation.
- Multiple mode: drawing a new shape adds a new value.
- For Point, LineString and Polygon: select, move, edit vertices and delete on the map.
- For MultiPoint, MultiLineString, MultiPolygon and GeometryCollection: display them, allow deleting the whole value, and offer no editing on the map.
  - Two different colours for editable (primary, blue) and read-only (secondary, gray, dashed lines, friendly for colour-blind users) geometries
  - Add legend somewhere to explain the meaning of the colours. Or pop up the hint message when hovering read-only geometries if it’s possible to implement.
- Never change the type of an existing value.

**Depends on:** task 1

---

### 6. Undo and redo 🎨 💅

**Background**
Once shapes can be edited on the map, mistakes need to be reversible.

**What to Do**

- Add undo and redo for adding, editing and deleting shapes, in single and multiple mode.

**Depends on:** task 5

---

### 7. Shape list 🎨 💅

**Background**
With several shapes on one map, small shapes, overlapping shapes and shapes outside the current view are hard to select.

**What to Do**

- List the shapes in the field next to the map, showing each shape’s type.
- Keep selection synchronised both ways: selecting on the map highlights the row, selecting a row highlights the shape and zooms the map to it.
- Show a multipart value as one entry.

**Depends on:** task 5

---

### 8. Editable GeoJSON panel 🎨 💅

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

### 9. Coordinates panel 🎨 💅

**Background**
Users need to enter or fine-tune a point’s longitude and latitude precisely, which the map alone does not allow.

**What to Do**

- Add a collapsible coordinates panel, collapsed by default.
- Show the selected shape only. With nothing selected, show “Select a shape to edit its coordinates.”
- Offer numeric editing for Point values only. For other types, point to the GeoJSON editor.
- Enter or blur applies a change (memory in frontend only, no HTTP requests); Esc reverts.
- Keep the panel synchronised with the map and the GeoJSON panel.

**Depends on:** tasks 5 and 8

---

### 10. Large values in the editor 🎨

**Background**
A field can hold many shapes; the shape list and the map must stay responsive.

**What to Do**

- Keep the shape list responsive with many shapes.
- Keep the map readable with many shapes.

**Depends on:** tasks 5 and 7

---

## Deferred

### 11. Apply location search results 🎨

**Background**
Location search already exists but only moves the map; the result cannot be used as a value.

**What to Do**

- Set the selected point to the search result, or add a new point when nothing is selected.
- On hold until the CTO office decides the geocoding provider.

**Depends on:** task 5; choice of geocoding provider

---

## Before kickoff

These RDD open questions affect the tasks above:

- Phase split — confirms which tasks are in the first release.
- Limits: value size and its basis of measurement, shapes per value and total coordinates — affects task 2.
- Geocoding provider — blocks task 11 (deferred).
