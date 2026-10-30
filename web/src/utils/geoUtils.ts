/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { HintIssue } from "@placemarkio/check-geojson";
import { check, getIssues } from "@placemarkio/check-geojson";
import type { Feature, FeatureCollection, GeoJSON, Geometry, Position } from "geojson";

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

  /** [west, south, east, north] in WGS84, or null for an empty geometry. */
  public static bbox(geometries: readonly Geometry[]): [number, number, number, number] | null {
    let west = Infinity;
    let south = Infinity;
    let east = -Infinity;
    let north = -Infinity;
    const visit = (value: unknown) => {
      if (!Array.isArray(value) || value.length === 0) return;
      if (typeof value[0] === "number") {
        const [lng, lat] = value as number[];
        west = Math.min(west, lng);
        east = Math.max(east, lng);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
        return;
      }
      value.forEach(visit);
    };
    const walk = (geometry: Geometry) => {
      if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) geometry.geometries.forEach(walk);
      else visit(geometry.coordinates);
    };
    geometries.forEach(walk);
    return Number.isFinite(west) ? [west, south, east, north] : null;
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
