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

/**
 * Everything entering the geometry editor's store goes through `normalize`, so comparisons
 * can be structural and cheap.
 */
export abstract class GeoUtils {
  public static readonly ALL_KINDS: readonly GeometryKind[] = Object.values(GeometryKind);

  /** ~1cm. Without a fixed precision the EPSG:3857 round-trip never settles. */
  private static readonly COORDINATE_PRECISION = 7;

  /** The map edits only what the map can draw. */
  private static readonly EDITABLE_KINDS: readonly GeometryKind[] = [
    GeometryKind.POINT,
    GeometryKind.LINE_STRING,
    GeometryKind.POLYGON,
  ];

  private static readonly ID_PATTERN = /^s(\d+)$/;

  public static isGeometryKind(value: unknown): value is GeometryKind {
    return this.ALL_KINDS.some(kind => kind === value);
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

  public static findFeature(collection: FeatureCollection, id: string | null): Feature | null {
    if (id === null) return null;
    return collection.features.find(feature => String(feature.id) === id) ?? null;
  }

  public static nextFeatureId(collection: FeatureCollection): string {
    return `s${this.highestIdSuffix(collection) + 1}`;
  }

  public static isEditableKind(geometry: Geometry | null | undefined): boolean {
    return !!geometry && this.isEditableType(geometry.type);
  }

  /** How many parts a Multi* or GeometryCollection holds. */
  public static partCount(geometry: Geometry): number {
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) return geometry.geometries.length;
    if (
      geometry.type === GeometryKind.MULTI_POINT ||
      geometry.type === GeometryKind.MULTI_LINE_STRING ||
      geometry.type === GeometryKind.MULTI_POLYGON
    ) {
      return geometry.coordinates.length;
    }
    return 1;
  }

  /** Vertices a user may edit; a ring's closing position is omitted because it repeats the first. */
  public static listVertices(geometry: Geometry): VertexRef[] {
    if (geometry.type === GeometryKind.POINT) {
      return [{ index: 0, position: geometry.coordinates, number: 1 }];
    }
    if (geometry.type === GeometryKind.LINE_STRING) {
      return geometry.coordinates.map((position, index) => ({
        index,
        position,
        number: index + 1,
      }));
    }
    if (geometry.type === GeometryKind.POLYGON) {
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
    return [];
  }

  public static countVertices(geometry: Geometry): number {
    if (geometry.type === GeometryKind.POINT) return 1;
    if (geometry.type === GeometryKind.LINE_STRING) return geometry.coordinates.length;
    if (geometry.type === GeometryKind.POLYGON) {
      return geometry.coordinates.reduce((total, ring) => total + ring.length - 1, 0);
    }
    return 0;
  }

  public static setVertex(geometry: Geometry, index: number, position: Position): Geometry {
    if (geometry.type === GeometryKind.POINT) {
      return index === 0 ? { ...geometry, coordinates: position } : geometry;
    }
    if (geometry.type === GeometryKind.LINE_STRING) {
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((p, i) => (i === index ? position : p)),
      };
    }
    if (geometry.type === GeometryKind.POLYGON) {
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
    return geometry;
  }

  /**
   * The geometry without one vertex, or null when that would leave a line under 2 vertices
   * or a ring under 3.
   */
  public static removeVertex(geometry: Geometry, index: number): Geometry | null {
    // condition 2: LineString
    if (geometry.type === GeometryKind.LINE_STRING) {
      if (geometry.coordinates.length <= 2) return null;
      return { ...geometry, coordinates: geometry.coordinates.filter((_, i) => i !== index) };
    }

    // condition 2: Polygon
    if (geometry.type === GeometryKind.POLYGON) {
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

    // other conditions
    return null;
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
    let widest = merged[0][0] + 360 - merged[gapAfter][1];
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

  private static highestIdSuffix(collection: FeatureCollection): number {
    return collection.features.reduce((highest, feature) => {
      const match = this.ID_PATTERN.exec(String(feature.id ?? ""));
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
  }

  private static round(value: number): number {
    const factor = 10 ** this.COORDINATE_PRECISION;
    return Math.round(value * factor) / factor;
  }

  private static roundNested(value: unknown): unknown {
    if (typeof value === "number") return this.round(value);
    if (Array.isArray(value)) return value.map(entry => this.roundNested(entry));
    return value;
  }
}
