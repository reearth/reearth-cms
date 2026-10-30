import type { FeatureCollection, Geometry, Position } from "geojson";

import type { IconName } from "@reearth-cms/components/atoms/Icon";
import { t } from "@reearth-cms/i18n";
import { GeoUtils, GeometryKind } from "@reearth-cms/utils/geoUtils";
import type { VertexRef } from "@reearth-cms/utils/geoUtils";

/** Human-readable copy for shapes. Internal ids never appear in the UI. */

export const kindIcon = (kind: string): IconName => {
  switch (kind) {
    case GeometryKind.POINT:
    case GeometryKind.MULTI_POINT:
      return "mapPin";
    case GeometryKind.LINE_STRING:
    case GeometryKind.MULTI_LINE_STRING:
      return "lineString";
    case GeometryKind.POLYGON:
    case GeometryKind.MULTI_POLYGON:
      return "polygon";
    default:
      return "block";
  }
};

export const kindName = (kind: string): string => {
  switch (kind) {
    case GeometryKind.POINT:
      return t("Point");
    case GeometryKind.LINE_STRING:
      return t("Line");
    case GeometryKind.POLYGON:
      return t("Polygon");
    default:
      // Multi* and GeometryCollection keep their GeoJSON names: they only exist for
      // people who already work in GeoJSON.
      return kind;
  }
};

export const formatLatLng = (position: Position, digits = 5): string =>
  `${position[1].toFixed(digits)}, ${position[0].toFixed(digits)}`;

/** "35.68124, 139.76712" · "5 vertices" · "3 parts" */
export const shapeDetail = (geometry: Geometry): string => {
  switch (geometry.type) {
    case GeometryKind.POINT:
      return formatLatLng(geometry.coordinates);
    case GeometryKind.LINE_STRING:
    case GeometryKind.POLYGON:
      return t("{{count}} vertices", { count: GeoUtils.countVertices(geometry) });
    default:
      return t("{{count}} parts", { count: GeoUtils.partCount(geometry) });
  }
};

export const vertexLabel = (vertex: VertexRef): string =>
  vertex.ring
    ? t("Ring {{ring}} · Vertex {{number}}", { ring: vertex.ring, number: vertex.number })
    : t("Vertex {{number}}", { number: vertex.number });

/** One line for the inline field footer. */
export const summarize = (collection: FeatureCollection): string => {
  const geometries = collection.features
    .map(f => f.geometry)
    .filter((geometry): geometry is Geometry => !!geometry);
  if (geometries.length === 0) return t("No geometry");
  if (geometries.length === 1) {
    return `${kindName(geometries[0].type)} · ${shapeDetail(geometries[0])}`;
  }
  const counts = new Map<string, number>();
  geometries.forEach(g => counts.set(g.type, (counts.get(g.type) ?? 0) + 1));
  const parts = [...counts.entries()].map(([kind, count]) => kindCount(kind, count)).join(", ");
  return `${t("{{count}} shapes", { count: geometries.length })} · ${parts}`;
};

const kindCount = (kind: string, count: number): string => {
  switch (kind) {
    case GeometryKind.POINT:
      return t("{{count}} points", { count });
    case GeometryKind.LINE_STRING:
      return t("{{count}} lines", { count });
    case GeometryKind.POLYGON:
      return t("{{count}} polygons", { count });
    default:
      return `${count} ${kind}`;
  }
};
