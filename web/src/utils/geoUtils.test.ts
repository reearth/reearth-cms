import type { BBox, FeatureCollection, Geometry, LineString, MultiLineString } from "geojson";
import { describe, expect, test } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { GeoUtils, GeometryKind } from "./geoUtils";

describe("kinds", () => {
  test.each([...GeoUtils.ALL_KINDS])("isGeometryKind is true for %s", kind => {
    expect(GeoUtils.isGeometryKind(kind)).toBe(true);
  });

  test.each(["Feature", undefined])("isGeometryKind is false for %s", value => {
    expect(GeoUtils.isGeometryKind(value)).toBe(false);
  });

  test.each([GeometryKind.POINT, GeometryKind.LINE_STRING, GeometryKind.POLYGON])(
    "isEditableType is true for %s",
    kind => {
      expect(GeoUtils.isEditableType(kind)).toBe(true);
    },
  );

  test.each([
    GeometryKind.MULTI_POINT,
    GeometryKind.MULTI_LINE_STRING,
    GeometryKind.MULTI_POLYGON,
    undefined,
  ])("isEditableType is false for %s", kind => {
    expect(GeoUtils.isEditableType(kind)).toBe(false);
  });
});

describe("toCollection", () => {
  test("wraps each geometry in a feature with an internal id", () => {
    const point = Test.GEO_JSON_POINT;
    expect(GeoUtils.toCollection([point, point]).features.map(f => f.id)).toEqual(["s1", "s2"]);
  });
});

describe("setVertex", () => {
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

  test("moving a ring's first vertex moves its closing position too", () => {
    const next = GeoUtils.setVertex(square, 0, [0.5, -0.5]);
    if (next.type !== "Polygon") throw new Error("expected Polygon");
    expect(next.coordinates[0][0]).toEqual([0.5, -0.5]);
    expect(next.coordinates[0][4]).toEqual([0.5, -0.5]);
  });

  test("indices run across rings without the closing positions", () => {
    const withHole = {
      type: "Polygon" as const,
      coordinates: [
        square.coordinates[0],
        [
          [0.2, 0.2],
          [0.4, 0.2],
          [0.4, 0.4],
          [0.2, 0.2],
        ],
      ],
    };
    const vertices = GeoUtils.listVertices(withHole);
    expect(vertices).toHaveLength(7);
    expect(vertices[4]).toMatchObject({ ring: 2, number: 1, position: [0.2, 0.2] });
    const next = GeoUtils.setVertex(withHole, 5, [0.5, 0.2]);
    if (next.type !== "Polygon") throw new Error("expected Polygon");
    expect(next.coordinates[1][1]).toEqual([0.5, 0.2]);
    expect(next.coordinates[0]).toEqual(square.coordinates[0]);
  });
});

describe("removeVertex", () => {
  const square: Geometry = {
    type: "Polygon",
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

  const triangle: Geometry = {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ],
    ],
  };

  const line = (...xs: number[]): Geometry => ({
    type: "LineString",
    coordinates: xs.map(x => [x, 0]),
  });

  test.each<[string, Geometry, number, Geometry | null]>([
    ["removes a line's vertex", line(0, 1, 2), 1, line(0, 2)],
    [
      "re-closes a ring on its new first vertex",
      square,
      0,
      {
        type: "Polygon",
        coordinates: [
          [
            [1, 0],
            [1, 1],
            [0, 1],
            [1, 0],
          ],
        ],
      },
    ],
    ["won't leave a line under 2 vertices", line(0, 1), 0, null],
    ["won't leave a ring under 3 vertices", triangle, 0, null],
  ])("%s", (_, geometry, index, expected) => {
    expect(GeoUtils.removeVertex(geometry, index)).toEqual(expected);
  });
});

