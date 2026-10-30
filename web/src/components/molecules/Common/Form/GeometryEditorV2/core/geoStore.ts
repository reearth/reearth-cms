import type { Feature, FeatureCollection, Geometry } from "geojson";

import { GeoUtils } from "@reearth-cms/utils/geoUtils";
import { ObjectUtils } from "@reearth-cms/utils/object";

import { EditOrigin } from "./types";
import type { FocusTarget, GeoSnapshot, HistoryEntry } from "./types";

const HISTORY_LIMIT = 100;

/** Bursts of typing or nudging one number fold into a single undo step. */
const COALESCE_WINDOW_MS = 600;
const COALESCING_ORIGINS: ReadonlySet<EditOrigin> = new Set([EditOrigin.TEXT, EditOrigin.NUMERIC]);

export type GeometryUpdate = {
  readonly featureId: string;
  readonly geometry: Geometry;
};

export type GeoStore = {
  getSnapshot(): GeoSnapshot;
  subscribe(listener: () => void): () => void;
  /** Replaces the document and clears history — used when the editor opens. */
  reset(collection: FeatureCollection): void;
  commit(collection: FeatureCollection, origin: EditOrigin, coalesceKey?: string): void;
  setGeometry(featureId: string, geometry: Geometry, origin: EditOrigin): void;
  /** Batched so one map gesture produces exactly one revision. */
  setGeometries(updates: readonly GeometryUpdate[], origin: EditOrigin): void;
  addFeature(geometry: Geometry, origin: EditOrigin): string;
  /** Single-value fields: the new geometry replaces whatever was there. */
  replaceAll(geometry: Geometry, origin: EditOrigin): string;
  removeFeature(featureId: string, origin: EditOrigin): void;
  /** Selecting a shape clears the selected vertex. */
  select(featureId: string | null): void;
  /** A vertex of the selected line or polygon, by `GeoUtils.listVertices` index. */
  selectVertex(index: number | null): void;
  focus(target: FocusTarget): void;
  undo(): void;
  redo(): void;
  /** Map gestures commit on their end event, so history must not move mid-drag. */
  beginGesture(): void;
  endGesture(): void;
};

