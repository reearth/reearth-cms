/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { HintIssue } from "@placemarkio/check-geojson";
import { check, getIssues } from "@placemarkio/check-geojson";
import type { BBox, Feature, FeatureCollection, GeoJSON, Geometry, Position } from "geojson";

import { PerformanceTimer } from "@reearth-cms/utils/performance";

/** Values match the GeoJSON `type` strings so they compare directly. */
export enum GeometryKind {
  POINT = "Point",
  LINE_STRING = "LineString",
  POLYGON = "Polygon",
  MULTI_POINT = "MultiPoint",
  MULTI_LINE_STRING = "MultiLineString",
  MULTI_POLYGON = "MultiPolygon",
  GEOMETRY_COLLECTION = "GeometryCollection",
}

/** One numerically editable position within a geometry, addressed by flat index. */
export type VertexRef = {
  readonly index: number;
  readonly position: Position;
  /** 1-based ring number for polygons with holes. */
  readonly ring?: number;
  /** 1-based vertex number within its ring/line. */
  readonly number: number;
};

type ValidateGeoJson = (
  raw: Record<string, unknown> | string | GeoJSON,
) => Promise<{ isValid: true; data: GeoJSON } | { isValid: false; error: string }>;

/** A position on a line, with the world copy it falls in (see `GeoUtils.worldOf`). */
type TaggedPosition = { readonly position: Position; readonly world: number };

/**
 * Everything entering the geometry editor's store goes through `normalize`, so comparisons
 * can be structural and cheap.
 */
export abstract class GeoUtils {
  public static readonly ALL_KINDS: readonly GeometryKind[] = Object.values(GeometryKind);

  /** The westernmost longitude; with `MAX_LONGITUDE`, the antimeridian. */
  public static readonly MIN_LONGITUDE = -180;

  /** The easternmost longitude; with `MIN_LONGITUDE`, the antimeridian. */
  public static readonly MAX_LONGITUDE = 180;

  /** The South Pole's latitude. */
  public static readonly MIN_LATITUDE = -90;

  /** The North Pole's latitude. */
  public static readonly MAX_LATITUDE = 90;

  /** Degrees of longitude in one copy of the world. */
  public static readonly WORLD_WIDTH = this.MAX_LONGITUDE - this.MIN_LONGITUDE;

  /** ~1cm. Without a fixed precision the EPSG:3857 round-trip never settles. */
  private static readonly COORDINATE_PRECISION = 7;

  /** The map edits only what the map can draw. */
  private static readonly EDITABLE_KINDS: readonly GeometryKind[] = [
    GeometryKind.POINT,
    GeometryKind.LINE_STRING,
    GeometryKind.POLYGON,
  ];

  private static readonly ID_PATTERN = /^s(\d+)$/;

  /** Type guard: whether `value` is one of the GeoJSON geometry type strings. */
  public static isGeometryKind(value: unknown): value is GeometryKind {
    return this.ALL_KINDS.some(kind => kind === value);
  }

  /** Whether `value` is a longitude in range, ±180 included. */
  public static isLongitude(value: number): boolean {
    return value >= this.MIN_LONGITUDE && value <= this.MAX_LONGITUDE;
  }

  /** Whether `value` is a latitude in range, the poles included. */
  public static isLatitude(value: number): boolean {
    return value >= this.MIN_LATITUDE && value <= this.MAX_LATITUDE;
  }

  /** Whether `lng` lies on the antimeridian, at either −180 or 180. */
  public static isAntimeridian(lng: number): boolean {
    return lng === this.MIN_LONGITUDE || lng === this.MAX_LONGITUDE;
  }

  /** Whether a GeoJSON or OpenLayers geometry type string is one the map can edit. */
  public static isEditableType(type: string | undefined): boolean {
    return this.EDITABLE_KINDS.some(kind => kind === type);
  }

  /** One feature per geometry, with the editor's internal ids. */
  public static toCollection(geometries: readonly Geometry[]): FeatureCollection {
    return {
      type: "FeatureCollection",
      features: geometries.map((geometry, i): Feature => ({
        type: "Feature",
        id: `s${i + 1}`,
        geometry,
        properties: {},
      })),
    };
  }

