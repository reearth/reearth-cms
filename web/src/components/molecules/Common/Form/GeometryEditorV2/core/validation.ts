import { t } from "@reearth-cms/i18n";

import { ALL_KINDS, GeometryKind } from "./types";

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

export const LIMITS = {
  SHAPES: 1000,
  COORDINATES: 100_000,
  COLLECTION_DEPTH: 5,
} as const;

const MAX_ISSUES = 20;
const raw = { interpolation: { escapeValue: false } };

const MEMBERS: Record<string, readonly string[]> = {
  [GeometryKind.GEOMETRY_COLLECTION]: ["type", "geometries", "bbox"],
};
const COORDINATE_MEMBERS = ["type", "coordinates", "bbox"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
  if (!checkPositions(value, path, 4, out)) return;
  const ring = value as unknown[];
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

function checkGeometry(value: unknown, path: string, depth: number, out: Collector) {
  if (!isObject(value)) {
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
  if (typeof type !== "string" || !ALL_KINDS.includes(type as GeometryKind)) {
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
  switch (type as GeometryKind) {
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
      if (depth >= LIMITS.COLLECTION_DEPTH) {
        out.add(
          path,
          t("GeometryCollection nesting is limited to {{max}} levels", {
            max: LIMITS.COLLECTION_DEPTH,
          }),
        );
        return;
      }
      checkList(value.geometries, at("geometries"), out, (g, gp) =>
        checkGeometry(g, gp, depth + 1, out),
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
    if (value.length > LIMITS.SHAPES) {
      out.add(
        "",
        t("Too many shapes: {{count}} (limit {{max}})", {
          count: value.length,
          max: LIMITS.SHAPES,
        }),
      );
    }
    value.forEach((geometry, i) => {
      shapes.push(geometry);
      if (!out.full) checkGeometry(geometry, `[${i}]`, 0, out);
    });
  } else {
    if (Array.isArray(value)) {
      out.add("", t("This field holds one geometry. Remove the surrounding [ ]."));
      return out.issues;
    }
    shapes.push(value);
    checkGeometry(value, "", 0, out);
  }

  if (out.coordinates > LIMITS.COORDINATES) {
    out.add(
      "",
      t("Too many coordinates: {{count}} (limit {{max}})", {
        count: out.coordinates,
        max: LIMITS.COORDINATES,
      }),
    );
  }

  const allowed = options.allowedKinds;
  if (allowed && allowed.length < ALL_KINDS.length) {
    shapes.forEach((shape, i) => {
      const type = isObject(shape) ? shape.type : undefined;
      if (typeof type === "string" && ALL_KINDS.includes(type as GeometryKind)) {
        if (!allowed.includes(type as GeometryKind)) {
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

export function formatIssue(issue: GeometryIssue): string {
  return issue.path ? `${issue.path}: ${issue.message}` : issue.message;
}