describe("bbox", () => {
  const cutLine: MultiLineString = {
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
  };

  test.each<[string, Geometry[], BBox | null]>([
    [
      "frames ordinary shapes from the westmost to the eastmost position",
      [Test.GEO_JSON_POLYGON_WITH_HOLE, Test.GEO_JSON_POINT],
      [139.69, 35.65, 139.78, 35.71],
    ],
    [
      "gives a shape cut at the antimeridian a box across it, with west > east",
      [cutLine],
      [170, 45, -170, 50],
    ],
    [
      "frames points on both sides of the antimeridian the short way",
      [
        {
          type: "MultiPoint",
          coordinates: [
            [175, 0],
            [-175, 1],
          ],
        },
      ],
      [175, 0, -175, 1],
    ],
    [
      "frames an uncut line from -170 to 170 the long way, as it is drawn",
      [
        {
          type: "LineString",
          coordinates: [
            [-170, 0],
            [170, 1],
          ],
        },
      ],
      [-170, 0, 170, 1],
    ],
    [
      "looks inside GeometryCollections",
      [{ type: "GeometryCollection", geometries: [cutLine] }],
      [170, 45, -170, 50],
    ],
    ["is null for no geometries", [], null],
    ["is null for a geometry without positions", [{ type: "MultiPoint", coordinates: [] }], null],
  ])("%s", (_, geometries, expected) => {
    expect(GeoUtils.bbox(geometries)).toEqual(expected);
  });
});

describe("carryBbox", () => {
  const line = Test.GEO_JSON_LINE_STRING_WITH_BBOX;
  const moved: LineString = {
    type: "LineString",
    coordinates: [
      [139.6, 35.6],
      [139.7673, 35.6812],
    ],
  };
  const cut: MultiLineString = {
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
  };

  test.each<[string, Geometry, Geometry, BBox]>([
    ["the bbox of a shape that had one", moved, line, [139.6, 35.6, 139.7673, 35.6812]],
    [
      "a box across the antimeridian for a cut shape",
      cut,
      { ...cut, bbox: [0, 0, 1, 1] },
      [170, 45, -170, 50],
    ],
  ])("recomputes %s", (_, next, previous, expected) => {
    expect(GeoUtils.carryBbox(next, previous).bbox).toEqual(expected);
  });

  test.each<[string, Geometry, Geometry]>([
    ["on a shape that had none", moved, Test.GEO_JSON_LINE_STRING],
    [
      "that only came along through a spread",
      { ...Test.GEO_JSON_LINE_STRING, ...moved, bbox: line.bbox },
      Test.GEO_JSON_LINE_STRING,
    ],
  ])("never leaves a bbox %s", (_, next, previous) => {
    expect(GeoUtils.carryBbox(next, previous)).not.toHaveProperty("bbox");
  });

  describe("with altitude", () => {
    const line3d = Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE_AND_BBOX;
    const collection: Geometry = {
      type: "GeometryCollection",
      geometries: [Test.GEO_JSON_POINT_WITH_ALTITUDE, line3d],
      bbox: [0, 0, 0, 1, 1, 1],
    };

    test.each<[string, Geometry, Geometry, BBox]>([
      [
        "recomputes the altitude range too",
        GeoUtils.setVertex(line3d, 0, [139.6, 35.5, 5]),
        line3d,
        [139.6, 35.5, 5, 139.7673, 35.6812, 40],
      ],
      [
        "reads the range from the positions that still have an altitude",
        { type: "LineString", coordinates: [[139.6, 35.5], ...line3d.coordinates] },
        line3d,
        [139.6, 35.5, 10, 139.7673, 35.6895, 40],
      ],
      [
        "falls back to a flat bbox once no position has an altitude",
        moved,
        line3d,
        [139.6, 35.6, 139.7673, 35.6812],
      ],
      [
        "keeps a flat bbox flat even when positions have an altitude",
        line3d,
        { ...line3d, bbox: [139.6917, 35.6812, 139.7673, 35.6895] },
        [139.6917, 35.6812, 139.7673, 35.6895],
      ],
      [
        // The point's altitude (50) lies outside the line's range, so it must be counted.
        "looks inside GeometryCollections",
        collection,
        collection,
        [139.6917, 35.6812, 10, 139.7673, 35.6895, 50],
      ],
    ])("%s", (_, next, previous, expected) => {
      expect(GeoUtils.carryBbox(next, previous).bbox).toEqual(expected);
    });
  });
});

describe("normalize", () => {
  test("keeps existing ids and numbers new ones after the highest", () => {
    const collection = GeoUtils.normalize({
      type: "FeatureCollection",
      features: [
        { type: "Feature", id: "s3", geometry: Test.GEO_JSON_POINT, properties: {} },
        { type: "Feature", id: 7, geometry: Test.GEO_JSON_POINT, properties: null },
        { type: "Feature", geometry: Test.GEO_JSON_POINT, properties: {} },
      ],
    });
    expect(collection.features.map(f => f.id)).toEqual(["s3", "7", "s4"]);
    expect(collection.features[1].properties).toEqual({});
  });

  test("rounds coordinates to about a centimetre", () => {
    const collection = GeoUtils.normalize(
      GeoUtils.toCollection([{ type: "Point", coordinates: [139.123456789, 35.987654321] }]),
    );
    expect(collection.features[0].geometry).toEqual({
      type: "Point",
      coordinates: [139.1234568, 35.9876543],
    });
  });
});