  /**
   * Checks raw GeoJSON (a string or an object) with `@placemarkio/check-geojson`, resolving the
   * parsed data or every issue joined into one message. Runs after a `setTimeout(0)`, so the
   * caller's current work finishes first.
   */
  public static validateGeoJson: ValidateGeoJson = raw => {
    return new Promise<Awaited<ReturnType<ValidateGeoJson>>>(resolve => {
      setTimeout(() => {
        const timer = new PerformanceTimer("validateGeoJson");

        const parseRaw: string = typeof raw === "string" ? raw : JSON.stringify(raw);
        const issues: HintIssue[] = getIssues(parseRaw);

        if (issues.length > 0) {
          resolve({
            isValid: false,
            error: issues.map(issue => issue.message).join(", "),
          });
        } else {
          const data = check(parseRaw);
          resolve({ isValid: true, data });
        }

        timer.log();
      }, 0);
    });
  };

  /**
   * A copy with every coordinate rounded to `COORDINATE_PRECISION` decimals, GeometryCollection
   * included.
   */
  public static roundGeometry(geometry: Geometry): Geometry {
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
      return { ...geometry, geometries: geometry.geometries.map(g => this.roundGeometry(g)) };
    }

    return { ...geometry, coordinates: this.roundNested(geometry.coordinates) } as Geometry;
  }

  /** Every feature gets a stable internal id (the map diffs on it) and rounded coordinates. */
  public static normalize(collection: FeatureCollection): FeatureCollection {
    let counter = this.highestIdSuffix(collection);
    const features: Feature[] = collection.features.map(feature => ({
      ...feature,
      id:
        typeof feature.id === "string" || typeof feature.id === "number"
          ? String(feature.id)
          : `s${++counter}`,
      geometry: feature.geometry ? this.roundGeometry(feature.geometry) : feature.geometry,
      properties: feature.properties ?? {},
    }));

    return { type: "FeatureCollection", features };
  }

  /** The feature with internal id `id`, or null when `id` is null or no feature has it. */
  public static findFeature(collection: FeatureCollection, id: string | null): Feature | null {
    if (id === null) return null;
    return collection.features.find(feature => String(feature.id) === id) ?? null;
  }

  /** An unused internal id (`s<n>`) for a feature about to be added. */
  public static nextFeatureId(collection: FeatureCollection): string {
    return `s${this.highestIdSuffix(collection) + 1}`;
  }

  /** Whether the map can edit `geometry`: a Point, LineString or Polygon. False when missing. */
  public static isEditableKind(geometry: Geometry | null | undefined): boolean {
    return !!geometry && this.isEditableType(geometry.type);
  }

  /** How many parts a Multi* or GeometryCollection holds. */
  public static partCount(geometry: Geometry): number {
    switch (geometry.type) {
      case GeometryKind.GEOMETRY_COLLECTION:
        return geometry.geometries.length;

      case GeometryKind.MULTI_POINT:
      case GeometryKind.MULTI_LINE_STRING:
      case GeometryKind.MULTI_POLYGON:
        return geometry.coordinates.length;

      default:
        return 1;
    }
  }

  /** Vertices a user may edit; a ring's closing position is omitted because it repeats the first. */
  public static listVertices(geometry: Geometry): VertexRef[] {
    switch (geometry.type) {
      case GeometryKind.POINT:
        return [{ index: 0, position: geometry.coordinates, number: 1 }];

      case GeometryKind.LINE_STRING:
        return geometry.coordinates.map((position, index) => ({
          index,
          position,
          number: index + 1,
        }));

      case GeometryKind.POLYGON: {
        const refs: VertexRef[] = [];
        const multiRing = geometry.coordinates.length > 1;

        geometry.coordinates.forEach((ring, ringIndex) => {
          ring.slice(0, -1).forEach((position, index) => {
            refs.push({
              index: refs.length,
              position,
              number: index + 1,
              ring: multiRing ? ringIndex + 1 : undefined,
            });
          });
        });

        return refs;
      }

      default:
        return [];
    }
  }

  /** How many vertices `listVertices` would return, without building the list. */
  public static countVertices(geometry: Geometry): number {
    switch (geometry.type) {
      case GeometryKind.POINT:
        return 1;

      case GeometryKind.LINE_STRING:
        return geometry.coordinates.length;

      case GeometryKind.POLYGON:
        return geometry.coordinates.reduce((total, ring) => total + ring.length - 1, 0);

      default:
        return 0;
    }
  }

  /**
   * `geometry` with the vertex at flat `index` (as in `listVertices`) moved to `position`;
   * unchanged when the index is out of range or the type isn't editable.
   */
  public static setVertex(geometry: Geometry, index: number, position: Position): Geometry {
    switch (geometry.type) {
      case GeometryKind.POINT:
        return index === 0 ? { ...geometry, coordinates: position } : geometry;

      case GeometryKind.LINE_STRING:
        return {
          ...geometry,
          coordinates: geometry.coordinates.map((p, i) => (i === index ? position : p)),
        };

      case GeometryKind.POLYGON: {
        let cursor = 0;
        const coordinates = geometry.coordinates.map(ring => {
          const editable = ring.length - 1;
          const local = index - cursor;
          cursor += editable;
          if (local < 0 || local >= editable) return ring;
          const next = ring.map((p, i) => (i === local ? position : p));
          // Moving a ring's first position must move its closing position too.
          if (local === 0) next[next.length - 1] = position;
          return next;
        });

        return { ...geometry, coordinates };
      }

      default:
        return geometry;
    }
  }

  /**
   * The geometry without one vertex, or null when that would leave a line under 2 vertices
   * or a ring under 3.
   */
  public static removeVertex(geometry: Geometry, index: number): Geometry | null {
    switch (geometry.type) {
      case GeometryKind.LINE_STRING:
        if (geometry.coordinates.length <= 2) return null;
        return { ...geometry, coordinates: geometry.coordinates.filter((_, i) => i !== index) };

      case GeometryKind.POLYGON: {
        let cursor = 0;
        let removed = false;

        const coordinates = geometry.coordinates.map(ring => {
          const editable = ring.length - 1;
          const local = index - cursor;
          cursor += editable;
          if (local < 0 || local >= editable) return ring;
          if (editable <= 3) return ring;
          removed = true;
          const open = ring.slice(0, -1).filter((_, i) => i !== local);
          // The closing position always repeats the (possibly new) first one.
          return [...open, open[0]];
        });

        return removed ? { ...geometry, coordinates } : null;
      }

      default:
        return null;
    }
  }

  /**
   * [west, south, east, north] in WGS84, or null for an empty geometry. When the shapes sit
   * on both sides of the antimeridian, west > east (RFC 7946 §5.2).
   */
  public static bbox(geometries: readonly Geometry[]): [number, number, number, number] | null {
    // Longitude spans of each line, ring and point. A line's span is exact: its edges never
    // cross ±180, since data that does is cut into parts (RFC 7946 §3.1.9).
    const spans: [number, number][] = [];
    let south = Infinity;
    let north = -Infinity;

    const addSpan = (positions: readonly Position[]) => {
      let west = Infinity;
      let east = -Infinity;

      for (const [lng, lat] of positions) {
        west = Math.min(west, lng);
        east = Math.max(east, lng);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
      }
      spans.push([west, east]);
    };

    const visit = (value: unknown) => {
      if (!Array.isArray(value) || value.length === 0) return;
      if (typeof value[0] === "number") addSpan([value as Position]);
      else if (Array.isArray(value[0]) && typeof value[0][0] === "number") {
        addSpan(value as Position[]);
      } else value.forEach(visit);
    };

    const walk = (geometry: Geometry) => {
      if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) geometry.geometries.forEach(walk);
      // Each point stands alone, so points on both sides of ±180 frame the short way.
      else if (geometry.type === GeometryKind.MULTI_POINT) geometry.coordinates.forEach(visit);
      else visit(geometry.coordinates);
    };

    geometries.forEach(walk);
    if (spans.length === 0) return null;

    const merged: [number, number][] = [];

    for (const [west, east] of [...spans].sort((a, b) => a[0] - b[0])) {
      const last = merged[merged.length - 1];
      if (last && west <= last[1]) last[1] = Math.max(last[1], east);
      else merged.push([west, east]);
    }
    // The box leaves out the widest stretch of longitude that no shape covers. Ties keep the
    // stretch across the antimeridian out, so ordinary data gets an ordinary box.
    let gapAfter = merged.length - 1;
    let widest = merged[0][0] + this.WORLD_WIDTH - merged[gapAfter][1];

    for (let i = 0; i < merged.length - 1; i++) {
      const gap = merged[i + 1][0] - merged[i][1];
      if (gap > widest) {
        widest = gap;
        gapAfter = i;
      }
    }

    return [merged[(gapAfter + 1) % merged.length][0], south, merged[gapAfter][1], north];
  }

  /**
   * `next` with a bbox only where `previous` had one, recomputed so it can't go stale. A
   * bbox is optional, so an edit never adds one. A bbox with altitude keeps it while any
   * position still has one.
   */
  public static carryBbox(next: Geometry, previous: Geometry | null | undefined): Geometry {
    const flat = previous?.bbox ? this.bbox([next]) : null;
    const altitude = previous?.bbox?.length === 6 ? this.altitudeRange(next) : null;
    const bbox: BBox | null =
      flat && altitude ? [flat[0], flat[1], altitude[0], flat[2], flat[3], altitude[1]] : flat;

    if (bbox) return { ...next, bbox };
    if (!next.bbox) return next;
    // Edits that spread the old geometry still carry its bbox.

    const withoutBbox = { ...next };
    delete withoutBbox.bbox;

    return withoutBbox;
  }

  /**
   * A shape drawn on a map that repeats the world sideways can come back with longitudes past
   * ±180 (e.g. 217.59 for −142.41). This moves it back into range, and splits a line or polygon
   * that runs across 180° into parts that meet there (RFC 7946 §3.1.9), so a LineString may
   * come back a MultiLineString and a Polygon a MultiPolygon.
   */
  public static splitAtAntimeridian(geometry: Geometry): Geometry {
    switch (geometry.type) {
      case GeometryKind.POINT:
        return { ...geometry, coordinates: this.intoWorld(geometry.coordinates) };

      case GeometryKind.MULTI_POINT:
        return {
          ...geometry,
          coordinates: geometry.coordinates.map(position => this.intoWorld(position)),
        };

      case GeometryKind.LINE_STRING: {
        const parts = this.splitLine(geometry.coordinates);
        // A degenerate line has no parts left; it keeps its type and validation reports it.
        return parts.length > 1
          ? { type: "MultiLineString", coordinates: parts }
          : { ...geometry, coordinates: parts[0] ?? geometry.coordinates };
      }

      case GeometryKind.POLYGON: {
        const parts = this.splitPolygon(geometry.coordinates);
        return parts.length > 1
          ? { type: "MultiPolygon", coordinates: parts }
          : { ...geometry, coordinates: parts[0] ?? geometry.coordinates };
      }

      // Multi* and GeometryCollection can't be edited on the map, so they never arrive here.
      default:
        return geometry;
    }
  }

  /** Which copy of the world a longitude falls in: 0 for (−180, 180], 1 for (180, 540], … */
  private static worldOf(lng: number): number {
    return Math.ceil((lng - this.MAX_LONGITUDE) / this.WORLD_WIDTH);
  }

  /** Moves a position from world copy `world` back into range, 360° per copy; lat/alt are kept. */
  private static shiftWorld(position: Position, world: number): Position {
    return world === 0 ? position : [position[0] - this.WORLD_WIDTH * world, ...position.slice(1)];
  }

  /**
   * Moves a position from whichever world copy it's in back into range. ±180 are left as
   * entered: they're the same place, and `worldOf` alone would turn −180 into 180.
   */
  private static intoWorld(position: Position): Position {
    if (this.isLongitude(position[0])) return position;
    return this.shiftWorld(position, this.worldOf(position[0]));
  }

  /** The point on the edge a → b at longitude `lng`; latitude and altitude are interpolated. */
  private static atLongitude(a: Position, b: Position, lng: number): Position {
    const t = (lng - a[0]) / (b[0] - a[0]);
    return a.map((value, i) => (i === 0 ? lng : value + t * ((b[i] ?? value) - value)));
  }

  /** Drops each position equal to the one before it, e.g. a cut point landing on a vertex. */
  private static withoutRepeats(positions: readonly Position[]): Position[] {
    return positions.filter(
      (position, i) => i === 0 || position.some((value, j) => value !== positions[i - 1][j]),
    );
  }

  /** Cuts a line wherever it crosses a world's edge and moves each part into range. */
  private static splitLine(positions: readonly Position[]): Position[][] {
    const tagged = positions.flatMap((position, i): TaggedPosition[] => {
      const world = this.worldOf(position[0]);

      if (i === 0) return [{ position, world }];

      const previous = positions[i - 1];
      const from = this.worldOf(previous[0]);
      const step = Math.sign(world - from);
      // Each edge crossed ends one part and starts the next, at the same point.
      const crossings = Array.from<unknown, TaggedPosition[]>(
        { length: Math.abs(world - from) },
        (_, k) => {
          const left = from + k * step;
          const edge =
            (step > 0 ? this.MAX_LONGITUDE : this.MIN_LONGITUDE) + this.WORLD_WIDTH * left;
          const at = this.atLongitude(previous, position, edge);

          return [
            { position: at, world: left },
            { position: at, world: left + step },
          ];
        },
      ).flat();

      return [...crossings, { position, world }];
    });
    const parts = tagged.reduce<TaggedPosition[][]>((groups, item) => {
      const last = groups[groups.length - 1];

      return last && last[0].world === item.world
        ? [...groups.slice(0, -1), [...last, item]]
        : [...groups, [item]];
    }, []);

    return parts
      .map(part =>
        this.withoutRepeats(part.map(({ position, world }) => this.shiftWorld(position, world))),
      )
      .filter(part => part.length >= 2);
  }

  /** Clips a polygon to each world copy its outer ring touches and moves each part into range. */
  private static splitPolygon(rings: readonly Position[][]): Position[][][] {
    const worlds = (rings[0] ?? []).map(position => this.worldOf(position[0]));
    const first = Math.min(...worlds);
    const last = Math.max(...worlds);

    if (first === last) return [rings.map(ring => ring.map(p => this.shiftWorld(p, first)))];

    return Array.from({ length: last - first + 1 }, (_, k) => first + k).flatMap(world => {
      const [outer, ...holes] = rings.map(ring => this.clipRingToWorld(ring, world));
      // A part exists where the outer ring does; holes clipped away entirely are dropped.
      if (!outer) return [];

      return [[outer, ...holes.filter((hole): hole is Position[] => hole !== null)]];
    });
  }

  /**
   * Sutherland–Hodgman clip of one ring to the world copy `world`, moved into range and
   * closed again; null when nothing of it falls in that copy.
   */
  private static clipRingToWorld(ring: readonly Position[], world: number): Position[] | null {
    const offset = this.WORLD_WIDTH * world;
    const west = offset + this.MIN_LONGITUDE;
    const east = offset + this.MAX_LONGITUDE;
    const open = ring.slice(0, -1);
    const clipped = this.clipHalfPlane(
      this.clipHalfPlane(open, p => p[0] >= west, west),
      p => p[0] <= east,
      east,
    );
    const moved = this.withoutRepeats(clipped.map(p => this.shiftWorld(p, world)));

    return moved.length >= 3 ? [...moved, moved[0]] : null;
  }

  /**
   * One Sutherland–Hodgman pass: the part of an open ring on the `inside` side of the meridian
   * `edge`, with a point added wherever an edge crosses it.
   */
  private static clipHalfPlane(
    ring: readonly Position[],
    inside: (position: Position) => boolean,
    edge: number,
  ): Position[] {
    return ring.flatMap((current, i) => {
      const previous = ring[(i + ring.length - 1) % ring.length];
      if (inside(current)) {
        return inside(previous) ? [current] : [this.atLongitude(previous, current, edge), current];
      }

      return inside(previous) ? [this.atLongitude(previous, current, edge)] : [];
    });
  }

  /** [lowest, highest] altitude among positions that have one, or null when none do. */
  private static altitudeRange(geometry: Geometry): [number, number] | null {
    let low = Infinity;
    let high = -Infinity;

    const visit = (value: unknown) => {
      if (!Array.isArray(value)) return;
      if (typeof value[0] !== "number") {
        value.forEach(visit);
        return;
      }
      const altitude: unknown = value[2];
      if (typeof altitude !== "number") return;
      low = Math.min(low, altitude);
      high = Math.max(high, altitude);
    };

    const walk = (g: Geometry) => {
      if (g.type === GeometryKind.GEOMETRY_COLLECTION) g.geometries.forEach(walk);
      else visit(g.coordinates);
    };

    walk(geometry);

    return Number.isFinite(low) ? [low, high] : null;
  }

  /** The highest `n` among internal ids `s<n>` in the collection, or 0 when there are none. */
  private static highestIdSuffix(collection: FeatureCollection): number {
    return collection.features.reduce((highest, feature) => {
      const match = this.ID_PATTERN.exec(String(feature.id ?? ""));
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
  }

  /** `value` rounded to `COORDINATE_PRECISION` decimal places. */
  private static round(value: number): number {
    const factor = 10 ** this.COORDINATE_PRECISION;

    return Math.round(value * factor) / factor;
  }

  /** Rounds every number in a nested coordinate array; anything else is returned as is. */
  private static roundNested(value: unknown): unknown {
    if (typeof value === "number") return this.round(value);
    if (Array.isArray(value)) return value.map(entry => this.roundNested(entry));

    return value;
  }
}
