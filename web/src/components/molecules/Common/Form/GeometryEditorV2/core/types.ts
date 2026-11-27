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

/** What a focus request moves the map to. */
export enum FocusKind {
  GEOMETRY = "geometry",
  EXTENT = "extent",
  POSITION = "position",
}

/** Where the map should move. A geometry is fitted; a position is centred at `zoom`. */
export type FocusTarget =
  | { readonly kind: FocusKind.GEOMETRY; readonly geometry: Geometry }
  | { readonly kind: FocusKind.EXTENT; readonly extent: readonly [number, number, number, number] }
  | {
      readonly kind: FocusKind.POSITION;
      readonly position: Position;
      readonly zoom?: number;
    };

export type FocusRequest = FocusTarget & {
  /** Makes repeated requests for the same target distinguishable. */
  readonly nonce: number;
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
  /** Index into `GeoUtils.listVertices` of the selected shape, for a line or polygon. */
  readonly selectedVertex: number | null;
  readonly focus: FocusRequest | null;
  readonly undoDepth: number;
  readonly redoDepth: number;
};
