import type { Geometry, Position } from "geojson";

import { t } from "@reearth-cms/i18n";
import { GeoUtils, GeometryKind } from "@reearth-cms/utils/geoUtils";
import { ObjectUtils } from "@reearth-cms/utils/object";

/**
 * Field-value validation: a value is an RFC 7946 geometry, with
 * the same rules whichever surface (map, text, API) produced it.
 */

export type GeometryIssue = {
  /** JSON path inside the value, e.g. `[1].coordinates[0][3]`. Empty for the root. */
  readonly path: string;
  readonly message: string;
};

export type ValidateOptions = {
  /** Kinds the field accepts; legacy Geometry Object fields may restrict these. */
  readonly allowedKinds?: readonly GeometryKind[];
};

/** Placeholders until the backend confirms the agreed limits. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class GeometryLimits {
  public static readonly SHAPES = 1_000;
  public static readonly COORDINATES = 100_000;
  /** UTF-8 bytes of one geometry serialized as compact JSON, whatever the input formatting. */
  public static readonly VALUE_BYTES = 1_024 * 1_024;
}

const MAX_ISSUES = 20;
const raw = { interpolation: { escapeValue: false } };

const MEMBERS: Record<string, readonly string[]> = {
  [GeometryKind.GEOMETRY_COLLECTION]: ["type", "geometries", "bbox"],
};
const COORDINATE_MEMBERS = ["type", "coordinates", "bbox"];

const encoder = new TextEncoder();

class Collector {
  readonly issues: GeometryIssue[] = [];
  coordinates = 0;

  add(path: string, message: string) {
    if (this.issues.length < MAX_ISSUES) this.issues.push({ path, message });
  }

  get full() {
    return this.issues.length >= MAX_ISSUES;
  }
}

function checkPosition(value: unknown, path: string, out: Collector) {
  out.coordinates++;
  if (
    !Array.isArray(value) ||
    value.length < 2 ||
    value.length > 3 ||
    !value.every(n => typeof n === "number" && Number.isFinite(n))
  ) {
    out.add(path, t("A position is [longitude, latitude] with an optional altitude"));
    return;
  }
  const [lng, lat] = value as number[];
  const lngOk = lng >= -180 && lng <= 180;
  const latOk = lat >= -90 && lat <= 90;
  if (lngOk && latOk) return;
  // A latitude outside ±90 that would be a fine longitude, next to a longitude that would
  // be a fine latitude, is almost always a [lat, lng] paste.
  if (!latOk && Math.abs(lat) <= 180 && Math.abs(lng) <= 90) {
    out.add(path, t("Coordinates must be [longitude, latitude]"));
  } else if (!lngOk) {
    out.add(path, t("Longitude must be between -180 and 180"));
  } else {
    out.add(path, t("Latitude must be between -90 and 90"));
  }
}

function checkPositions(value: unknown, path: string, min: number, out: Collector): boolean {
  if (!Array.isArray(value)) {
    out.add(path, t("Expected a list of positions"));
    return false;
  }
  if (value.length < min) {
    out.add(
      path,
      min === 2
        ? t("A LineString needs at least 2 positions")
        : t("A polygon ring needs at least 4 positions"),
    );
  }
  value.forEach((position, i) => !out.full && checkPosition(position, `${path}[${i}]`, out));
  return true;
}

function checkRing(value: unknown, path: string, out: Collector) {
  if (!checkPositions(value, path, 4, out) || !Array.isArray(value)) return;
  const ring = value;
  if (ring.length >= 4 && JSON.stringify(ring[0]) !== JSON.stringify(ring[ring.length - 1])) {
    out.add(path, t("A polygon ring must end where it starts"));
  }
}

function checkList(
  value: unknown,
  path: string,
  out: Collector,
  each: (v: unknown, p: string) => void,
) {
  if (!Array.isArray(value)) {
    out.add(path, t("Expected a list"));
    return;
  }
  value.forEach((entry, i) => !out.full && each(entry, `${path}[${i}]`));
}

