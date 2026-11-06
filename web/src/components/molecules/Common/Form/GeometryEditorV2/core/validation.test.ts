import type { Geometry, GeometryCollection, LineString } from "geojson";
import { describe, expect, test } from "vitest";

import { Test } from "@reearth-cms/test/utils";
import { GeometryKind } from "@reearth-cms/utils/geoUtils";

import { findStaleBboxes, GeometryLimits, validateValue } from "./validation";

const messages = (value: unknown, multiple = false): string[] =>
  validateValue(value, multiple).map(issue => issue.message);

describe("validateValue", () => {
  test.each([
    ["Point", Test.GEO_JSON_POINT],
    ["MultiPoint", Test.GEO_JSON_MULTI_POINT],
    ["LineString", Test.GEO_JSON_LINE_STRING],
    ["MultiLineString", Test.GEO_JSON_MULTI_LINE_STRING],
    ["Polygon", Test.GEO_JSON_POLYGON],
    ["Polygon with a hole", Test.GEO_JSON_POLYGON_WITH_HOLE],
    ["MultiPolygon", Test.GEO_JSON_MULTI_POLYGON],
    ["GeometryCollection", Test.GEO_JSON_GEO_COLLECTION],
  ])("accepts a valid %s", (_, value) => {
    expect(messages(value)).toEqual([]);
  });

  test("accepts an optional altitude and the range bounds", () => {
    expect(messages(Test.GEO_JSON_POINT_WITH_ALTITUDE)).toEqual([]);
    expect(messages(Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE)).toEqual([]);
    expect(messages(Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE_AND_BBOX)).toEqual([]);
    expect(messages({ type: "Point", coordinates: [180, 90] })).toEqual([]);
    expect(messages({ type: "Point", coordinates: [-180, -90] })).toEqual([]);
  });

  // RFC 7946 §3.1.9: a shape crossing the antimeridian is cut into parts that meet at ±180.
  test("accepts a shape cut at the antimeridian", () => {
    expect(
      messages({
        type: "MultiLineString",
        coordinates: [
          [
            [170, 45],
            [180, 48],
          ],
          [
            [-180, 48],
            [-170, 50],
          ],
        ],
      }),
    ).toEqual([]);
  });

  test.each([
    ["too few numbers", [0]],
    ["too many numbers", [0, 0, 0, 0]],
    ["a string", [0, "1"]],
    ["Infinity", [0, Infinity]],
    ["NaN", [NaN, 0]],
  ])("rejects a position with %s", (_, coordinates) => {
    expect(messages({ type: "Point", coordinates })).toEqual([
      "A position is [longitude, latitude] with an optional altitude",
    ]);
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

  test("rejects Feature wrappers and short lines", () => {
    expect(messages({ type: "Feature", geometry: null })[0]).toContain("not a Feature");
    expect(messages({ type: "LineString", coordinates: [[0, 0]] })).toContain(
      "A LineString needs at least 2 positions",
    );
  });

  describe("polygon rings", () => {
    const [outer, hole] = Test.GEO_JSON_POLYGON_WITH_HOLE.coordinates;
    const withHole = (ring: number[][]) => ({ type: "Polygon", coordinates: [outer, ring] });

    test("an open hole is pinned to that ring", () => {
      expect(validateValue(withHole(hole.slice(0, -1)), false)).toEqual([
        { path: "coordinates[1]", message: "A polygon ring must end where it starts" },
      ]);
    });

    test("a ring needs at least 4 positions", () => {
      expect(validateValue(withHole([hole[0], hole[1], hole[0]]), false)).toEqual([
        { path: "coordinates[1]", message: "A polygon ring needs at least 4 positions" },
      ]);
    });
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
    // Each position serializes to 25 bytes, so VALUE_BYTES / 20 positions overshoot the byte
    // limit by a quarter while staying under the coordinate limit.
    const count = Math.ceil(GeometryLimits.VALUE_BYTES / 20);
    const big = {
      type: "MultiPoint",
      coordinates: Array.from({ length: count }, () => [139.7671251, 35.6812361]),
    };
    const issues = validateValue([{ type: "Point", coordinates: [0, 0] }, big], true);
    expect(issues.map(issue => issue.path)).toContain("[1]");
    expect(issues.some(issue => issue.message.startsWith("This geometry is too large"))).toBe(true);
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

describe("findStaleBboxes", () => {
  const STALE = "The bbox doesn't contain this geometry. It will be saved as is.";
  const line = Test.GEO_JSON_LINE_STRING_WITH_BBOX;
  const stale: LineString = { ...line, bbox: [0, 0, 1, 1] };

  test.each<[string, Geometry]>([
    ["a fresh bbox", line],
    ["a padded bbox", { ...line, bbox: [139, 35, 140, 36] }],
    ["a fresh bbox with altitude", Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE_AND_BBOX],
    ["no bbox", Test.GEO_JSON_LINE_STRING],
    [
      "a bbox across the antimeridian",
      {
        type: "MultiLineString",
        coordinates: [
          [
            [170, 45],
            [180, 48],
          ],
          [
            [-180, 48],
            [-170, 50],
          ],
        ],
        bbox: [170, 45, -170, 50],
      },
    ],
  ])("accepts %s", (_, geometry) => {
    expect(findStaleBboxes([geometry], false)).toEqual([]);
  });

  test("flags a bbox that leaves part of the geometry out", () => {
    expect(findStaleBboxes([stale], false)).toEqual([{ path: "bbox", message: STALE }]);
  });

  test("tolerates the rounding of positions", () => {
    expect(
      findStaleBboxes([{ ...line, bbox: [139.69170001, 35.6812, 139.7673, 35.6895] }], false),
    ).toEqual([]);
  });

  test("reads only longitude and latitude from a bbox with altitude", () => {
    const geometry: LineString = {
      ...Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE,
      bbox: [0, 0, 10, 1, 1, 40],
    };
    expect(findStaleBboxes([geometry], false)).toEqual([{ path: "bbox", message: STALE }]);
  });

  test("pins each stale bbox to its geometry in a multiple value", () => {
    expect(findStaleBboxes([line, stale], true)).toEqual([{ path: "[1].bbox", message: STALE }]);
  });

  test("checks the members of a GeometryCollection", () => {
    const collection: GeometryCollection = {
      type: "GeometryCollection",
      geometries: [Test.GEO_JSON_POINT, stale],
    };
    expect(findStaleBboxes([collection], false)).toEqual([
      { path: "geometries[1].bbox", message: STALE },
    ]);
  });
});
