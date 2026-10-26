import { describe, expect, test } from "vitest";

import {
  collectionToText,
  parseText,
  readFieldValue,
  withStableIds,
  writeFieldValue,
} from "./fieldValue";
import { createGeoStore } from "./geoStore";
import { GeoUtils } from "./GeoUtils";
import { EditOrigin, GeometryKind } from "./types";
import { GeometryLimits, validateValue } from "./validation";

const POINT = '{"type":"Point","coordinates":[139.767125,35.681236]}';
const LINE = '{ "type": "LineString", "coordinates": [[139.7, 35.6], [139.8, 35.7]] }';

describe("readFieldValue / writeFieldValue", () => {
  test("single: empty values read as an empty document", () => {
    for (const value of [undefined, null, "", "  "]) {
      const result = readFieldValue(value, false);
      expect(result.ok && result.collection.features).toEqual([]);
    }
  });

  test("single: round-trips a geometry and keeps the original text when unchanged", () => {
    const result = readFieldValue(LINE, false);
    if (!result.ok) throw new Error("expected ok");
    expect(result.collection.features).toHaveLength(1);
    expect(writeFieldValue(result.collection, false, result.originals)).toBe(LINE);
  });

  test("single: writes '' when the document is empty", () => {
    expect(writeFieldValue({ type: "FeatureCollection", features: [] }, false)).toBe("");
  });

  test("multiple: one feature per entry, empty entries skipped, order kept", () => {
    const result = readFieldValue([POINT, "", LINE], true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.collection.features.map(f => f.geometry?.type)).toEqual(["Point", "LineString"]);
    expect(writeFieldValue(result.collection, true, result.originals)).toEqual([POINT, LINE]);
  });

  test("multiple: an edited shape is re-serialized, untouched ones are not", () => {
    const result = readFieldValue([POINT, LINE], true);
    if (!result.ok) throw new Error("expected ok");
    const store = createGeoStore(result.collection);
    store.setGeometry("s1", { type: "Point", coordinates: [139.7, 35.6] }, EditOrigin.MAP);
    expect(writeFieldValue(store.getSnapshot().collection, true, result.originals)).toEqual([
      '{"type":"Point","coordinates":[139.7,35.6]}',
      LINE,
    ]);
  });

  test("invalid stored values are reported with the raw text kept", () => {
    const result = readFieldValue('{"type":"Point","coordinates":[35.68,139.76]}', false);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0].message).toBe("Coordinates must be [longitude, latitude]");
    expect(result.text).toContain("139.76");
  });

  test("broken JSON in one entry of a multiple value is pinned to that entry", () => {
    const result = readFieldValue([POINT, "{oops"], true);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0].path).toBe("[1]");
  });

  test("text panel shows exactly the stored shape", () => {
    const result = readFieldValue([POINT], true);
    if (!result.ok) throw new Error("expected ok");
    expect(JSON.parse(collectionToText(result.collection, true))).toEqual([JSON.parse(POINT)]);
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

describe("validateValue", () => {
  const messages = (value: unknown, multiple = false) =>
    validateValue(value, multiple).map(issue => issue.message);

  test("accepts all seven geometry types", () => {
    const ring = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ];
    const values = [
      { type: "Point", coordinates: [0, 0] },
      { type: "MultiPoint", coordinates: [[0, 0]] },
      {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      {
        type: "MultiLineString",
        coordinates: [
          [
            [0, 0],
            [1, 1],
          ],
        ],
      },
      { type: "Polygon", coordinates: [ring] },
      { type: "MultiPolygon", coordinates: [[ring]] },
      {
        type: "GeometryCollection",
        geometries: [
          { type: "Point", coordinates: [0, 0] },
          { type: "LineString", coordinates: ring.slice(0, 2) },
        ],
      },
    ];
    for (const value of values) expect(messages(value)).toEqual([]);
  });

  test("accepts an optional altitude and the range bounds", () => {
    expect(messages({ type: "Point", coordinates: [139.7, 35.6, 50] })).toEqual([]);
    expect(messages({ type: "Point", coordinates: [180, 90] })).toEqual([]);
    expect(messages({ type: "Point", coordinates: [-180, -90] })).toEqual([]);
  });

  test("rejects malformed positions", () => {
    const invalid = "A position is [longitude, latitude] with an optional altitude";
    for (const coordinates of [[0], [0, 0, 0, 0], [0, "1"], [0, Infinity], [NaN, 0]]) {
      expect(messages({ type: "Point", coordinates })).toEqual([invalid]);
    }
  });

  test("rejects out-of-range positions", () => {
    expect(messages({ type: "Point", coordinates: [180.1, 0] })).toEqual([
      "Longitude must be between -180 and 180",
    ]);
    // A longitude beyond ±90 rules out a swapped pair.
    expect(messages({ type: "Point", coordinates: [100, -90.1] })).toEqual([
      "Latitude must be between -90 and 90",
    ]);
  });

  test("names reversed coordinates", () => {
    expect(messages({ type: "Point", coordinates: [35.68, 139.76] })).toEqual([
      "Coordinates must be [longitude, latitude]",
    ]);
  });

  test("rejects unknown members", () => {
    expect(messages({ type: "Point", coordinates: [0, 0], hello: 1 })[0]).toBe(
      'Unknown property "hello" is not allowed in a geometry. Store extra information in a separate field.',
    );
  });

  test("rejects Feature wrappers, open rings and short lines", () => {
    expect(messages({ type: "Feature", geometry: null })[0]).toContain("not a Feature");
    expect(
      messages({
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        ],
      }),
    ).toContain("A polygon ring must end where it starts");
    expect(messages({ type: "LineString", coordinates: [[0, 0]] })).toContain(
      "A LineString needs at least 2 positions",
    );
  });

  test("rejects a GeometryCollection inside another", () => {
    const issues = validateValue(
      {
        type: "GeometryCollection",
        geometries: [
          { type: "Point", coordinates: [0, 0] },
          { type: "GeometryCollection", geometries: [{ type: "Point", coordinates: [0, 0] }] },
        ],
      },
      false,
    );
    expect(issues).toEqual([
      {
        path: "geometries[1]",
        message: "A GeometryCollection can't contain another GeometryCollection",
      },
    ]);
  });

  test("limits the size of each value, not of the whole field", () => {
    // Each position serializes to 25 bytes, so this passes the byte limit while staying
    // under the coordinate limit.
    const count = Math.ceil(GeometryLimits.VALUE_BYTES / 20);
    const big = {
      type: "MultiPoint",
      coordinates: Array.from({ length: count }, () => [139.7671251, 35.6812361]),
    };
    const issues = validateValue([{ type: "Point", coordinates: [0, 0] }, big], true);
    expect(issues.map(issue => issue.path)).toContain("[1]");
    expect(issues.some(issue => issue.message.startsWith("This geometry is too large"))).toBe(
      true,
    );
    expect(issues.some(issue => issue.path === "[0]")).toBe(false);
  });

  test("respects a legacy field's supported types", () => {
    const issues = validateValue(
      {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      false,
      {
        allowedKinds: [GeometryKind.POINT],
      },
    );
    expect(issues[0].message).toBe("This field accepts only: Point");
  });

  test("single vs multiple shape mismatch", () => {
    expect(messages([{ type: "Point", coordinates: [0, 0] }])[0]).toContain("one geometry");
    expect(messages({ type: "Point", coordinates: [0, 0] }, true)[0]).toContain("list");
  });
});

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

  test("history is blocked mid-gesture", () => {
    const store = createGeoStore(empty);
    store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
    store.beginGesture();
    store.undo();
    expect(store.getSnapshot().collection.features).toHaveLength(1);
    store.endGesture();
  });
});

describe("vertex editing", () => {
  const square = {
    type: "Polygon" as const,
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
  };

  test("inserting after a vertex adds the midpoint and keeps the ring closed", () => {
    const next = GeoUtils.insertVertex(square, 1);
    if (next.type !== "Polygon") throw new Error("expected Polygon");
    expect(next.coordinates[0]).toHaveLength(6);
    expect(next.coordinates[0][2]).toEqual([1, 0.5]);
    expect(next.coordinates[0][0]).toEqual(next.coordinates[0][5]);
  });
});