function checkGeometry(value: unknown, path: string, inCollection: boolean, out: Collector) {
  if (!ObjectUtils.isPlainObject(value)) {
    out.add(path, t("Expected a GeoJSON geometry object"));
    return;
  }
  const type = value.type;
  if (type === "Feature" || type === "FeatureCollection") {
    out.add(
      path,
      t("Expected a geometry, not a {{type}}. Use the geometry inside it.", { type, ...raw }),
    );
    return;
  }
  if (!GeoUtils.isGeometryKind(type)) {
    out.add(
      path ? `${path}.type` : "type",
      typeof type === "string"
        ? t("Unknown geometry type {{type}}", { type, ...raw })
        : t("A geometry needs a type"),
    );
    return;
  }

  const allowed = MEMBERS[type] ?? COORDINATE_MEMBERS;
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      out.add(
        path ? `${path}.${key}` : key,
        t(
          'Unknown property "{{name}}" is not allowed in a geometry. Store extra information in a separate field.',
          { name: key, ...raw },
        ),
      );
    }
  }

  const at = (member: string) => (path ? `${path}.${member}` : member);
  const coordinates = value.coordinates;
  switch (type) {
    case GeometryKind.POINT:
      checkPosition(coordinates, at("coordinates"), out);
      break;
    case GeometryKind.MULTI_POINT:
      checkList(coordinates, at("coordinates"), out, (p, pp) => checkPosition(p, pp, out));
      break;
    case GeometryKind.LINE_STRING:
      checkPositions(coordinates, at("coordinates"), 2, out);
      break;
    case GeometryKind.MULTI_LINE_STRING:
      checkList(coordinates, at("coordinates"), out, (l, lp) => checkPositions(l, lp, 2, out));
      break;
    case GeometryKind.POLYGON:
      checkList(coordinates, at("coordinates"), out, (r, rp) => checkRing(r, rp, out));
      break;
    case GeometryKind.MULTI_POLYGON:
      checkList(coordinates, at("coordinates"), out, (poly, pp) =>
        checkList(poly, pp, out, (r, rp) => checkRing(r, rp, out)),
      );
      break;
    case GeometryKind.GEOMETRY_COLLECTION:
      if (inCollection) {
        out.add(path, t("A GeometryCollection can't contain another GeometryCollection"));
        return;
      }
      checkList(value.geometries, at("geometries"), out, (g, gp) =>
        checkGeometry(g, gp, true, out),
      );
      break;
  }
}

/**
 * Validates a whole field value: one geometry (single) or a list of them (multiple).
 * `null` / empty list means "no value" and is valid here; `required` is the form's job.
 */
export function validateValue(
  value: unknown,
  multiple: boolean,
  options: ValidateOptions = {},
): GeometryIssue[] {
  const out = new Collector();
  if (value === null || value === undefined) return out.issues;

  const shapes: unknown[] = [];
  if (multiple) {
    if (!Array.isArray(value)) {
      out.add("", t("Expected a list of geometries, e.g. [ { ... }, { ... } ]"));
      return out.issues;
    }
    if (value.length > GeometryLimits.SHAPES) {
      out.add(
        "",
        t("Too many geometries: {{count}} (limit {{max}})", {
          count: value.length,
          max: GeometryLimits.SHAPES,
        }),
      );
    }
    value.forEach((geometry, i) => {
      shapes.push(geometry);
      if (!out.full) checkGeometry(geometry, `[${i}]`, false, out);
    });
  } else {
    if (Array.isArray(value)) {
      out.add("", t("This field holds one geometry. Remove the surrounding [ ]."));
      return out.issues;
    }
    shapes.push(value);
    checkGeometry(value, "", false, out);
  }

  if (out.coordinates > GeometryLimits.COORDINATES) {
    out.add(
      "",
      t("Too many coordinates: {{count}} (limit {{max}})", {
        count: out.coordinates,
        max: GeometryLimits.COORDINATES,
      }),
    );
  }

  shapes.forEach((shape, i) => {
    const bytes = encoder.encode(JSON.stringify(shape)).length;
    if (bytes > GeometryLimits.VALUE_BYTES) {
      out.add(
        multiple ? `[${i}]` : "",
        t("This geometry is too large: {{size}} KB (limit {{max}} KB)", {
          size: Math.ceil(bytes / 1024),
          max: GeometryLimits.VALUE_BYTES / 1024,
        }),
      );
    }
  });

  const allowed = options.allowedKinds;
  if (allowed && allowed.length < GeoUtils.ALL_KINDS.length) {
    shapes.forEach((shape, i) => {
      const type = ObjectUtils.isPlainObject(shape) ? shape.type : undefined;
      if (GeoUtils.isGeometryKind(type)) {
        if (!allowed.includes(type)) {
          out.add(
            multiple ? `[${i}]` : "",
            t("This field accepts only: {{types}}", { types: allowed.join(", "), ...raw }),
          );
        }
      }
    });
  }

  return out.issues;
}

