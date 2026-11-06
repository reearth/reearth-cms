import type { GeometryCollection, LineString } from "geojson";
import { describe, expect, test } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { GeoUtils, GeometryKind } from "./geoUtils";

describe("kinds", () => {
  test("isGeometryKind accepts the seven GeoJSON geometry types only", () => {
    expect(GeoUtils.ALL_KINDS.every(kind => GeoUtils.isGeometryKind(kind))).toBe(true);
    expect(GeoUtils.isGeometryKind("Feature")).toBe(false);
    expect(GeoUtils.isGeometryKind(undefined)).toBe(false);
  });

  test("isEditableType is true for Point, LineString and Polygon", () => {
    expect(GeoUtils.isEditableType(GeometryKind.POLYGON)).toBe(true);
    expect(GeoUtils.isEditableType(GeometryKind.MULTI_POINT)).toBe(false);
    expect(GeoUtils.isEditableType(undefined)).toBe(false);
  });
});

describe("toCollection", () => {
  test("wraps each geometry in a feature with an internal id", () => {
    const point = { type: "Point" as const, coordinates: [0, 0] };
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

  test("removes a line's vertex", () => {
    const line = {
      type: "LineString" as const,
      coordinates: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
    };
    expect(GeoUtils.removeVertex(line, 1)).toEqual({
      type: "LineString",
      coordinates: [
        [0, 0],
        [2, 0],
      ],
    });
  });

  test("removing a ring's first vertex re-closes the ring on the new first one", () => {
    expect(GeoUtils.removeVertex(square, 0)).toEqual({
      type: "Polygon",
      coordinates: [
        [
          [1, 0],
          [1, 1],
          [0, 1],
          [1, 0],
        ],
      ],
    });
  });

  test("refuses to go below 2 line vertices or 3 ring vertices", () => {
    const line = {
      type: "LineString" as const,
      coordinates: [
        [0, 0],
        [1, 0],
      ],
    };
    const triangle = {
      type: "Polygon" as const,
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    };
    expect(GeoUtils.removeVertex(line, 0)).toBeNull();
    expect(GeoUtils.removeVertex(triangle, 0)).toBeNull();
  });
});

describe("bbox", () => {
  const cutLine = {
    type: "MultiLineString" as const,
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

  test("frames ordinary shapes from the westmost to the eastmost position", () => {
    expect(GeoUtils.bbox([Test.GEO_JSON_POLYGON_WITH_HOLE, Test.GEO_JSON_POINT])).toEqual([
      139.69, 35.65, 139.78, 35.71,
    ]);
  });

  test("a shape cut at the antimeridian gets a box across it, with west > east", () => {
    expect(GeoUtils.bbox([cutLine])).toEqual([170, 45, -170, 50]);
  });

  test("points on both sides of the antimeridian are framed the short way", () => {
    expect(
      GeoUtils.bbox([
        {
          type: "MultiPoint",
          coordinates: [
            [175, 0],
            [-175, 1],
          ],
        },
      ]),
    ).toEqual([175, 0, -175, 1]);
  });

  test("an uncut line from -170 to 170 is framed the long way, as it is drawn", () => {
    expect(
      GeoUtils.bbox([
        {
          type: "LineString",
          coordinates: [
            [-170, 0],
            [170, 1],
          ],
        },
      ]),
    ).toEqual([-170, 0, 170, 1]);
  });

  test("looks inside GeometryCollections", () => {
    expect(GeoUtils.bbox([{ type: "GeometryCollection", geometries: [cutLine] }])).toEqual([
      170, 45, -170, 50,
    ]);
  });

  test("is null for nothing", () => {
    expect(GeoUtils.bbox([])).toBeNull();
    expect(GeoUtils.bbox([{ type: "MultiPoint", coordinates: [] }])).toBeNull();
  });
});

describe("carryBbox", () => {
  const line = Test.GEO_JSON_LINE_STRING_WITH_BBOX;
  const moved = {
    type: "LineString" as const,
    coordinates: [
      [139.6, 35.6],
      [139.7673, 35.6812],
    ],
  };

  test("recomputes the bbox of a shape that had one", () => {
    expect(GeoUtils.carryBbox(moved, line).bbox).toEqual([139.6, 35.6, 139.7673, 35.6812]);
  });

  test("never adds a bbox to a shape that had none", () => {
    expect(GeoUtils.carryBbox(moved, Test.GEO_JSON_LINE_STRING)).not.toHaveProperty("bbox");
  });

  test("drops a bbox that only came along through a spread", () => {
    const spread = { ...Test.GEO_JSON_LINE_STRING, ...moved, bbox: line.bbox };
    expect(GeoUtils.carryBbox(spread, Test.GEO_JSON_LINE_STRING)).not.toHaveProperty("bbox");
  });

  test("a shape cut at the antimeridian gets a box across it", () => {
    const cut = {
      type: "MultiLineString" as const,
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
    expect(GeoUtils.carryBbox(cut, { ...cut, bbox: [0, 0, 1, 1] }).bbox).toEqual([
      170, 45, -170, 50,
    ]);
  });

  describe("with altitude", () => {
    const line3d = Test.GEO_JSON_LINE_STRING_WITH_ALTITUDE_AND_BBOX;

    test("recomputes the altitude range too", () => {
      const next = GeoUtils.setVertex(line3d, 0, [139.6, 35.5, 5]);
      expect(GeoUtils.carryBbox(next, line3d).bbox).toEqual([
        139.6, 35.5, 5, 139.7673, 35.6812, 40,
      ]);
    });

    test("reads the range from the positions that still have an altitude", () => {
      const next: LineString = {
        type: "LineString",
        coordinates: [[139.6, 35.5], ...line3d.coordinates],
      };
      expect(GeoUtils.carryBbox(next, line3d).bbox).toEqual([
        139.6, 35.5, 10, 139.7673, 35.6895, 40,
      ]);
    });

    test("falls back to a flat bbox once no position has an altitude", () => {
      expect(GeoUtils.carryBbox(moved, line3d).bbox).toEqual([139.6, 35.6, 139.7673, 35.6812]);
    });

    test("a flat bbox stays flat even when positions have an altitude", () => {
      const flat: LineString = { ...line3d, bbox: [139.6917, 35.6812, 139.7673, 35.6895] };
      expect(GeoUtils.carryBbox(line3d, flat).bbox).toEqual([139.6917, 35.6812, 139.7673, 35.6895]);
    });

    test("looks inside GeometryCollections", () => {
      const collection: GeometryCollection = {
        type: "GeometryCollection",
        geometries: [Test.GEO_JSON_POINT_WITH_ALTITUDE, line3d],
        bbox: [0, 0, 0, 1, 1, 1],
      };
      // The point's altitude (50) lies outside the line's range, so it must be counted.
      expect(GeoUtils.carryBbox(collection, collection).bbox).toEqual([
        139.6917, 35.6812, 10, 139.7673, 35.6895, 50,
      ]);
    });
  });
});
