import type { FeatureCollection, Geometry, Position } from "geojson";

/** Which surface produced a commit; drives undo coalescing and echo suppression. */
export enum EditOrigin {
  INITIAL = "INITIAL",
  TEXT = "TEXT",
  MAP = "MAP",
  NUMERIC = "NUMERIC",
  LIST = "LIST",
  SEARCH = "SEARCH",
  /** A jump through the undo/redo stack rather than a fresh edit. */
  HISTORY = "HISTORY",
}

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

export const ALL_KINDS: readonly GeometryKind[] = Object.values(GeometryKind);

/** The map edits only what the map can draw (proposal §3.4). */
export const EDITABLE_KINDS: readonly GeometryKind[] = [
  GeometryKind.POINT,
  GeometryKind.LINE_STRING,
  GeometryKind.POLYGON,
];

/** Where the map should move. A geometry is fitted; a position is centred at `zoom`. */
export type FocusTarget =
  | { readonly kind: "geometry"; readonly geometry: Geometry }
  | { readonly kind: "extent"; readonly extent: readonly [number, number, number, number] }
  | { readonly kind: "position"; readonly position: Position; readonly zoom?: number };

export type FocusRequest = FocusTarget & {
  /** Makes repeated requests for the same target distinguishable. */
  readonly nonce: number;
  /** Skip the move when the target is already visible. */
  readonly onlyIfOffscreen?: boolean;
};

export type HistoryEntry = {
  readonly collection: FeatureCollection;
  readonly selectedId: string | null;
};

export type GeoSnapshot = {
  readonly collection: FeatureCollection;
  /** Bumped only when `collection` changes; selection changes do not bump it. */
  readonly revision: number;
  readonly origin: EditOrigin;
  readonly selectedId: string | null;
  readonly focus: FocusRequest | null;
  readonly undoDepth: number;
  readonly redoDepth: number;
};

/** One numerically editable position within a geometry, addressed by flat index. */
export type VertexRef = {
  readonly index: number;
  readonly position: Position;
  /** 1-based ring number for polygons with holes. */
  readonly ring?: number;
  /** 1-based vertex number within its ring/line. */
  readonly number: number;
};
