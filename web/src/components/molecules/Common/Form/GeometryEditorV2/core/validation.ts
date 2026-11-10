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

type FlatBbox = readonly [west: number, south: number, east: number, north: number];

/** Placeholders until the backend confirms the agreed limits. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class GeometryLimits {
  public static readonly SHAPES = 1_000;
  public static readonly COORDINATES = 100_000;
  /**
   * UTF-8 bytes of one geometry serialized as compact JSON, whatever the input formatting.
   * Matches the backend's `maxGeoFieldBytes`; change both together.
   */
  public static readonly VALUE_BYTES = 10 * 1_024;
}

/** Every check returns its own issues; nothing is collected by mutation. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class GeometryValidation {
  private static readonly MAX_ISSUES = 20;
  /** Positions are rounded to 7 decimals, so one may sit this far outside a bbox made before. */
  private static readonly BBOX_TOLERANCE = 1e-7;
  private static readonly RAW = { interpolation: { escapeValue: false } };
  private static readonly MEMBERS: Record<string, readonly string[]> = {
    [GeometryKind.GEOMETRY_COLLECTION]: ["type", "geometries", "bbox"],
  };
  private static readonly COORDINATE_MEMBERS: readonly string[] = ["type", "coordinates", "bbox"];
  private static readonly ENCODER = new TextEncoder();

  /**
   * Validates a whole field value: one geometry (single) or a list of them (multiple).
   * `null` / empty list means "no value" and is valid here; `required` is the form's job.
   */
  public static validateValue(
    value: unknown,
    multiple: boolean,
    options: ValidateOptions = {},
  ): GeometryIssue[] {
    if (value === null || value === undefined) return [];
    if (multiple && !Array.isArray(value)) {
      return [this.issue("", t("Expected a list of geometries, e.g. [ { ... }, { ... } ]"))];
    }

    if (!multiple && Array.isArray(value)) {
      return [this.issue("", t("This field holds one geometry. Remove the surrounding [ ]."))];
    }

    const shapes: readonly unknown[] = Array.isArray(value) ? value : [value];
    const coordinates = shapes.reduce<number>(
      (total, shape) => total + this.countPositions(shape),
      0,
    );

    return [
      ...(multiple && shapes.length > GeometryLimits.SHAPES
        ? [
            this.issue(
              "",
              t("Too many geometries: {{count}} (limit {{max}})", {
                count: shapes.length,
                max: GeometryLimits.SHAPES,
              }),
            ),
          ]
        : []),
      ...shapes.flatMap((shape, i) => this.checkGeometry(shape, this.pathOf(i, multiple), false)),
      ...(coordinates > GeometryLimits.COORDINATES
        ? [
            this.issue(
              "",
              t("Too many coordinates: {{count}} (limit {{max}})", {
                count: coordinates,
                max: GeometryLimits.COORDINATES,
              }),
            ),
          ]
        : []),
      ...shapes.flatMap((shape, i) => this.checkSize(shape, this.pathOf(i, multiple))),
      ...shapes.flatMap((shape, i) =>
        this.checkAllowedKind(shape, this.pathOf(i, multiple), options.allowedKinds),
      ),
    ].slice(0, this.MAX_ISSUES);
  }

  /**
   * A bbox is optional and is stored as written, so a stale one is a warning, not an error.
   * A bbox larger than its geometry is fine: RFC 7946 doesn't require the smallest one.
   */
  public static findStaleBboxes(
    geometries: readonly Geometry[],
    multiple: boolean,
  ): GeometryIssue[] {
    return geometries.flatMap((geometry, i) =>
      this.checkStaleBbox(geometry, this.pathOf(i, multiple)),
    );
  }

  /** Uncut crossings are valid GeoJSON, so they're a warning, and the value is saved as is. */
  public static findAntimeridianCrossings(
    geometries: readonly Geometry[],
    multiple: boolean,
  ): GeometryIssue[] {
    return geometries.flatMap((geometry, i) =>
      this.checkAntimeridian(geometry, this.pathOf(i, multiple)),
    );
  }

  public static formatIssue(issue: GeometryIssue): string {
    return issue.path ? `${issue.path}: ${issue.message}` : issue.message;
  }

  private static issue(path: string, message: string): GeometryIssue {
    return { path, message };
  }

  private static at(path: string, member: string): string {
    return path ? `${path}.${member}` : member;
  }

  /** Where a field value's geometry sits: `[i]` in a list, the root otherwise. */
  private static pathOf(index: number, multiple: boolean): string {
    return multiple ? `[${index}]` : "";
  }

  private static checkGeometry(
    value: unknown,
    path: string,
    inCollection: boolean,
  ): readonly GeometryIssue[] {
    if (!ObjectUtils.isPlainObject(value)) {
      return [this.issue(path, t("Expected a GeoJSON geometry object"))];
    }

    const type = value.type;

    if (type === "Feature" || type === "FeatureCollection") {
      return [
        this.issue(
          path,
          t("Expected a geometry, not a {{type}}. Use the geometry inside it.", {
            type,
            ...this.RAW,
          }),
        ),
      ];
    }

    if (!GeoUtils.isGeometryKind(type)) {
      return [
        this.issue(
          this.at(path, "type"),
          typeof type === "string"
            ? t("Unknown geometry type {{type}}", { type, ...this.RAW })
            : t("A geometry needs a type"),
        ),
      ];
    }

    const allowed = this.MEMBERS[type] ?? this.COORDINATE_MEMBERS;
    const memberIssues = Object.keys(value)
      .filter(key => !allowed.includes(key))
      .map(key =>
        this.issue(
          this.at(path, key),
          t(
            'Unknown property "{{name}}" is not allowed in a geometry. Store extra information in a separate field.',
            { name: key, ...this.RAW },
          ),
        ),
      );

    const bboxIssues =
      "bbox" in value ? this.checkBboxMember(value.bbox, this.at(path, "bbox")) : [];

    return [
      ...memberIssues,
      ...bboxIssues,
      ...this.checkCoordinates(value, type, path, inCollection),
    ];
  }

  private static checkCoordinates(
    value: Record<string, unknown>,
    type: GeometryKind,
    path: string,
    inCollection: boolean,
  ): readonly GeometryIssue[] {
    const coordinates = value.coordinates;
    const coordinatesPath = this.at(path, "coordinates");
    switch (type) {
      case GeometryKind.POINT:
        return this.checkPosition(coordinates, coordinatesPath);
      case GeometryKind.MULTI_POINT:
        return this.checkList(coordinates, coordinatesPath, (p, pp) => this.checkPosition(p, pp));
      case GeometryKind.LINE_STRING:
        return this.checkPositions(coordinates, coordinatesPath, 2);
      case GeometryKind.MULTI_LINE_STRING:
        return this.checkList(coordinates, coordinatesPath, (l, lp) =>
          this.checkPositions(l, lp, 2),
        );
      case GeometryKind.POLYGON:
        return this.checkList(coordinates, coordinatesPath, (r, rp) => this.checkRing(r, rp));
      case GeometryKind.MULTI_POLYGON:
        return this.checkList(coordinates, coordinatesPath, (poly, pp) =>
          this.checkList(poly, pp, (r, rp) => this.checkRing(r, rp)),
        );
      case GeometryKind.GEOMETRY_COLLECTION:
        if (inCollection) {
          return [
            this.issue(path, t("A GeometryCollection can't contain another GeometryCollection")),
          ];
        }

        return this.checkList(value.geometries, this.at(path, "geometries"), (g, gp) =>
          this.checkGeometry(g, gp, true),
        );
    }
  }

  private static checkPosition(value: unknown, path: string): readonly GeometryIssue[] {
    if (
      !Array.isArray(value) ||
      value.length < 2 ||
      value.length > 3 ||
      !value.every(n => typeof n === "number" && Number.isFinite(n))
    ) {
      return [this.issue(path, t("A position is [longitude, latitude] with an optional altitude"))];
    }

    const [lng, lat] = value as number[];
    const lngOk = lng >= -180 && lng <= 180;
    const latOk = lat >= -90 && lat <= 90;

    if (lngOk && latOk) return [];
    // A latitude outside ±90 that would be a fine longitude, next to a longitude that would
    // be a fine latitude, is almost always a [lat, lng] paste.
    if (!latOk && Math.abs(lat) <= 180 && Math.abs(lng) <= 90) {
      return [this.issue(path, t("Coordinates must be [longitude, latitude]"))];
    }

    return [
      this.issue(
        path,
        !lngOk
          ? t("Longitude must be between -180 and 180")
          : t("Latitude must be between -90 and 90"),
      ),
    ];
  }

  private static checkPositions(
    value: unknown,
    path: string,
    min: number,
  ): readonly GeometryIssue[] {
    if (!Array.isArray(value)) return [this.issue(path, t("Expected a list of positions"))];

    const lengthIssues =
      value.length < min
        ? [
            this.issue(
              path,
              min === 2
                ? t("A LineString needs at least 2 positions")
                : t("A polygon ring needs at least 4 positions"),
            ),
          ]
        : [];

    return [
      ...lengthIssues,
      ...value.flatMap((position, i) => this.checkPosition(position, `${path}[${i}]`)),
    ];
  }

  private static checkRing(value: unknown, path: string): readonly GeometryIssue[] {
    const positionIssues = this.checkPositions(value, path, 4);
    if (!Array.isArray(value)) return positionIssues;
    const open =
      value.length >= 4 && JSON.stringify(value[0]) !== JSON.stringify(value[value.length - 1]);

    return [
      ...positionIssues,
      ...(open ? [this.issue(path, t("A polygon ring must end where it starts"))] : []),
    ];
  }

  private static checkList(
    value: unknown,
    path: string,
    each: (entry: unknown, entryPath: string) => readonly GeometryIssue[],
  ): readonly GeometryIssue[] {
    if (!Array.isArray(value)) return [this.issue(path, t("Expected a list"))];

    return value.flatMap((entry, i) => each(entry, `${path}[${i}]`));
  }

  /**
   * RFC 7946 §5: [west, south, east, north], or [west, south, low, east, north, high] with
   * altitude. West > east is fine: the box crosses the antimeridian.
   */
  private static checkBboxMember(value: unknown, path: string): readonly GeometryIssue[] {
    if (
      !Array.isArray(value) ||
      (value.length !== 4 && value.length !== 6) ||
      !value.every(n => typeof n === "number" && Number.isFinite(n))
    ) {
      return [
        this.issue(
          path,
          t("A bbox is [west, south, east, north], with an optional altitude range"),
        ),
      ];
    }

    const box = value as number[];
    const half = box.length / 2;
    const [west, south] = box;
    const [east, north] = [box[half], box[half + 1]];
    const lngOk = [west, east].every(lng => lng >= -180 && lng <= 180);
    const latOk = [south, north].every(lat => lat >= -90 && lat <= 90);

    if (!lngOk || !latOk) {
      return [this.issue(path, t("A bbox must stay within longitude ±180 and latitude ±90"))];
    }

    if (south > north) {
      return [this.issue(path, t("A bbox's south edge can't be north of its north edge"))];
    }

    if (half === 3 && box[2] > box[5]) {
      return [this.issue(path, t("A bbox's lowest altitude can't be above its highest"))];
    }

    return [];
  }

  private static checkSize(shape: unknown, path: string): readonly GeometryIssue[] {
    const bytes = this.ENCODER.encode(JSON.stringify(shape)).length;

    return bytes <= GeometryLimits.VALUE_BYTES
      ? []
      : [
          this.issue(
            path,
            t("This geometry is too large: {{size}} KB (limit {{max}} KB)", {
              size: Math.ceil(bytes / 1024),
              max: GeometryLimits.VALUE_BYTES / 1024,
            }),
          ),
        ];
  }

  private static checkAllowedKind(
    shape: unknown,
    path: string,
    allowed: readonly GeometryKind[] | undefined,
  ): readonly GeometryIssue[] {
    if (!allowed || allowed.length >= GeoUtils.ALL_KINDS.length) return [];

    const type = ObjectUtils.isPlainObject(shape) ? shape.type : undefined;
    if (!GeoUtils.isGeometryKind(type) || allowed.includes(type)) return [];

    return [
      this.issue(
        path,
        t("This field accepts only: {{types}}", { types: allowed.join(", "), ...this.RAW }),
      ),
    ];
  }

  /** How many positions a shape holds, the way the checks above walk it. */
  private static countPositions(shape: unknown): number {
    if (!ObjectUtils.isPlainObject(shape)) return 0;

    const lengthOf = (value: unknown): number => (Array.isArray(value) ? value.length : 0);
    const sumOf = (value: unknown, count: (entry: unknown) => number): number =>
      Array.isArray(value) ? value.reduce<number>((total, entry) => total + count(entry), 0) : 0;
    const coordinates = shape.coordinates;

    switch (shape.type) {
      case GeometryKind.POINT:
        return 1;
      case GeometryKind.MULTI_POINT:
      case GeometryKind.LINE_STRING:
        return lengthOf(coordinates);
      case GeometryKind.MULTI_LINE_STRING:
      case GeometryKind.POLYGON:
        return sumOf(coordinates, lengthOf);
      case GeometryKind.MULTI_POLYGON:
        return sumOf(coordinates, polygon => sumOf(polygon, lengthOf));
      case GeometryKind.GEOMETRY_COLLECTION:
        return sumOf(shape.geometries, member => this.countPositions(member));
      default:
        return 0;
    }
  }

  private static checkStaleBbox(geometry: Geometry, path: string): readonly GeometryIssue[] {
    const box = this.flatBbox(geometry.bbox);

    const stale =
      box && !this.everyPosition(geometry, position => this.containsPosition(box, position))
        ? [
            this.issue(
              this.at(path, "bbox"),
              t("The bbox doesn't contain this geometry. It will be saved as is."),
            ),
          ]
        : [];

    const members =
      geometry.type === GeometryKind.GEOMETRY_COLLECTION
        ? geometry.geometries.flatMap((g, i) =>
            this.checkStaleBbox(g, this.at(path, `geometries[${i}]`)),
          )
        : [];

    return [...stale, ...members];
  }

  /** [west, south, east, north] of a well-formed bbox, altitude left out; null otherwise. */
  private static flatBbox(bbox: unknown): FlatBbox | null {
    if (!Array.isArray(bbox) || !bbox.every(n => typeof n === "number" && Number.isFinite(n))) {
      return null;
    }

    const box = bbox as number[];

    if (box.length === 4) return [box[0], box[1], box[2], box[3]];
    if (box.length === 6) return [box[0], box[1], box[3], box[4]];

    return null;
  }

  private static containsPosition(
    [west, south, east, north]: FlatBbox,
    [lng, lat]: Position,
  ): boolean {
    const tolerance = this.BBOX_TOLERANCE;

    if (lat < south - tolerance || lat > north + tolerance) return false;

    // west > east is a box across the antimeridian (RFC 7946 §5.2).
    return west <= east
      ? lng >= west - tolerance && lng <= east + tolerance
      : lng >= west - tolerance || lng <= east + tolerance;
  }

  private static everyPosition(geometry: Geometry, test: (position: Position) => boolean): boolean {
    const visit = (value: unknown): boolean =>
      Array.isArray(value) &&
      (typeof value[0] === "number" ? test(value as Position) : value.every(visit));

    return geometry.type === GeometryKind.GEOMETRY_COLLECTION
      ? geometry.geometries.every(g => this.everyPosition(g, test))
      : geometry.coordinates.length === 0 || visit(geometry.coordinates);
  }

  private static checkAntimeridian(geometry: Geometry, path: string): readonly GeometryIssue[] {
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
      return geometry.geometries.flatMap((g, i) =>
        this.checkAntimeridian(g, this.at(path, `geometries[${i}]`)),
      );
    }

    if (!this.lineLists(geometry).some(positions => this.isCrossingAntimeridian(positions))) {
      return [];
    }

    return [
      this.issue(
        this.at(path, "coordinates"),
        t(
          "This geometry crosses the 180° meridian without being split, so it's drawn the long way around. Split it into parts that meet at ±180.",
        ),
      ),
    ];
  }

  /**
   * GeoJSON joins positions by plain interpolation, so an edge more than 180° of longitude long
   * runs the long way around the globe instead of across the antimeridian (RFC 7946 §3.1.9).
   * Edges along the antimeridian itself, like a cut shape's seam, don't count.
   */
  private static isCrossingAntimeridian(positions: readonly Position[]): boolean {
    return positions.slice(1).some((next, i) => {
      const [lng] = positions[i];
      const onAntimeridian = Math.abs(lng) === 180 && Math.abs(next[0]) === 180;

      return !onAntimeridian && Math.abs(next[0] - lng) > 180;
    });
  }

  /** The position lists whose consecutive positions are joined by edges. */
  private static lineLists(geometry: Geometry): readonly Position[][] {
    switch (geometry.type) {
      case GeometryKind.LINE_STRING:
        return [geometry.coordinates];
      case GeometryKind.MULTI_LINE_STRING:
      case GeometryKind.POLYGON:
        return geometry.coordinates;
      case GeometryKind.MULTI_POLYGON:
        return geometry.coordinates.flat();
      default:
        return [];
    }
  }
}