/** Positions are rounded to 7 decimals, so one may sit this far outside a bbox made before. */
const BBOX_TOLERANCE = 1e-7;

/** [west, south, east, north] of a well-formed bbox, altitude left out; null otherwise. */
function flatBbox(bbox: unknown): [number, number, number, number] | null {
  if (!Array.isArray(bbox) || !bbox.every(n => typeof n === "number" && Number.isFinite(n))) {
    return null;
  }
  const box = bbox as number[];
  if (box.length === 4) return [box[0], box[1], box[2], box[3]];
  if (box.length === 6) return [box[0], box[1], box[3], box[4]];
  return null;
}

function containsPosition(
  [west, south, east, north]: [number, number, number, number],
  [lng, lat]: Position,
): boolean {
  if (lat < south - BBOX_TOLERANCE || lat > north + BBOX_TOLERANCE) return false;
  // west > east is a box across the antimeridian (RFC 7946 §5.2).
  return west <= east
    ? lng >= west - BBOX_TOLERANCE && lng <= east + BBOX_TOLERANCE
    : lng >= west - BBOX_TOLERANCE || lng <= east + BBOX_TOLERANCE;
}

function everyPosition(geometry: Geometry, test: (position: Position) => boolean): boolean {
  const visit = (value: unknown): boolean =>
    Array.isArray(value) &&
    (typeof value[0] === "number" ? test(value as Position) : value.every(visit));
  return geometry.type === GeometryKind.GEOMETRY_COLLECTION
    ? geometry.geometries.every(g => everyPosition(g, test))
    : geometry.coordinates.length === 0 || visit(geometry.coordinates);
}

function checkBbox(geometry: Geometry, path: string, out: GeometryIssue[]) {
  const at = (member: string) => (path ? `${path}.${member}` : member);
  const box = flatBbox(geometry.bbox);
  if (box && !everyPosition(geometry, position => containsPosition(box, position))) {
    out.push({
      path: at("bbox"),
      message: t("The bbox doesn't contain this geometry. It will be saved as is."),
    });
  }
  if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
    geometry.geometries.forEach((g, i) => checkBbox(g, at(`geometries[${i}]`), out));
  }
}

/**
 * A bbox is optional and is stored as written, so a stale one is a warning, not an error.
 * A bbox larger than its geometry is fine: RFC 7946 doesn't require the smallest one.
 */
export function findStaleBboxes(
  geometries: readonly Geometry[],
  multiple: boolean,
): GeometryIssue[] {
  const out: GeometryIssue[] = [];
  geometries.forEach((geometry, i) => checkBbox(geometry, multiple ? `[${i}]` : "", out));
  return out;
}

export function formatIssue(issue: GeometryIssue): string {
  return issue.path ? `${issue.path}: ${issue.message}` : issue.message;
}
