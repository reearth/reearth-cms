import { describe, expect, test } from "vitest";

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
