import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import type OlMap from "ol/Map";
import { describe, expect, test } from "vitest";

import { vertexIndexAt } from "./handles";

// Map units are pixels here, so the tolerance applies directly.
const map = { getPixelFromCoordinate: (coordinate: number[]) => coordinate } as unknown as OlMap;

describe("vertexIndexAt", () => {
  test("finds the vertex under the pointer", () => {
    const line = new LineString([
      [0, 0],
      [100, 0],
      [200, 0],
    ]);
    expect(vertexIndexAt(map, line, [102, 3])).toBe(1);
    expect(vertexIndexAt(map, line, [50, 0])).toBeNull();
  });

  test("counts across polygon rings without their closing positions", () => {
    const polygon = new Polygon([
      [
        [0, 0],
        [100, 0],
        [100, 100],
        [0, 0],
      ],
      [
        [20, 20],
        [40, 20],
        [40, 40],
        [20, 20],
      ],
    ]);
    expect(vertexIndexAt(map, polygon, [40, 20])).toBe(4);
  });
});
