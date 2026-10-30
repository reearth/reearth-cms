import type { FeatureCollection, Geometry } from "geojson";
import { describe, expect, test } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { rippleTarget } from "./useRipple";

const collectionOf = (geometry: Geometry): FeatureCollection => ({
  type: "FeatureCollection",
  features: [{ type: "Feature", id: "s1", geometry, properties: {} }],
});

const line = collectionOf(Test.GEO_JSON_LINE_STRING);

describe("rippleTarget", () => {
  test("a selected point ripples at its position", () => {
    expect(rippleTarget(collectionOf(Test.GEO_JSON_POINT), "s1", null)).toEqual(
      Test.GEO_JSON_POINT.coordinates,
    );
  });

  test("a line ripples only once a vertex is selected", () => {
    expect(rippleTarget(line, "s1", null)).toBeNull();
    expect(rippleTarget(line, "s1", 1)).toEqual(Test.GEO_JSON_LINE_STRING.coordinates[1]);
  });

  test("nothing selected, or a stale vertex, means no ripple", () => {
    expect(rippleTarget(line, null, null)).toBeNull();
    expect(rippleTarget(line, "s1", 5)).toBeNull();
  });
});