export function createGeoStore(initial: FeatureCollection): GeoStore {
  const listeners = new Set<() => void>();

  let snapshot: GeoSnapshot = {
    collection: GeoUtils.normalize(initial),
    revision: 1,
    origin: EditOrigin.INITIAL,
    selectedId: null,
    selectedVertex: null,
    focus: null,
    undoDepth: 0,
    redoDepth: 0,
  };

  let past: HistoryEntry[] = [];
  let future: HistoryEntry[] = [];
  let lastKey: string | null = null;
  let lastAt = 0;
  let gesturing = false;

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const currentEntry = (): HistoryEntry => ({
    collection: snapshot.collection,
    selectedId: snapshot.selectedId,
  });

  const pushHistory = (origin: EditOrigin, coalesceKey?: string) => {
    const now = Date.now();
    const key = `${origin}:${coalesceKey ?? ""}`;
    const coalesces =
      past.length > 0 &&
      key === lastKey &&
      COALESCING_ORIGINS.has(origin) &&
      now - lastAt < COALESCE_WINDOW_MS;
    if (!coalesces) {
      past.push(currentEntry());
      if (past.length > HISTORY_LIMIT) past.shift();
    }
    lastKey = key;
    lastAt = now;
    future = [];
  };

  const commitState = (
    normalized: FeatureCollection,
    origin: EditOrigin,
    selectedId: string | null,
  ) => {
    const nextSelectedId = GeoUtils.findFeature(normalized, selectedId) ? selectedId : null;
    snapshot = {
      ...snapshot,
      collection: normalized,
      revision: snapshot.revision + 1,
      origin,
      selectedId: nextSelectedId,
      selectedVertex: keptVertex(normalized, nextSelectedId),
      undoDepth: past.length,
      redoDepth: future.length,
    };
    emit();
  };

  /**
   * The selected vertex survives an edit only when it still means the same vertex: same
   * shape, same vertex count. Adding or removing a vertex shifts the indices after it.
   */
  const keptVertex = (next: FeatureCollection, nextSelectedId: string | null): number | null => {
    const index = snapshot.selectedVertex;
    if (index === null || nextSelectedId !== snapshot.selectedId) return null;
    const before = GeoUtils.findFeature(snapshot.collection, nextSelectedId)?.geometry;
    const after = GeoUtils.findFeature(next, nextSelectedId)?.geometry;
    if (!before || !after) return null;
    const count = GeoUtils.listVertices(after).length;
    return count === GeoUtils.listVertices(before).length && index < count ? index : null;
  };

  const publish = (
    collection: FeatureCollection,
    origin: EditOrigin,
    selectedId: string | null = snapshot.selectedId,
    coalesceKey?: string,
  ): boolean => {
    const normalized = GeoUtils.normalize(collection);
    // Drop no-op commits so an edit that round-trips to identical data dies here.
    if (ObjectUtils.isDeepEqual(normalized, snapshot.collection)) return false;
    pushHistory(origin, coalesceKey);
    commitState(normalized, origin, selectedId);
    return true;
  };

  const setGeometries = (updates: readonly GeometryUpdate[], origin: EditOrigin) => {
    if (updates.length === 0) return;
    const byId = new Map(updates.map(update => [update.featureId, update.geometry]));
    const features: Feature[] = snapshot.collection.features.map(feature => {
      const geometry = byId.get(String(feature.id));
      return geometry ? { ...feature, geometry } : feature;
    });
    publish(
      { type: "FeatureCollection", features },
      origin,
      snapshot.selectedId,
      updates.length === 1 ? updates[0].featureId : undefined,
    );
  };

  const travel = (from: HistoryEntry[], to: HistoryEntry[]) => {
    if (gesturing) return;
    const entry = from.pop();
    if (!entry) return;
    to.push(currentEntry());
    lastKey = null;
    commitState(entry.collection, EditOrigin.HISTORY, entry.selectedId);
  };

  const newFeature = (geometry: Geometry): Feature => ({
    type: "Feature",
    id: GeoUtils.nextFeatureId(snapshot.collection),
    geometry,
    properties: {},
  });

  return {
    getSnapshot: () => snapshot,

    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    reset: collection => {
      past = [];
      future = [];
      lastKey = null;
      snapshot = {
        collection: GeoUtils.normalize(collection),
        revision: snapshot.revision + 1,
        origin: EditOrigin.INITIAL,
        selectedId: null,
        selectedVertex: null,
        focus: null,
        undoDepth: 0,
        redoDepth: 0,
      };
      emit();
    },

    commit: (collection, origin, coalesceKey) => {
      publish(collection, origin, snapshot.selectedId, coalesceKey);
    },

    setGeometry: (featureId, geometry, origin) => setGeometries([{ featureId, geometry }], origin),

    setGeometries,

    addFeature: (geometry, origin) => {
      const feature = newFeature(geometry);
      publish(
        { type: "FeatureCollection", features: [...snapshot.collection.features, feature] },
        origin,
        String(feature.id),
      );
      return String(feature.id);
    },

    replaceAll: (geometry, origin) => {
      const feature = newFeature(geometry);
      publish({ type: "FeatureCollection", features: [feature] }, origin, String(feature.id));
      return String(feature.id);
    },

    removeFeature: (featureId, origin) => {
      const features = snapshot.collection.features.filter(f => String(f.id) !== featureId);
      publish({ type: "FeatureCollection", features }, origin);
    },

    // Selection is view state, so it does not bump `revision`.
    select: featureId => {
      if (snapshot.selectedId === featureId) return;
      snapshot = { ...snapshot, selectedId: featureId, selectedVertex: null };
      emit();
    },

    selectVertex: index => {
      if (snapshot.selectedVertex === index) return;
      snapshot = { ...snapshot, selectedVertex: index };
      emit();
    },

    focus: target => {
      const nonce = (snapshot.focus?.nonce ?? 0) + 1;
      snapshot = { ...snapshot, focus: { ...target, nonce } };
      emit();
    },

    undo: () => travel(past, future),
    redo: () => travel(future, past),

    beginGesture: () => {
      gesturing = true;
    },
    endGesture: () => {
      gesturing = false;
    },
  };
}
