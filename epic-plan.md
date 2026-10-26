# [Geometry P1] Frontend implementation

## Goal

Deliver Phase 1 frontend support for the unified Geometry field, covering epic tasks 1–3 and 5–9.

## Why this task exists

Geometry Editor and Geometry Object store the same data but require users to choose an input method at schema-design time. A unified field should support map, GeoJSON and precise Point-coordinate editing.

## What to build / define

1. **Field support and schema editor (tasks 1 and 3)**
    - Add Geometry for new fields, with no geometry-specific configuration. Support required, multiple, title and description.
    - Use structured geometry objects containing standard GeoJSON; preserve current API output and existing Geometry Editor/Geometry Object fields.
    - Name: “Geometry”. Description: “Draw points, lines or areas on a map, or enter them as coordinates or GeoJSON.”
2. **Validation (task 2)**
    - Accept all seven GeoJSON geometry types. Require finite longitude/latitude positions with optional altitude; longitude −180 to 180 and latitude −90 to 90.
    - Require at least 2 positions for a LineString and at least 4 for a polygon ring, with identical first and last positions.
    - Reject nested GeometryCollections and unknown geometry properties. Enforce the agreed per-value size limit.
    - Errors identify the field and cause. Align reversed-coordinate and unknown-property messages with the agreed specification.
3. **Unified map and editing (task 5)**
    - Show all field shapes on one map. In single mode, drawing replaces the value after the existing confirmation; in multiple mode, it adds a value.
    - Allow selecting, moving, vertex editing and deletion for Point, LineString and Polygon.
    - Display MultiPoint, MultiLineString, MultiPolygon and GeometryCollection; allow whole-value deletion only, with no map editing. Never change an existing value’s type.
    - Distinguish editable shapes with primary blue styling and read-only shapes with secondary gray/dashed styling accessible to colour-blind users. Explain this with a legend or, if feasible, a hover hint.
4. **Undo/redo and shape list (tasks 6 and 7)**
    - Undo/redo adding, editing and deleting shapes in single and multiple mode.
    - List each shape’s type next to the map. Synchronise selection both ways; selecting a row highlights and zooms to its shape. A multipart value is one entry.
5. **GeoJSON panel (task 8)**
    - Collapsible, collapsed by default, always editable and synchronised with the map.
    - Apply text edits only once valid; retain the last valid map state and show errors otherwise. Prevent saving invalid values.
6. **Coordinates panel (task 9)**
    - Collapsible and collapsed by default. Show only the selected shape; otherwise show “Select a shape to edit its coordinates.”
    - Numeric editing is for Point values only; direct other types to GeoJSON.
    - Enter or blur applies changes in frontend memory only, without HTTP requests; Esc reverts. Synchronise with map and GeoJSON.

## Acceptance Criteria

- [ ]  New Geometry fields support the standard settings and specified schema-editor copy without changing legacy fields or API output.
- [ ]  Frontend validation follows all geometry rules and matches backend behaviour.
- [ ]  Single/multiple map workflows, editable/read-only behaviour and shape-list selection work as specified.
- [ ]  Undo/redo covers add, edit and delete operations.
- [ ]  GeoJSON edits preserve the last valid state and invalid data cannot be saved.
- [ ]  Point-coordinate editing applies/reverts correctly and all three input surfaces stay synchronised.
- [ ]  Unit tests cover new coding behaviour and all new UI text has Japanese translations.

## Dependencies and open decisions

- Build field support before schema and validation integration; map support precedes undo/redo and shape list; validation and map support precede GeoJSON; map and GeoJSON precede coordinates.
- Coordinate with backend engineer on storage, API behaviour, validation rules and error messages.
- Design team can hand off UI designs incrementally; not every frontend item must wait for all design work.
- Confirm value-size measurement/limit, shapes per value, total-coordinate limits and exact specified validation messages before finalising affected behaviour.
- Large-value performance work is Phase 2. Location-search changes are deferred.
