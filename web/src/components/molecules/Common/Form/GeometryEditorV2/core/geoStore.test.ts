import { afterEach, describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";

import { createGeoStore } from "./geoStore";
import type { GeoStore } from "./geoStore";
import { EditOrigin, FocusKind } from "./types";

describe("geoStore", () => {
  const empty = { type: "FeatureCollection" as const, features: [] };

  test("undo and redo restore document and selection", () => {
    const store = createGeoStore(empty);
    const id = store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    expect(store.getSnapshot().selectedId).toBe(id);
    store.removeFeature(id, EditOrigin.MAP);
    expect(store.getSnapshot().collection.features).toHaveLength(0);
    store.undo();
    expect(store.getSnapshot().collection.features).toHaveLength(1);
    store.undo();
    expect(store.getSnapshot().collection.features).toHaveLength(0);
    store.redo();
    // Redo brings back the shape together with the selection it had.
    expect(store.getSnapshot().selectedId).toBe(id);
    expect(store.getSnapshot().collection.features).toHaveLength(1);
  });

  test("replaceAll leaves exactly one shape", () => {
    const store = createGeoStore(empty);
    store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.replaceAll({ type: "Point", coordinates: [2, 2] }, EditOrigin.MAP);
    expect(store.getSnapshot().collection.features).toHaveLength(1);
  });

  test("no-op commits do not create history", () => {
    const store = createGeoStore(empty);
    const id = store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.setGeometry(id, { type: "Point", coordinates: [1, 1] }, EditOrigin.NUMERIC);
    expect(store.getSnapshot().undoDepth).toBe(1);
  });

  test("undo and redo cover editing a shape", () => {
    const store = createGeoStore(empty);
    const id = store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.setGeometry(id, { type: "Point", coordinates: [2, 2] }, EditOrigin.MAP);
    store.undo();
    expect(store.getSnapshot().collection.features[0].geometry).toEqual({
      type: "Point",
      coordinates: [1, 1],
    });
    store.redo();
    expect(store.getSnapshot().collection.features[0].geometry).toEqual({
      type: "Point",
      coordinates: [2, 2],
    });
  });

  test("single mode: undoing a replacement brings back the previous shape", () => {
    const store = createGeoStore(empty);
    const first = store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.replaceAll({ type: "Point", coordinates: [2, 2] }, EditOrigin.MAP);
    store.undo();
    const { collection, selectedId } = store.getSnapshot();
    expect(collection.features.map(f => f.geometry)).toEqual([
      { type: "Point", coordinates: [1, 1] },
    ]);
    expect(selectedId).toBe(first);
  });

  test("a new edit clears redo", () => {
    const store = createGeoStore(empty);
    store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.undo();
    store.addFeature({ type: "Point", coordinates: [2, 2] }, EditOrigin.MAP);
    expect(store.getSnapshot().redoDepth).toBe(0);
  });

  describe("coalescing", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const point = (x: number) => ({ type: "Point" as const, coordinates: [x, 0] });

    test("a burst of typing is one undo step", () => {
      vi.useFakeTimers();
      const store = createGeoStore(empty);
      const id = store.addFeature(point(0), EditOrigin.MAP);
      for (const x of [1, 2, 3]) {
        store.setGeometry(id, point(x), EditOrigin.NUMERIC);
        vi.advanceTimersByTime(100);
      }
      expect(store.getSnapshot().undoDepth).toBe(2);
      store.undo();
      expect(store.getSnapshot().collection.features[0].geometry).toEqual(point(0));
    });

    test("a pause starts a new undo step", () => {
      vi.useFakeTimers();
      const store = createGeoStore(empty);
      const id = store.addFeature(point(0), EditOrigin.MAP);
      store.setGeometry(id, point(1), EditOrigin.NUMERIC);
      vi.advanceTimersByTime(1000);
      store.setGeometry(id, point(2), EditOrigin.NUMERIC);
      expect(store.getSnapshot().undoDepth).toBe(3);
    });

    test("edits to different shapes and map gestures never merge", () => {
      vi.useFakeTimers();
      const store = createGeoStore(empty);
      const a = store.addFeature(point(0), EditOrigin.MAP);
      const b = store.addFeature(point(10), EditOrigin.MAP);
      store.setGeometry(a, point(1), EditOrigin.NUMERIC);
      store.setGeometry(b, point(11), EditOrigin.NUMERIC);
      store.setGeometry(b, point(12), EditOrigin.MAP);
      store.setGeometry(b, point(13), EditOrigin.MAP);
      expect(store.getSnapshot().undoDepth).toBe(6);
    });
  });

  test("repeated focus requests for the same shape are distinct", () => {
    const store = createGeoStore(empty);
    const geometry = { type: "Point" as const, coordinates: [1, 1] };
    store.focus({ kind: FocusKind.GEOMETRY, geometry });
    const first = store.getSnapshot().focus;
    store.focus({ kind: FocusKind.GEOMETRY, geometry });
    expect(store.getSnapshot().focus).not.toBe(first);
    expect(store.getSnapshot().focus?.nonce).toBe((first?.nonce ?? 0) + 1);
  });

  describe("vertex selection", () => {
    const line = (x: number) => ({
      type: "LineString" as const,
      coordinates: [
        [x, 0],
        [x + 1, 1],
        [x + 2, 2],
      ],
    });

    test("selecting another shape clears the vertex", () => {
      const store = createGeoStore(empty);
      const a = store.addFeature(line(0), EditOrigin.MAP);
      const b = store.addFeature(line(10), EditOrigin.MAP);
      store.select(a);
      store.selectVertex(2);
      store.select(b);
      expect(store.getSnapshot().selectedVertex).toBeNull();
    });

    test("moving a vertex keeps it selected", () => {
      const store = createGeoStore(empty);
      const id = store.addFeature(line(0), EditOrigin.MAP);
      store.selectVertex(1);
      store.setGeometry(id, line(5), EditOrigin.MAP);
      expect(store.getSnapshot().selectedVertex).toBe(1);
    });

    test("adding or removing a vertex clears it, since indices shift", () => {
      const store = createGeoStore(empty);
      const id = store.addFeature(line(0), EditOrigin.MAP);
      store.selectVertex(1);
      store.setGeometry(
        id,
        {
          type: "LineString",
          coordinates: [
            [0, 0],
            [2, 2],
          ],
        },
        EditOrigin.MAP,
      );
      expect(store.getSnapshot().selectedVertex).toBeNull();
    });
  });

  test("history is blocked mid-gesture", () => {
    const store = createGeoStore(empty);
    store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.beginGesture();
    store.undo();
    expect(store.getSnapshot().collection.features).toHaveLength(1);
    store.endGesture();
  });

  describe("bbox", () => {
    const line = Test.GEO_JSON_LINE_STRING_WITH_BBOX;
    const bboxOf = (store: GeoStore) => store.getSnapshot().collection.features[0].geometry?.bbox;

    test("a map edit recomputes the shape's bbox", () => {
      const store = createGeoStore(empty);
      const id = store.addFeature(line, EditOrigin.MAP);
      store.setGeometry(
        id,
        {
          type: "LineString",
          coordinates: [
            [139.6, 35.6],
            [139.7673, 35.6812],
          ],
        },
        EditOrigin.MAP,
      );
      expect(bboxOf(store)).toEqual([139.6, 35.6, 139.7673, 35.6812]);
    });

    test("a numeric edit recomputes the bbox it spread along", () => {
      const store = createGeoStore(empty);
      const id = store.addFeature(line, EditOrigin.MAP);
      store.setGeometry(id, GeoUtils.setVertex(line, 0, [139.8, 35.7]), EditOrigin.NUMERIC);
      expect(bboxOf(store)).toEqual([139.7673, 35.6812, 139.8, 35.7]);
    });

    test("a shape without a bbox stays without one", () => {
      const store = createGeoStore(empty);
      const id = store.addFeature(Test.GEO_JSON_LINE_STRING, EditOrigin.MAP);
      store.setGeometry(
        id,
        GeoUtils.setVertex(Test.GEO_JSON_LINE_STRING, 0, [139.8, 35.7]),
        EditOrigin.NUMERIC,
      );
      expect(bboxOf(store)).toBeUndefined();
    });

    test("text keeps a bbox exactly as written, stale or not", () => {
      const store = createGeoStore(empty);
      store.commit(GeoUtils.toCollection([{ ...line, bbox: [0, 0, 1, 1] }]), EditOrigin.TEXT);
      expect(bboxOf(store)).toEqual([0, 0, 1, 1]);
    });

    test("undo brings back the previous bbox", () => {
      const store = createGeoStore(empty);
      const id = store.addFeature(line, EditOrigin.MAP);
      store.setGeometry(id, GeoUtils.setVertex(line, 0, [139.8, 35.7]), EditOrigin.MAP);
      store.undo();
      expect(bboxOf(store)).toEqual(line.bbox);
    });
  });
});
