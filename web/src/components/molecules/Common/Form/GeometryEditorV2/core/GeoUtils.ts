/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";

import { GeometryKind, isEditableType } from "./types";
import type { VertexRef } from "./types";

/**
 * Everything entering the store goes through `normalize`, so comparisons can be
 * structural and cheap.
 */
export abstract class GeoUtils {
  /** ~1cm. Without a fixed precision the EPSG:3857 round-trip never settles. */
  public static readonly COORDINATE_PRECISION = 7;

  private static readonly ID_PATTERN = /^s(\d+)$/;

  public static round(value: number): number {
    const factor = 10 ** GeoUtils.COORDINATE_PRECISION;
    return Math.round(value * factor) / factor;
  }

  public static roundGeometry(geometry: Geometry): Geometry {
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
      return { ...geometry, geometries: geometry.geometries.map(g => GeoUtils.roundGeometry(g)) };
    }
    return { ...geometry, coordinates: GeoUtils.roundNested(geometry.coordinates) } as Geometry;
  }

  /** Every feature gets a stable internal id (the map diffs on it) and rounded coordinates. */
  public static normalize(collection: FeatureCollection): FeatureCollection {
    let counter = GeoUtils.highestIdSuffix(collection);
    const features: Feature[] = collection.features.map(feature => ({
      ...feature,
      id:
        typeof feature.id === "string" || typeof feature.id === "number"
          ? String(feature.id)
          : `s${++counter}`,
      geometry: feature.geometry ? GeoUtils.roundGeometry(feature.geometry) : feature.geometry,
      properties: feature.properties ?? {},
    }));
    return { type: "FeatureCollection", features };
  }

  public static isEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  public static findFeature(collection: FeatureCollection, id: string | null): Feature | null {
    if (id === null) return null;
    return collection.features.find(feature => String(feature.id) === id) ?? null;
  }

  public static nextFeatureId(collection: FeatureCollection): string {
    return `s${GeoUtils.highestIdSuffix(collection) + 1}`;
  }

  public static isEditableKind(geometry: Geometry | null | undefined): boolean {
    return !!geometry && isEditableType(geometry.type);
  }

  /** First coordinate of any geometry. */
  public static firstPosition(geometry: Geometry | null): Position | null {
    if (!geometry) return null;
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
      for (const entry of geometry.geometries) {
        const position = GeoUtils.firstPosition(entry);
        if (position) return position;
      }
      return null;
    }
    return GeoUtils.firstNested(geometry.coordinates);
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

  public static countPositions(geometry: Geometry): number {
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
      return geometry.geometries.reduce((total, g) => total + GeoUtils.countPositions(g), 0);
    }
    return GeoUtils.countNested(geometry.coordinates);
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
      const match = GeoUtils.ID_PATTERN.exec(String(feature.id ?? ""));
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
  }

  private static roundNested(value: unknown): unknown {
    if (typeof value === "number") return GeoUtils.round(value);
    if (Array.isArray(value)) return value.map(entry => GeoUtils.roundNested(entry));
    return value;
  }

  private static countNested(value: unknown): number {
    if (!Array.isArray(value) || value.length === 0) return 0;
    if (typeof value[0] === "number") return 1;
    return value.reduce<number>((total, entry) => total + GeoUtils.countNested(entry), 0);
  }

  private static firstNested(value: unknown): Position | null {
    if (!Array.isArray(value) || value.length === 0) return null;
    if (typeof value[0] === "number") return value;
    return GeoUtils.firstNested(value[0]);
  }
}
