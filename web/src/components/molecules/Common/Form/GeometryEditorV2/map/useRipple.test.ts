import type { FeatureCollection, Geometry } from "geojson";
import { describe, expect, test } from "vitest";

import { rippleTarget } from "./useRipple";

const collectionOf = (geometry: Geometry): FeatureCollection => ({
  type: "FeatureCollection",
  features: [{ type: "Feature", id: "s1", geometry, properties: {} }],
});

const line = collectionOf({
  type: "LineString",
  coordinates: [
    [0, 0],
    [1, 1],
  ],
});

describe("rippleTarget", () => {
  test("a selected point ripples at its position", () => {
    expect(rippleTarget(collectionOf({ type: "Point", coordinates: [3, 4] }), "s1", null)).toEqual([
      3, 4,
    ]);
  });

  test("a line ripples only once a vertex is selected", () => {
    expect(rippleTarget(line, "s1", null)).toBeNull();
    expect(rippleTarget(line, "s1", 1)).toEqual([1, 1]);
  });

  test("nothing selected, or a stale vertex, means no ripple", () => {
    expect(rippleTarget(line, null, null)).toBeNull();
    expect(rippleTarget(line, "s1", 5)).toBeNull();
  });
});
