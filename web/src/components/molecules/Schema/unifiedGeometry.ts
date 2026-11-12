import type { Field, ObjectSupportedType, SchemaFieldType } from "./types";

/**
 * Prototype of the unified Geometry field (04-geometry-field-proposal.md) without server
 * changes: a Geometry Object that accepts every GeoJSON type *is* the unified field. The
 * schema UI shows it as "Geometry" and the item form gives it the new editor; Geometry
 * Object fields restricted to some types stay legacy fields with the old editor.
 */
export const ALL_GEOMETRY_TYPES: ObjectSupportedType[] = [
  "POINT",
  "MULTIPOINT",
  "LINESTRING",
  "MULTILINESTRING",
  "POLYGON",
  "MULTIPOLYGON",
  "GEOMETRYCOLLECTION",
];

export const isUnifiedGeometryField = (field: Pick<Field, "type" | "typeProperty">) =>
  field.type === "GeometryObject" &&
  ALL_GEOMETRY_TYPES.every(type => field.typeProperty?.objectSupportedTypes?.includes(type));

/** The type the schema UI should show for a stored field. */
export const displayFieldType = (field: Pick<Field, "type" | "typeProperty">): SchemaFieldType =>
  isUnifiedGeometryField(field) ? "Geometry" : field.type;
