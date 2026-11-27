import type { LineString, Point } from "geojson";
import { describe, expect, test } from "vitest";

import {
  collectionToText,
  parseText,
  readFieldValue,
  withStableIds,
  writeFieldValue,
} from "./fieldValue";
import type { StoredValue } from "./fieldValue";
import { createGeoStore } from "./geoStore";
import { EditOrigin } from "./types";

const POINT: Point = { type: "Point", coordinates: [139.767125, 35.681236] };
const LINE: LineString = {
  type: "LineString",
  coordinates: [
    [139.7, 35.6],
    [139.8, 35.7],
  ],
};

describe("readFieldValue / writeFieldValue", () => {
  test.each<StoredValue>([undefined, null, "", "  "])(
    "single: %j reads as an empty document",
    value => {
      const result = readFieldValue(value, false);
      expect(result.ok && result.collection.features).toEqual([]);
    },
  );

  test("single: round-trips a geometry and returns the stored object when unchanged", () => {
    const result = readFieldValue(LINE, false);
    if (!result.ok) throw new Error("expected ok");
    expect(result.collection.features).toHaveLength(1);
    expect(writeFieldValue(result.collection, false, result.originals)).toBe(LINE);
  });

  test("an untouched shape keeps its bbox exactly as stored", () => {
    const withBbox: LineString = { ...LINE, bbox: [0, 0, 1, 1] };
    const result = readFieldValue([POINT, withBbox], true);
    if (!result.ok) throw new Error("expected ok");
    const store = createGeoStore(result.collection);
    store.setGeometry("s1", { type: "Point", coordinates: [139.7, 35.6] }, EditOrigin.MAP);
    expect(writeFieldValue(store.getSnapshot().collection, true, result.originals)).toEqual([
      { type: "Point", coordinates: [139.7, 35.6] },
      withBbox,
    ]);
  });

  test("single: writes null when the document is empty", () => {
    expect(writeFieldValue({ type: "FeatureCollection", features: [] }, false)).toBeNull();
  });

  test("multiple: one feature per entry, order kept", () => {
    const result = readFieldValue([POINT, LINE], true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.collection.features.map(f => f.geometry?.type)).toEqual(["Point", "LineString"]);
    expect(writeFieldValue(result.collection, true, result.originals)).toEqual([POINT, LINE]);
  });

  test("multiple: an edited shape is written anew, untouched ones are not", () => {
    const result = readFieldValue([POINT, LINE], true);
    if (!result.ok) throw new Error("expected ok");
    const store = createGeoStore(result.collection);
    store.setGeometry("s1", { type: "Point", coordinates: [139.7, 35.6] }, EditOrigin.MAP);
    const written = writeFieldValue(store.getSnapshot().collection, true, result.originals);
    expect(written).toEqual([{ type: "Point", coordinates: [139.7, 35.6] }, LINE]);
    expect((written as unknown[])[1]).toBe(LINE);
  });

  test("an untouched shape keeps its precision even after the store rounds its coordinates", () => {
    const precise: Point = { type: "Point", coordinates: [139.76712512345, 35.68123612345] };
    const result = readFieldValue(precise, false);
    if (!result.ok) throw new Error("expected ok");
    const store = createGeoStore(result.collection);
    expect(store.getSnapshot().collection.features[0].geometry).toEqual({
      type: "Point",
      coordinates: [139.7671251, 35.6812361],
    });
    expect(writeFieldValue(store.getSnapshot().collection, false, result.originals)).toBe(precise);
  });

  test("multiple: a value that isn't a list reads as an empty document", () => {
    const result = readFieldValue(POINT, true);
    expect(result.ok && result.collection.features).toEqual([]);
  });

  test("invalid stored values are reported with the raw value kept", () => {
    const result = readFieldValue({ type: "Point", coordinates: [35.68, 139.76] }, false);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0].message).toBe("Coordinates must be [longitude, latitude]");
    expect(result.text).toContain("139.76");
  });

  test("text panel shows exactly the stored shape", () => {
    const result = readFieldValue([POINT], true);
    if (!result.ok) throw new Error("expected ok");
    expect(JSON.parse(collectionToText(result.collection, true))).toEqual([POINT]);
    expect(collectionToText({ type: "FeatureCollection", features: [] }, false)).toBe("");
  });

  test("parsed text keeps existing ids by position so selection survives", () => {
    const result = readFieldValue([POINT, LINE], true);
    if (!result.ok) throw new Error("expected ok");
    const parsed = parseText(collectionToText(result.collection, true), true);
    if (!parsed.ok) throw new Error("expected ok");
    const next = withStableIds([...parsed.geometries, parsed.geometries[0]], result.collection);
    expect(next.features.map(f => f.id)).toEqual(["s1", "s2", "s3"]);
  });
});

// Legacy Geometry Object/Editor values are GeoJSON strings; the mini map still reads them.
describe("readFieldValue with legacy string values", () => {
  test("multiple: parses each entry, skips blank ones and writes objects back", () => {
    const result = readFieldValue([JSON.stringify(POINT), "", JSON.stringify(LINE)], true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.collection.features.map(f => f.geometry?.type)).toEqual(["Point", "LineString"]);
    expect(writeFieldValue(result.collection, true, result.originals)).toEqual([POINT, LINE]);
  });

  test("single: a stored null reads as an empty document", () => {
    const result = readFieldValue("null", false);
    expect(result.ok && result.collection.features).toEqual([]);
  });

  test("broken JSON in one entry of a multiple value is pinned to that entry", () => {
    const result = readFieldValue([JSON.stringify(POINT), "{oops"], true);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0].path).toBe("[1]");
  });
});
