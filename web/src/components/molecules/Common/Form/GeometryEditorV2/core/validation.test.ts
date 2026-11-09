import type { Geometry, LineString } from "geojson";
import { describe, expect, test } from "vitest";

import { Test } from "@reearth-cms/test/utils";
import { GeometryKind } from "@reearth-cms/utils/geoUtils";

import type { GeometryIssue } from "./validation";
import { findStaleBboxes, formatIssue, GeometryLimits, validateValue } from "./validation";

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

  test.each<[string, unknown]>([
    ["a Point with altitude", Test.GEO_JSON_POINT_WITH_ALTITUDE],
    ["a LineString with altitude", Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE],
    ["a LineString with altitude and a bbox", Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE_AND_BBOX],
    ["the upper range bounds", { type: "Point", coordinates: [180, 90] }],
    ["the lower range bounds", { type: "Point", coordinates: [-180, -90] }],
    // RFC 7946 §3.1.9: a shape crossing the antimeridian is cut into parts that meet at ±180.
    [
      "a shape cut at the antimeridian",
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
      },
    ],
  ])("accepts %s", (_, value) => {
    expect(messages(value)).toEqual([]);
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

  test.each([
    ["a longitude beyond 180", [180.1, 0], "Longitude must be between -180 and 180"],
    // A longitude beyond ±90 rules out a swapped pair.
    ["a latitude beyond 90", [100, -90.1], "Latitude must be between -90 and 90"],
    ["swapped coordinates", [35.68, 139.76], "Coordinates must be [longitude, latitude]"],
  ])("names %s", (_, coordinates, message) => {
    expect(messages({ type: "Point", coordinates })).toEqual([message]);
  });

  test.each<[string, unknown, string]>([
    [
      "an unknown member",
      { ...Test.GEO_JSON_POINT, hello: 1 },
      'Unknown property "hello" is not allowed in a geometry. Store extra information in a separate field.',
    ],
    ["a Feature wrapper", { type: "Feature", geometry: null }, "not a Feature"],
    [
      "a LineString with one position",
      { type: "LineString", coordinates: [[0, 0]] },
      "A LineString needs at least 2 positions",
    ],
  ])("rejects %s", (_, value, fragment) => {
    expect(messages(value)[0]).toContain(fragment);
  });

  describe("bbox", () => {
    const withBbox = (bbox: unknown) => ({ ...Test.GEO_JSON_LINE_STRING, bbox });
    const SHAPE = "A bbox is [west, south, east, north], with an optional altitude range";

    test.each<[string, unknown]>([
      ["a flat bbox", [139, 35, 140, 36]],
      ["a bbox with altitude", [139, 35, 0, 140, 36, 100]],
      // RFC 7946 §5.2: west > east is a box across the antimeridian.
      ["a bbox across the antimeridian", [170, 45, -170, 50]],
    ])("accepts %s", (_, bbox) => {
      expect(validateValue(withBbox(bbox), false)).toEqual([]);
    });

    test.each<[string, unknown, string]>([
      ["isn't a list", "oops", SHAPE],
      ["has 5 numbers", [0, 0, 0, 1, 1], SHAPE],
      ["holds something other than a number", [0, 0, "1", 1], SHAPE],
      ["holds Infinity", [0, 0, Infinity, 1], SHAPE],
      [
        "goes beyond the globe",
        [0, 0, 200, 1],
        "A bbox must stay within longitude ±180 and latitude ±90",
      ],
      [
        "has south above north",
        [0, 10, 1, 5],
        "A bbox's south edge can't be north of its north edge",
      ],
      [
        "has its altitudes upside down",
        [0, 0, 40, 1, 1, 10],
        "A bbox's lowest altitude can't be above its highest",
      ],
    ])("rejects a bbox that %s", (_, bbox, message) => {
      expect(validateValue(withBbox(bbox), false)).toEqual([{ path: "bbox", message }]);
    });

    test("checks the bbox of each GeometryCollection member", () => {
      expect(
        validateValue(
          { type: "GeometryCollection", geometries: [Test.GEO_JSON_POINT, withBbox("oops")] },
          false,
        ),
      ).toEqual([{ path: "geometries[1].bbox", message: SHAPE }]);
    });
  });

  describe("polygon rings", () => {
    const [outer, hole] = Test.GEO_JSON_POLYGON_WITH_HOLE.coordinates;

    test.each([
      ["an open hole", hole.slice(0, -1), "A polygon ring must end where it starts"],
      [
        "a ring of 3 positions",
        [hole[0], hole[1], hole[0]],
        "A polygon ring needs at least 4 positions",
      ],
    ])("pins %s to that ring", (_, ring, message) => {
      expect(validateValue({ type: "Polygon", coordinates: [outer, ring] }, false)).toEqual([
        { path: "coordinates[1]", message },
      ]);
    });
  });

  test("rejects a GeometryCollection inside another", () => {
    const issues = validateValue(
      {
        type: "GeometryCollection",
        geometries: [Test.GEO_JSON_POINT, Test.GEO_JSON_GEO_COLLECTION],
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
    const issues = validateValue([Test.GEO_JSON_POINT, big], true);
    expect(issues.map(issue => issue.path)).toContain("[1]");
    expect(issues.some(issue => issue.message.startsWith("This geometry is too large"))).toBe(true);
    expect(issues.some(issue => issue.path === "[0]")).toBe(false);
  });

  describe("size limit at the boundary", () => {
    const bytesOf = (value: unknown): number =>
      new TextEncoder().encode(JSON.stringify(value)).length;
    const multiPoint = (count: number) => ({
      type: "MultiPoint",
      coordinates: Array.from({ length: count }, () => [0, 0]),
    });
    // n points serialize to base + 5n + (n - 1) bytes: the empty MultiPoint, 5 per [0,0], and a
    // comma between points. Solving base + 6n - 1 <= VALUE_BYTES gives the most points that fit.
    const fits = Math.floor((GeometryLimits.VALUE_BYTES - bytesOf(multiPoint(0)) + 1) / 6);

    test("matches the backend's 10 KiB", () => {
      expect(GeometryLimits.VALUE_BYTES).toBe(10 * 1024);
    });

    test("accepts a geometry right at the limit", () => {
      expect(bytesOf(multiPoint(fits))).toBeLessThanOrEqual(GeometryLimits.VALUE_BYTES);
      expect(messages(multiPoint(fits))).toEqual([]);
    });

    test("rejects a geometry just over it", () => {
      expect(bytesOf(multiPoint(fits + 1))).toBeGreaterThan(GeometryLimits.VALUE_BYTES);
      expect(messages(multiPoint(fits + 1))).toEqual([
        expect.stringMatching(/^This geometry is too large: \d+ KB \(limit 10 KB\)$/),
      ]);
    });
  });

  test("respects a legacy field's supported types", () => {
    const issues = validateValue(Test.GEO_JSON_LINE_STRING, false, {
      allowedKinds: [GeometryKind.POINT],
    });
    expect(issues[0].message).toBe("This field accepts only: Point");
  });

  test.each<[string, unknown, boolean, string]>([
    ["a list in a single field", [Test.GEO_JSON_POINT], false, "one geometry"],
    ["one geometry in a multiple field", Test.GEO_JSON_POINT, true, "list"],
  ])("rejects %s", (_, value, multiple, fragment) => {
    expect(messages(value, multiple)[0]).toContain(fragment);
  });
});

describe("findStaleBboxes", () => {
  const STALE = "The bbox doesn't contain this geometry. It will be saved as is.";
  const line = Test.GEO_JSON_LINE_STRING_WITH_BBOX;
  const stale: LineString = { ...line, bbox: [0, 0, 1, 1] };

  test.each<[string, Geometry]>([
    ["a fresh bbox", line],
    ["a padded bbox", { ...line, bbox: [139, 35, 140, 36] }],
    ["a bbox off only by rounding", { ...line, bbox: [139.69170001, 35.6812, 139.7673, 35.6895] }],
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

  test.each<[string, Geometry[], boolean, string]>([
    ["a bbox that leaves part of the geometry out", [stale], false, "bbox"],
    [
      // Only longitude and latitude are read from a bbox with altitude.
      "a stale bbox with altitude",
      [{ ...Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE, bbox: [0, 0, 10, 1, 1, 40] }],
      false,
      "bbox",
    ],
    ["the stale geometry in a multiple value", [line, stale], true, "[1].bbox"],
    [
      "a stale member of a GeometryCollection",
      [{ type: "GeometryCollection", geometries: [Test.GEO_JSON_POINT, stale] }],
      false,
      "geometries[1].bbox",
    ],
  ])("flags %s", (_, geometries, multiple, path) => {
    expect(findStaleBboxes(geometries, multiple)).toEqual([{ path, message: STALE }]);
  });
});

describe("limits", () => {
  test.each<[string, unknown, boolean, string]>([
    [
      "too many geometries in a multiple value",
      Array.from({ length: GeometryLimits.SHAPES + 1 }, () => Test.GEO_JSON_POINT),
      true,
      `Too many geometries: ${GeometryLimits.SHAPES + 1} (limit ${GeometryLimits.SHAPES})`,
    ],
    [
      "too many coordinates in total",
      {
        type: "MultiPoint",
        coordinates: Array.from({ length: GeometryLimits.COORDINATES + 1 }, () => [0, 0]),
      },
      false,
      `Too many coordinates: ${GeometryLimits.COORDINATES + 1} (limit ${GeometryLimits.COORDINATES})`,
    ],
  ])("%s", (_, value, multiple, message) => {
    expect(messages(value, multiple)).toContain(message);
  });
});

describe("formatIssue", () => {
  test.each<[string, GeometryIssue, string]>([
    ["prefixes the path", { path: "coordinates[1]", message: "Oops" }, "coordinates[1]: Oops"],
    ["leaves a root issue as is", { path: "", message: "Oops" }, "Oops"],
  ])("%s", (_, issue, text) => {
    expect(formatIssue(issue)).toBe(text);
  });
});
