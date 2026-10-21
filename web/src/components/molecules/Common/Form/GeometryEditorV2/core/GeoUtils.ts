/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";

import { EDITABLE_KINDS, GeometryKind } from "./types";
import type { VertexRef } from "./types";

/**
 * Geometry helpers ported from the geo-editor PoC. Everything entering the store goes
 * through `normalize`, so comparisons can be structural and cheap.
 */
export abstract class GeoUtils {
  /** ~1cm. Without a fixed precision the EPSG:3857 round-trip never settles. */
  public static readonly COORDINATE_PRECISION = 7;

  /** Tokyo Station. */
  public static readonly DEFAULT_CENTER: Position = [139.767125, 35.681236];

  /** Degrees moved when an insert or conversion needs a position it cannot derive. */
  public static readonly VERTEX_STEP = 0.002;

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
    return !!geometry && EDITABLE_KINDS.includes(geometry.type as GeometryKind);
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

  public static removeVertex(geometry: Geometry, index: number): Geometry {
    if (!GeoUtils.canRemoveVertex(geometry, index)) return geometry;
    if (geometry.type === GeometryKind.LINE_STRING) {
      return { ...geometry, coordinates: geometry.coordinates.filter((_, i) => i !== index) };
    }
    if (geometry.type === GeometryKind.POLYGON) {
      let cursor = 0;
      const coordinates = geometry.coordinates.map(ring => {
        const editable = ring.length - 1;
        const local = index - cursor;
        cursor += editable;
        if (local < 0 || local >= editable) return ring;
        const next = ring.filter((_, i) => i !== local);
        if (local === 0) next[next.length - 1] = next[0];
        return next;
      });
      return { ...geometry, coordinates };
    }
    return geometry;
  }

  /** A LineString needs two positions and a ring three distinct ones. */
  public static canRemoveVertex(geometry: Geometry, index: number): boolean {
    if (geometry.type === GeometryKind.LINE_STRING) return geometry.coordinates.length > 2;
    if (geometry.type === GeometryKind.POLYGON) {
      let cursor = 0;
      for (const ring of geometry.coordinates) {
        const editable = ring.length - 1;
        if (index < cursor + editable) return editable > 3;
        cursor += editable;
      }
    }
    return false;
  }

  /**
   * Inserts a position after `index`, midway to its successor (PoC behaviour). A polygon
   * vertex always has a successor because the closing position repeats the first.
   */
  public static insertVertex(geometry: Geometry, index: number): Geometry {
    if (geometry.type === GeometryKind.LINE_STRING) {
      const coordinates = [...geometry.coordinates];
      coordinates.splice(
        index + 1,
        0,
        GeoUtils.between(coordinates[index], coordinates[index + 1]),
      );
      return { ...geometry, coordinates };
    }
    if (geometry.type === GeometryKind.POLYGON) {
      let cursor = 0;
      const coordinates = geometry.coordinates.map(ring => {
        const editable = ring.length - 1;
        const local = index - cursor;
        cursor += editable;
        if (local < 0 || local >= editable) return ring;
        const next = [...ring];
        next.splice(local + 1, 0, GeoUtils.between(ring[local], ring[local + 1]));
        return next;
      });
      return { ...geometry, coordinates };
    }
    return geometry;
  }

  /** Every addressable position in document order; ring closing positions dropped. */
  public static flattenPositions(geometry: Geometry): Position[] {
    if (geometry.type === GeometryKind.GEOMETRY_COLLECTION) {
      return geometry.geometries.flatMap(g => GeoUtils.flattenPositions(g));
    }
    if (geometry.type === GeometryKind.POINT) return [geometry.coordinates];
    if (geometry.type === GeometryKind.POLYGON) {
      return geometry.coordinates.flatMap(ring => ring.slice(0, -1));
    }
    if (geometry.type === GeometryKind.MULTI_POLYGON) {
      return geometry.coordinates.flatMap(polygon => polygon.flatMap(ring => ring.slice(0, -1)));
    }
    if (geometry.type === GeometryKind.MULTI_LINE_STRING) return geometry.coordinates.flat();
    return [...geometry.coordinates];
  }

  /** Rebuilds `geometry` as `kind` from its positions in order (PoC behaviour). */
  public static convertGeometry(geometry: Geometry, kind: GeometryKind): Geometry {
    if (!EDITABLE_KINDS.includes(kind) || geometry.type === kind) return geometry;
    return GeoUtils.buildGeometry(kind, GeoUtils.flattenPositions(geometry));
  }

  /** How many of `source`'s positions `converted` no longer carries. */
  public static droppedPositions(source: Geometry, converted: Geometry): number {
    const before = GeoUtils.flattenPositions(source);
    const after = GeoUtils.flattenPositions(converted);
    const kept = new Set(after.map(position => String(position)));
    const missing = before.filter(position => !kept.has(String(position))).length;
    return Math.max(missing, before.length - after.length);
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

  private static buildGeometry(kind: GeometryKind, positions: readonly Position[]): Geometry {
    const anchor = positions[0] ?? GeoUtils.DEFAULT_CENTER;
    if (kind === GeometryKind.LINE_STRING) {
      const coordinates =
        positions.length >= 2 ? [...positions] : [anchor, GeoUtils.between(anchor, undefined)];
      return { type: GeometryKind.LINE_STRING, coordinates };
    }
    if (kind === GeometryKind.POLYGON) {
      if (positions.length === 2) {
        // Derive a third corner along the axis the segment varies less, so the ring has area.
        const [a, b] = positions;
        const apex: Position =
          Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])
            ? [b[0], GeoUtils.step(b[1], 90)]
            : [GeoUtils.step(b[0], 180), b[1]];
        return { type: GeometryKind.POLYGON, coordinates: [[a, b, apex, a]] };
      }
      const ring = positions.length >= 3 ? [...positions] : GeoUtils.square(anchor);
      return { type: GeometryKind.POLYGON, coordinates: [[...ring, ring[0]]] };
    }
    return { type: GeometryKind.POINT, coordinates: anchor };
  }

  private static between(a: Position, b: Position | undefined): Position {
    if (!b) return [GeoUtils.step(a[0], 180), a[1]];
    const midpoint: Position = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (a.length > 2 && b.length > 2) midpoint.push((a[2] + b[2]) / 2);
    return midpoint;
  }

  private static square(anchor: Position): Position[] {
    const east = GeoUtils.step(anchor[0], 180);
    const north = GeoUtils.step(anchor[1], 90);
    return [anchor, [east, anchor[1]], [east, north], [anchor[0], north]];
  }

  /** One step along an axis, turning back rather than crossing the axis limit. */
  private static step(value: number, limit: number): number {
    const next = value + GeoUtils.VERTEX_STEP;
    return next <= limit ? next : value - GeoUtils.VERTEX_STEP;
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
    return (value as unknown[]).reduce<number>(
      (total, entry) => total + GeoUtils.countNested(entry),
      0,
    );
  }

  private static firstNested(value: unknown): Position | null {
    if (!Array.isArray(value) || value.length === 0) return null;
    if (typeof value[0] === "number") return value as Position;
    return GeoUtils.firstNested(value[0]);
  }
}