describe("nextFeatureId", () => {
  test.each<[string, FeatureCollection, string]>([
    ["starts at s1 in an empty document", GeoUtils.toCollection([]), "s1"],
    [
      "follows the highest id",
      {
        type: "FeatureCollection",
        features: [
          { type: "Feature", id: "s5", geometry: Test.GEO_JSON_POINT, properties: {} },
          { type: "Feature", id: "s2", geometry: Test.GEO_JSON_POINT, properties: {} },
        ],
      },
      "s6",
    ],
  ])("%s", (_, collection, expected) => {
    expect(GeoUtils.nextFeatureId(collection)).toBe(expected);
  });
});

describe("partCount", () => {
  test.each<[string, Geometry, number]>([
    ["MultiPoint", Test.GEO_JSON_MULTI_POINT, 3],
    ["MultiPolygon", Test.GEO_JSON_MULTI_POLYGON, 2],
    ["GeometryCollection", Test.GEO_JSON_GEO_COLLECTION, 2],
    ["Point", Test.GEO_JSON_POINT, 1],
  ])("a %s has %i part(s)", (_, geometry, count) => {
    expect(GeoUtils.partCount(geometry)).toBe(count);
  });
});

describe("countVertices", () => {
  // A ring's closing position repeats its first, so it isn't counted.
  test.each<[string, Geometry, number]>([
    ["Point", Test.GEO_JSON_POINT, 1],
    ["LineString", Test.GEO_JSON_LINE_STRING, 4],
    ["Polygon with a hole", Test.GEO_JSON_POLYGON_WITH_HOLE, 8],
    ["MultiPoint", Test.GEO_JSON_MULTI_POINT, 0],
  ])("a %s has %i editable vertices", (_, geometry, count) => {
    expect(GeoUtils.countVertices(geometry)).toBe(count);
  });
});

describe("validateGeoJson", () => {
  test.each<[string, string | Geometry, Geometry]>([
    ["text", JSON.stringify(Test.GEO_JSON_POINT), Test.GEO_JSON_POINT],
    ["an object", Test.GEO_JSON_POLYGON, Test.GEO_JSON_POLYGON],
  ])("accepts valid GeoJSON given as %s", async (_, raw, geometry) => {
    expect(await GeoUtils.validateGeoJson(raw)).toEqual({ isValid: true, data: geometry });
  });

  test("rejects invalid GeoJSON with a message", async () => {
    expect(await GeoUtils.validateGeoJson('{"type":"Point","coordinates":"nope"}')).toEqual({
      isValid: false,
      error: expect.stringMatching(/\S/),
    });
  });
});

describe("splitAtAntimeridian", () => {
  const square = (west: number, east: number): Geometry => ({
    type: "Polygon",
    coordinates: [
      [
        [west, 0],
        [east, 0],
        [east, 10],
        [west, 10],
        [west, 0],
      ],
    ],
  });

  test.each<[string, Geometry]>([
    ["a point", Test.GEO_JSON_POINT],
    ["a line", Test.GEO_JSON_LINE_STRING],
    ["a polygon with a hole", Test.GEO_JSON_POLYGON_WITH_HOLE],
    ["a point on −180°", { type: "Point", coordinates: [-180, 10] }],
    ["a point on 180°", { type: "Point", coordinates: [180, 10] }],
    [
      "points on both sides of the antimeridian",
      {
        type: "MultiPoint",
        coordinates: [
          [-180, 0],
          [180, 5],
        ],
      },
    ],
    [
      "a line ending on −180°",
      {
        type: "LineString",
        coordinates: [
          [-170, 0],
          [-180, 5],
        ],
      },
    ],
    ["a polygon touching −180°", square(-180, -170)],
    [
      "a line ending on 180°",
      {
        type: "LineString",
        coordinates: [
          [170, 0],
          [180, 5],
        ],
      },
    ],
    [
      "a degenerate line, as a LineString",
      {
        type: "LineString",
        coordinates: [
          [10, 0],
          [10, 0],
        ],
      },
    ],
  ])("leaves %s in range alone", (_, geometry) => {
    expect(GeoUtils.splitAtAntimeridian(geometry)).toEqual(geometry);
  });

  test.each<[string, Geometry, Geometry]>([
    [
      "a point",
      { type: "Point", coordinates: [217.5, 15] },
      { type: "Point", coordinates: [-142.5, 15] },
    ],
    [
      "a line drawn entirely past 180°",
      {
        type: "LineString",
        coordinates: [
          [190, 0],
          [200, 10],
        ],
      },
      {
        type: "LineString",
        coordinates: [
          [-170, 0],
          [-160, 10],
        ],
      },
    ],
    ["a polygon drawn entirely past 180°", square(190, 200), square(-170, -160)],
    [
      "a line drawn entirely past −180°",
      {
        type: "LineString",
        coordinates: [
          [-190, 0],
          [-200, 10],
        ],
      },
      {
        type: "LineString",
        coordinates: [
          [170, 0],
          [160, 10],
        ],
      },
    ],
  ])("moves %s back into range", (_, geometry, expected) => {
    expect(GeoUtils.splitAtAntimeridian(geometry)).toEqual(expected);
  });

  test.each<[string, Geometry, Geometry]>([
    [
      "a line crossing eastward, cut where it meets 180°",
      {
        type: "LineString",
        coordinates: [
          [170, 0],
          [190, 10],
        ],
      },
      {
        type: "MultiLineString",
        coordinates: [
          [
            [170, 0],
            [180, 5],
          ],
          [
            [-180, 5],
            [-170, 10],
          ],
        ],
      },
    ],
    [
      "a line crossing westward",
      {
        type: "LineString",
        coordinates: [
          [-170, 0],
          [-190, 10],
        ],
      },
      {
        type: "MultiLineString",
        coordinates: [
          [
            [-170, 0],
            [-180, 5],
          ],
          [
            [180, 5],
            [170, 10],
          ],
        ],
      },
    ],
    [
      "a polygon crossing 180°",
      square(170, 190),
      {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [170, 0],
              [180, 0],
              [180, 10],
              [170, 10],
              [170, 0],
            ],
          ],
          [
            [
              [-180, 0],
              [-170, 0],
              [-170, 10],
              [-180, 10],
              [-180, 0],
            ],
          ],
        ],
      },
    ],
    [
      "a polygon crossing 180°, keeping its hole on the side it falls",
      {
        type: "Polygon",
        coordinates: [
          [
            [170, 0],
            [190, 0],
            [190, 10],
            [170, 10],
            [170, 0],
          ],
          [
            [185, 2],
            [188, 2],
            [188, 4],
            [185, 4],
            [185, 2],
          ],
        ],
      },
      {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [170, 0],
              [180, 0],
              [180, 10],
              [170, 10],
              [170, 0],
            ],
          ],
          [
            [
              [-180, 0],
              [-170, 0],
              [-170, 10],
              [-180, 10],
              [-180, 0],
            ],
            [
              [-175, 2],
              [-172, 2],
              [-172, 4],
              [-175, 4],
              [-175, 2],
            ],
          ],
        ],
      },
    ],
  ])("splits %s", (_, geometry, expected) => {
    expect(GeoUtils.splitAtAntimeridian(geometry)).toEqual(expected);
  });

  test("a line starting on 180° and heading east stays one line, on the far side", () => {
    expect(
      GeoUtils.splitAtAntimeridian({
        type: "LineString",
        coordinates: [
          [180, 0],
          [190, 0],
        ],
      }),
    ).toEqual({
      type: "LineString",
      coordinates: [
        [-180, 0],
        [-170, 0],
      ],
    });
  });

  test("the drawn example from the field splits into two parts that meet at 180°", () => {
    const split = GeoUtils.splitAtAntimeridian({
      type: "LineString",
      coordinates: [
        [131.6555303, 16.0436059],
        [217.586851, 15.0886743],
      ],
    });
    if (split.type !== "MultiLineString") throw new Error("expected a MultiLineString");
    const [west, east] = split.coordinates;
    expect(west[0]).toEqual([131.6555303, 16.0436059]);
    expect(west[1][0]).toBe(180);
    expect(east[0][0]).toBe(-180);
    expect(east[0][1]).toBeCloseTo(west[1][1]);
    expect(east[1][0]).toBeCloseTo(-142.413149);
  });
});
